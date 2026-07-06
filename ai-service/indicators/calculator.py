import pandas as pd
import numpy as np

def calculate_sma(prices: list, period: int = 20) -> list:
    if len(prices) < period:
        return [float(p) for p in prices]
    series = pd.Series(prices)
    sma = series.rolling(window=period).mean()
    # Fill NaN values with initial prices to avoid breaking clients
    sma = sma.fillna(series)
    return sma.tolist()

def calculate_ema(prices: list, period: int = 20) -> list:
    if len(prices) < period:
        return [float(p) for p in prices]
    series = pd.Series(prices)
    ema = series.ewm(span=period, adjust=False).mean()
    return ema.tolist()

def calculate_rsi(prices: list, period: int = 14) -> list:
    if len(prices) <= period:
        return [50.0] * len(prices) # Fallback to neutral
    
    series = pd.Series(prices)
    delta = series.diff()
    
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    
    # Wilder's smoothing technique
    for i in range(period + 1, len(prices)):
        avg_gain.iloc[i] = (avg_gain.iloc[i - 1] * (period - 1) + gain.iloc[i]) / period
        avg_loss.iloc[i] = (avg_loss.iloc[i - 1] * (period - 1) + loss.iloc[i]) / period
        
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    # Fill leading NaNs with 50.0
    rsi = rsi.fillna(50.0)
    return rsi.tolist()

def calculate_macd(prices: list) -> dict:
    if len(prices) < 26:
        # Return flat indicators if prices are too short
        flat = [0.0] * len(prices)
        return {"macd": flat, "signal": flat, "histogram": flat}
        
    series = pd.Series(prices)
    ema12 = series.ewm(span=12, adjust=False).mean()
    ema26 = series.ewm(span=26, adjust=False).mean()
    
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    histogram = macd_line - signal_line
    
    return {
        "macd": macd_line.tolist(),
        "signal": signal_line.tolist(),
        "histogram": histogram.tolist()
    }

def calculate_bollinger_bands(prices: list, period: int = 20, num_std: float = 2.0) -> dict:
    if len(prices) < period:
        # Fallback
        prices_float = [float(p) for p in prices]
        return {"upper": prices_float, "lower": prices_float, "basis": prices_float}
        
    series = pd.Series(prices)
    basis = series.rolling(window=period).mean()
    std = series.rolling(window=period).std()
    
    upper = basis + (std * num_std)
    lower = basis - (std * num_std)
    
    # Fill leading NaNs
    basis = basis.fillna(series)
    upper = upper.fillna(series)
    lower = lower.fillna(series)
    
    return {
        "upper": upper.tolist(),
        "lower": lower.tolist(),
        "basis": basis.tolist()
    }
