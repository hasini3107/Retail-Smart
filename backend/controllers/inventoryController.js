const Inventory = require('../models/inventoryModel');

const inventoryController = {
  // Get full inventory list for the authenticated seller
  getInventory: async (req, res) => {
    try {
      const sellerId = req.seller.id;
      const inventory = await Inventory.getInventory(sellerId);
      
      res.status(200).json({
        success: true,
        count: inventory.length,
        inventory
      });
    } catch (error) {
      console.error('Get Inventory Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory details.'
      });
    }
  },

  // Update stock level or warning threshold for a product
  updateStock: async (req, res) => {
    try {
      const sellerId = req.seller.id;
      const { productId } = req.params;
      const { quantity, low_stock_threshold } = req.body;

      if (quantity === undefined || isNaN(quantity)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid numeric quantity value.'
        });
      }

      const updated = await Inventory.updateStock(
        productId,
        sellerId,
        quantity,
        low_stock_threshold
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Inventory record not found or access denied.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Inventory stock level updated successfully.'
      });
    } catch (error) {
      console.error('Update Stock Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update inventory stock.'
      });
    }
  },

  // Get list of items triggering low stock alerts
  getLowStockAlerts: async (req, res) => {
    try {
      const sellerId = req.seller.id;
      const alerts = await Inventory.getLowStockAlerts(sellerId);

      res.status(200).json({
        success: true,
        count: alerts.length,
        alerts
      });
    } catch (error) {
      console.error('Get Low Stock Alerts Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check low stock alerts.'
      });
    }
  }
};

module.exports = inventoryController;
