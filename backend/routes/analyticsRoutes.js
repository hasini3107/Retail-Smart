const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// Route: GET /api/analytics/dashboard - Fetch full dashboard KPI statistics and chart metrics
router.get('/dashboard', analyticsController.getDashboardAnalytics);

module.exports = router;
