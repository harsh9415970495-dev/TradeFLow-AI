const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAlerts);
router.post('/create', protect, createAlert);
router.delete('/cancel/:id', protect, deleteAlert);

module.exports = router;
