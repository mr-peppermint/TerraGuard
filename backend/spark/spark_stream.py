"""
Apache Spark Structured Streaming layer (optional, but this is the "Spark real-time" piece).

  Sentinel-2 catalog --(scene_poller.py)--> stream_in/*.json --(Spark)--> FastAPI /detect/recent --> SSE --> React map

Spark reads the folder as an unbounded stream, drops cloudy scenes, de-duplicates scene ids
(stateful, with a watermark), and for every micro-batch triggers ONE live detection per affected
region through the FastAPI backend (which runs the Earth Engine analysis and pushes the result
to the browser over /alerts/stream).

Run (needs Java 17 + `pip install pyspark`):
  cd backend && python spark/spark_stream.py
"""
import json
import os
import urllib.request

from pyspark.sql import SparkSession, functions as F, types as T

API = os.getenv("VR_API", "http://localhost:8000")
IN_DIR = os.getenv("VR_STREAM_IN", "stream_in")
CHECKPOINT = os.getenv("VR_CHECKPOINT", "spark_checkpoint")
MAX_CLOUD = float(os.getenv("VR_MAX_CLOUD", "60"))

schema = T.StructType([
    T.StructField("region_id", T.StringType()),
    T.StructField("scene_id", T.StringType()),
    T.StructField("tile", T.StringType()),
    T.StructField("scene_time", T.LongType()),     # epoch milliseconds
    T.StructField("cloud", T.DoubleType()),
    T.StructField("days", T.IntegerType()),
    T.StructField("geometry", T.StringType()),     # GeoJSON as a JSON string
])


def trigger_detection(batch_df, batch_id):
    rows = batch_df.select("region_id", "geometry", "days", "scene_id").collect()
    if not rows:
        return
    per_region = {}
    for r in rows:
        per_region.setdefault(r.region_id, r)
    print(f"[spark batch {batch_id}] {len(rows)} new scene(s) in {len(per_region)} region(s)")
    for region_id, r in per_region.items():
        body = json.dumps({"region_id": region_id, "geometry": json.loads(r.geometry), "days": r.days,
                           "broadcast": True, "reason": "spark"}).encode()
        req = urllib.request.Request(f"{API}/detect/recent", data=body,
                                     headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=900) as resp:
                meta = json.loads(resp.read())["meta"]
            print(f"  -> {region_id}: {meta.get('candidates_total', 0)} candidate patch(es), "
                  f"latest scene {meta['monitoring'].get('latest_scene')}")
        except Exception as exc:  # noqa: BLE001
            print(f"  -> {region_id}: detection failed: {exc}")


if __name__ == "__main__":
    spark = (SparkSession.builder.appName("vanrakshak-scene-stream").master("local[*]")
             .config("spark.sql.shuffle.partitions", "2").getOrCreate())
    spark.sparkContext.setLogLevel("WARN")

    scenes = (
        spark.readStream.schema(schema).json(IN_DIR)
        .filter(F.col("cloud") <= MAX_CLOUD)
        .withColumn("event_ts", (F.col("scene_time") / 1000).cast("timestamp"))
        .withWatermark("event_ts", "30 days")
        .dropDuplicates(["scene_id", "event_ts"])
    )
    query = (scenes.writeStream.foreachBatch(trigger_detection)
             .option("checkpointLocation", CHECKPOINT)
             .trigger(processingTime="10 seconds").start())
    print(f"Spark streaming from ./{IN_DIR} -> {API}  (Ctrl+C to stop)")
    query.awaitTermination()
