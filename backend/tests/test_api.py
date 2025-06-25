import pytest
from fastapi.testclient import TestClient
from app.main import app
import json
import os
print("CWD:", os.getcwd())

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_backtest_endpoint_smoke():
    # Minimal valid payload for the backtest endpoint
    payload = {
        "strategy": {
            "name": "Test",
            "indicators": [{"type": "EMA", "params": {"period": 3}}],
            "entry": {"condition": {"left": "EMA_3", "operator": ">", "right": 2.0}},
            "exit": {"condition": {"left": "EMA_3", "operator": "<", "right": 8.0}},
            "order_type": "market",
            "market_type": "spot",
            "allocation": 0.5,
            "slippage": 0.0,
            "fee": 0.0,
            "stop_loss": None,
            "take_profit": None
        },
        "ohlcv_data": [
            {"timestamp": i, "open": float(i), "high": float(i)+0.1, "low": float(i)-0.1, "close": float(i), "volume": 100.0} for i in range(1, 11)
        ]
    }
    response = client.post("/api/v1/backtest/test-strategy", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

# Metrics endpoint test (assumes a backtest has been run and stored)
def test_metrics_endpoint_smoke():
    response = client.get("/api/v1/metrics/test-strategy")
    # Accept 200 or 404 (if no backtest result yet)
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        assert "pnl" in response.json()

# WebSocket endpoint test (basic connect/ping)
def test_websocket_backtest_ping():
    with client.websocket_connect("/api/v1/ws/backtest/test-session") as ws:
        ws.send_text(json.dumps({"type": "ping"}))
        data = ws.receive_text()
        msg = json.loads(data)
        assert msg["type"] == "pong" 