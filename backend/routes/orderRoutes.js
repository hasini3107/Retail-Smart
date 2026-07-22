const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// All order routes are protected by JWT auth
router.use(authMiddleware);

// GET /api/orders - Fetch seller orders
router.get('/', orderController.getOrders);

// POST /api/orders - Create a new order
router.post('/', orderController.createOrder);

// GET /api/orders/:id - Fetch order details
router.get('/:id', orderController.getOrderById);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', orderController.updateOrderStatus);

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
