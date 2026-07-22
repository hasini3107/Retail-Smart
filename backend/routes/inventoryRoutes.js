const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Secure all endpoints in this router
router.use(authMiddleware);

// Route: GET /api/inventory - Get all inventory records
router.get('/', inventoryController.getInventory);

// Route: GET /api/inventory/alerts - Get low stock warning alerts
router.get('/alerts', inventoryController.getLowStockAlerts);

// Route: PUT /api/inventory/:productId - Update stock level / threshold parameters
router.put('/:productId', inventoryController.updateStock);

module.exports = router;
