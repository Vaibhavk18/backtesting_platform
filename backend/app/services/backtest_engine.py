import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from app.schemas.strategy_schemas import StrategySchema
from app.services.strategy_engine import StrategyEngine
from app.api.v1.metrics_routes import store_backtest_result
import logging

logger = logging.getLogger("uvicorn.error")

class BacktestEngine:
    def __init__(self, initial_capital: float = 10000):
        self.initial_capital = initial_capital
        self.strategy_engine = StrategyEngine()
        logger.info(f"[BacktestEngine] Initialized with initial_capital={initial_capital}")
        
    def get_market_config(self, market_type: str) -> Dict:
        configs = {
            "spot": {
                "leverage": 1.0,
                "margin_requirement": 1.0,
                "settlement": "immediate",
                "funding_rate": 0.0
            },
            "perp": {
                "leverage": 10.0,
                "margin_requirement": 0.1,
                "settlement": "continuous",
                "funding_rate": 0.0001
            },
            "future": {
                "leverage": 20.0,
                "margin_requirement": 0.05,
                "settlement": "expiry",
                "funding_rate": 0.0
            },
            "options": {
                "leverage": 1.0,
                "margin_requirement": 1.0,
                "settlement": "expiry",
                "funding_rate": 0.0
            }
        }
        return configs.get(market_type, configs["spot"])
        
    def calculate_position_size(self, price: float, allocation: float, current_capital: float, 
                              market_type: str, leverage: Optional[float] = None) -> float:
        config = self.get_market_config(market_type)
        effective_leverage = leverage if leverage else config["leverage"]
        
        base_position = (current_capital * allocation) / price
        return base_position * effective_leverage
    
    def apply_slippage_and_fees(self, price: float, is_buy: bool, slippage_bps: float, fee_bps: float) -> float:
        slippage_multiplier = 1 + (slippage_bps / 10000) if is_buy else 1 - (slippage_bps / 10000)
        fee_multiplier = 1 + (fee_bps / 10000) if is_buy else 1 - (fee_bps / 10000)
        return price * slippage_multiplier * fee_multiplier
    
    def calculate_margin_requirement(self, position_value: float, market_type: str) -> float:
        config = self.get_market_config(market_type)
        return position_value * config["margin_requirement"]
    
    def apply_funding_rate(self, position_value: float, market_type: str, hours: float = 8) -> float:
        config = self.get_market_config(market_type)
        funding_rate = config["funding_rate"]
        return position_value * funding_rate * (hours / 8)
    
    def execute_order(self, order_type: str, price: float, quantity: float, 
                     slippage_bps: float, fee_bps: float, market_type: str) -> Tuple[float, float]:
        if order_type == "market":
            actual_price = self.apply_slippage_and_fees(price, True, slippage_bps, fee_bps)
        else:
            actual_price = self.apply_slippage_and_fees(price, True, 0, fee_bps)
        
        config = self.get_market_config(market_type)
        if market_type in ["perp", "future"]:
            cost = actual_price * quantity * config["margin_requirement"]
        else:
            cost = actual_price * quantity
            
        return actual_price, cost
    
    def to_serializable(self, val):
        if isinstance(val, np.floating):
            return float(val)
        elif isinstance(val, np.integer):
            return int(val)
        elif isinstance(val, np.ndarray):
            return val.tolist()
        elif isinstance(val, pd.Series):
            return val.tolist()
        elif isinstance(val, dict):
            return {k: self.to_serializable(v) for k, v in val.items()}
        elif isinstance(val, list):
            return [self.to_serializable(v) for v in val]
        else:
            return val

    def run_backtest(self, data: pd.DataFrame, strategy: StrategySchema) -> Any:
        logger.info(f"[BacktestEngine] Running backtest for strategy={strategy.name}")
        try:
            signals = self.strategy_engine.generate_signals(
                data, strategy.entry, strategy.exit, strategy.indicators
            )
            
            capital = self.initial_capital
            position = 0.0
            trades = []
            equity_curve = []
            funding_payments = []
            config = self.get_market_config(strategy.market_type)
            entry_price = None
            
            for i in range(len(data)):
                current_price = data.iloc[i]["close"]
                signal = signals.iloc[i]
                
                if strategy.market_type == "perp" and position != 0:
                    funding_payment = self.apply_funding_rate(position * current_price, strategy.market_type)
                    capital -= funding_payment
                    funding_payments.append({
                        "timestamp": data.index[i],
                        "amount": funding_payment
                    })
                
                if signal == 1 and position == 0:
                    quantity = self.calculate_position_size(
                        current_price, strategy.allocation, capital, strategy.market_type
                    )
                    
                    position_value = quantity * current_price
                    required_margin = self.calculate_margin_requirement(position_value, strategy.market_type)
                    
                    actual_price, cost = self.execute_order(
                        strategy.order_type, current_price, quantity,
                        strategy.slippage, strategy.fee, strategy.market_type
                    )
                    
                    if cost <= capital:
                        position = quantity
                        capital -= cost
                        entry_price = actual_price
                        trades.append({
                            "timestamp": data.index[i],
                            "type": "BUY",
                            "price": actual_price,
                            "quantity": quantity,
                            "cost": cost,
                            "market_type": strategy.market_type
                        })
                
                elif position > 0 and entry_price is not None:
                    sl_triggered = False
                    tp_triggered = False
                    if strategy.stop_loss is not None and current_price <= entry_price * (1 - strategy.stop_loss):
                        sl_triggered = True
                    if strategy.take_profit is not None and current_price >= entry_price * (1 + strategy.take_profit):
                        tp_triggered = True
                    if sl_triggered or tp_triggered:
                        actual_price, revenue = self.execute_order(
                            strategy.order_type, current_price, position,
                            strategy.slippage, strategy.fee, strategy.market_type
                        )
                        capital += revenue
                        trades.append({
                            "timestamp": data.index[i],
                            "type": "SELL_SL" if sl_triggered else "SELL_TP",
                            "price": actual_price,
                            "quantity": position,
                            "revenue": revenue,
                            "market_type": strategy.market_type
                        })
                        position = 0.0
                        entry_price = None
                
                elif signal == -1 and position > 0:
                    actual_price, revenue = self.execute_order(
                        strategy.order_type, current_price, position,
                        strategy.slippage, strategy.fee, strategy.market_type
                    )
                    
                    capital += revenue
                    trades.append({
                        "timestamp": data.index[i],
                        "type": "SELL",
                        "price": actual_price,
                        "quantity": position,
                        "revenue": revenue,
                        "market_type": strategy.market_type
                    })
                    position = 0.0
                    entry_price = None
                
                position_value = position * current_price
                current_equity = capital + position_value
                equity_curve.append(current_equity)
            
            equity_series = pd.Series(equity_curve, index=data.index)
            returns = equity_series.pct_change().dropna()
            
            total_return = (equity_series.iloc[-1] - self.initial_capital) / self.initial_capital
            sharpe_ratio = returns.mean() / returns.std() * np.sqrt(252) if returns.std() > 0 else 0
            max_drawdown = (equity_series / equity_series.expanding().max() - 1).min()
            
            def convert_trade(trade):
                return {k: (float(v) if isinstance(v, np.floating) else
                            int(v) if isinstance(v, np.integer) else
                            v)
                        for k, v in trade.items()}
            
            logger.info(f"[BacktestEngine] Backtest complete for strategy={strategy.name}")
            results = {
                "initial_capital": self.initial_capital,
                "final_capital": equity_series.iloc[-1],
                "total_return": total_return,
                "sharpe_ratio": sharpe_ratio,
                "max_drawdown": max_drawdown,
                "trades": [convert_trade(t) for t in trades],
                "equity_curve": equity_series,
                "returns": returns,
                "signals": signals,
                "funding_payments": funding_payments,
                "market_type": strategy.market_type
            }
            return self.to_serializable(results)
        except Exception as e:
            logger.error(f"[BacktestEngine] Error during backtest: {e}", exc_info=True)
            raise

def run_and_store_backtest(strategy_id: str, data: pd.DataFrame, strategy, user_id: Optional[str] = None):
    logger.info(f"[BacktestEngine] run_and_store_backtest: strategy_id={strategy_id}, user_id={user_id}")
    try:
        engine = BacktestEngine()
        results = engine.run_backtest(data, strategy)
        store_backtest_result(strategy_id, results, user_id)
        logger.info(f"[BacktestEngine] Stored results for strategy_id={strategy_id}")
        return results
    except Exception as e:
        logger.error(f"[BacktestEngine] Error in run_and_store_backtest: {e}", exc_info=True)
        raise
