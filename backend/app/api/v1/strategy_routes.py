from fastapi import APIRouter, HTTPException, Body, Query
from typing import Optional
from app.db.supabase_client import supabase
from datetime import datetime
from app.schemas.strategy_schemas import StrategySchema

router = APIRouter()

@router.get("/strategies", tags=["Strategy"])
async def get_strategies():
    result = supabase.table("strategies").select("*").execute()
    return result.data

@router.post("/strategies", tags=["Strategy"])
async def save_strategy(strategy: StrategySchema):
    # Serialize components and connections to dicts if they are Pydantic models
    def serialize_list(items):
        if items is None:
            return None
        return [item.dict() if hasattr(item, 'dict') else item for item in items]

    result = supabase.table("strategies").upsert({
        "name": strategy.name,
        "description": getattr(strategy, "description", None),
        "market_type": getattr(strategy, "market_type", None),
        "order_type": getattr(strategy, "order_type", None),
        "allocation": getattr(strategy, "allocation", None),
        "slippage": getattr(strategy, "slippage", None),
        "fee": getattr(strategy, "fee", None),
        "stop_loss": getattr(strategy, "stop_loss", None),
        "take_profit": getattr(strategy, "take_profit", None),
        "data": strategy.data,
        "components": serialize_list(strategy.components),
        "connections": serialize_list(strategy.connections)
    }).execute()
    return result

@router.get("/performance", tags=["Performance"])
async def get_performance(strategy_id: str = Query(...), time_range: str = Query(...)):
    result = supabase.table("performance").select("*").eq("strategy_id", strategy_id).eq("time_range", time_range).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No performance data found")
    return result.data[0]

@router.post("/performance", tags=["Performance"])
async def save_performance(
    strategy_id: str = Body(...),
    time_range: str = Body(...),
    metrics_json: dict = Body(...)
):
    record = {
        "strategy_id": strategy_id,
        "time_range": time_range,
        "metrics_json": metrics_json,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase.table("performance").insert(record).execute()
    return result.data 