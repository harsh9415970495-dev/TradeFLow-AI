const express = require('express');
const router = express.Router();
const { placeOrder, cancelOrder, getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUserOrders);
router.post('/place', protect, placeOrder);
router.delete('/cancel/:orderId', protect, cancelOrder);

module.exports = router;
