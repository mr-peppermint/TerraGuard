"""
Held-out-state validation (required by the problem statement).

  1. Tune the dNDVI threshold on a TRAINING area (state A) against Hansen Global Forest Change labels.
  2. Freeze the best threshold and report precision / recall / F1 on a HELD-OUT area (state B).

Hansen labels are 30 m and yearly, i.e. exactly the "coarse, noisy labels" described in the problem, so
treat the numbers as an honest estimate, not ground truth. Detection here is year-over-year
(Oct 15 - Dec 31 of the target year vs the same window a year earlier), the same method the live scan uses.

  python heldout_validation.py                       # example areas (edit AOIS below / pass bboxes)
  python heldout_validation.py --year 2023 \
      --train 85.35,21.95,85.55,22.15 --heldout 82.45,22.30,82.65,22.50
Bboxes are minLon,minLat,maxLon,maxLat. Results are also written to validation_results.json.
"""
import argparse
import json
import os
from datetime import date

import ee

import detector

HANSEN = os.getenv("HANSEN_ASSET", "UMD/hansen/global_forest_change_2023_v1_11")
# Examples only: Joda-Barbil mining belt (Odisha) for training, Hasdeo-Arand coal belt (Chhattisgarh) held out.
AOIS = {"train": "85.35,21.95,85.55,22.15", "heldout": "82.45,22.30,82.65,22.50"}


def _bbox(text):
    return [float(x) for x in text.split(",")]


def evaluate(bbox, year, ndvi_thr, min_patch_ha=0.5):
    region = ee.Geometry.Rectangle(bbox)
    mon = detector._collection(region, date(year, 10, 15), date(year, 12, 31), 60)
    prev = detector._collection(region, date(year - 1, 10, 15), date(year - 1, 12, 31), 60)
    loss, _ = detector.loss_image(detector._composite(mon), detector._composite(prev), None,
                                  ndvi_thr, ndvi_thr * 0.75, min_patch_ha)
    det = loss.unmask(0).eq(1)
    hansen = ee.Image(HANSEN)
    forest = ee.ImageCollection(detector.WORLDCOVER).first().select("Map").eq(10)
    truth = hansen.select("lossyear").eq(year - 2000).And(hansen.select("treecover2000").gte(30)).And(forest)
    area = ee.Image.pixelArea().divide(10000)
    res = ee.Image.cat([
        area.updateMask(det.And(truth)).rename("tp"),
        area.updateMask(det.And(truth.Not())).rename("fp"),
        area.updateMask(det.Not().And(truth)).rename("fn"),
    ]).reduceRegion(ee.Reducer.sum(), region, 30, maxPixels=1e11, tileScale=8).getInfo()
    tp, fp, fn = (res.get(k) or 0.0 for k in ("tp", "fp", "fn"))
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {"ndvi_threshold": ndvi_thr, "tp_ha": round(tp, 1), "fp_ha": round(fp, 1), "fn_ha": round(fn, 1),
            "precision": round(precision, 3), "recall": round(recall, 3), "f1": round(f1, 3)}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--year", type=int, default=2023)
    ap.add_argument("--train", default=AOIS["train"])
    ap.add_argument("--heldout", default=AOIS["heldout"])
    args = ap.parse_args()

    if not detector.init_earth_engine():
        raise SystemExit(f"Earth Engine not ready: {detector.EE_ERROR}")

    train_box, test_box = _bbox(args.train), _bbox(args.heldout)
    sweep = []
    for thr in (-0.15, -0.20, -0.25, -0.30):
        r = evaluate(train_box, args.year, thr)
        sweep.append(r)
        print("train  ", r)
    best = max(sweep, key=lambda r: r["f1"])
    held = evaluate(test_box, args.year, best["ndvi_threshold"])
    print("\nBest threshold on training area:", best["ndvi_threshold"])
    print("HELD-OUT result:", held)
    out = {"year": args.year, "labels": HANSEN, "train_bbox": train_box, "heldout_bbox": test_box,
           "train_sweep": sweep, "chosen_threshold": best["ndvi_threshold"], "heldout": held}
    with open("validation_results.json", "w") as fh:
        json.dump(out, fh, indent=2)
    print("saved validation_results.json")
