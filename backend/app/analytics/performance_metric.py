import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional

def pnl(equity_curve: pd.Series) -> float:
    return float(equity_curve.iloc[-1] - equity_curve.iloc[0])

def pnl_pct(equity_curve: pd.Series) -> float:
    return float((equity_curve.iloc[-1] / equity_curve.iloc[0]) - 1)

def cagr(equity_curve: pd.Series, periods_per_year=252) -> float:
    n_years = (len(equity_curve) - 1) / periods_per_year
    return float((equity_curve.iloc[-1] / equity_curve.iloc[0]) ** (1 / n_years) - 1) if n_years > 0 else float(0)

def sharpe(returns: pd.Series, risk_free_rate=0.0, periods_per_year=252) -> float:
    excess = returns - risk_free_rate / periods_per_year
    return float(np.sqrt(periods_per_year) * excess.mean() / excess.std()) if excess.std() > 0 else float(0)

def sortino(returns: pd.Series, risk_free_rate=0.0, periods_per_year=252) -> float:
    downside = returns[returns < 0]
    denom = downside.std() if len(downside) > 0 else 1
    excess = returns - risk_free_rate / periods_per_year
    if denom > 0:
        return float(np.sqrt(periods_per_year) * excess.mean() / denom)
    else:
        return float(0)

def max_drawdown(equity_curve: pd.Series) -> float:
    roll_max = equity_curve.cummax()
    drawdown = (equity_curve / roll_max) - 1
    return float(drawdown.min())

# --- Trade Metrics ---
def trade_metrics(trades: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not trades:
        return {"win_rate": None, "trade_count": 0, "avg_duration": None, "turnover": None}
    buy_trades = [t for t in trades if t["type"].startswith("BUY")]
    sell_trades = [t for t in trades if t["type"].startswith("SELL")]
    trade_count = min(len(buy_trades), len(sell_trades))
    wins = 0
    durations = []
    turnover = 0.0
    for buy, sell in zip(buy_trades, sell_trades):
        profit = (sell["price"] - buy["price"]) * buy["quantity"]
        if profit > 0:
            wins += 1
        
        durations.append(sell["timestamp"] - buy["timestamp"] if isinstance(sell["timestamp"], (int, float)) else 1)
        turnover += buy["cost"] + sell.get("revenue", 0)
    win_rate = wins / trade_count if trade_count > 0 else None
    avg_duration = np.mean(durations) if durations else None
    return {
        "win_rate": win_rate,
        "trade_count": trade_count,
        "avg_duration": avg_duration,
        "turnover": turnover
    }

# --- Risk Metrics ---
def var(returns: pd.Series, alpha: float = 0.05) -> float:
    return float(np.percentile(returns, 100 * alpha))

def beta_to_btc(strategy_returns: pd.Series, btc_returns: pd.Series) -> Optional[float]:
    if len(strategy_returns) != len(btc_returns):
        return None
    cov = np.cov(strategy_returns, btc_returns)
    var_btc = np.var(btc_returns)
    return float(cov[0, 1] / var_btc) if var_btc > 0 else None

def average_leverage(trades: List[Dict[str, Any]]) -> Optional[float]:
    leverages = [t.get("leverage", 1.0) for t in trades if "leverage" in t]
    return float(np.mean(leverages)) if leverages else None
