from fastapi import APIRouter, HTTPException, Query
from supabase import create_client, Client
from typing import List, Optional
import os
import logging
from datetime import datetime

router = APIRouter()

from app.db.supabase_client import supabase  
from app.services.data_fetcher import fetch_ohlcv, discover_and_fetch_all

logger = logging.getLogger("uvicorn.error")

@router.get("/ohlcv", tags=["Data Access"])
async def get_ohlcv_data(
    symbol: str = Query(..., description="e.g. BTC/USDT"),
    timeframe: str = Query(..., description="e.g. 1m, 5m, 1h, 1d"),
    exchange: Optional[str] = Query("binance", description="Exchange (default: binance)"),
    market_type: Optional[str] = Query("spot", description="Market type (default: spot)"),
    limit: int = Query(500, ge=1, le=1000, description="Number of candles to fetch (default: 500, max: 1000)")
):
    """
    Get OHLCV data filtered by symbol, timeframe, and optionally exchange and market type.
    """
    logger.info(f"[Data] /ohlcv: symbol={symbol}, timeframe={timeframe}, exchange={exchange}, market_type={market_type}, limit={limit}")
    try:
        query = supabase.table("ohlcv_data").select("*")\
            .eq("symbol", symbol)\
            .eq("timeframe", timeframe)\
            .eq("exchange", exchange)\
            .eq("market_type", market_type)
        result = query.order("timestamp", desc=False).limit(limit).execute()

        if not result.data:
            logger.warning(f"[Data] /ohlcv: No data found for symbol={symbol}, timeframe={timeframe}. Fetching from ccxt...")
            # Fetch from ccxt
            ohlcv_result = await fetch_ohlcv(exchange, market_type, symbol, timeframe, limit=limit)
            if ohlcv_result and ohlcv_result["data"]:
                # Preprocess and store in Supabase
                rows = [
                    {
                        "symbol": symbol,
                        "timeframe": timeframe,
                        "exchange": exchange,
                        "market_type": market_type,
                        "timestamp": datetime.utcfromtimestamp(bar[0] / 1000).isoformat(),
                        "open": bar[1],
                        "high": bar[2],
                        "low": bar[3],
                        "close": bar[4],
                        "volume": bar[5]
                    }
                    for bar in ohlcv_result["data"]
                ]
                if rows:
                    supabase.table("ohlcv_data").insert(rows).execute()
                    logger.info(f"[Data] /ohlcv: Inserted {len(rows)} rows for symbol={symbol}, timeframe={timeframe}")
                    return rows
                else:
                    raise HTTPException(status_code=404, detail="No data found for the given parameters and could not fetch from exchange.")

        logger.info(f"[Data] /ohlcv: Found {len(result.data)} rows for symbol={symbol}, timeframe={timeframe}")
        return result.data

    except Exception as e:
        logger.error(f"[Data] /ohlcv: Error for symbol={symbol}, timeframe={timeframe}, error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/symbols", tags=["Metadata"])
async def get_available_symbols():
    """
    Returns the list of unique symbols available in the OHLCV dataset.
    """
    try:
        result = supabase.table("ohlcv_data").select("symbol").execute()
        symbols = sorted(list(set([row["symbol"] for row in result.data])))
        return {"symbols": symbols}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exchanges", tags=["Metadata"])
async def get_available_exchanges():
    """
    Returns the list of unique exchanges available in the OHLCV dataset.
    """
    try:
        result = supabase.table("ohlcv_data").select("exchange").execute()
        exchanges = sorted(list(set([row["exchange"] for row in result.data])))
        return {"exchanges": exchanges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/timeframes", tags=["Metadata"])
async def get_available_timeframes():
    """
    Returns the list of unique timeframes available in the OHLCV dataset.
    """
    try:
        result = supabase.table("ohlcv_data").select("timeframe").execute()
        timeframes = sorted(list(set([row["timeframe"] for row in result.data])))
        return {"timeframes": timeframes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market-types", tags=["Metadata"])
async def get_available_market_types():
    """
    Returns the list of unique market types available in the OHLCV dataset.
    """
    try:
        result = supabase.table("ohlcv_data").select("market_type").execute()
        market_types = sorted(list(set([row["market_type"] for row in result.data])))
        return {"market_types": market_types}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

