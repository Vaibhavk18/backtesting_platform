from fastapi import APIRouter, HTTPException, Body
from typing import Optional
from app.services.backtest_engine import run_and_store_backtest
from app.schemas.strategy_schemas import StrategySchema
import pandas as pd
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

@router.post("/backtest/{strategy_id}", tags=["Backtest"])
async def run_backtest_api(
    strategy_id: str,
    strategy: StrategySchema = Body(...),
    user_id: Optional[str] = None,
    ohlcv_data: list = Body(...)
):
    logger.info(f"[Backtest] Request: strategy_id={strategy_id}, user_id={user_id}, strategy={strategy.model_dump()}, ohlcv_len={len(ohlcv_data)}")
    try:
        df = pd.DataFrame(ohlcv_data)
        results = run_and_store_backtest(strategy_id, df, strategy, user_id)
        logger.info(f"[Backtest] Success: strategy_id={strategy_id}, results_keys={list(results.keys())}")
        return {"status": "success", "results": results}
    except Exception as e:
        logger.error(f"[Backtest] Error: strategy_id={strategy_id}, error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 