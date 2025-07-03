from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Union, Any, Dict

class IndicatorConfig(BaseModel):
    type: Literal["EMA", "RSI", "MACD"]
    params: dict[str,Any]

class Condition(BaseModel):
    left: Union[str, float]  # e.g., "EMA_10", "RSI", or a number
    operator: Literal["<", ">", "<=", ">=", "==", "!="]
    right: Union[str, float]

class LogicNode(BaseModel):
    and_: Optional[List["LogicNode"]] = None
    or_: Optional[List["LogicNode"]] = None
    condition: Optional[Condition] = None

LogicNode.model_rebuild()

class StrategySchema(BaseModel):
    name: str
    data: Dict[str, Any]  # Accepts the full frontend strategy object
    indicators: List[IndicatorConfig]
    entry: LogicNode
    exit: LogicNode
    order_type: Literal["market", "limit"]
    market_type: Literal["spot", "perp", "future", "options"]
    allocation: float = Field(..., description="Fraction of portfolio to allocate, e.g. 0.1 for 10%")
    slippage: float = Field(0.0, description="Slippage in basis points (bps)")
    fee: float = Field(0.0, description="Fee in basis points (bps)")
    stop_loss: Optional[float] = Field(None, description="Stop loss as a percentage (e.g. 0.05 for 5%)")
    take_profit: Optional[float] = Field(None, description="Take profit as a percentage (e.g. 0.1 for 10%)")
    components: Optional[dict] = Field(None, description="Node-based components for the strategy")
    connections: Optional[dict] = Field(None, description="Node-based connections for the strategy")
