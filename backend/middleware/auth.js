const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tradeflow_super_secret_jwt_key_123!');

      // Get user from the token, exclude password
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, email: true, cashBalance: true, createdAt: true }
      });
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found, unauthorized' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
