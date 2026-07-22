const Analytics = require('../models/analyticsModel');

const analyticsController = {
  // Fetch unified dashboard analytics metrics and charts
  getDashboardAnalytics: async (req, res) => {
    try {
      const sellerId = req.seller.id;
      const data = await Analytics.getDashboardSummary(sellerId);

      res.status(200).json({
        success: true,
        analytics: data
      });
    } catch (error) {
      console.error('Get Dashboard Analytics Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard analytics reports.'
      });
    }
  }
};

module.exports = analyticsController;
