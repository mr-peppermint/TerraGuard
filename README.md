# TerraGuard — Satellite Forest-Loss Monitoring

TerraGuard detects and maps **candidate forest-canopy loss** from Copernicus Sentinel-2 L2A imagery, processed on Google Earth Engine through a FastAPI backend, and shows it in an interactive React + MapLibre web app. (The backend and some docs still use the earlier working name **TerraGuard**.)

Every detection is a **candidate alert that needs human verification**. It is not confirmed deforestation.

---

## Contents

1. [What is real and what is demo](#1-what-is-real-and-what-is-demo)
2. [How live detection works](#2-how-live-detection-works)
3. [Architecture](#3-architecture)
4. [Project structure](#4-project-structure)
5. [Configuration (environment variables)](#5-configuration-environment-variables)
6. [Run locally](#6-run-locally)
7. [Optional: Spark real-time layer](#7-optional-spark-real-time-layer)
8. [Held-out validation](#8-held-out-validation)
9. [Deploy: Cloudflare Pages + always-on backend](#9-deploy-cloudflare-pages--always-on-backend)
10. [Backend API reference](#10-backend-api-reference)
11. [Troubleshooting](#11-troubleshooting)
12. [Known limits](#12-known-limits)
13. [Data attribution](#13-data-attribution)

---

## 1. What is real and what is demo

| Part | Status |
|---|---|
| **Live monitor panel** (Explorer, top-right): scan the last **5 / 10 / 15 days** | **Real**: Sentinel-2 L2A analysed on Google Earth Engine via the FastAPI backend |
| **Auto-monitor** (new satellite pass → new alert pushed to the map) | **Real**: Server-Sent Events from the backend scheduler, or triggered by Spark |
| **Apache Spark Structured Streaming** layer | **Real, optional**: `backend/spark/spark_stream.py` (needs Java 17 + pyspark) |
| **Held-out validation** | **Real once you run** `backend/heldout_validation.py`; until then the UI shows a **PLACEHOLDER** label |
| Pre-loaded corridors, alert lists, Change Lab canvases | **Demo / simulated**: labelled `DEMO DATA` when no live scan exists for that region |
| Deforestation **forecast** (1 / 3 / 5 years) | **Simulated**: a deterministic rule-based projection, not a trained model |
| Searched locations (Google geocoding) | Region is real; the alerts generated for it are **demo placeholders** until you run a live scan |

The Live monitor badge shows `LIVE DATA` or `DEMO DATA` for the selected region, and its status dot shows whether the backend and Earth Engine are connected. If the backend is down you get a message, not invented alerts.

---

## 2. How live detection works

Implemented in `backend/detector.py`:

1. **Masking.** Cloud, shadow, cirrus and snow pixels are removed using the Sentinel-2 SCL band (classes 3, 8, 9, 10, 11).
2. **Monitoring composite.** Median of the last N days (5 / 10 / 15). If clouds leave less than 25 % clear pixels, the window is widened ×2 / ×3 and the UI says so.
3. **Seasonal baseline.** The *same calendar window one year earlier* (±15 days). This separates leaf-fall, harvest and monsoon effects from real loss.
4. **Recent baseline.** The 60 days before the window. A pixel must also have dropped against it, so only *recent* clearing is flagged.
5. **Pixel rules.** A pixel is kept only if it was forest (ESA WorldCover tree class, NDVI ≥ 0.5 last year), is now sparse (NDVI < 0.45), and dNDVI and dNBR are below their thresholds (defaults −0.20 and −0.15).
6. **Vectorise and score.** Small patches are sieved out (default minimum 0.3 ha), the rest become polygons with an explainable 0–100 **screening score** (a heuristic, not a probability), and are returned as GeoJSON.

Sentinel-2 revisits about every 5 days and Earth Engine publishes scenes about 2–3 days after acquisition, so "live" means *near-real-time*, not instant.

---

## 3. Architecture

```
Browser ──► Cloudflare Pages (static React app)
   │
   └──HTTPS──► FastAPI backend (always on) ──► Google Earth Engine
                    ▲   │
   Spark (optional) ┘   └── /alerts/stream (SSE) ──► browser map
```

- **Frontend:** Vite, React 18, TypeScript, Tailwind, MapLibre GL, Recharts.
- **Backend:** FastAPI + `earthengine-api`. It keeps a watch list and a scheduler **in memory**, so run **a single worker**.

---

## 4. Project structure

```
.
├── index.html
├── package.json / vite.config.ts / tailwind.config.js / tsconfig.json
├── .env.example                  # copy to .env (never commit .env)
├── public/_redirects             # SPA routing for Cloudflare Pages (you create this, see §9)
├── src/
│   ├── App.tsx, main.tsx, index.css
│   ├── pages/                    # Home, Explorer, ChangeDetection, Alerts, AlertDetail, Methodology, About
│   ├── components/               # Map, ledger, charts, headers/footers, modals
│   ├── services/
│   │   ├── liveDetectionService.ts   # talks to the backend (scan, watch, SSE)
│   │   ├── googleMapsService.ts      # tiles + geocoding (optional key)
│   │   ├── predictionService.ts      # deterministic forecast model
│   │   ├── explanationService.ts     # rule-based explanation (+ optional Gemini)
│   │   └── detectionService.ts, satelliteService.ts
│   ├── data/                     # demo regions/alerts, validation data hook
│   └── types/geospatial.ts
└── backend/
    ├── app.py                    # FastAPI routes, SSE hub, scheduler
    ├── detector.py               # Earth Engine detection logic
    ├── heldout_validation.py     # precision / recall / F1 vs Hansen labels
    ├── scene_poller.py           # optional: feeds Spark
    ├── spark/spark_stream.py     # optional: Spark Structured Streaming
    ├── requirements.txt
    ├── requirements-spark.txt
    └── Dockerfile                # you create this (see §9)
```

---

## 5. Configuration (environment variables)

Copy `.env.example` to `.env`. **`.env` must be git-ignored** (add the line `.env` to `.gitignore`).

### Backend

| Variable | Purpose | Default |
|---|---|---|
| `GCP_PROJECT_ID` | Google Cloud project registered for Earth Engine | none |
| `EE_SERVICE_ACCOUNT_JSON_CONTENT` | **Full JSON text** of the service-account key (use on cloud hosts) | none |
| `EE_SERVICE_ACCOUNT_JSON` | Path to a service-account key file (local use) | none |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API | `http://localhost:5173,http://127.0.0.1:5173` |
| `MONITOR_INTERVAL_MIN` | Minutes between automatic re-scans of watched regions (`0` = off) | `60` |
| `MAX_AREA_KM2` | Largest area a single scan may cover | `1500` |
| `HANSEN_ASSET` | Hansen label version for `heldout_validation.py` | `UMD/hansen/global_forest_change_2023_v1_11` |

Earth Engine auth order: `EE_SERVICE_ACCOUNT_JSON_CONTENT` → `EE_SERVICE_ACCOUNT_JSON` (file) → cached `earthengine authenticate` login.

### Frontend (Vite, baked into the build)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | URL of the backend, e.g. `http://localhost:8000` or `https://api.example.com` (no trailing slash) |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional. Google satellite tiles and place search. Without it the map uses Esri imagery and search only matches the built-in regions |

> **Anything starting with `VITE_` is public in the browser bundle.** Restrict such keys by HTTP referrer in their provider's console.

---

## 6. Run locally

### 0. Earth Engine access (one time, free for non-commercial use)

Pick one:

```bash
earthengine authenticate          # developer login, then set GCP_PROJECT_ID in .env
```

or create a service account (see §9.1) and put the key path in `EE_SERVICE_ACCOUNT_JSON`.

### 1. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env        # then edit GCP_PROJECT_ID / key path
uvicorn app:app --reload --port 8000
```

Check http://localhost:8000/health. You want `"earth_engine": true`.

### 2. Frontend

```bash
cd ..
npm install
npm run dev                       # http://localhost:5173
```

Open **Explorer → Live monitor → Scan last 10 days**. The first scan can take about a minute.

Production build: `npm run build` (output in `dist/`).

---

## 7. Optional: Spark real-time layer

Spark watches a folder of new-scene events, drops cloudy scenes, de-duplicates by scene id, and triggers one live detection per affected region.

```
Sentinel-2 catalogue ─(scene_poller.py)→ stream_in/*.json ─(Spark)→ POST /detect/recent → SSE → map
```

Needs Java 17 (macOS: `brew install openjdk@17`).

```bash
cd backend
pip install -r requirements-spark.txt
python scene_poller.py            # watches the catalogue (use --once for a single pass)
python spark/spark_stream.py      # Spark Structured Streaming
```

Tick **Auto-monitor** in the UI first; it registers the region with the backend. Skip Spark in cloud deployments: the built-in scheduler (`MONITOR_INTERVAL_MIN`) already re-scans watched regions.

---

## 8. Held-out validation

Tunes the dNDVI threshold on a **training** box, freezes it, then reports precision / recall / F1 on a **held-out** box against Hansen Global Forest Change labels.

```bash
cd backend
python heldout_validation.py --year 2023 \
  --train 85.35,21.95,85.55,22.15 \
  --heldout 82.45,22.30,82.65,22.50     # minLon,minLat,maxLon,maxLat
```

It writes `backend/validation_results.json`, which the backend serves at `GET /validation` and the Methodology page and Analytics panel pick up automatically. The two example boxes are placeholders: choose your own training and held-out regions.

On a hosted backend, run this locally and **commit `validation_results.json`**, because container disks are ephemeral.

---

## 9. Deploy: Cloudflare Pages + always-on backend

**The backend cannot run on Cloudflare Pages or Workers.** It uses Python with `earthengine-api`, in-memory state, a background scheduler, SSE streaming, and scans that take minutes. Host it on an always-on Docker platform (Railway, Render paid plan, Fly.io) or a VPS, and let the Cloudflare-hosted frontend call it over HTTPS.

### 9.1 Earth Engine service account (one time)

1. In Google Cloud, create or select a project and enable the **Earth Engine API**.
2. IAM & Admin → Service Accounts → create one → Keys → **Add key → JSON**.
3. Register the project for Earth Engine (non-commercial use is free) and grant the service account access.

### 9.2 Deploy the backend (24/7)

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
```

Use **one worker** only: the watch list and scheduler live in memory.

On your platform:

1. New service from this repo, root directory `backend/`, builder = Dockerfile.
2. Set environment variables:
   - `GCP_PROJECT_ID` = your project id
   - `EE_SERVICE_ACCOUNT_JSON_CONTENT` = full contents of the key JSON
   - `CORS_ORIGINS` = `https://your-site.pages.dev,https://yourdomain.com`
   - `MONITOR_INTERVAL_MIN` = `60`, `MAX_AREA_KM2` = `1500`
3. Health check path: `/health`. Choose a plan that **never sleeps or scales to zero**, or the monitor loop stops.
4. Optional custom domain, e.g. `api.yourdomain.com`.
5. Open `https://<backend-url>/health` and confirm `"earth_engine": true`.

**Cloudflare proxy timeout:** if the API sits behind Cloudflare's proxy (orange cloud or a Tunnel), requests over about 100 s fail with HTTP 524. Cold Earth Engine scans can exceed that, so use the platform's own URL or a DNS-only (grey cloud) subdomain for the API.

**VPS alternative:** run the same container on your own server and expose it with `cloudflared`, keeping the 100 s limit in mind.

### 9.3 Deploy the frontend on Cloudflare Pages

1. Create `public/_redirects` with exactly one line (fixes 404 on refresh of `/alerts/...`):
   ```
   /* /index.html 200
   ```
2. Push the repo to GitHub (confirm `.env` is git-ignored).
3. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
4. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
5. Environment variables (build-time):
   - `VITE_API_BASE_URL` = `https://<your-backend-url>` (https, no trailing slash)
   - optional `VITE_GOOGLE_MAPS_API_KEY` (restrict by referrer)
6. Deploy. Changing `VITE_API_BASE_URL` requires a redeploy.

### 9.4 Verify

- Open the site → Explorer. The Live monitor dot should turn green: "Backend + Earth Engine connected".
- Click **Scan last 10 days**. The first scan may take about a minute.
- Tick **Auto-monitor**. It should show "● streaming".

### 9.5 Deployment notes

- The watch list resets when the backend restarts; the UI re-registers it when Auto-monitor is toggled.
- Never commit the service-account JSON or `.env`. Store them only as platform secrets.

---

## 10. Backend API reference

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Backend and Earth Engine status |
| POST | `/detect/recent` | Live scan of the last N days (3–30) vs same-season baseline |
| POST | `/detect` | Scan between two explicit date windows |
| POST | `/scenes/recent` | List recent Sentinel-2 scenes for a region (used by the poller) |
| POST / GET / DELETE | `/watch`, `/watch/{region_id}` | Manage regions for automatic monitoring |
| GET | `/validation` | Held-out metrics (404 until `heldout_validation.py` has run) |
| GET | `/alerts/stream` | Server-Sent Events: pushes each finished scan |

Error codes: `503` Earth Engine not initialised, `413` area too large, `502` Earth Engine error.

---

## 11. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| "Backend not reachable" | Backend not running, wrong `VITE_API_BASE_URL`, or the site's origin is missing from `CORS_ORIGINS` |
| Dot is amber: "Earth Engine not signed in" | Check `earth_engine_error` at `/health`: bad key JSON, project not registered for Earth Engine, or Earth Engine API not enabled |
| HTTP 524 on scans | Request exceeded Cloudflare's ~100 s proxy limit. Use a DNS-only API domain or a smaller area |
| HTTP 413 | Scan area above `MAX_AREA_KM2`; zoom in or raise the limit |
| "No usable scenes" | Cloud cover or no recent pass; try the 15-day window |
| 404 when refreshing `/alerts/...` | Missing `public/_redirects` |
| Auto-monitor never streams | Backend asleep or scaled to zero, or a proxy buffering SSE |
| Validation shows PLACEHOLDER | `validation_results.json` not generated or not committed |

---

## 12. Known limits

- **Rule-based thresholds, not a trained model.** The held-out script tunes one threshold on coarse Hansen labels; it does not train a classifier.
- Hansen labels are 30 m and yearly, so precision and recall are **estimates**, not ground truth.
- One live scan covers at most about 22 km × 22 km around the region centre.
- The **driver** of a loss patch (mining, road, agriculture) is **not** classified live. Live alerts say "Undetermined" until verified.
- Change Lab canvases and forecast charts are simulated visuals; the forecast is a deterministic projection from observed loss, not a learned model.
- Demo alerts and corridor statistics are illustrative.
- Thresholds tuned for one biome should not be assumed to transfer to others (for example from dry deciduous forest to equatorial rainforest) without recalibration.

---

## 13. Data attribution

Contains modified Copernicus Sentinel data, retrieved via Google Earth Engine. Land-cover masking uses ESA WorldCover. Validation labels use the Hansen / UMD / Google / USGS / NASA Global Forest Change dataset. Map basemaps: OpenStreetMap contributors; satellite basemap from Google Maps (if keyed) or Esri.