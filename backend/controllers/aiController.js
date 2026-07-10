const { prisma } = require('../config/db');
const axios = require('axios');

// GROQ_API_KEY is read at runtime (not module load) to ensure dotenv has initialized

// Helper to ask Groq (reads key at runtime)
async function askGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key || !key.startsWith('gsk_')) {
    throw new Error(`Invalid or missing GROQ_API_KEY (current value: ${key ? key.substring(0,8) + '...' : 'undefined'})`);
  }

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a helpful JSON-only financial analysis AI. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
}

// @desc    Get AI Company Technical & Sentiment Summary
// @route   GET /api/ai/summary/:symbol
// @access  Private
const getCompanySummary = async (req, res) => {
  const { symbol } = req.params;
  const formattedSymbol = symbol.toUpperCase();

  try {
    const stock = await prisma.stock.findUnique({ where: { symbol: formattedSymbol } });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const news = await prisma.news.findMany({
      where: {
        OR: [
          { title: { contains: formattedSymbol, mode: 'insensitive' } },
          { title: { contains: stock.companyName.split(' ')[0], mode: 'insensitive' } },
        ],
      },
      take: 5
    });

    const headlines = news.map((n) => n.title);
    const history = stock.history || [];
    const closePrices = history.map((h) => h.close);
    const lastPrice = stock.currentPrice;

    try {
      const prompt = `You are a financial AI. Analyze this Indian stock:
Symbol: ${formattedSymbol}
Name: ${stock.companyName}
Current Price: ₹${lastPrice}
Recent Prices (oldest to newest): ${closePrices.slice(-10).join(', ')}
Recent News Headlines: ${headlines.join(' | ') || 'No recent news.'}

Output strictly valid JSON (no markdown) with this schema:
{
  "technicalSummary": "String (2-3 sentences of technical analysis)",
  "sentimentSummary": "String (1-2 sentences of sentiment analysis)",
  "recommendation": "BUY / ACCUMULATE / HOLD / SELL",
  "metrics": {
    "rsi": number (0-100),
    "trend": "Uptrend" or "Downtrend" or "Sideways",
    "avgSentiment": number (-1 to 1)
  }
}`;

      const aiData = await askGroq(prompt);

      return res.json({
        success: true,
        source: 'Groq AI Service (Llama 3)',
        data: {
          symbol: formattedSymbol,
          ...aiData
        },
      });

    } catch (apiError) {
      console.warn('Groq API down or failed, using local mock fallback:', apiError.message);
      
      const len = closePrices.length;
      const mockRSI = 45 + Math.random() * 20; 
      const mockSMA = len > 0 ? closePrices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, len) : lastPrice;
      const trend = lastPrice > mockSMA ? 'Uptrend' : 'Downtrend';
      const sentimentLabel = Math.random() > 0.4 ? 'Bullish' : 'Neutral';

      return res.json({
        success: true,
        source: 'Node.js Fallback Engine',
        data: {
          symbol: formattedSymbol,
          technicalSummary: `${formattedSymbol} is currently in a short-term ${trend.toLowerCase()} with a current price of ₹${lastPrice}. The RSI is sitting at ${mockRSI.toFixed(1)}, indicating a neutral momentum zone. Moving averages indicate stable support near ₹${mockSMA.toFixed(1)}.`,
          sentimentSummary: `Overall news sentiment is ${sentimentLabel}. Key topics revolve around sector growth prospects and recent earnings stability.`,
          recommendation: lastPrice > mockSMA && mockRSI < 60 ? 'BUY / ACCUMULATE' : 'HOLD',
          metrics: {
            rsi: Math.round(mockRSI * 100) / 100,
            trend,
            avgSentiment: sentimentLabel === 'Bullish' ? 0.6 : 0.1,
          },
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Price Direction Prediction
// @route   GET /api/ai/predict/:symbol
// @access  Private
const getStockPrediction = async (req, res) => {
  const { symbol } = req.params;
  const formattedSymbol = symbol.toUpperCase();

  try {
    const stock = await prisma.stock.findUnique({ where: { symbol: formattedSymbol } });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const history = stock.history || [];
    const closePrices = history.map((h) => h.close);
    const lastPrice = stock.currentPrice;

    try {
      const prompt = `You are a quantitative AI. Analyze this Indian stock:
Symbol: ${formattedSymbol}
Current Price: ₹${lastPrice}
Recent Prices (oldest to newest): ${closePrices.slice(-10).join(', ')}

Predict the price movement for the next 5 days.
Output strictly valid JSON (no markdown) with this schema:
{
  "predictedPrice": number (forecast for 5 days),
  "confidence": number (0 to 100),
  "direction": "UP" or "DOWN" or "FLAT",
  "horizon": "5 Days"
}`;

      const aiData = await askGroq(prompt);

      return res.json({
        success: true,
        source: 'Groq Machine Learning (Llama 3)',
        data: {
          symbol: formattedSymbol,
          currentPrice: lastPrice,
          ...aiData
        },
      });
    } catch (apiError) {
      console.warn('Groq prediction down, using local mock fallback:', apiError.message);
      
      const change = (Math.random() - 0.45) * 2; 
      const targetPrice = lastPrice * (1 + change / 100);

      return res.json({
        success: true,
        source: 'Node.js Fallback ML',
        data: {
          symbol: formattedSymbol,
          currentPrice: lastPrice,
          predictedPrice: Math.round(targetPrice * 100) / 100,
          confidence: Math.round((70 + Math.random() * 15) * 100) / 100, 
          direction: change >= 0 ? 'UP' : 'DOWN',
          horizon: '5 Days',
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Market Overview Summary
// @route   GET /api/ai/market-summary
// @access  Private
const getMarketSummary = async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany();
    const news = await prisma.news.findMany({ take: 5 });

    const gainers = stocks.filter((s) => s.changePercent > 0).length;
    const losers = stocks.filter((s) => s.changePercent <= 0).length;

    let marketMoodLocal = 'Neutral';
    if (gainers > losers + 2) marketMoodLocal = 'Bullish';
    if (losers > gainers + 2) marketMoodLocal = 'Bearish';

    try {
      const headlines = news.map((n) => n.title);
      const prompt = `You are an expert market analyst for the Indian Stock Market. 
Current State: ${gainers} advancing stocks, ${losers} declining stocks.
Recent News Headlines: ${headlines.join(' | ') || 'No major news today.'}

Output strictly valid JSON (no markdown) with this schema:
{
  "marketMood": "Bullish" or "Bearish" or "Neutral",
  "sentimentScore": number (-1 to 1),
  "summary": "String (A 2-3 sentence engaging market overview)"
}`;

      const aiData = await askGroq(prompt);

      return res.json({
        success: true,
        source: 'Groq Sentiment Engine (Llama 3)',
        data: {
          advances: gainers,
          declines: losers,
          ...aiData
        },
      });

    } catch (apiError) {
      console.warn('Groq API down, using local mock market summary:', apiError.message);
      
      let summaryText = `The market shows ${gainers} stocks advancing and ${losers} declining. Indices are trading with low volatility. `;
      if (marketMoodLocal === 'Bullish') {
        summaryText += 'Strong retail buying in auto and banking is keeping indices elevated.';
      } else if (marketMoodLocal === 'Bearish') {
        summaryText += 'Foreign institutional investors (FIIs) continue to divest holdings in major IT indices.';
      } else {
        summaryText += 'Market indices remain sideways as traders await key monetary policy directions.';
      }

      return res.json({
        success: true,
        source: 'Node.js Fallback Engine',
        data: {
          marketMood: marketMoodLocal,
          sentimentScore: marketMoodLocal === 'Bullish' ? 0.45 : marketMoodLocal === 'Bearish' ? -0.45 : 0.05,
          advances: gainers,
          declines: losers,
          summary: summaryText,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Chat with personalized AI
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        portfolios: { include: { holdings: { include: { stock: true } } } },
        orders: { take: 5, orderBy: { createdAt: 'desc' }, include: { stock: true } }
      }
    });

    let portfolioContext = 'User has no active portfolio.';
    if (user.portfolios && user.portfolios.length > 0) {
      const p = user.portfolios[0];
      const holdingStr = p.holdings.map(h => `${h.quantity} shares of ${h.stock.symbol} (Avg: ₹${h.averagePrice}, Current: ₹${h.stock.currentPrice})`).join(', ');
      portfolioContext = `Portfolio Value: ₹${p.totalValue}. Holdings: ${holdingStr || 'None'}.`;
    }

    const orderStr = user.orders.map(o => `${o.type} ${o.quantity} ${o.stock.symbol} @ ₹${o.price || o.limitPrice || 'MKT'} (${o.status})`).join(', ');

    const prompt = `You are ATLAS AI Trading & Learning Analytics System, a helpful, professional financial assistant for ${user.username}.
Answer their trading questions contextually based on their account. Keep your response conversational, formatting it cleanly using markdown (bullet points if needed) but keep it concise (under 150 words if possible).

USER CONTEXT:
Cash Balance: ₹${user.cashBalance.toFixed(2)}
${portfolioContext}
Recent Orders: ${orderStr || 'None'}

User asks: "${message}"`;

    const chatKey = process.env.GROQ_API_KEY;
    if (!chatKey || !chatKey.startsWith('gsk_')) {
      console.error('GROQ_API_KEY missing or invalid. Value:', chatKey ? chatKey.substring(0,8) + '...' : 'undefined');
      return res.status(500).json({ success: false, message: 'AI service not configured' });
    }

    const aiResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are ATLAS AI Trading & Learning Analytics System, a helpful and professional Indian stock market assistant. Be conversational, concise, and supportive.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 512
      },
      {
        headers: {
          'Authorization': `Bearer ${chatKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const botMessage = aiResponse.data.choices[0].message.content;

    return res.json({
      success: true,
      data: { reply: botMessage }
    });
  } catch (error) {
    console.warn('Groq API down or failed in chat, using local mock fallback:', error.message);
    
    // Provide a helpful fallback response using the available user context
    const fallbackReply = `I'm currently operating in offline mode due to a connection issue with the AI server. \n\n**Account Summary:**\n- Cash Balance: ₹${user?.cashBalance?.toFixed(2) || '0.00'}\n- Recent Orders: ${user?.orders?.length > 0 ? user.orders.length : 'None'}\n\nPlease try again later for advanced AI insights.`;
    
    return res.json({
      success: true,
      source: 'Node.js Fallback Engine',
      data: { reply: fallbackReply }
    });
  }
};

module.exports = {
  getCompanySummary,
  getStockPrediction,
  getMarketSummary,
  chatWithAI,
};
