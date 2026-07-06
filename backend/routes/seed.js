require('dotenv').config();
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stocksData = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Limited', sector: 'Energy & Petrochemicals', basePrice: 2450.0, marketCap: 1650000, overview: 'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. It has diverse businesses including energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.' },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services', sector: 'Information Technology', basePrice: 3250.0, marketCap: 1180000, overview: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai.' },
  { symbol: 'INFY', companyName: 'Infosys Limited', sector: 'Information Technology', basePrice: 1420.0, marketCap: 590000, overview: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited', sector: 'Banking & Financials', basePrice: 1550.0, marketCap: 1150000, overview: "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets." },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Limited', sector: 'Banking & Financials', basePrice: 940.0, marketCap: 650000, overview: 'ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai.' },
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors Limited', sector: 'Automobile', basePrice: 630.0, marketCap: 210000, overview: 'Tata Motors Limited is an Indian multinational automotive manufacturing company, headquartered in Mumbai, which is part of the Tata Group.' },
  { symbol: 'ITC', companyName: 'ITC Limited', sector: 'FMCG', basePrice: 435.0, marketCap: 540000, overview: 'ITC Limited is an Indian conglomerate headquartered in Kolkata with diversified presence in FMCG, Hotels, Packaging, Paperboards and Agri-Business.' },
  { symbol: 'SBIN', companyName: 'State Bank of India', sector: 'Banking & Financials', basePrice: 575.0, marketCap: 510000, overview: 'State Bank of India is an Indian multinational public sector bank and financial services statutory body headquartered in Mumbai.' },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Limited', sector: 'Telecommunications', basePrice: 860.0, marketCap: 480000, overview: 'Bharti Airtel Limited is an Indian multinational telecommunications services company based in New Delhi.' },
  { symbol: 'LT', companyName: 'Larsen & Toubro Limited', sector: 'Engineering & Construction', basePrice: 2350.0, marketCap: 330000, overview: 'Larsen & Toubro Limited, commonly known as L&T, is an Indian multinational conglomerate company with business interests in engineering, construction, manufacturing, and technology.' },
];

const newsData = [
  { title: 'Reliance Announces Green Energy Initiative Expansion', content: 'Reliance Industries details an aggressive expansion plan for its solar gigafactory and green hydrogen plants, aiming for net zero emissions by 2035.' },
  { title: 'IT Sector Faces Slowdown in Enterprise Spending', content: 'Major IT players like TCS and Infosys project cautious revenue growth for the next two quarters as US clients tighten budgets.' },
  { title: 'HDFC Bank Reports 18% Credit Growth in Q1', content: 'HDFC Bank displays strong retail credit demand and corporate loan off-take, outpacing market expectations and maintaining stable asset quality.' },
  { title: 'Tata Motors EV Division to Launch Three New Models', content: 'Tata Motors targets a 40% market share in the EV passenger segment by 2027, backed by new dedicated EV architectures.' },
  { title: 'Monsoon Delays May Impact FMCG Rural Volume Recovery', content: 'FMCG giants including ITC indicate concern over delayed monsoon showers which could impact rural incomes and FMCG consumption.' },
  { title: 'RBI Keeps Repo Rates Unchanged in Monetary Policy Review', content: 'The Reserve Bank of India keeps the policy repo rate unchanged at 6.5% for the sixth consecutive meeting, focusing on inflation control.' },
];

const generateHistory = (basePrice) => {
  const history = [];
  const today = new Date();
  let currentClose = basePrice;
  for (let i = 30; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const changePct = (Math.random() - 0.48) * 0.03;
    const open = currentClose;
    const close = Math.round(open * (1 + changePct) * 100) / 100;
    const high = Math.round(Math.max(open, close) * (1 + Math.random() * 0.015) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - Math.random() * 0.015) * 100) / 100;
    const volume = Math.floor(500000 + Math.random() * 1500000);
    history.push({ time: date.toISOString().split('T')[0], open, high, low, close, volume });
    currentClose = close;
  }
  return { history, lastPrice: currentClose };
};

// GET /api/seed - seeds database (remove this route after first use)
router.get('/', async (req, res) => {
  try {
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

    // Seed stocks
    for (const stock of stocksData) {
      const { history, lastPrice } = generateHistory(stock.basePrice);
      const prevClose = history[history.length - 2]?.close || stock.basePrice;
      const change = Math.round((lastPrice - prevClose) * 100) / 100;
      const changePercent = Math.round((change / prevClose) * 10000) / 100;
      await prisma.stock.create({
        data: {
          symbol: stock.symbol, companyName: stock.companyName, sector: stock.sector,
          currentPrice: lastPrice, previousClose: prevClose, change, changePercent,
          volume: history[history.length - 1].volume, marketCap: stock.marketCap,
          overview: stock.overview, history,
        },
      });
    }

    // Seed news
    await prisma.news.createMany({ data: newsData });

    await prisma.$disconnect();
    res.json({ success: true, message: 'Database seeded successfully! 10 stocks, 6 news articles, 1 test user (harsh@gmail.com / Harsh@123)' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
