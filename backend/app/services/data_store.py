from app.db.supabase_client import supabase
import logging
import asyncio

logger = logging.getLogger("uvicorn.error")

async def async_store_preprocessed_data(records, table: str, batch_size: int = 500, max_retries: int = 3, retry_delay: float = 1.0):
    """
    Asynchronously store a batch of preprocessed records into the specified table with error handling and retries.
    Args:
        records: List of dicts or Pydantic models (OKXCandle/OKXTrade)
        table: 'ohlcv_data' or 'trades_data'
        batch_size: Number of records per batch
        max_retries: Number of times to retry a failed batch
        retry_delay: Seconds to wait between retries
    """
    
    if not records:
        logger.info(f"[DataStore] No records to store for table {table}.")
        return

    # Convert Pydantic models to dicts if needed
    if hasattr(records[0], 'dict'):
        records = [r.dict(exclude_unset=True) for r in records]

    for i in range(0, len(records), batch_size):
        chunk = records[i:i + batch_size]
        attempt = 0
        while attempt < max_retries:
            try:
                # Use upsert to avoid duplicates (requires unique constraint in table)
                supabase.table(table).upsert(chunk).execute()
                logger.info(f"[DataStore] Successfully upserted batch {i}-{i+len(chunk)} into {table}.")
                break
            except Exception as e:
                attempt += 1
                logger.error(f"[DataStore] ERROR upserting batch {i}-{i+len(chunk)} into {table} (attempt {attempt}/{max_retries}): {e}", exc_info=True)
                if attempt < max_retries:
                    await asyncio.sleep(retry_delay)
                else:
                    logger.error(f"[DataStore] FAILED to upsert batch {i}-{i+len(chunk)} into {table} after {max_retries} attempts.")
