const { prisma } = require('./config/db');
const bcrypt = require('bcryptjs');

const stocksData = [
  { symbol: 'RELIANCE.NS', companyName: 'Reliance Industries Limited', sector: 'Energy & Petrochemicals', overview: 'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai.' },
  { symbol: 'TCS.NS', companyName: 'Tata Consultancy Services', sector: 'Information Technology', overview: 'Tata Consultancy Services is an Indian multinational IT services and consulting company headquartered in Mumbai.' },
  { symbol: 'INFY.NS', companyName: 'Infosys Limited', sector: 'Information Technology', overview: 'Infosys Limited is an Indian multinational IT company that provides business consulting, IT and outsourcing services.' },
  { symbol: 'HDFCBANK.NS', companyName: 'HDFC Bank Limited', sector: 'Banking & Financials', overview: "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets." },
  { symbol: 'ICICIBANK.NS', companyName: 'ICICI Bank Limited', sector: 'Banking & Financials', overview: 'ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai.' },
  { symbol: 'M&M.NS', companyName: 'Mahindra & Mahindra', sector: 'Automobile', overview: 'Mahindra & Mahindra Limited is an Indian multinational automotive manufacturing company.' },
  { symbol: 'ITC.NS', companyName: 'ITC Limited', sector: 'FMCG', overview: 'ITC Limited is an Indian conglomerate headquartered in Kolkata with diversified presence in FMCG, Hotels, and Agri-Business.' },
  { symbol: 'SBIN.NS', companyName: 'State Bank of India', sector: 'Banking & Financials', overview: 'State Bank of India is an Indian multinational public sector bank headquartered in Mumbai.' },
  { symbol: 'BHARTIARTL.NS', companyName: 'Bharti Airtel Limited', sector: 'Telecommunications', overview: 'Bharti Airtel Limited is an Indian multinational telecommunications services company based in New Delhi.' },
  { symbol: 'LT.NS', companyName: 'Larsen & Toubro Limited', sector: 'Engineering & Construction', overview: 'L&T is an Indian multinational conglomerate with business interests in engineering, construction, manufacturing, and technology.' },
  { symbol: 'WIPRO.NS', companyName: 'Wipro Limited', sector: 'Information Technology', overview: 'Wipro Limited is an Indian multinational corporation that provides IT, consulting and business process services.' },
  { symbol: 'HCLTECH.NS', companyName: 'HCL Technologies', sector: 'Information Technology', overview: 'HCL Technologies Limited is an Indian multinational IT company, headquartered in Noida.' },
];

const newsData = [
  { title: 'Reliance Announces Green Energy Initiative Expansion', content: 'Reliance Industries details an aggressive expansion plan for its solar gigafactory and green hydrogen plants, aiming for net zero emissions by 2035.' },
  { title: 'IT Sector Faces Slowdown in Enterprise Spending', content: 'Major IT players like TCS and Infosys project cautious revenue growth for the next two quarters as US clients tighten budgets.' },
  { title: 'HDFC Bank Reports 18% Credit Growth in Q1', content: 'HDFC Bank displays strong retail credit demand and corporate loan off-take, outpacing market expectations and maintaining stable asset quality.' },
  { title: 'Tata Motors EV Division to Launch Three New Models', content: 'Tata Motors targets a 40% market share in the EV passenger segment by 2027, backed by new dedicated EV architectures.' },
  { title: 'Monsoon Delays May Impact FMCG Rural Volume Recovery', content: 'FMCG giants including ITC indicate concern over delayed monsoon showers which could impact rural incomes and FMCG consumption.' },
  { title: 'RBI Keeps Repo Rates Unchanged in Monetary Policy Review', content: 'The Reserve Bank of India keeps the policy repo rate unchanged at 6.5% for the sixth consecutive meeting, focusing on inflation control.' },
];

async function fetchStockData(symbol) {
  try {
    let response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`);
    if (!response.ok) {
      response = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`);
    }
    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Invalid Yahoo API response format');
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote[0];

    const recentHistory = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quotes.close[i] !== null) {
        recentHistory.push({
          time: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open: quotes.open[i] || 0,
          high: quotes.high[i] || 0,
          low: quotes.low[i] || 0,
          close: quotes.close[i] || 0,
          volume: quotes.volume[i] || 0,
        });
      }
    }

    const meta = result.meta;
    return {
      lastPrice: meta.regularMarketPrice || 0,
      prevClose: meta.chartPreviousClose || 0,
      volume: meta.regularMarketVolume || 0,
      history: recentHistory,
    };
  } catch (err) {
    return null;
  }
}

async function autoSeedIfEmpty() {
  try {
    const stockCount = await prisma.stock.count();
    if (stockCount > 0) {
      console.log(`Auto-seed check: ${stockCount} stocks already in database. Skipping seed.`);
      return;
    }

    console.log('Auto-seed: No stocks found. Seeding database with real market data...');

    // Seed default test user if not exists
    const existingUser = await prisma.user.findUnique({ where: { email: 'harsh@gmail.com' } });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Harsh@123', salt);
      await prisma.user.create({
        data: { username: 'harsh', email: 'harsh@gmail.com', passwordHash, cashBalance: 1000000 },
      });
      console.log('Auto-seed: Created default user harsh@gmail.com');
    }

    // Seed news if not exists
    const newsCount = await prisma.news.count();
    if (newsCount === 0) {
      await prisma.news.createMany({ data: newsData });
      console.log('Auto-seed: Seeded news articles.');
    }

    // Fetch and seed stocks
    for (const stock of stocksData) {
      try {
        const data = await fetchStockData(stock.symbol);
        if (!data) {
          console.warn(`Auto-seed: Skipped ${stock.symbol} (fetch failed)`);
          continue;
        }

        const { lastPrice, prevClose, volume, history } = data;
        const change = lastPrice - prevClose;
        const changePercent = prevClose ? (change / prevClose) * 100 : 0;

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
            marketCap: 0,
            overview: stock.overview,
            history: history,
          },
        });
        console.log(`Auto-seed: Seeded ${stock.symbol} @ ₹${lastPrice}`);
      } catch (err) {
        console.warn(`Auto-seed: Failed for ${stock.symbol}: ${err.message}`);
      }
    }

    console.log('Auto-seed complete!');
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
}

module.exports = { autoSeedIfEmpty };
