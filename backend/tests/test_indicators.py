import pandas as pd
from app.services.indicators import ema, rsi, macd

def test_ema():
    data = [1.0, 2.0, 3.0, 4.0, 5.0]
    result = ema(data, 2)
    assert isinstance(result, pd.Series)
    assert len(result) == 5

def test_rsi():
    data = [1.0, 2.0, 3.0, 2.0, 1.0, 2.0, 3.0, 4.0, 5.0]
    result = rsi(data, 3)
    assert isinstance(result, pd.Series)
    assert len(result) == 9

def test_macd():
    data = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
    macd_line, signal_line, histogram = macd(data)
    assert len(macd_line) == len(data)
    assert len(signal_line) == len(data)
    assert len(histogram) == len(data) 