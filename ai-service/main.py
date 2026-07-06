from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.endpoints import router as api_router

app = FastAPI(
    title="TradeFlow AI Service",
    description="Python FastAPI engine for technical indicators, news sentiment, and trend predictions.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount indicators and sentiment routes
app.include_router(api_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "TradeFlow AI",
        "features": ["Technical Indicators (RSI, MACD, BB, SMA, EMA)", "Sentiment Analysis", "ML Price Prediction"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
