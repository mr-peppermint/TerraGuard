"""
Scene poller -> writes one JSON-lines file per batch of NEW Sentinel-2 scenes into ./stream_in/.
Spark Structured Streaming (spark/spark_stream.py) watches that folder as a live stream.
Needs only the standard library; it talks to the FastAPI backend (which holds the Earth Engine login).

  python scene_poller.py            # loop forever (every POLL_SECONDS, default 900)
  python scene_poller.py --once     # single pass (good for a demo)
"""
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

API = os.getenv("VR_API", "http://localhost:8000")
OUT = Path(os.getenv("VR_STREAM_IN", "stream_in"))
SEEN_FILE = OUT.parent / ".seen_scenes.json"
POLL = int(os.getenv("POLL_SECONDS", "900"))


def call(path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, headers={"Content-Type": "application/json"},
                                 method="POST" if body is not None else "GET")
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read())


def poll_once(seen):
    OUT.mkdir(parents=True, exist_ok=True)
    lines = []
    for w in call("/watch")["regions"]:
        for s in call("/scenes/recent", {"geometry": w["geometry"], "days": w["days"]})["scenes"]:
            key = f'{w["region_id"]}:{s["scene_id"]}'
            if key in seen:
                continue
            seen.add(key)
            lines.append(json.dumps({
                "region_id": w["region_id"], "scene_id": s["scene_id"], "tile": s.get("tile"),
                "scene_time": int(s["scene_time"]), "cloud": float(s["cloud"]), "days": w["days"],
                "geometry": json.dumps(w["geometry"]),
            }))
    if lines:
        tmp = OUT / f".tmp_{int(time.time() * 1000)}"
        tmp.write_text("\n".join(lines) + "\n")
        tmp.rename(OUT / f"scenes_{int(time.time() * 1000)}.json")  # atomic: Spark never sees half a file
    print(f"[poller] {len(lines)} new scene(s)")
    return seen


if __name__ == "__main__":
    seen = set(json.loads(SEEN_FILE.read_text())) if SEEN_FILE.exists() else set()
    while True:
        try:
            seen = poll_once(seen)
            SEEN_FILE.write_text(json.dumps(sorted(seen)))
        except Exception as exc:  # noqa: BLE001
            print("[poller] error:", exc)
        if "--once" in sys.argv:
            break
        time.sleep(POLL)
