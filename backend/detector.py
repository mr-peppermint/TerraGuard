import json
import math
import os
from datetime import date, datetime, timedelta, timezone

try:
    import ee
except ImportError:  # backend still starts so /health can explain what is missing
    ee = None

S2 = "COPERNICUS/S2_SR_HARMONIZED"
WORLDCOVER = "ESA/WorldCover/v200"
MAX_AREA_KM2 = float(os.getenv("MAX_AREA_KM2", "1500"))
BANDS = ["NDVI", "NBR", "B2", "B3", "B4", "B8"]

EE_READY = False
EE_ERROR = "Earth Engine not initialised yet"


# --------------------------------------------------------------------------- init
def init_earth_engine():
    """
    Auth order (first match wins):
      1. EE_SERVICE_ACCOUNT_JSON_CONTENT - full JSON key text (use this on cloud hosts, no file needed)
      2. EE_SERVICE_ACCOUNT_JSON         - path to a key file on disk
      3. cached `earthengine authenticate` login (developer machine)
    """
    global EE_READY, EE_ERROR
    if ee is None:
        EE_READY, EE_ERROR = False, "earthengine-api is not installed (pip install -r requirements.txt)"
        return False
    project = os.getenv("GCP_PROJECT_ID") or None
    key_content = (os.getenv("EE_SERVICE_ACCOUNT_JSON_CONTENT") or "").strip()
    key_path = os.getenv("EE_SERVICE_ACCOUNT_JSON")
    try:
        if key_content:
            email = json.loads(key_content)["client_email"]
            creds = ee.ServiceAccountCredentials(email, key_data=key_content)
            ee.Initialize(creds, project=project)
        elif key_path and os.path.isfile(key_path):
            ee.Initialize(ee.ServiceAccountCredentials(None, key_path), project=project)
        else:  # developer machine: run `earthengine authenticate` once
            ee.Initialize(project=project)
        EE_READY, EE_ERROR = True, None
    except Exception as exc:  # noqa: BLE001
        EE_READY, EE_ERROR = False, f"{type(exc).__name__}: {exc}"
    return EE_READY


# --------------------------------------------------------------------------- helpers
def _first_ring(geometry):
    g = geometry.get("geometry", geometry) if geometry.get("type") == "Feature" else geometry
    coords = g["coordinates"]
    while coords and isinstance(coords[0][0], list):
        coords = coords[0]
    return g, coords


def bbox_area_km2(geometry):
    _, ring = _first_ring(geometry)
    lons = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    mid_lat = math.radians((min(lats) + max(lats)) / 2)
    return (max(lons) - min(lons)) * 111.32 * math.cos(mid_lat) * (max(lats) - min(lats)) * 110.57


def _region(geometry):
    if bbox_area_km2(geometry) > MAX_AREA_KM2:
        raise ValueError(
            f"Area too large for a live scan (limit {MAX_AREA_KM2:.0f} km2). Zoom in / pick a smaller region."
        )
    g, _ = _first_ring(geometry)
    return ee.Geometry(g)


def _iso(d):
    return d.isoformat()


def _mask_s2(img):
    scl = img.select("SCL")
    bad = scl.eq(3).Or(scl.eq(8)).Or(scl.eq(9)).Or(scl.eq(10)).Or(scl.eq(11))
    return img.updateMask(bad.Not())


def _add_indices(img):
    ndvi = img.normalizedDifference(["B8", "B4"]).rename("NDVI")
    nbr = img.normalizedDifference(["B8", "B12"]).rename("NBR")
    return img.addBands([ndvi, nbr])


def _collection(region, start, end, max_cloud):
    """end is INCLUSIVE here (Earth Engine's filterDate end is exclusive, so add a day)."""
    return (
        ee.ImageCollection(S2)
        .filterBounds(region)
        .filterDate(_iso(start), _iso(end + timedelta(days=1)))
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", max_cloud))
        .map(_mask_s2)
        .map(_add_indices)
    )


def _composite(col):
    return col.select(BANDS).median()


# --------------------------------------------------------------------------- scene info
def scene_stats(region, start, end, max_cloud=60):
    col = _collection(region, start, end, max_cloud)
    info = ee.Dictionary(
        {
            "n": col.size(),
            "latest": col.aggregate_max("system:time_start"),
            "cloud": col.aggregate_mean("CLOUDY_PIXEL_PERCENTAGE"),
            "tile": col.aggregate_array("MGRS_TILE").distinct().slice(0, 3),
        }
    ).getInfo()
    valid = None
    if info["n"]:
        valid = (
            col.select("NDVI").count().gt(0)
            .reduceRegion(ee.Reducer.mean(), region, 60, maxPixels=1e9, bestEffort=True)
            .get("NDVI")
            .getInfo()
        )
        valid = None if valid is None else round(valid * 100, 1)
    latest = info["latest"]
    return {
        "scenes": info["n"],
        "latest_scene": datetime.fromtimestamp(latest / 1000, timezone.utc).date().isoformat() if latest else None,
        "mean_cloud_percent": round(info["cloud"], 1) if info["cloud"] is not None else None,
        "tiles": info["tile"],
        "valid_pixel_percent": valid,
    }


