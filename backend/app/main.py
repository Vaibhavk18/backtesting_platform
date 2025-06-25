from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
import traceback
import os
from app.api.v1 import data_routes, websocket_routes, metrics_routes, backtest_routes

app = FastAPI(
    title="Backtesting Platform API",
    version="1.0.0",
    description="Backend API for full-stack backtesting platform"
)

app.include_router(data_routes.router, prefix="/api/v1")
app.include_router(websocket_routes.router, prefix="/api/v1")
app.include_router(metrics_routes.router, prefix="/api/v1")
app.include_router(backtest_routes.router, prefix="/api/v1")

# Configure file-based logging with absolute path
log_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'app.log'))
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[
        logging.FileHandler(log_path),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("uvicorn.error")
logger.info("=== Logger initialized and main.py loaded ===")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    logger.error(f"Unhandled error for {request.method} {request.url}:\n{tb}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )

# Middleware to log all requests and responses
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code} for {request.method} {request.url}")
        return response
    except Exception as exc:
        logger.error(f"Exception during request: {exc}", exc_info=True)
        raise

#Health check route 
@app.get("/")
def root():
    return {"message": "Backtesting Platform API is running"}
