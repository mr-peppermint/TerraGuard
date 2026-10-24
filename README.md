# VanRakshak - Satellite Forest-Loss Alerts (CL-01, live prototype)

## What is REAL and what is DEMO

| Part | Status |
|---|---|
| **Live monitor panel** (Explorer page, top-right): scan the last **5 / 10 / 15 days** | **Real** - Sentinel-2 L2A analysed on Google Earth Engine through the FastAPI backend |
| Auto-monitor (new satellite pass -> new alert pushed to the map) | **Real** - Server-Sent Events from the backend scheduler, or triggered by Spark |
| Apache Spark Structured Streaming layer | **Real, optional** - `backend/spark/spark_stream.py` (needs Java + pyspark) |
| Held-out-state validation | **Real once you run** `backend/heldout_validation.py`; until then the UI shows a **PLACEHOLDER** label |
| Pre-loaded corridors, alert lists, Change Lab canvases, forecasts | **Demo / simulated** - labelled `DEMO DATA` when no live scan has been run for that region |

The badge in the Live monitor shows `LIVE DATA` or `DEMO DATA` for the selected region, and the status dot shows whether the
backend and Earth Engine are connected. Nothing is silently faked: if the backend is down you get a message, not made-up alerts.

## How the live detection works (backend/detector.py)

1. Cloud, shadow, cirrus and snow pixels are masked with the Sentinel-2 SCL band (classes 3, 8, 9, 10, 11).
2. **Monitoring composite** = median of the last N days (5 / 10 / 15). If clouds leave < 25 % clear pixels the window is widened x2 / x3 and the UI says so.
3. **Seasonal baseline** = the *same calendar window one year earlier* (+/-15 days) - this is what separates leaf-fall / harvest / river changes from real loss.
4. **Recent baseline** = the 60 days before the window - a pixel must also have dropped against it, so only *recent* clearing is flagged.
5. Only pixels that were forest (ESA WorldCover tree class, NDVI >= 0.5 last year) and are now sparse (NDVI < 0.45) with dNDVI and dNBR below threshold are kept.
6. Patches smaller than the minimum size are sieved out, the rest are vectorised, scored with an explainable 0-100 heuristic and returned as GeoJSON.

Sentinel-2 revisits every ~5 days and Earth Engine publishes scenes ~2-3 days after acquisition, so "live" means *near-real-time*, not instant.

## Run it (3 terminals)

```bash
# 0) one-time: Earth Engine access (free for non-commercial use) - pick ONE
earthengine authenticate                      # developer login, then set GCP_PROJECT_ID in .env
#   or put a service-account key path in EE_SERVICE_ACCOUNT_JSON (see .env.example)

# 1) backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env                    # then edit GCP_PROJECT_ID / key path
uvicorn app:app --reload --port 8000
#   http://localhost:8000/health  ->  "earth_engine": true

# 2) frontend
cd ..
npm install
npm run dev                                   # http://localhost:5173  -> Explorer -> Live monitor
```

Optional **Spark real-time layer** (needs Java 17: `brew install openjdk@17`):

```bash
cd backend
pip install -r requirements-spark.txt
python scene_poller.py            # watches the Sentinel-2 catalogue, drops new-scene events into ./stream_in
python spark/spark_stream.py      # Spark Structured Streaming: filter, de-duplicate, trigger live detection
```
Tick **Auto-monitor** in the UI first (it registers the region with the backend). Spark then pushes new alerts to the open map.

**Validation on a held-out state** (required by the problem statement):

```bash
cd backend && python heldout_validation.py --year 2023 \
   --train 85.35,21.95,85.55,22.15 --heldout 82.45,22.30,82.65,22.50    # minLon,minLat,maxLon,maxLat
```
It tunes the threshold on the training box, freezes it, reports precision / recall / F1 on the held-out box against Hansen labels,
and writes `backend/validation_results.json`, which the Methodology page and Analytics panel pick up automatically. The two example boxes are
placeholders - choose your own training and held-out states.

## Known limits (say these before the judges do)

