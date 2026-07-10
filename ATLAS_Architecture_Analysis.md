# ATLAS AI Trading & Learning Analytics System - Project Architecture & Technical Analysis

This document provides a comprehensive technical analysis of the ATLAS AI Trading & Learning Analytics System project, detailing its workflows, mathematical models, AI integrations, and backend architecture.

## 1. Overall System Architecture
ATLAS AI Trading & Learning Analytics System is a real-time virtual trading platform utilizing the MERN stack (MongoDB, Express, React, Node.js) with Prisma ORM.

**Key Components:**
- **Frontend (React/Vite):** Provides the user interface, utilizing Tailwind CSS for styling and `lucide-react` for icons. It uses Axios for HTTP requests and Socket.io-client for real-time market updates.
- **Backend (Express/Node.js):** Handles authentication (JWT), portfolio management, order execution, AI insights, and real-time market data broadcasting.
- **Database (Prisma + Supabase PostgreSQL):** Handles structured data and relationships (Users, Portfolios, Transactions, Orders). Supabase ensures high-availability and secure hosting.
- **Real-Time Engine (Socket.io):** Broadcasts stock price updates, order executions, and notifications globally to connected clients.
- **AI Engine (Groq / Llama 3):** Powers market sentiment analysis, stock-level recommendations, and the AI chatbot.

## Key Challenges Solved

1. **AI Service Unavailability:** The Llama 3 Groq API might timeout or face socket hangups. To resolve this, `aiController.js` includes a local Node.js fallback mechanism that gracefully returns basic portfolio details and maintains the chat interface stability.
2. **Yahoo Finance Rate Limits:** Concurrent requests previously caused IP bans. The background worker now processes stocks sequentially with a 1000ms delay, ensuring consistent live data without triggering blocks.
3. **Complex UI Stacking Contexts:** Modal components (`OrderModal`) previously misaligned due to parent `transform` animations (`fade-in`). Solved by utilizing React's `createPortal` to attach the modal directly to `document.body`.
4. **Data Sync:** Ensuring local UI balances sync correctly with real DB balances when an order is executed. Solved via aggressive frontend state updates and Socket.io `orderExecuted` events.

---

## 2. Mathematical Models & Calculations

### 2.1 Average Buying Price Calculation
When a user buys additional shares of a stock they already own, the new average price is calculated using the weighted average formula.
**File:** `backend/sockets/liveMarketFetcher.js`
**Formula:**
```math
New Avg Price = ( (Old Qty × Old Price) + (New Qty × New Price) ) / (Old Qty + New Qty)
```

### 2.2 Change & Change Percentage
The daily price change and percentage change are calculated against the previous day's close.
**File:** `backend/sockets/liveMarketFetcher.js`
**Formula:**
```math
Change = Current Price - Previous Close
Change Percent = (Change / Previous Close) * 100
```
*(These values are rounded to 2 decimal places to avoid floating-point precision issues).*

### 2.3 Limit Order Execution Logic
The live market fetcher evaluates pending limit orders against real-time prices.
- **BUY Order:** Executes if `Current Price <= Limit Price`
- **SELL Order:** Executes if `Current Price >= Limit Price`
The total cost/credit is simply: `Total Amount = Quantity × Current Price`.

---

## 3. Data Fetching Workflow

### 3.1 Live Market Data (Yahoo Finance)
The backend runs a background daemon (`liveMarketFetcher.js`) that periodically queries the Yahoo Finance chart API.
- **Interval:** Every 30 seconds (Updated from 10s to prevent rate limits).
- **Process:**
  1. Fetch list of seeded stocks from the database.
  2. Iteratively call `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d`.
  3. A 1-second delay is introduced between each stock fetch to prevent IP blocking (HTTP 429).
  4. The response yields `regularMarketPrice` and `chartPreviousClose`.
  5. The DB is updated, and a `stockPriceUpdate` event is emitted to all connected sockets.
  6. The system then evaluates any pending Limit Orders and Price Alerts against the newly updated price.

---

## 4. AI Integration Workflow

### 4.1 Sentiment & Technical Analysis
**File:** `backend/controllers/aiController.js`
When a user clicks "Analyze" on a stock (e.g., in `AIInsights.jsx`), the backend performs the following:
1. Fetches recent closing prices (last 10 days) and top 5 relevant news headlines from the DB.
2. Constructs a prompt requesting a JSON response containing `technicalSummary`, `sentimentSummary`, `recommendation`, `rsi`, `trend`, and `avgSentiment`.
3. Calls the **Groq API** (using the `llama-3.1-8b-instant` model).
4. **Fallback Mechanism:** If the Groq API fails (e.g., rate limits or network issues), a robust local Node.js fallback is triggered.
   - *Mock SMA (Simple Moving Average):* Average of the last 20 closing prices.
   - *Trend Evaluation:* `Current Price > SMA ? "Uptrend" : "Downtrend"`
   - *Mock RSI:* Randomly generated between 45 and 65.
   - *Recommendation:* If `Current Price > SMA` and `RSI < 60`, return `BUY / ACCUMULATE`, else `HOLD`.

### 4.2 AI Chatbot Context
The Chat AI is deeply integrated with the user's portfolio.
- **Context Loading:** Before calling the LLM, the backend queries the user's `cashBalance`, `holdings`, and `orders`.
- **System Prompt:** This data is injected into the LLM's prompt, ensuring the AI can answer queries like *"Should I sell my Reliance shares?"* accurately based on the user's actual virtual holdings and purchase prices.

---

## 5. UI Layout & Component Behavior

### 5.1 AI Insights Layout Fix
In the `AIInsights.jsx` page, stock cards are displayed in a CSS Grid.
- **Issue:** By default, grid items in a row stretch to match the height of the tallest item. Expanding the AI analysis on one card caused the adjacent card to stretch awkwardly with empty space.
- **Resolution:** Applied the `items-start` Tailwind utility to the grid container. This overrides the default `align-items: stretch`, allowing each card to size independently based on its own content.

---

## Conclusion
ATLAS AI Trading & Learning Analytics System is a robust platform. The calculations for portfolio management are mathematically sound, utilizing standard weighted averages. The recent improvements to the live market fetcher (introducing delays and longer intervals) ensure stability and prevent upstream rate limiting from Yahoo Finance, resolving the issue where stock prices failed to update.
