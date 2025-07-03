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
    # Save the whole strategy.data to the data column, and also components/connections if present
    result = supabase.table("strategies").upsert({
        "name": strategy.name,
        "data": strategy.data,
        "components": strategy.components,
        "connections": strategy.connections
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