# Project Note

At one point during development, all core features—including strategy creation, saving, loading, and data visualization—were working as intended. However, due to my limited experience with advanced frontend concepts in React, I encountered issues that prevented the "Run Backtest" button from appearing and running as expected in the UI. Despite this, all other data (strategies, performance, and market data) loads and displays correctly, and the backend remains fully functional.

This issue is isolated to the frontend integration of the backtest trigger and will be addressed as a priority in future improvements. I am committed to learning more about advanced React patterns and state management to resolve this and further enhance the platform.

---

# Backtesting & Analytics Platform

A full-stack platform for building, backtesting, and analyzing quantitative trading strategies.

---

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [API Documentation](#api-documentation)
3. [Strategy Building Guide](#strategy-building-guide)
4. [Performance Considerations](#performance-considerations)
5. [Testing Coverage](#testing-coverage)
6. [Future Improvements](#future-improvements)
7. [Sample Strategies and Results](#sample-strategies-and-results)

---

## Setup Instructions

### Backend

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

6. **Run backend tests:**
   ```sh
   pytest
   ```

### Frontend

1. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   pnpm install
   ```

3. **Create a `.env.local` file:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
   ```

4. **Start the frontend:**
   ```sh
   npm run dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## API Documentation

- **Interactive docs:** Visit [http://localhost:8000/docs](http://localhost:8000/docs) after starting the backend.
- **Key Endpoints:**
  - `GET /api/v1/strategies` — List all strategies
  - `POST /api/v1/strategies` — Save a strategy
  - `POST /api/v1/strategies/validate` — Validate a strategy
  - `POST /api/v1/strategies/backtest` — Run a backtest
  - `GET /api/v1/ohlcv` — Get OHLCV market data
  - `GET /api/v1/performance` — Get performance data

---

## Strategy Building Guide

- Use the **Strategy Builder** in the frontend to drag and drop components (indicators, logic, execution).
- Configure each node's properties by clicking the properties icon.
- Connect nodes by clicking and dragging from outputs to inputs.
- Save your strategy using the toolbar.
- Run a backtest (if button is present) or use the API to backtest your strategy.
- View results in the Performance Dashboard and Data Visualization tabs.

---

## Performance Considerations

- **Backend:** Uses async FastAPI and efficient data fetching from OKX. Heavy computations (backtests) are run in optimized Python code.
- **Frontend:** Uses React, Zustand, and React Query for efficient state and data management. Charts are virtualized for performance.
- **Database:** Supabase/Postgres is used for persistent storage; ensure indexes on `strategy_id` for performance.

---

## Testing Coverage

- **Backend:**  
  - Run `pytest` in the `backend/` directory.
  - Tests cover API endpoints, backtest engine, and analytics.
- **Frontend:**  
  - Run `npm test` or `pnpm test` in the `frontend/` directory.
  - Tests cover UI components, strategy builder logic, and integration flows.

---

## Future Improvements
- Better UI support

- Custom indicator support

- Strategy optimization

- Cross-exchange arbitrage analysis

- Advanced risk modeling

- Portfolio rebalancing logic

---

## Sample Strategies and Results

### Example: `strategies` Table (JSON)

```json
[
  {
    "id": "b1e7c2e2-8c1a-4e2a-9b1a-1e2b3c4d5e6f",
    "name": "EMA Crossover",
    "components": {
      "nodes": [
        {
          "id": "node-1",
          "type": "Indicator",
          "name": "EMA",
          "properties": { "period": 10 },
          "inputs": [],
          "outputs": ["EMA_10"]
        },
        {
          "id": "node-2",
          "type": "Indicator",
          "name": "EMA",
          "properties": { "period": 50 },
          "inputs": [],
          "outputs": ["EMA_50"]
        },
        {
          "id": "node-3",
          "type": "Comparison",
          "name": "CrossOver",
          "properties": { "operator": ">", "left": "EMA_10", "right": "EMA_50" },
          "inputs": ["EMA_10", "EMA_50"],
          "outputs": ["Signal"]
        }
      ]
    },
    "connections": {
      "edges": [
        { "source": "node-1", "target": "node-3", "sourceHandle": "EMA_10", "targetHandle": "left" },
        { "source": "node-2", "target": "node-3", "sourceHandle": "EMA_50", "targetHandle": "right" }
      ]
    },
    "created_at": "2024-07-03T12:00:00Z"
  },
  {
    "id": "a2f8d3c4-7b2a-4c3d-8e1f-2b3c4d5e6f7a",
    "name": "RSI Mean Reversion",
    "components": {
      "nodes": [
        {
          "id": "node-1",
          "type": "Indicator",
          "name": "RSI",
          "properties": { "period": 14 },
          "inputs": [],
          "outputs": ["RSI_14"]
        },
        {
          "id": "node-2",
          "type": "Comparison",
          "name": "RSI < 30",
          "properties": { "operator": "<", "left": "RSI_14", "right": 30 },
          "inputs": ["RSI_14"],
          "outputs": ["Signal"]
        }
      ]
    },
    "connections": {
      "edges": [
        { "source": "node-1", "target": "node-2", "sourceHandle": "RSI_14", "targetHandle": "left" }
      ]
    },
    "created_at": "2024-07-03T12:30:00Z"
  }
]
```

### Example: `performance` Table (JSON)

```json
[
  {
    "strategy_id": "b1e7c2e2-8c1a-4e2a-9b1a-1e2b3c4d5e6f",
    "time_range": "2023-01-01_to_2023-12-31",
    "total_return": 0.23,
    "sharpe_ratio": 1.5,
    "max_drawdown": 0.08,
    "win_rate": 0.62,
    "total_trades": 34,
    "created_at": "2024-07-03T13:00:00Z"
  },
  {
    "strategy_id": "a2f8d3c4-7b2a-4c3d-8e1f-2b3c4d5e6f7a",
    "time_range": "2023-01-01_to_2023-12-31",
    "total_return": 0.12,
    "sharpe_ratio": 1.1,
    "max_drawdown": 0.05,
    "win_rate": 0.55,
    "total_trades": 20,
    "created_at": "2024-07-03T13:10:00Z"
  }
]
```

---

## License

MIT License - see LICENSE file for details

---

**For any questions or support, please contact the project maintainer.**
