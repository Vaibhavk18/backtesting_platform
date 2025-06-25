from app.db.supabase_client import supabase
import logging

logger = logging.getLogger("uvicorn.error")

def store_preprocessed_data(records):
    if not records:
        return

    batch_size = 500
    for i in range(0, len(records), batch_size):
        chunk = records[i:i + batch_size]
        try:
            supabase.table("ohlcv_data").insert(chunk).execute()
        except Exception as e:
            logger.error(f"[DataStore] DB ERROR Inserting batch {i}-{i+batch_size}: {e}", exc_info=True)
