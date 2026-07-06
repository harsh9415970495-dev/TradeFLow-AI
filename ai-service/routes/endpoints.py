from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from indicators.calculator import (
    calculate_sma, calculate_ema, calculate_rsi, 
    calculate_macd, calculate_bollinger_bands
)
from sentiment.analyzer import analyze_texts_batch
from prediction.model import predict_future_prices

router = APIRouter()

# --- Request/Response Pydantic Models ---

class PricesRequest(BaseModel):
    prices: List[float]

class TextsRequest(BaseModel):
    texts: List[str]

class SummaryRequest(BaseModel):
    symbol: str
    name: str
    sector: str
    current_price: float
    change_pct: float
    indicators: Dict[str, Any]
    sentiment: Dict[str, Any]

# --- Endpoints ---

@router.post("/api/indicators")
def get_indicators(req: PricesRequest):
    if not req.prices:
        raise HTTPException(status_code=400, detail="Price list cannot be empty")
    
    prices = req.prices
    sma = calculate_sma(prices)
    ema = calculate_ema(prices)
    rsi = calculate_rsi(prices)
    macd = calculate_macd(prices)
    bb = calculate_bollinger_bands(prices)
    
    return {
        "sma": sma,
        "ema": ema,
        "rsi": rsi,
        "macd": macd,
        "bollinger_bands": bb
    }

@router.post("/api/sentiment")
def get_sentiment(req: TextsRequest):
    if not req.texts:
        return {"average_score": 0.0, "sentiment": "Neutral", "results": []}
    return analyze_texts_batch(req.texts)

@router.post("/api/predict")
def get_prediction(req: PricesRequest):
    if len(req.prices) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 historical price points for prediction")
    return predict_future_prices(req.prices)

@router.post("/api/summary")
def get_summary(req: SummaryRequest):
    # Parse inputs to write a premium commentary
    rsi_vals = req.indicators.get("rsi", [])
    rsi = rsi_vals[-1] if rsi_vals else 50.0
    
    sma_vals = req.indicators.get("sma", [])
    sma = sma_vals[-1] if sma_vals else req.current_price
    
    bb = req.indicators.get("bollinger_bands", {})
    bb_upper = bb.get("upper", [])
    bb_lower = bb.get("lower", [])
    upper_band = bb_upper[-1] if bb_upper else req.current_price
    lower_band = bb_lower[-1] if bb_lower else req.current_price

    sentiment_score = req.sentiment.get("average_score", 0.0)
    sentiment_label = req.sentiment.get("sentiment", "Neutral")

    # Trend detection
    if req.current_price > sma:
        trend = "Bullish Uptrend"
    else:
        trend = "Bearish Downtrend"

    # Bollinger Bands signal
    bb_signal = "within range"
    if req.current_price >= upper_band * 0.98:
        bb_signal = "near upper Bollinger band (potential overbought)"
    elif req.current_price <= lower_band * 1.02:
        bb_signal = "near lower Bollinger band (potential oversold)"

    # Formulate recommendations
    if rsi < 35 and sentiment_score > -0.2:
        recommendation = "STRONG BUY (Oversold RSI and stable news sentiment)"
    elif rsi > 70:
        recommendation = "SELL / TAKE PROFIT (Overbought RSI)"
    elif trend == "Bullish Uptrend" and sentiment_label == "Bullish":
        recommendation = "BUY / ACCUMULATE (Aligned technical momentum and positive news sentiment)"
    elif trend == "Bearish Downtrend" and sentiment_label == "Bearish":
        recommendation = "SELL / AVOID (Aligned bearish pressure)"
    else:
        recommendation = "HOLD (Mixed signals, range-bound market)"

    technical_text = (
        f"{req.symbol} ({req.name}) in the {req.sector} sector is trading at ₹{req.current_price} "
        f"({req.change_pct:+.2f}%). Technically, the stock exhibits a {trend.lower()} relative to its 20-day "
        f"SMA of ₹{sma:.1f}. The RSI stands at {rsi:.1f}, signaling a "
        f"{'neutral' if 30 <= rsi <= 70 else 'extreme'} momentum state. Bollinger bands reveal the price is {bb_signal}."
    )

    sentiment_text = (
        f"Financial media sentiment for {req.symbol} is currently classified as {sentiment_label} "
        f"(index score of {sentiment_score:+.2f}). Market discussions highlight stability in its core segment, "
        f"though macro-economic headwinds remain a sector-wide concern."
    )

    return {
        "symbol": req.symbol,
        "technicalSummary": technical_text,
        "sentimentSummary": sentiment_text,
        "recommendation": recommendation,
        "metrics": {
            "rsi": round(rsi, 2),
            "trend": trend,
            "avgSentiment": sentiment_score
        }
    }
