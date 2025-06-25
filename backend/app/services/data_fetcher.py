import asyncio
import ccxt.async_support as ccxt
import pandas as pd
from datetime import datetime
import time
import traceback
import logging

logger = logging.getLogger("uvicorn.error")

SUPPORTED_EXCHANGES = ["binance", "bybit", "coinbase"]
SUPPORTED_MARKET_TYPES = ["spot", "future", "swap", "option"]
SUPPORTED_SYMBOLS = [
     "BTC/USDT", "ETH/USDT", "SOL/USDT", "MATIC/USDT", "DOGE/USDT",
     "XRP/USDT", "ADA/USDT", "LTC/USDT", "BNB/USDT", "AVAX/USDT"
 ]
SUPPORTED_TIMEFRAMES = ["1m", "5m", "1h", "4h", "1d"]
#SUPPORTED_EXCHANGES = ["binance"]
#SUPPORTED_MARKET_TYPES = ["spot"]
#SUPPORTED_SYMBOLS = ["BTC/USDT"]
#SUPPORTED_TIMEFRAMES = ["1h"]

async def fetch_ohlcv(exchange_id, market_type, symbol, timeframe, limit=1000):
    try:
        exchange_class = getattr(ccxt, exchange_id)
        exchange = exchange_class({"enableRateLimit": True})
        exchange.options["defaultType"] = market_type

        await exchange.load_markets()
        if symbol not in exchange.symbols:
            await exchange.close()
            logger.warning(f"[DataFetcher] Symbol {symbol} not in {exchange_id} markets.")
            return None

        ohlcv = await exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
        await exchange.close()
        logger.info(f"[DataFetcher] Fetched {len(ohlcv)} rows for {exchange_id}-{market_type}-{symbol}-{timeframe}")

        return {
            "exchange": exchange_id,
            "market_type": market_type,
            "symbol": symbol,
            "timeframe": timeframe,
            "data": ohlcv
        }
    except Exception as e:
        logger.error(f"[DataFetcher] ERROR {exchange_id}-{market_type}-{symbol}-{timeframe}: {e}", exc_info=True)
        return None

async def discover_and_fetch_all():
    logger.info("[DataFetcher] Starting discovery and fetch for all supported exchanges/symbols/timeframes.")
    tasks = []
    for exchange in SUPPORTED_EXCHANGES:
        for market_type in SUPPORTED_MARKET_TYPES:
            for symbol in SUPPORTED_SYMBOLS:
                for timeframe in SUPPORTED_TIMEFRAMES:
                    tasks.append(fetch_ohlcv(exchange, market_type, symbol, timeframe))

    results = await asyncio.gather(*tasks)
    logger.info(f"[DataFetcher] Discovery complete. Total successful fetches: {len([r for r in results if r is not None])}")
    return [r for r in results if r is not None]