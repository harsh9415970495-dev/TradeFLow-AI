require('dotenv').config();
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Using .NS for National Stock Exchange of India
const stocksData = [
  { symbol: 'RELIANCE.NS', companyName: 'Reliance Industries Limited', sector: 'Energy & Petrochemicals', overview: 'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. It has diverse businesses including energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.' },
  { symbol: 'TCS.NS', companyName: 'Tata Consultancy Services', sector: 'Information Technology', overview: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai.' },
  { symbol: 'INFY.NS', companyName: 'Infosys Limited', sector: 'Information Technology', overview: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.' },
  { symbol: 'HDFCBANK.NS', companyName: 'HDFC Bank Limited', sector: 'Banking & Financials', overview: "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets." },
  { symbol: 'ICICIBANK.NS', companyName: 'ICICI Bank Limited', sector: 'Banking & Financials', overview: 'ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai.' },
  { symbol: 'TATAMOTORS.NS', companyName: 'Tata Motors Limited', sector: 'Automobile', overview: 'Tata Motors Limited is an Indian multinational automotive manufacturing company, headquartered in Mumbai, which is part of the Tata Group.' },
  { symbol: 'ITC.NS', companyName: 'ITC Limited', sector: 'FMCG', overview: 'ITC Limited is an Indian conglomerate headquartered in Kolkata with diversified presence in FMCG, Hotels, Packaging, Paperboards and Agri-Business.' },
  { symbol: 'SBIN.NS', companyName: 'State Bank of India', sector: 'Banking & Financials', overview: 'State Bank of India is an Indian multinational public sector bank and financial services statutory body headquartered in Mumbai.' },
  { symbol: 'BHARTIARTL.NS', companyName: 'Bharti Airtel Limited', sector: 'Telecommunications', overview: 'Bharti Airtel Limited is an Indian multinational telecommunications services company based in New Delhi.' },
  { symbol: 'LT.NS', companyName: 'Larsen & Toubro Limited', sector: 'Engineering & Construction', overview: 'Larsen & Toubro Limited, commonly known as L&T, is an Indian multinational conglomerate company with business interests in engineering, construction, manufacturing, and technology.' },
];

const newsData = [
  { title: 'Reliance Announces Green Energy Initiative Expansion', content: 'Reliance Industries details an aggressive expansion plan for its solar gigafactory and green hydrogen plants, aiming for net zero emissions by 2035.' },
  { title: 'IT Sector Faces Slowdown in Enterprise Spending', content: 'Major IT players like TCS and Infosys project cautious revenue growth for the next two quarters as US clients tighten budgets.' },
  { title: 'HDFC Bank Reports 18% Credit Growth in Q1', content: 'HDFC Bank displays strong retail credit demand and corporate loan off-take, outpacing market expectations and maintaining stable asset quality.' },
  { title: 'Tata Motors EV Division to Launch Three New Models', content: 'Tata Motors targets a 40% market share in the EV passenger segment by 2027, backed by new dedicated EV architectures.' },
  { title: 'Monsoon Delays May Impact FMCG Rural Volume Recovery', content: 'FMCG giants including ITC indicate concern over delayed monsoon showers which could impact rural incomes and FMCG consumption.' },
  { title: 'RBI Keeps Repo Rates Unchanged in Monetary Policy Review', content: 'The Reserve Bank of India keeps the policy repo rate unchanged at 6.5% for the sixth consecutive meeting, focusing on inflation control.' },
];

// GET /api/seed - seeds database (remove this route after first use)
router.get('/', async (req, res) => {
  try {
    const yahooFinance = (await import('yahoo-finance2')).default;
    // Clear old data
    await prisma.transaction.deleteMany();
    await prisma.holding.deleteMany();
    await prisma.portfolio.deleteMany();
    await prisma.order.deleteMany();
    await prisma.watchlist.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.news.deleteMany();
    await prisma.stock.deleteMany();

    // Seed test user
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Harsh@123', salt);
    await prisma.user.deleteMany({ where: { OR: [{ email: 'harsh@gmail.com' }, { username: 'harsh' }] } });
    await prisma.user.create({
      data: { username: 'harsh', email: 'harsh@gmail.com', passwordHash, cashBalance: 1000000 },
    });

    // Determine the date for 30 days ago
    const today = new Date();
    const period1Date = new Date();
    period1Date.setDate(today.getDate() - 40); // Fetch extra days in case of weekends/holidays

    // Seed stocks using real data from yahooFinance
    for (const stock of stocksData) {
      try {
        const quote = await yahooFinance.quote(stock.symbol);
        
        // Fetch historical data
        const historicalOptions = {
          period1: period1Date,
          interval: '1d',
        };
        const historicalResults = await yahooFinance.historical(stock.symbol, historicalOptions);
        
        // Take the last 30 trading days
        const recentHistory = historicalResults.slice(-30).map(item => ({
          time: item.date.toISOString().split('T')[0],
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));

        const lastPrice = quote.regularMarketPrice || 0;
        const prevClose = quote.regularMarketPreviousClose || (recentHistory.length > 0 ? recentHistory[recentHistory.length - 1].close : lastPrice);
        const change = quote.regularMarketChange || (lastPrice - prevClose);
        const changePercent = quote.regularMarketChangePercent || (prevClose ? (change / prevClose) * 100 : 0);
        const volume = quote.regularMarketVolume || 0;
        const marketCap = quote.marketCap || 0;

        await prisma.stock.create({
          data: {
            symbol: stock.symbol, 
            companyName: stock.companyName, 
            sector: stock.sector,
            currentPrice: lastPrice, 
            previousClose: prevClose, 
            change: Math.round(change * 100) / 100, 
            changePercent: Math.round(changePercent * 100) / 100,
            volume: volume, 
            marketCap: marketCap,
            overview: stock.overview, 
            history: recentHistory,
          },
        });
        console.log(`Successfully seeded ${stock.symbol}`);
      } catch (err) {
        console.error(`Failed to fetch data for ${stock.symbol}:`, err.message);
      }
    }

    // Seed news
    await prisma.news.createMany({ data: newsData });

    await prisma.$disconnect();
    res.json({ success: true, message: 'Database seeded successfully with REAL market data!' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
