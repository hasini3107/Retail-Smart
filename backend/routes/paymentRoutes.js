const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// All payment routes are protected by JWT auth
router.use(authMiddleware);

// GET /api/payments - Fetch seller transaction history
router.get('/', paymentController.getPayments);

// POST /api/payments - Log a new payment transaction
router.post('/', paymentController.createPayment);

// GET /api/payments/summary - Revenue and payouts summary
router.get('/summary', paymentController.getBillingSummary);

module.exports = router;