* Rule-based thresholds, not a trained model. The held-out script tunes one threshold on coarse Hansen labels; it does not train a classifier.
* Hansen labels are 30 m and yearly, so recall/precision are estimates, not ground truth.
* One scan covers at most ~22 km x 22 km around the region centre (fast, and Earth Engine-friendly).
* The driver of a loss patch (mining / road / agriculture) is **not** classified live - alerts say "Undetermined" until verified.
* Change Lab canvases and the forecast charts are still simulated visuals.
* Not run end-to-end in the environment this was built in (no internet / Earth Engine there): the code compiles and type-checks, helper logic and the poller were unit-tested, but the first live Earth Engine call happens on your machine.

---

# TerraGuard — Forest Intelligence & Autonomous Planetary Monitoring
### Minimal Satellite Forest-Loss Monitoring & AI Deforestation Forecasting

TerraGuard is an editorial, research-grade geospatial web application designed to detect, delineate, and investigate potential tropical and subtropical forest canopy loss using Copernicus Sentinel-2 MSI Level-2A surface-reflectance imagery, Google Earth Engine processing, and multi-year AI predictive deforestation forecasting.

Designed with a calm, architectural, and editorial aesthetic inspired by Northline Studio, TerraGuard uses warm off-white (`#F3F0E8`), sand (`#A89679`), charcoal (`#141512`), and muted forest tones (`#344236`).

---

## What's New in this Release

1. **Redesigned Explorer Page with Split-Screen & Viewport Integration**:
   - Full viewport interactive MapLibre GL map.
   - Live **Split-Screen Mode** allowing simultaneous map exploration and dual-temporal Change Lab side-by-side inspection.
   - Collapsible drawers for region navigation and the **Geospatial Loss Analytics & Evidence Ledger**.
   - Interactive coordinate probing: click or drag anywhere on the map to trigger dynamic AI multi-year forecasting on any custom region.

2. **Geospatial Loss Analytics & Evidence Ledger (The Reference Screenshot)**:
   - 6 top key metrics: **Candidate Alerts**, **Potentially Affected Area (HA)**, **Cloud-Free Purity (%)**, **Monitoring Horizon (T1 - T2)**, **Sensor Resolution (10m GSD MSI)**, and **Screening Status (UNVERIFIED Leads)**.
   - 3 main analytical charts matching the exact layout and muted palette:
     1. **Estimated Loss by Suspected Driver (Hectares)**: Horizontal bar chart breakdown across mining, linear infrastructure, wildfires, and agriculture.
     2. **Screening Severity Allocation**: Donut triage ring (Critical, Elevated, Screening).
     3. **Portfolio Monitoring Sites**: Regional canopy disturbance vertical comparison.
   - Instant **RFC-4180 CSV Export**.

3. **Multi-Year Deforestation Predictions directly on the Map**:
   - Selectable horizons: **1 Year**, **3 Years**, and **5 Years**.
   - Spatial risk polygons projected directly onto the map with high-visibility warning borders, risk probability percentages, and road proximity scores.
   - Multi-year cumulative progression area charts.

4. **Synchronized Alerts Across the App**:
   - Alert list and detail pages now display multi-year projected expansion risk alongside spectral band deltas.

---

## Free Online AI Agent Setup (Hugging Face / Gemini)

To configure online AI agents for real-time deforestation risk assessment:

### Option 1: Hugging Face Serverless Inference API (Free Tier)
1. Sign up at [huggingface.co](https://huggingface.co) and generate a free Read Token at `https://huggingface.co/settings/tokens`.
2. Open your `.env` file (or copy `.env.example` to `.env`):
   ```bash
   VITE_HUGGINGFACE_API_KEY=hf_your_free_token_here
   ```
3. Models supported out of the box: `meta-llama/Llama-3.2-3B-Instruct`, `Qwen/Qwen2.5-7B-Instruct`.

### Option 2: Google Gemini Flash 1.5 API (Free Tier)
1. Generate a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add it to your `.env` file:
   ```bash
   VITE_GEMINI_API_KEY=your_free_gemini_key_here
   ```

*Note: If no API key is provided, TerraGuard automatically defaults to its built-in Spatial Cellular Automata & Random Forest heuristic ensemble, ensuring 100% functionality with zero downtime.*

---

## Google Earth Engine Backend Setup

The Python backend is located in the `backend/` directory:

1. Create a Python virtual environment:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Set your Google Earth Engine service account key path in `.env`:
   ```bash
   EE_SERVICE_ACCOUNT_JSON=/absolute/path/to/your-service-account.json
   ```
3. Run the backend server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

---

## Running the Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
Production build: `npm run build`.
