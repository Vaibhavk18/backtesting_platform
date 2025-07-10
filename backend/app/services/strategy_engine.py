import pandas as pd
from typing import Dict, Any, List, Union, Optional 
from app.schemas.strategy_schemas import LogicNode, Condition, IndicatorConfig
from app.services.indicators import ema, rsi, macd
import logging

logger = logging.getLogger("uvicorn.error")

class StrategyEngine:
    def __init__(self):
        self.indicators = {
            "EMA": ema,
            "RSI": rsi,
            "MACD": macd
        }
        logger.info("[StrategyEngine] Initialized with indicators: EMA, RSI, MACD")
    
    def calculate_indicators(self, data: pd.DataFrame, indicator_configs: List[IndicatorConfig], components: Optional[List[Any]] = None) -> Dict[str, pd.Series]:
        """Calculate all indicators for the given data, including node-based MACD if present"""
        results = {}
        # Standard indicator configs
        for config in indicator_configs:
            try:
                if config.type == "EMA":
                    period = config.params.get("period", 10)
                    results[f"EMA_{period}"] = self.indicators["EMA"](data["close"], period)
                    logger.info(f"[StrategyEngine] Calculated EMA_{period}")
                elif config.type == "RSI":
                    period = config.params.get("period", 14)
                    results["RSI"] = self.indicators["RSI"](data["close"], period)
                    logger.info(f"[StrategyEngine] Calculated RSI_{period}")
                elif config.type == "MACD":
                    fast = config.params.get("fast_period", 12)
                    slow = config.params.get("slow_period", 26)
                    signal = config.params.get("signal_period", 9)
                    macd_line, signal_line, histogram = self.indicators["MACD"](data["close"], fast, slow, signal)
                    results["MACD"] = macd_line
                    results["MACD_SIGNAL"] = signal_line
                    results["MACD_HISTOGRAM"] = histogram
                    logger.info(f"[StrategyEngine] Calculated MACD (fast={fast}, slow={slow}, signal={signal})")
            except Exception as e:
                logger.error(f"[StrategyEngine] Error calculating indicator {config.type}: {e}", exc_info=True)
        # Node-based MACD components
        if components:
            for comp in components:
                if comp.type == "macd-indicator":
                    props = comp.properties
                    fast = props.get("fast_period", 12)
                    slow = props.get("slow_period", 26)
                    signal = props.get("signal_period", 9)
                    macd_line, signal_line, histogram = self.indicators["MACD"](data["close"], fast, slow, signal)
                    results[f"MACD_{fast}_{slow}_{signal}"] = macd_line
                    results[f"MACD_SIGNAL_{fast}_{slow}_{signal}"] = signal_line
                    results[f"MACD_HISTOGRAM_{fast}_{slow}_{signal}"] = histogram
                    logger.info(f"[StrategyEngine] Calculated node-based MACD (fast={fast}, slow={slow}, signal={signal})")
        return results
    
    def evaluate_condition(self, condition: Condition, indicators: Dict[str, pd.Series], index: int) -> bool:
        """Evaluate a single condition at a specific index"""
        
        if isinstance(condition.left, str):
            left_val = indicators[condition.left].iloc[index]
        else:
            left_val = condition.left
        
        
        if isinstance(condition.right, str):
            right_val = indicators[condition.right].iloc[index]
        else:
            right_val = condition.right
        
    
        if condition.operator == "<":
            return left_val < right_val
        elif condition.operator == ">":
            return left_val > right_val
        elif condition.operator == "<=":
            return left_val <= right_val
        elif condition.operator == ">=":
            return left_val >= right_val
        elif condition.operator == "==":
            return left_val == right_val
        elif condition.operator == "!=":
            return left_val != right_val
        else:
            raise ValueError(f"Unknown operator: {condition.operator}")
    
    def evaluate_logic_node(self, node: LogicNode, indicators: Dict[str, pd.Series], index: int) -> bool:
        """Recursively evaluate a logic node"""
        if node.condition:
            return self.evaluate_condition(node.condition, indicators, index)
        
        if node.and_:
            return all(self.evaluate_logic_node(child, indicators, index) for child in node.and_)
        
        if node.or_:
            return any(self.evaluate_logic_node(child, indicators, index) for child in node.or_)
        
        return False
    
    def generate_signals(self, data: pd.DataFrame, entry_logic: LogicNode, exit_logic: LogicNode, 
                        indicator_configs: List[IndicatorConfig], components: Optional[List[Any]] = None) -> pd.Series:
        """Generate buy/sell signals based on entry and exit logic"""
        
        logger.info("[StrategyEngine] Generating signals...")
        try:
            indicators = self.calculate_indicators(data, indicator_configs, components)
            
            signals = pd.Series(index=data.index, data=0) 
            
            for i in range(len(data)):
                entry_signal = self.evaluate_logic_node(entry_logic, indicators, i)
                exit_signal = self.evaluate_logic_node(exit_logic, indicators, i)
                
                if entry_signal:
                    signals.iloc[i] = 1  
                elif exit_signal:
                    signals.iloc[i] = -1  
            
            logger.info("[StrategyEngine] Signal generation complete.")
            return signals
        except Exception as e:
            logger.error(f"[StrategyEngine] Error generating signals: {e}", exc_info=True)
            raise
