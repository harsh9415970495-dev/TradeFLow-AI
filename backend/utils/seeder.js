require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stocksData = [
  {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    sector: 'Energy & Petrochemicals',
    basePrice: 2450.0,
    marketCap: 1650000, // ₹ in Crores
    overview: 'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. It has diverse businesses including energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.',
  },
  {
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services',
    sector: 'Information Technology',
    basePrice: 3250.0,
    marketCap: 1180000,
    overview: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai. It is a part of the Tata Group and operates in 150 locations across 46 countries.',
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Limited',
    sector: 'Information Technology',
    basePrice: 1420.0,
    marketCap: 590000,
    overview: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services. The company was founded in Pune and is headquartered in Bangalore.',
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    sector: 'Banking & Financials',
    basePrice: 1550.0,
    marketCap: 1150000,
    overview: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India\'s largest private sector bank by assets and the world\'s tenth-largest bank by market capitalization as of May 2024.',
  },
  {
    symbol: 'ICICIBANK',
    companyName: 'ICICI Bank Limited',
    sector: 'Banking & Financials',
    basePrice: 940.0,
    marketCap: 650000,
    overview: 'ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai. It offers a wide range of banking products and financial services for corporate and retail customers through a variety of delivery channels.',
  },
  {
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    sector: 'Automobile',
    basePrice: 630.0,
    marketCap: 210000,
    overview: 'Tata Motors Limited is an Indian multinational automotive manufacturing company, headquartered in Mumbai, which is part of the Tata Group. The company produces passenger cars, trucks, vans, coaches, and buses.',
  },
  {
    symbol: 'ITC',
    companyName: 'ITC Limited',
    sector: 'FMCG',
    basePrice: 435.0,
    marketCap: 540000,
    overview: 'ITC Limited is an Indian conglomerate headquartered in Kolkata. ITC has a diversified presence in FMCG, Hotels, Packaging, Paperboards & Specialty Papers and Agri-Business.',
  },
  {
    symbol: 'SBIN',
    companyName: 'State Bank of India',
    sector: 'Banking & Financials',
    basePrice: 575.0,
    marketCap: 510000,
    overview: 'State Bank of India is an Indian multinational public sector bank and financial services statutory body headquartered in Mumbai. SBI is the 48th largest bank in the world by total assets.',
  },
  {
    symbol: 'BHARTIARTL',
    companyName: 'Bharti Airtel Limited',
    sector: 'Telecommunications',
    basePrice: 860.0,
    marketCap: 480000,
    overview: 'Bharti Airtel Limited is an Indian multinational telecommunications services company based in New Delhi. It operates in 18 countries across South Asia and Africa, as well as the Channel Islands.',
  },
  {
    symbol: 'LT',
    companyName: 'Larsen & Toubro Limited',
    sector: 'Engineering & Construction',
    basePrice: 2350.0,
    marketCap: 330000,
    overview: 'Larsen & Toubro Limited, commonly known as L&T, is an Indian multinational conglomerate company, with business interests in engineering, construction, manufacturing, technology, information technology and financial services.',
  },
];