def list_recent_scenes(geometry, days=10, max_cloud=80, end=None):
    region = _region(geometry)
    end = end or datetime.now(timezone.utc).date()
    col = _collection(region, end - timedelta(days=days), end, max_cloud)
    feats = col.map(
        lambda i: ee.Feature(
            None,
            {
                "scene_id": i.get("system:index"),
                "tile": i.get("MGRS_TILE"),
                "scene_time": i.get("system:time_start"),
                "cloud": i.get("CLOUDY_PIXEL_PERCENTAGE"),
            },
        )
    )
    return [f["properties"] for f in feats.getInfo()["features"]]


# --------------------------------------------------------------------------- core detection
def loss_image(mon_c, seas_c, rec_c, ndvi_thr, nbr_thr, min_patch_ha):
    """Binary (masked) image of candidate forest loss + the bands used for per-patch statistics."""
    forest = ee.ImageCollection(WORLDCOVER).first().select("Map").eq(10)
    d_ndvi = mon_c.select("NDVI").subtract(seas_c.select("NDVI")).rename("dNDVI")
    d_nbr = mon_c.select("NBR").subtract(seas_c.select("NBR")).rename("dNBR")
    cond = (
        d_ndvi.lte(ndvi_thr)
        .And(d_nbr.lte(nbr_thr))
        .And(seas_c.select("NDVI").gte(0.5))   # was dense vegetation a year ago
        .And(mon_c.select("NDVI").lt(0.45))    # is no longer dense vegetation
        .And(forest)
    )
    d_rec = None
    if rec_c is not None:
        d_rec = mon_c.select("NDVI").subtract(rec_c.select("NDVI")).rename("dRecent")
        cond = cond.And(d_rec.lte(ndvi_thr / 2))  # the drop is recent, not an old clearing
    binary = cond.unmask(0)
    min_px = int(min(250, max(1, round(min_patch_ha * 100))))  # 1 ha = 100 Sentinel-2 pixels
    keep = binary.eq(1).And(binary.connectedPixelCount(256, True).gte(min_px))
    loss = binary.updateMask(keep).rename("loss")
    parts = [
        d_ndvi, d_nbr,
        seas_c.select("NDVI").rename("ndvi_before"), mon_c.select("NDVI").rename("ndvi_after"),
        seas_c.select(["B2", "B3", "B4", "B8"]).rename(["b2_before", "b3_before", "b4_before", "b8_before"]),
        mon_c.select(["B2", "B3", "B4", "B8"]).rename(["b2_after", "b3_after", "b4_after", "b8_after"]),
    ]
    if d_rec is not None:
        parts.append(d_rec)
    return loss, ee.Image.cat(parts)


def _score(props, valid_pct):
    """Explainable 0-100 screening score (a heuristic, NOT a calibrated probability)."""
    mag = min(30.0, abs(props.get("dNDVI") or 0) / 0.5 * 30)
    persist = min(25.0, abs(props.get("dRecent") or props.get("dNDVI") or 0) / 0.3 * 25)
    contig = min(20.0, (props.get("area_ha") or 0) / 5.0 * 20)
    spectral = min(15.0, abs(props.get("dNBR") or 0) / 0.4 * 15)
    penalty = 0.0 if (valid_pct or 0) >= 60 else -min(20.0, (60 - (valid_pct or 0)) / 60 * 20)
    total = max(0, min(100, round(mag + persist + contig + spectral + penalty)))
    return {
        "ndviMagnitude": round(mag), "temporalConsistency": round(persist),
        "patchContiguity": round(contig), "spectralDistinctness": round(spectral),
        "cloudShadowRiskPenalty": round(penalty), "finalScore": total,
    }


