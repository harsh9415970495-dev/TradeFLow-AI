import numpy as np
from sklearn.linear_model import LinearRegression

def predict_future_prices(prices: list, horizon: int = 5) -> dict:
    prices_arr = np.array(prices, dtype=float)
    n = len(prices_arr)
    
    # Fallback if insufficient data
    if n < 10:
        last_price = prices_arr[-1] if n > 0 else 100.0
        prediction = last_price * (1 + 0.005 * horizon)
        return {
            "currentPrice": round(float(last_price), 2),
            "predictedPrice": round(float(prediction), 2),
            "direction": "UP",
            "confidence": 50.0,
            "horizon": f"{horizon} Days",
            "path": [round(float(last_price * (1 + 0.001 * i)), 2) for i in range(1, horizon + 1)]
        }
        
    # Use autoregressive features (lags 1, 2, 3) for linear regression
    lags = 3
    X = []
    y = []
    
    for i in range(lags, n):
        X.append(prices_arr[i-lags:i])
        y.append(prices_arr[i])
        
    X = np.array(X)
    y = np.array(y)
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Calculate model fit quality (R^2) as basis for confidence
    r_sq = model.score(X, y)
    # Scale confidence between 60% and 95%
    confidence = 60.0 + (min(max(r_sq, 0.0), 1.0) * 35.0)
    
    # Iterative multi-step prediction
    current_window = list(prices_arr[-lags:])
    predicted_path = []
    
    for _ in range(horizon):
        pred = model.predict([current_window])[0]
        # Safeguard to prevent bizarre negative prices
        pred = max(1.0, pred)
        predicted_path.append(round(float(pred), 2))
        current_window.pop(0)
        current_window.append(pred)
        
    last_price = prices_arr[-1]
    final_pred = predicted_path[-1]
    direction = "UP" if final_pred >= last_price else "DOWN"
    
    return {
        "currentPrice": round(float(last_price), 2),
        "predictedPrice": round(float(predicted_path[0]), 2),
        "direction": direction,
        "confidence": round(float(confidence), 2),
        "horizon": f"{horizon} Days",
        "path": predicted_path
    }
