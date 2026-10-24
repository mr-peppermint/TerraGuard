"""
VanRakshak backend (FastAPI).

  GET  /health            backend + Earth Engine status
  POST /detect/recent     live scan of the last N days (5 / 10 / 15 ...) vs same-season baseline
  POST /detect            scan between two explicit date windows (used for validation / history)
  POST /scenes/recent     list recent Sentinel-2 scenes for a region (used by the Spark poller)
  POST/GET/DELETE /watch  regions to monitor automatically
  GET  /validation        held-out validation metrics (after running heldout_validation.py)
  GET  /alerts/stream     Server-Sent Events: pushes a new scan result whenever one finishes
"""
import asyncio
import json
import os
from datetime import date
from pathlib import Path
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

try:  # load backend/.env or project .env if python-dotenv is installed
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

import detector  # noqa: E402  (after dotenv so env vars are visible)

app = FastAPI(title="VanRakshak backend", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------------------------------------------------- models
class RecentRequest(BaseModel):
    region_id: str = "custom"
    geometry: dict
    days: int = Field(10, ge=3, le=30)
    ndvi_threshold: float = Field(-0.20, ge=-0.8, le=-0.05)
    min_patch_ha: float = Field(0.3, ge=0.1, le=50)
    max_cloud: float = Field(60, ge=5, le=100)
    broadcast: bool = False          # also push the result to every /alerts/stream subscriber
    reason: str = "manual"           # manual | scheduled | spark


class WindowRequest(BaseModel):
    region_id: str = "custom"
    geometry: dict
    monitoring_start: date
    monitoring_end: date
    baseline_start: date
    baseline_end: date
    ndvi_threshold: float = Field(-0.20, ge=-0.8, le=-0.05)
    min_patch_ha: float = Field(0.3, ge=0.1, le=50)
    max_cloud: float = Field(60, ge=5, le=100)


class ScenesRequest(BaseModel):
    geometry: dict
    days: int = Field(10, ge=1, le=30)


# ----------------------------------------------------------------------------- SSE hub
class Hub:
    def __init__(self):
        self.subscribers = set()

    def publish(self, event: dict):
        for q in list(self.subscribers):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                pass


hub = Hub()
WATCH: Dict[str, RecentRequest] = {}
LAST_SCENE: Dict[str, Optional[str]] = {}


def _require_ee():
    if not detector.EE_READY:
        raise HTTPException(503, f"Earth Engine is not initialised: {detector.EE_ERROR}")


async def _run_recent(req: RecentRequest):
    _require_ee()
    try:
        fc, meta = await asyncio.to_thread(
            detector.detect_recent, req.geometry, req.days,
            max_cloud=req.max_cloud, ndvi_threshold=req.ndvi_threshold, min_patch_ha=req.min_patch_ha,
        )
    except ValueError as exc:
        raise HTTPException(413, str(exc))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"Earth Engine error: {type(exc).__name__}: {exc}")
    latest = meta["monitoring"].get("latest_scene")
    meta["new_scene_since_last_scan"] = LAST_SCENE.get(req.region_id) not in (None, latest)
    LAST_SCENE[req.region_id] = latest
    if req.broadcast:
        hub.publish({"type": "scan", "reason": req.reason, "region_id": req.region_id,
                     "feature_collection": fc, "meta": meta})
    return {**fc, "meta": meta}


# ----------------------------------------------------------------------------- routes
@app.on_event("startup")
async def _startup():
    await asyncio.to_thread(detector.init_earth_engine)
    print("Earth Engine:", "READY" if detector.EE_READY else f"NOT READY - {detector.EE_ERROR}")
    if float(os.getenv("MONITOR_INTERVAL_MIN", "60")) > 0:
        asyncio.create_task(_monitor_loop())


@app.get("/health")
def health():
    return {
        "status": "ok",
        "earth_engine": detector.EE_READY,
        "earth_engine_error": detector.EE_ERROR,
        "watched_regions": len(WATCH),
        "stream_subscribers": len(hub.subscribers),
    }


@app.get("/validation")
def validation():
    """Real held-out metrics written by heldout_validation.py (404 until it has been run)."""
    f = Path(__file__).parent / "validation_results.json"
    if not f.exists():
        raise HTTPException(404, "validation_results.json not found - run heldout_validation.py")
    return json.loads(f.read_text())


@app.post("/detect/recent")
async def detect_recent(req: RecentRequest):
    return await _run_recent(req)


@app.post("/detect")
async def detect_between(req: WindowRequest):
    _require_ee()
    try:
        fc, meta = await asyncio.to_thread(
            detector.detect_windows, req.geometry, req.monitoring_start, req.monitoring_end,
            req.baseline_start, req.baseline_end, None, None,
            ndvi_threshold=req.ndvi_threshold, min_patch_ha=req.min_patch_ha, max_cloud=req.max_cloud,
        )
    except ValueError as exc:
        raise HTTPException(413, str(exc))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"Earth Engine error: {type(exc).__name__}: {exc}")
    return {**fc, "meta": meta}


@app.post("/scenes/recent")
async def scenes_recent(req: ScenesRequest):
    _require_ee()
    try:
        scenes = await asyncio.to_thread(detector.list_recent_scenes, req.geometry, req.days)
    except ValueError as exc:
        raise HTTPException(413, str(exc))
    return {"scenes": scenes}


@app.post("/watch")
def watch_add(req: RecentRequest):
    WATCH[req.region_id] = req
    return {"watching": list(WATCH)}


@app.delete("/watch/{region_id}")
def watch_remove(region_id: str):
    WATCH.pop(region_id, None)
    return {"watching": list(WATCH)}


@app.get("/watch")
def watch_list():
    return {"regions": [w.model_dump() for w in WATCH.values()]}


@app.get("/alerts/stream")
async def alerts_stream(request: Request):
    queue: asyncio.Queue = asyncio.Queue(maxsize=50)
    hub.subscribers.add(queue)

    async def gen():
        try:
            yield "retry: 5000\n\n"
            yield f"data: {json.dumps({'type': 'hello', 'earth_engine': detector.EE_READY})}\n\n"
            while not await request.is_disconnected():
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keep-alive\n\n"
        finally:
            hub.subscribers.discard(queue)

    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


async def _monitor_loop():
    """Re-scan every watched region on a schedule and push results to the UI."""
    interval = float(os.getenv("MONITOR_INTERVAL_MIN", "60")) * 60
    while True:
        await asyncio.sleep(interval)
        for req in list(WATCH.values()):
            try:
                await _run_recent(req.model_copy(update={"broadcast": True, "reason": "scheduled"}))
            except HTTPException as exc:
                hub.publish({"type": "error", "region_id": req.region_id, "message": exc.detail})
