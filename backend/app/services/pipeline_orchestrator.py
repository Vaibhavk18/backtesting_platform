import sys
import asyncio
import logging
from app.services.okx_data_fetcher import OKXDataFetcher
from app.services.data_preprocessor import preprocess_ohlcv, preprocess_trades
from app.services.data_store import async_store_preprocessed_data
from datetime import datetime, timezone

logger = logging.getLogger("uvicorn.error")

logger.info("=== OKX Pipeline Orchestrator started ===")

if sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())



async def fetch_preprocess_store_candles(instId: str, bar: str = "1m", limit: int = 100):
    async with OKXDataFetcher() as fetcher:
        candles = await fetcher.fetch_history_candles(instId, bar, limit=limit)
        if not candles:
            logger.warning(f"No candles found for {instId} {bar}")
            return
        raw_entry = {
            "data": candles,
            "exchange": "okx",
            "market_type": "SPOT",
            "symbol": instId.replace("-", "/"),
            "timeframe": bar,
            "instId": instId,
            "bar": bar,
            "base": instId.split("-")[0],
            "quote": instId.split("-")[1],
        }
        preprocessed = preprocess_ohlcv(raw_entry)
        await async_store_preprocessed_data(preprocessed, "ohlcv_data")
        logger.info(f"Stored {len(preprocessed)} candles for {instId} {bar}")

async def fetch_preprocess_store_trades(instId: str, limit: int = 100):
    async with OKXDataFetcher() as fetcher:
        trades = await fetcher.fetch_history_trades(instId, limit=limit)
        if not trades:
            logger.warning(f"No trades found for {instId}")
            return
        processed = []
        for trade in trades:
            processed.append({
                "trade_id": str(trade["tradeId"]),
                "timestamp": datetime.fromtimestamp(int(trade["ts"]) / 1000, tz=timezone.utc).isoformat(),
                "price": float(trade["px"]),
                "size": float(trade["sz"]),
                "side": str(trade["side"]),
                "exchange": "okx",
                "instId": instId,
                "base": trade["instId"].split("-")[0],
                "quote": trade["instId"].split("-")[1],
            })
        await async_store_preprocessed_data(processed, "trades_data")
        logger.info(f"Stored {len(processed)} trades for {instId}")

if __name__ == "__main__":
    # Example usage: fetch, preprocess, and store BTC-USDT 1m candles and trades
    symbol = "BTC-USDT"
    bar = "1m"
    limit = 100
    asyncio.run(fetch_preprocess_store_candles(symbol, bar, limit))
    asyncio.run(fetch_preprocess_store_trades(symbol, limit))
