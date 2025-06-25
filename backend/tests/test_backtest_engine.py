import pandas as pd
from app.services.backtest_engine import BacktestEngine
from app.schemas.strategy_schemas import IndicatorConfig, Condition, LogicNode, StrategySchema

def test_backtest_engine_basic():
    data = pd.DataFrame({
        "timestamp": range(10),
        "open": [1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0],
        "high": [1.1,2.1,3.1,4.1,5.1,6.1,7.1,8.1,9.1,10.1],
        "low": [0.9,1.9,2.9,3.9,4.9,5.9,6.9,7.9,8.9,9.9],
        "close": [1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0],
        "volume": [100]*10
    })
    indicators = [IndicatorConfig(type="EMA", params={"period": 3})]
    entry_logic = LogicNode(condition=Condition(left="EMA_3", operator=">", right=2.0))
    exit_logic = LogicNode(condition=Condition(left="EMA_3", operator="<", right=8.0))
    strategy = StrategySchema(
        name="Test",
        indicators=indicators,
        entry=entry_logic,
        exit=exit_logic,
        order_type="market",
        market_type="spot",
        allocation=0.5,
        slippage=0.0,
        fee=0.0,
        stop_loss=None,
        take_profit=None
    )
    engine = BacktestEngine(initial_capital=1000)
    results = engine.run_backtest(data, strategy)
    assert "trades" in results
    assert isinstance(results["trades"], list)
    assert "equity_curve" in results
    assert len(results["equity_curve"]) == len(data) 