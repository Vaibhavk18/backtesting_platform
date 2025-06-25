from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Optional
import json
import asyncio
from datetime import datetime
import logging

router = APIRouter()

logger = logging.getLogger("uvicorn.error")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.backtest_sessions: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"[WebSocket] Connected: session_id={session_id}, total_active={len(self.active_connections)}")
        if session_id:
            if session_id not in self.backtest_sessions:
                self.backtest_sessions[session_id] = []
            self.backtest_sessions[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: Optional[str] = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"[WebSocket] Disconnected: session_id={session_id}, total_active={len(self.active_connections)}")
        if session_id and session_id in self.backtest_sessions:
            if websocket in self.backtest_sessions[session_id]:
                self.backtest_sessions[session_id].remove(websocket)
            if not self.backtest_sessions[session_id]:
                del self.backtest_sessions[session_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

    async def broadcast_to_session(self, message: str, session_id: str):
        if session_id in self.backtest_sessions:
            for connection in self.backtest_sessions[session_id]:
                try:
                    await connection.send_text(message)
                except:
                    pass

manager = ConnectionManager()

@router.websocket("/ws/backtest/{session_id}")
async def websocket_backtest_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"[WebSocket] Received message: session_id={session_id}, data={data}")
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await manager.send_personal_message(
                    json.dumps({"type": "pong", "timestamp": datetime.now().isoformat()}),
                    websocket
                )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        logger.info(f"[WebSocket] Disconnected (exception): session_id={session_id}")

@router.websocket("/ws/backtest")
async def websocket_general_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await manager.send_personal_message(
                    json.dumps({"type": "pong", "timestamp": datetime.now().isoformat()}),
                    websocket
                )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def send_backtest_update(session_id: str, update_type: str, data: Dict):
    message = {
        "type": update_type,
        "session_id": session_id,
        "timestamp": datetime.now().isoformat(),
        "data": data
    }
    await manager.broadcast_to_session(json.dumps(message), session_id)

async def send_backtest_progress(session_id: str, current_step: int, total_steps: int, message: str = ""):
    progress_data = {
        "current_step": current_step,
        "total_steps": total_steps,
        "progress_percentage": (current_step / total_steps) * 100,
        "message": message
    }
    await send_backtest_update(session_id, "progress", progress_data)

async def send_backtest_trade(session_id: str, trade_data: Dict):
    await send_backtest_update(session_id, "trade", trade_data)

async def send_backtest_complete(session_id: str, results: Dict):
    await send_backtest_update(session_id, "complete", results)

async def send_backtest_error(session_id: str, error_message: str):
    error_data = {"error": error_message}
    await send_backtest_update(session_id, "error", error_data) 