const newsData = [
  {
    title: 'Reliance Announces Green Energy Initiative Expansion',
    source: 'Financial Express',
    summary: 'Reliance Industries details an aggressive expansion plan for its solar gigafactory and green hydrogen plants, aiming for net zero emissions by 2035.',
    sentiment: 'Bullish',
    sentimentScore: 0.85,
  },
  {
    title: 'IT Sector Faces Slowdown in Enterprise Spending',
    source: 'Economic Times',
    summary: 'Major IT players like TCS and Infosys project cautious revenue growth for the next two quarters as US clients tighten budgets due to high interest rates.',
    sentiment: 'Bearish',
    sentimentScore: -0.65,
  },
  {
    title: 'HDFC Bank Reports 18% Credit Growth in Q1',
    source: 'Business Standard',
    summary: 'HDFC Bank displays strong retail credit demand and corporate loan off-take, outpacing market expectations and maintaining stable asset quality.',
    sentiment: 'Bullish',
    sentimentScore: 0.75,
  },
  {
    title: 'Tata Motors EV Division to Launch Three New Models',
    source: 'AutoCar India',
    summary: 'Tata Motors targets a 40% market share in the EV passenger segment by 2027, backed by new dedicated EV architectures and localized battery sourcing.',
    sentiment: 'Bullish',
    sentimentScore: 0.9,
  },
  {
    title: 'Monsoon Delays May Impact FMCG Rural Volume Recovery',
    source: 'Mint',
    summary: 'FMCG giants including ITC indicate concern over delayed monsoon showers which could impact rural incomes and subsequent FMCG consumption patterns.',
    sentiment: 'Neutral',
    sentimentScore: -0.15,
  },
  {
    title: 'RBI Keeps Repo Rates Unchanged in Monetary Policy Review',
    source: 'Bloomberg Quint',
    summary: 'The Reserve Bank of India keeps the policy repo rate unchanged at 6.5% for the sixth consecutive meeting, focusing on inflation control.',
    sentiment: 'Neutral',
    sentimentScore: 0.05,
  },
];

// Helper to generate historical daily data (OHLCV) for the last 30 days
const generateHistory = (basePrice) => {
  const history = [];
  const today = new Date();
  let currentClose = basePrice;

  for (let i = 30; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Random walk with small upward drift
    const changePct = (Math.random() - 0.48) * 0.03; // Max 1.5% up, 1.4% down
    const open = currentClose;
    const close = Math.round(open * (1 + changePct) * 100) / 100;
    
    // High and Low calculation
    const high = Math.round(Math.max(open, close) * (1 + Math.random() * 0.015) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - Math.random() * 0.015) * 100) / 100;
    
    // Volume calculation
    const volume = Math.floor(500000 + Math.random() * 1500000);

    history.push({
      time: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
      open,
      high,
      low,
      close,
      volume,
    });

    currentClose = close;
  }
  return { history, lastPrice: currentClose };
};

const seedData = async () => {
  try {
    console.log('Seed: Connected to Prisma Database...');

    // Clear existing collections
    await prisma.transaction.deleteMany();
    await prisma.holding.deleteMany();
    await prisma.portfolio.deleteMany();
    await prisma.order.deleteMany();
    await prisma.watchlist.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.news.deleteMany();
    await prisma.stock.deleteMany();
    // Seed a test user (email: harsh@gmail.com, password: Harsh@123)
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Harsh@123', salt);
    // Ensure no duplicate user exists
    await prisma.user.deleteMany({ where: { OR: [{ email: 'harsh@gmail.com' }, { username: 'harsh' }] } });
    await prisma.user.create({
      data: {
        username: 'harsh',
        email: 'harsh@gmail.com',
        passwordHash,
        cashBalance: 1000000,
      },
    });
    console.log('Seeded test user harsh@gmail.com');
    console.log('Cleaned old records.');

    // Seed Stocks
    const finalStocks = stocksData.map((stock) => {
      const { history, lastPrice } = generateHistory(stock.basePrice);
      const prevClose = history[history.length - 2] ? history[history.length - 2].close : stock.basePrice;
      const change = Math.round((lastPrice - prevClose) * 100) / 100;
      const changePercent = Math.round((change / prevClose) * 10000) / 100;

      return {
        symbol: stock.symbol,
        companyName: stock.companyName,
        sector: stock.sector,
        currentPrice: lastPrice,
        previousClose: prevClose,
        change,
        changePercent,
        volume: history[history.length - 1].volume,
        marketCap: stock.marketCap,
        overview: stock.overview,
        history,
      };
    });

    for (const stock of finalStocks) {
      await prisma.stock.create({ data: stock });
    }
    console.log(`Successfully seeded ${finalStocks.length} Stocks.`);

    // Seed News
    await prisma.news.createMany({
      data: newsData.map(item => ({
        title: item.title,
        content: item.summary,
      })),
    });
    console.log(`Successfully seeded ${newsData.length} News articles.`);

    console.log('Seeding complete. Disconnecting...');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
