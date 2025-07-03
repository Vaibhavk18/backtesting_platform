import asyncio
import httpx
import pandas as pd
from datetime import datetime
import time
import traceback
import logging
from typing import List, Dict, Optional, Any

logger = logging.getLogger("uvicorn.error")

# OKX API Configuration
OKX_BASE_URL = "https://www.okx.com"
OKX_API_VERSION = "v5"



class OKXDataFetcher:
    def __init__(self):
        self.base_url = f"{OKX_BASE_URL}/api/{OKX_API_VERSION}"
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    
    
    
    async def get_instruments(self, inst_type: str = "SPOT") -> Optional[List[Dict]]:
        """
        Get available instruments from OKX
        :param inst_type: Instrument type (SPOT, SWAP, FUTURES, OPTION)
        :return: List of instruments or None if error
        """
        try:
            url = f"{self.base_url}/public/instruments"
            params = {"instType": inst_type}
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") != "0":
                logger.error(f"[OKX] API Error: {data}")
                return None
            
            instruments = data.get("data", [])
            logger.info(f"[OKX] Fetched {len(instruments)} {inst_type} instruments")
            return instruments
            
        except Exception as e:
            logger.error(f"[OKX] Error fetching instruments for {inst_type}: {e}", exc_info=True)
            return None

    async def fetch_history_candles(
        self, instId: str, bar: str = "1m", after: Optional[str] = None, before: Optional[str] = None, limit: int = 100
    ) -> Optional[list]:
        """
        Fetch historical candlestick data from OKX API (history-candles endpoint)
        :param instId: Instrument ID (e.g., BTC-USDT)
        :param bar: Bar size (e.g., 1s, 1m, 5m, 1D, etc.)
        :param after: Pagination - return records earlier than this timestamp
        :param before: Pagination - return records newer than this timestamp
        :param limit: Number of results (max 300)
        :return: List of candles, each as [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]
        """
        try:
            url = f"{self.base_url}/market/history-candles"
            params = {
                "instId": instId,
                "bar": bar,
                "limit": min(limit, 300)
            }
            if after:
                params["after"] = after
            if before:
                params["before"] = before
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            if data.get("code") != "0":
                logger.error(f"[OKX] API Error: {data}")
                return None
            candles = data.get("data", [])
            # Each candle: [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]
            return candles
        except Exception as e:
            logger.error(f"[OKX] Error fetching history candles for {instId}-{bar}: {e}", exc_info=True)
            return None

    async def fetch_history_trades(
        self,
        instId: str,
        type_: str = "1",
        after: Optional[str] = None,
        before: Optional[str] = None,
        limit: int = 100
    ) -> Optional[list]:
        """
        Fetch trade history from OKX API (history-trades endpoint)
        :param instId: Instrument ID (e.g., BTC-USDT)
        :param type_: Pagination type (1: tradeId, 2: timestamp)
        :param after: Return records earlier than this tradeId or ts
        :param before: Return records newer than this tradeId
        :param limit: Number of results (max 100)
        :return: List of trade objects
        """
        try:
            url = f"{self.base_url}/market/history-trades"
            params = {
                "instId": instId,
                "type": type_,
                "limit": min(limit, 100)
            }
            if after:
                params["after"] = after
            if before:
                params["before"] = before
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            if data.get("code") != "0":
                logger.error(f"[OKX] API Error: {data}")
                return None
            return data.get("data", [])
        except Exception as e:
            logger.error(f"[OKX] Error fetching history trades for {instId}: {e}", exc_info=True)
            return None


