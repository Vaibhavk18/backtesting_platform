import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.okx_data_fetcher import OKXDataFetcher

@pytest.fixture
def sample_history_candles_data():
    return {
        "code": "0",
        "msg": "",
        "data": [
            ["1640995200000", "46200.1", "46200.1", "46200.1", "46200.1", "0.1", "4620.01", "4620.01", "1"],
            ["1640995260000", "46200.1", "46200.2", "46200.1", "46200.2", "0.2", "9240.02", "9240.02", "1"]
        ]
    }

@pytest.fixture
def sample_history_trades_data():
    return {
        "code": "0",
        "msg": "",
        "data": [
            {
                "instId": "BTC-USDT",
                "tradeId": "123456",
                "px": "46200.1",
                "sz": "0.1",
                "side": "buy",
                "ts": "1640995200000"
            }
        ]
    }

class TestOKXDataFetcher:
    @pytest.mark.asyncio
    async def test_fetch_history_candles_success(self, sample_history_candles_data):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = sample_history_candles_data
        with patch('httpx.AsyncClient.get', return_value=mock_response):
            async with OKXDataFetcher() as fetcher:
                result = await fetcher.fetch_history_candles("BTC-USDT", "1m", limit=2)
                assert result is not None
                assert len(result) == 2
                assert result[0][0] == "1640995200000"
                assert result[0][1] == "46200.1"
    
    @pytest.mark.asyncio
    async def test_fetch_history_trades_success(self, sample_history_trades_data):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = sample_history_trades_data
        with patch('httpx.AsyncClient.get', return_value=mock_response):
            async with OKXDataFetcher() as fetcher:
                result = await fetcher.fetch_history_trades("BTC-USDT", "1", limit=1)
                assert result is not None
                assert len(result) == 1
                assert result[0]["instId"] == "BTC-USDT"
                assert result[0]["tradeId"] == "123456" 