import pandas as pd
from app.analytics import performance_metric

def test_pnl():
    eq = pd.Series([100, 110, 120])
    assert performance_metric.pnl(eq) == 20

def test_max_drawdown():
    eq = pd.Series([100, 120, 80, 130])
    assert performance_metric.max_drawdown(eq) < 0

def test_sharpe():
    returns = pd.Series([0.01, 0.02, -0.01, 0.03])
    assert isinstance(performance_metric.sharpe(returns), float)

def test_sortino():
    returns = pd.Series([0.01, 0.02, -0.01, 0.03])
    assert isinstance(performance_metric.sortino(returns), float)

def test_var():
    returns = pd.Series([0.01, 0.02, -0.01, 0.03])
    assert isinstance(performance_metric.var(returns), float) 