import pytest
from fastapi.testclient import TestClient
from app.main import app
import time

client = TestClient(app)

strategy_id = "integration-test-strategy"

strategy_payload = {
    "name": "IntegrationTest",
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
}

ohlcv_data = [
    {"timestamp": i, "open": float(i), "high": float(i)+0.1, "low": float(i)-0.1, "close": float(i), "volume": 100.0} for i in range(1, 11)
]

def test_full_workflow_backtest_and_metrics():
    # Run backtest
    response = client.post(f"/api/v1/backtest/{strategy_id}", json={
        "strategy": strategy_payload,
        "ohlcv_data": ohlcv_data
    })
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    
    time.sleep(1)

    # Fetch metrics
    response = client.get(f"/api/v1/metrics/{strategy_id}")
    assert response.status_code == 200
    metrics = response.json()
    assert "pnl" in metrics
    assert "trade_metrics" in metrics
    assert "max_drawdown" in metrics 