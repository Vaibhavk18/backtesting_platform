from datetime import datetime, timezone

def preprocess_ohlcv(raw_entry):
    raw_ohlcv = raw_entry["data"]
    exchange = raw_entry["exchange"]
    market_type = raw_entry["market_type"]
    symbol = raw_entry["symbol"]
    timeframe = raw_entry["timeframe"]

    base, quote = symbol.split("/")

    processed = []
    for candle in raw_ohlcv:
        processed.append({
            "timestamp": datetime.fromtimestamp(candle[0] / 1000, tz=timezone.utc).isoformat(),
            "open": candle[1],
            "high": candle[2],
            "low": candle[3],
            "close": candle[4],
            "volume": candle[5],
            "exchange": exchange,
            "market_type": market_type,
            "base_symbol": base,
            "quote_symbol": quote,
            "timeframe": timeframe
        })
    return processed