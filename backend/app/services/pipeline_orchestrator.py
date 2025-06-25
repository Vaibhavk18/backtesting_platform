import sys
import asyncio
from app.services.data_fetcher import discover_and_fetch_all
from app.services.data_preprocessor import preprocess_ohlcv
from app.services.data_store import store_preprocessed_data
import logging

logger = logging.getLogger("uvicorn.error")


logger.info("=== Pipeline script started ===")

if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def main():
    logger.info("[Pipeline] Starting data fetch process...")

    try:
        all_ohlcv_data = await discover_and_fetch_all()
        logger.info(f"[Pipeline] Total fetched data sets: {len(all_ohlcv_data)}")

        total_records = 0
        for record in all_ohlcv_data:
            logger.info(f"[Pipeline] Processing record: {record.get('symbol', 'N/A')}")
            if not record or not record.get("data") or len(record["data"]) == 0:
                logger.warning("[Pipeline] Skipping empty record")
                continue

            preprocessed = preprocess_ohlcv(record)
            logger.info(f"[Pipeline] Preprocessed {len(preprocessed)} rows for {record['symbol']}")

            store_preprocessed_data(preprocessed)
            logger.info(f"[Pipeline] Stored {len(preprocessed)} rows for {record['symbol']}")
            total_records += len(preprocessed)

        logger.info(f"[Pipeline] Completed pipeline. Total records stored: {total_records}")
    except Exception as e:
        logger.error(f"[Pipeline] ERROR: {e}", exc_info=True)
        raise

if __name__ == "__main__":
    asyncio.run(main())
