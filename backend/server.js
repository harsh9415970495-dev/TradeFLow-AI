const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const { initSockets } = require('./sockets/socketManager');
const { startLiveMarketFetcher } = require('./sockets/liveMarketFetcher');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSockets(server);

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stocks');
const portfolioRoutes = require('./routes/portfolio');
const watchlistRoutes = require('./routes/watchlist');
const orderRoutes = require('./routes/orders');
const transactionRoutes = require('./routes/transactions');
const notificationRoutes = require('./routes/notifications');
const alertRoutes = require('./routes/alerts');
const aiRoutes = require('./routes/ai');
const seedRoutes = require('./routes/seed');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/seed', seedRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date() });
});

// Start live market fetcher
startLiveMarketFetcher();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Express Server running on port ${PORT}`);
});
