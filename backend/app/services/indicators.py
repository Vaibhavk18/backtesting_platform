import pandas as pd
from typing import List, Union

def ema(series: Union[pd.Series, List[float]], period: int) -> pd.Series:
    """Exponential Moving Average (EMA)"""
    return pd.Series(pd.Series(series).ewm(span=period, adjust=False).mean())

def rsi(series: Union[pd.Series, List[float]], period: int = 14) -> pd.Series:
    """Relative Strength Index (RSI)"""
    series = pd.Series(series)
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return pd.Series(rsi)

def macd(series: Union[pd.Series, List[float]], fast_period: int = 12, slow_period: int = 26, signal_period: int = 9):
    """Moving Average Convergence Divergence (MACD)"""
    series = pd.Series(series)
    ema_fast = series.ewm(span=fast_period, adjust=False).mean()
    ema_slow = series.ewm(span=slow_period, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram 