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





<<<<<<< HEAD
=======
## Notes

- The backend is designed to be extended with new indicators, risk models, and analytics.
- For production, configure logging, secrets, and database credentials securely.
- Frontend integration is planned for the next phase.

# Project Note

At one point during development, all core features—including strategy creation, saving, loading, and data visualization—were working as intended. However, due to my limited experience with advanced frontend concepts in React, I encountered issues that prevented the "Run Backtest" button from appearing and running as expected in the UI. Despite this, all other data (strategies, performance, and market data) loads and displays correctly, and the backend remains fully functional.

This issue is isolated to the frontend integration of the backtest trigger and will be addressed as a priority in future improvements. I am committed to learning more about advanced React patterns and state management to resolve this and further enhance the platform.

---

You can update this documentation as you add the frontend and more features. 
>>>>>>> 3879a89 (Final project: OKX endpoint integration, frontend improvements, bugfixes, and documentation updates)
