import re

# Simple, effective financial news sentiment lexicon mapping
BULLISH_WORDS = {
    'surge', 'jump', 'gain', 'profit', 'expansion', 'expand', 'growth', 'bullish',
    'buy', 'beat', 'upgrade', 'optimism', 'positive', 'success', 'record', 'high',
    'rise', 'climb', 'outperform', 'advance', 'boost', 'acquisition', 'merger',
    'demand', 'innovative', 'launch', 'partnership', 'green', 'sustainable'
}

BEARISH_WORDS = {
    'drop', 'fall', 'loss', 'decrease', 'bearish', 'sell', 'miss', 'downgrade',
    'caution', 'negative', 'failure', 'decline', 'slump', 'plunge', 'warns',
    'slowdown', 'inflation', 'deficit', 'penalty', 'fine', 'investigation',
    'risk', 'pressure', 'concern', 'regulatory', 'debt', 'liabilities'
}

def analyze_text_sentiment(text: str) -> dict:
    # Clean text and tokenize
    words = re.findall(r'\b\w+\b', text.lower())
    
    pos_count = sum(1 for w in words if w in BULLISH_WORDS)
    neg_count = sum(1 for w in words if w in BEARISH_WORDS)
    
    total_matches = pos_count + neg_count
    
    if total_matches == 0:
        score = 0.0
    else:
        # Score normalized between -1.0 and 1.0
        score = (pos_count - neg_count) / total_matches
        # Scale score slightly based on the concentration of matching words in the headline
        coverage = total_matches / max(len(words), 1)
        score = score * (0.5 + 0.5 * coverage)
        
    score = max(-1.0, min(1.0, score))
    
    # Classification
    if score >= 0.15:
        label = "Bullish"
    elif score <= -0.15:
        label = "Bearish"
    else:
        label = "Neutral"
        
    return {
        "text": text,
        "score": round(float(score), 3),
        "sentiment": label,
        "bullish_count": pos_count,
        "bearish_count": neg_count
    }

def analyze_texts_batch(texts: list) -> dict:
    if not texts:
        return {"average_score": 0.0, "sentiment": "Neutral", "results": []}
        
    results = [analyze_text_sentiment(t) for t in texts]
    avg_score = sum(r["score"] for r in results) / len(results)
    
    if avg_score >= 0.15:
        overall_sentiment = "Bullish"
    elif avg_score <= -0.15:
        overall_sentiment = "Bearish"
    else:
        overall_sentiment = "Neutral"
        
    return {
        "average_score": round(float(avg_score), 3),
        "sentiment": overall_sentiment,
        "results": results
    }
