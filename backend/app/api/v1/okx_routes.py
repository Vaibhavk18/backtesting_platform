from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from datetime import datetime
from app.services.okx_data_fetcher import OKXDataFetcher
from app.schemas.okx_schemas import (
    OKXCandleBatchResponse, OKXTradeBatchResponse,
    OKXCandlePaginatedResponse, OKXTradePaginatedResponse, PaginationMeta, OKXCandle, OKXTrade
)
from app.services.pipeline_orchestrator import fetch_preprocess_store_candles, fetch_preprocess_store_trades

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

OKX_BAR_MAP = {
    "1m": "1m",
    "3m": "3m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1H",
    "4h": "4H",
    "1d": "1D",
    "1w": "1W",
    "1M": "1M"
}

@router.get("/instruments", tags=["OKX Data"])
async def get_okx_instruments(inst_type: str = Query("SPOT", description="Instrument type: SPOT, SWAP, FUTURES, OPTION")):
    """
    Get available instruments from OKX
    """
    try:
        async with OKXDataFetcher() as fetcher:
            instruments = await fetcher.get_instruments(inst_type)
            
            if instruments is None:
                raise HTTPException(status_code=500, detail="Failed to fetch instruments from OKX")
            
            return {
                "inst_type": inst_type,
                "count": len(instruments),
                "instruments": instruments
            }
    except Exception as e:
        logger.error(f"[OKX] Error getting instruments: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history-candles", tags=["OKX Data"], response_model=OKXCandleBatchResponse)
async def get_okx_history_candles(
    instId: str = Query(..., description="Instrument ID (e.g., BTC-USDT)"),
    bar: str = Query("1m", description="Bar size (e.g., 1s, 1m, 5m, 1D, etc.)"),
    after: Optional[str] = Query(None, description="Pagination - return records earlier than this timestamp (ms)"),
    before: Optional[str] = Query(None, description="Pagination - return records newer than this timestamp (ms)"),
    limit: int = Query(100, ge=1, le=300, description="Number of results (max 300)")
):
    """
    Get historical candlestick data from OKX (history-candles endpoint)
    """
    try:
        async with OKXDataFetcher() as fetcher:
            candles = await fetcher.fetch_history_candles(instId, bar, after, before, limit)
            if candles is None:
                raise HTTPException(status_code=500, detail="Failed to fetch history candles from OKX")
            # Convert to Pydantic models
            candle_objs = [OKXCandle(
                instId=instId,
                bar=bar,
                timestamp=datetime.fromtimestamp(int(c[0]) / 1000),
                open=float(c[1]),
                high=float(c[2]),
                low=float(c[3]),
                close=float(c[4]),
                volume=float(c[5]),
                volCcy=float(c[6]) if c[6] is not None else None,
                volCcyQuote=float(c[7]) if c[7] is not None else None,
                confirm=int(c[8]),
                base=instId.split('-')[0],
                quote=instId.split('-')[1],
            ) for c in candles]
            return OKXCandleBatchResponse(
                instId=instId,
                bar=bar,
                count=len(candle_objs),
                candles=candle_objs
            )
    except Exception as e:
        logger.error(f"[OKX] Error getting history candles: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history-trades", tags=["OKX Data"], response_model=OKXTradeBatchResponse)
async def get_okx_history_trades(
    instId: str = Query(..., description="Instrument ID (e.g., BTC-USDT)"),
    type_: str = Query("1", alias="type", description="Pagination type: 1 (tradeId), 2 (timestamp)"),
    after: Optional[str] = Query(None, description="Return records earlier than this tradeId or ts"),
    before: Optional[str] = Query(None, description="Return records newer than this tradeId"),
    limit: int = Query(100, ge=1, le=100, description="Number of results (max 100)")
):
    """
    Get trade history from OKX (history-trades endpoint)
    """
    try:
        async with OKXDataFetcher() as fetcher:
            trades = await fetcher.fetch_history_trades(instId, type_, after, before, limit)
            if trades is None:
                raise HTTPException(status_code=500, detail="Failed to fetch history trades from OKX")
            trade_objs = [OKXTrade(
                instId=trade["instId"],
                trade_id=trade["tradeId"],
                price=float(trade["px"]),
                size=float(trade["sz"]),
                side=trade["side"],
                timestamp=datetime.fromtimestamp(int(trade["ts"]) / 1000),
                base=trade["instId"].split('-')[0],
                quote=trade["instId"].split('-')[1],
            ) for trade in trades]
            return OKXTradeBatchResponse(
                instId=instId,
                count=len(trade_objs),
                trades=trade_objs
            )
    except Exception as e:
        logger.error(f"[OKX] Error getting history trades: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-ingest-candles-and-trades", tags=["Testing Only"])
async def test_ingest_candles_and_trades(
    instId: str = Query("BTC-USDT", description="Instrument ID (e.g., BTC-USDT)"),
    bar: str = Query("1m", description="Bar size (e.g., 1m, 5m, 1D, etc.)"),
    limit: int = Query(100, ge=1, le=300, description="Number of results (max 300)")
):
    """
    Test endpoint: Fetch, preprocess, and store a batch of candles and trades for a given symbol/bar/limit.
    This is for Swagger UI testing only.
    """
    await fetch_preprocess_store_candles(instId, bar, limit)
    await fetch_preprocess_store_trades(instId, limit)
    return {"status": "success", "message": f"Ingested candles and trades for {instId} {bar} (limit {limit})"}

@router.get("/ohlcv", tags=["OKX Data"])
async def get_ohlcv(
    symbol: str = Query(..., description="Instrument ID (e.g., BTC-USDT)"),
    timeframe: str = Query("1h", description="Bar size (e.g., 1m, 5m, 1h, 1d)"),
    exchange: str = Query("okx", description="Exchange name"),
    market_type: str = Query("SPOT", description="Market type")
):
    try:
        okx_bar = OKX_BAR_MAP.get(timeframe, timeframe)
        async with OKXDataFetcher() as fetcher:
            candles = await fetcher.fetch_history_candles(symbol, okx_bar)
            if not candles:
                raise HTTPException(status_code=404, detail="No OHLCV data found")
            return {
                "symbol": symbol,
                "timeframe": timeframe,
                "ohlcv": candles
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

