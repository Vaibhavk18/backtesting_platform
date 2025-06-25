# Backtesting & Analytics Platform – Backend

## Overview

This backend provides a modular, testable, and robust API for quantitative trading strategy backtesting and analytics.  
It is built with FastAPI, Supabase, and pandas/numpy, and supports plug-and-play strategies, risk management, and performance analytics.

## Features

- Modular strategy schema (EMA, RSI, MACD, logic nodes, entry/exit, order types, allocation, slippage, fees)
- Backtest engine with support for spot, perp, future, options
- Risk management (stop loss, take profit, leverage, margin)
- Trade ledger and portfolio tracking
- Performance metrics (PnL, CAGR, Sharpe, Sortino, Max Drawdown, VaR, Beta, Leverage)
- REST API endpoints for running backtests and fetching metrics
- Supabase integration for persistent storage
- Pytest-based unit and integration tests
- Detailed logging and error handling

## Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd Backtesting_Platform
   ```

2. **Create and activate a virtual environment:**
   ```sh
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On Mac/Linux
   ```

3. **Install dependencies:**
   ```sh
   pip install -r backend/requirements.txt
   ```

4. **Configure environment variables:**
   - Copy `backend/.env.example` to `backend/.env` and fill in your Supabase credentials.

5. **Run the backend server:**
   ```sh
   uvicorn backend.app.main:app --reload
   ```

6. **Run tests:**
   ```sh
   pytest
   ```





