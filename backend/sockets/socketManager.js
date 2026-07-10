const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict to your frontend domain
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Join specific stock updates channel
    socket.on('subscribeMarket', () => {
      socket.join('market-updates');
      console.log(`Client ${socket.id} subscribed to market updates`);
    });

    // Authenticate and join user-specific room for private events
    socket.on('joinUserRoom', (token) => {
      try {
        if (!token) return;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'atlas_super_secret_jwt_key_123!');
        const userId = decoded.id;
        socket.join(`user:${userId}`);
        console.log(`Client ${socket.id} joined private room: user:${userId}`);
      } catch (err) {
        console.error('Socket authentication failed:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

// Send user-specific notification
const sendToUser = (userId, eventName, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(eventName, data);
  }
};

// Broadcast to market subscribers
const broadcastMarket = (eventName, data) => {
  if (io) {
    io.to('market-updates').emit(eventName, data);
  }
};

module.exports = {
  initSockets,
  getIO,
  sendToUser,
  broadcastMarket,
};
