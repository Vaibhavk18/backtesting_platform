import pandas as pd
from app.services.strategy_engine import StrategyEngine
from app.schemas.strategy_schemas import IndicatorConfig, Condition, LogicNode

def test_strategy_engine_logic():
    data = pd.DataFrame({"close": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]})
    indicators = [IndicatorConfig(type="EMA", params={"period": 3})]
    entry_condition = Condition(left="EMA_3", operator=">", right=2)
    entry_logic = LogicNode(condition=entry_condition)
    exit_logic = LogicNode(condition=Condition(left="EMA_3", operator="<", right=8))
    engine = StrategyEngine()
    signals = engine.generate_signals(data, entry_logic, exit_logic, indicators)
    assert isinstance(signals, pd.Series)
    assert set(signals.unique()).issubset({-1, 0, 1}) 