def detect_windows(geometry, mon_start, mon_end, base_start, base_end, rec_start=None, rec_end=None,
                   ndvi_threshold=-0.20, nbr_threshold=-0.15, min_patch_ha=0.3, max_cloud=60,
                   max_features=150, mon_stats=None):
    """Compare a monitoring window against a seasonal baseline (and optionally a recent baseline)."""
    region = _region(geometry)
    mon = _collection(region, mon_start, mon_end, max_cloud)
    seas = _collection(region, base_start, base_end, max_cloud)
    rec = _collection(region, rec_start, rec_end, max_cloud) if rec_start else None

    mon_stats = mon_stats or scene_stats(region, mon_start, mon_end, max_cloud)
    sizes = ee.Dictionary({"seasonal": seas.size(), "recent": rec.size() if rec is not None else 1}).getInfo()
    meta = {
        "source": S2,
        "monitoring": {"start": _iso(mon_start), "end": _iso(mon_end), **mon_stats},
        "baseline_seasonal": {"start": _iso(base_start), "end": _iso(base_end), "scenes": sizes["seasonal"]},
        "baseline_recent": {"start": _iso(rec_start), "end": _iso(rec_end), "scenes": sizes["recent"]} if rec_start else None,
        "thresholds": {"ndvi": ndvi_threshold, "nbr": nbr_threshold, "min_patch_ha": min_patch_ha, "max_cloud": max_cloud},
        "computed_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    empty = {"type": "FeatureCollection", "features": []}
    if mon_stats["scenes"] == 0:
        meta["status"] = "no_scenes"
        meta["message"] = "No usable Sentinel-2 scenes in this window yet (clouds or no recent pass)."
        return empty, meta
    if sizes["seasonal"] == 0 or sizes["recent"] == 0:
        meta["status"] = "no_baseline"
        meta["message"] = "Not enough baseline imagery to compare against."
        return empty, meta

    mon_c, seas_c = _composite(mon), _composite(seas)
    rec_c = _composite(rec) if rec is not None else None
    loss, stats_img = loss_image(mon_c, seas_c, rec_c, ndvi_threshold, nbr_threshold, min_patch_ha)

    vectors = loss.reduceToVectors(
        geometry=region, scale=10, geometryType="polygon", eightConnected=True,
        maxPixels=1e9, tileScale=4,
    )
    vectors = vectors.map(
        lambda f: ee.Feature(f).set("area_ha", ee.Feature(f).geometry().area(10).divide(10000))
    )
    vectors = vectors.filter(ee.Filter.gte("area_ha", min_patch_ha))
    totals = ee.Dictionary({"count": vectors.size(), "total_ha": vectors.aggregate_sum("area_ha")}).getInfo()
    top = vectors.sort("area_ha", False).limit(max_features)
    top = stats_img.reduceRegions(collection=top, reducer=ee.Reducer.mean(), scale=10, tileScale=4)
    top = top.map(lambda f: ee.Feature(ee.Feature(f).geometry().simplify(5)).copyProperties(f))
    fc = top.getInfo()

    valid = mon_stats.get("valid_pixel_percent")
    out = []
    for i, f in enumerate(fc.get("features", [])):
        p = f["properties"]
        breakdown = _score(p, valid)
        score = breakdown["finalScore"]
        out.append({
            "type": "Feature",
            "geometry": f["geometry"],
            "properties": {
                "id": i + 1,
                "area_ha": round(p.get("area_ha", 0), 2),
                "dndvi": round(p.get("dNDVI", 0), 3), "dnbr": round(p.get("dNBR", 0), 3),
                "drecent": round(p["dRecent"], 3) if p.get("dRecent") is not None else None,
                "ndvi_before": round(p.get("ndvi_before", 0), 3), "ndvi_after": round(p.get("ndvi_after", 0), 3),
                "bands_before": {k: round((p.get(f"{k}_before") or 0) / 10000, 4) for k in ("b2", "b3", "b4", "b8")},
                "bands_after": {k: round((p.get(f"{k}_after") or 0) / 10000, 4) for k in ("b2", "b3", "b4", "b8")},
                "score": score,
                "severity": "critical" if score >= 75 else "high" if score >= 60 else "moderate" if score >= 45 else "low",
                "breakdown": breakdown,
            },
        })
    meta.update({
        "status": "ok",
        "candidates_total": totals["count"],
        "total_loss_ha": round(totals["total_ha"] or 0, 1),
        "candidates_returned": len(out),
    })
    return {"type": "FeatureCollection", "features": out}, meta


def detect_recent(geometry, days=10, end=None, max_cloud=60, min_valid_pct=25.0, **kw):
    """Last-N-days scan. Widens the window (x2, x3) when clouds leave too little clear coverage."""
    region = _region(geometry)
    end = end or datetime.now(timezone.utc).date()
    chosen, stats, widened = None, None, False
    for mult in (1, 2, 3):
        win = days * mult
        s = scene_stats(region, end - timedelta(days=win), end, max_cloud)
        chosen, stats = win, s
        if s["scenes"] > 0 and (s["valid_pixel_percent"] or 0) >= min_valid_pct:
            break
        widened = mult > 1 or widened
    mon_start = end - timedelta(days=chosen)
    fc, meta = detect_windows(
        geometry, mon_start, end,
        base_start=mon_start - timedelta(days=365 + 15), base_end=end - timedelta(days=365 - 15),
        rec_start=mon_start - timedelta(days=60), rec_end=mon_start - timedelta(days=1),
        max_cloud=max_cloud, mon_stats=stats, **kw,
    )
    meta["requested_days"] = days
    meta["window_days"] = chosen
    meta["widened"] = chosen != days
    if meta["widened"] and meta.get("status") == "ok":
        meta["message"] = f"Window widened from {days} to {chosen} days because of cloud cover."
    if (stats["valid_pixel_percent"] or 0) < min_valid_pct and stats["scenes"] > 0:
        meta["warning"] = "Low clear-sky coverage - treat detections with caution."
    return fc, meta