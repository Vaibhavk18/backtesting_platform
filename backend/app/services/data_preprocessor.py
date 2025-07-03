from datetime import datetime, timezone

def preprocess_ohlcv(raw_entry):
    raw_ohlcv = raw_entry["data"]
    instId = raw_entry.get("instId") 
    bar = raw_entry.get("bar")         
    exchange = raw_entry.get("exchange", "okx")
    

    # Parse base and quote from instId if possible
    base, quote = ("", "")
    if instId and "-" in instId:
        base, quote = instId.split("-")
    elif instId and "/" in instId:
        base, quote = instId.split("/")
    else:
        base, quote = instId, ""

    processed = []
    for candle in raw_ohlcv:
        # OKX /history-candles format: [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]
        processed.append({
            "timestamp": datetime.fromtimestamp(int(candle[0]) / 1000, tz=timezone.utc).isoformat(),
            "open": float(candle[1]),
            "high": float(candle[2]),
            "low": float(candle[3]),
            "close": float(candle[4]),
            "volume": float(candle[5]),
            "volCcy": float(candle[6]),
            "volCcyQuote": float(candle[7]),
            "confirm": int(candle[8]),
            "exchange": exchange,
            "instId": instId,
            "bar": bar,
            "base": base,
            "quote": quote,
            
        })
    return processed
def preprocess_trades(raw_entry):
    """
    Preprocess raw trades data from OKX or similar sources.
    Expects raw_entry to have keys:
        - "data": list of trades, each as [trade_id, ts, price, size, side]
        - "instId": instrument id (e.g., "BTC-USDT")
        - "exchange": exchange name (default "okx")
    """
    raw_trades = raw_entry["data"]
    instId = raw_entry.get("instId")
    exchange = raw_entry.get("exchange", "okx")

    # Parse base and quote from instId if possible
    base, quote = ("", "")
    if instId and "-" in instId:
        base, quote = instId.split("-")
    elif instId and "/" in instId:
        base, quote = instId.split("/")
    else:
        base, quote = instId, ""

    processed = []
    for trade in raw_trades:
        # OKX trade format: [trade_id, ts, price, size, side]
        processed.append({
            "trade_id": str(trade[0]),
            "timestamp": datetime.fromtimestamp(int(trade[1]) / 1000, tz=timezone.utc).isoformat(),
            "price": float(trade[2]),
            "size": float(trade[3]),
            "side": str(trade[4]),
            "exchange": exchange,
            "instId": instId,
            "base": base,
            "quote": quote,
        })
    return processed