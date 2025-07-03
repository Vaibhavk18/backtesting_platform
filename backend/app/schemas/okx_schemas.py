from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class OKXCandle(BaseModel):
    instId: str
    bar: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    volCcy: Optional[float] = None
    volCcyQuote: Optional[float] = None
    confirm: int
    base: str
    quote: str
    exchange: str = Field(default="okx")
    created_at: Optional[datetime] = None

    class Config:
        form_attributes = True

class OKXTrade(BaseModel):
    instId: str
    trade_id: str
    price: float
    size: float
    side: str
    timestamp: datetime
    base: Optional[str] = None
    quote: Optional[str] = None
    exchange: str = Field(default="okx")
    created_at: Optional[datetime] = None

    class Config:
        form_attributes = True

class PaginationMeta(BaseModel):
    next_cursor: Optional[str] = None
    prev_cursor: Optional[str] = None
    total: Optional[int] = None

class OKXCandleBatchResponse(BaseModel):
    instId: str
    bar: str
    count: int
    candles: List[OKXCandle]

class OKXTradeBatchResponse(BaseModel):
    instId: str
    count: int
    trades: List[OKXTrade]

class OKXCandlePaginatedResponse(BaseModel):
    instId: str
    bar: str
    count: int
    candles: List[OKXCandle]
    pagination: PaginationMeta

class OKXTradePaginatedResponse(BaseModel):
    instId: str
    count: int
    trades: List[OKXTrade]
    pagination: PaginationMeta 