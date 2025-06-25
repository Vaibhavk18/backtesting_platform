from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from app.analytics import performance_metric
from app.db.supabase_client import supabase
import json
import pandas as pd
import logging
import numpy as np

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

def to_serializable(val):
    if isinstance(val, np.floating):
        return float(val)
    elif isinstance(val, np.integer):
        return int(val)
    elif isinstance(val, np.ndarray):
        return val.tolist()
    elif isinstance(val, pd.Series):
        return val.tolist()
    elif isinstance(val, dict):
        return {k: to_serializable(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [to_serializable(v) for v in val]
    else:
        return val

def store_backtest_result(strategy_id: str, results: dict, user_id: Optional[str] = None):
    results_to_store = to_serializable(results)
    row = {
        "strategy_id": strategy_id,
        "results_json": json.dumps(results_to_store)
    }
    if user_id:
        row["user_id"] = user_id
    supabase.table("backtest_results").insert(row).execute()

def get_strategy_results(strategy_id: str) -> Dict[str, Any]:
    row = supabase.table("backtest_results") \
        .select("*") \
        .eq("strategy_id", strategy_id) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()
    if not row.data:
        raise HTTPException(status_code=404, detail="No results found for this strategy_id.")
    results = json.loads(row.data[0]["results_json"])
    results["equity_curve"] = pd.Series(results["equity_curve"])
    results["returns"] = pd.Series(results["returns"])
    if results.get("btc_returns") is not None:
        results["btc_returns"] = pd.Series(results["btc_returns"])
    return results

@router.get("/metrics/{strategy_id}", tags=["Performance Analytics"])
async def get_metrics(strategy_id: str):
    logger.info(f"[Metrics] Request: strategy_id={strategy_id}")
    try:
        results = get_strategy_results(strategy_id)
        equity_curve = results["equity_curve"]
        trades = results["trades"]
        returns = results["returns"]
        btc_returns = results.get("btc_returns", None)

        metrics = {
            "pnl": performance_metric.pnl(equity_curve),
            "pnl_pct": performance_metric.pnl_pct(equity_curve),
            "cagr": performance_metric.cagr(equity_curve),
            "sharpe": performance_metric.sharpe(returns),
            "sortino": performance_metric.sortino(returns),
            "max_drawdown": performance_metric.max_drawdown(equity_curve),
            "trade_metrics": performance_metric.trade_metrics(trades),
            "var": performance_metric.var(returns),
            "beta_to_btc": performance_metric.beta_to_btc(returns, btc_returns) if btc_returns is not None else None,
            "average_leverage": performance_metric.average_leverage(trades)
        }
        logger.info(f"[Metrics] Success: strategy_id={strategy_id}, metrics_keys={list(metrics.keys())}")
        return to_serializable(metrics)
    except Exception as e:
        logger.error(f"[Metrics] Error: strategy_id={strategy_id}, error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 