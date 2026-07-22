const Order = require('../models/orderModel');

const orderController = {
  // Retrieve all orders for logged-in seller
  getOrders: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const orders = await Order.findAllBySeller(seller_id);

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      console.error('Get orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error retrieving orders.'
      });
    }
  },

  // Get single order by ID
  getOrderById: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { id } = req.params;

      const order = await Order.findById(id, seller_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.'
        });
      }

      return res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Get order by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error retrieving order details.'
      });
    }
  },

  // Create a new order
  createOrder: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { customer_name, customer_email, items } = req.body;

      if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Customer name and order items are required.'
        });
      }

      const newOrder = await Order.create(seller_id, {
        customer_name,
        customer_email: customer_email || 'guest@example.com',
        items
      });

      return res.status(201).json({
        success: true,
        message: 'Order created successfully.',
        order: newOrder
      });
    } catch (error) {
      console.error('Create order error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error creating order.'
      });
    }
  },

  // Update order status (Pending -> Processing -> Delivered -> Cancelled)
  updateOrderStatus: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
        });
      }

      const updatedOrder = await Order.updateStatus(id, seller_id, status);

      return res.status(200).json({
        success: true,
        message: `Order status updated to '${status}' successfully.`,
        order: updatedOrder
      });
    } catch (error) {
      console.error('Update order status error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error updating order status.'
      });
    }
  },

  // Delete an order
  deleteOrder: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { id } = req.params;

      await Order.delete(id, seller_id);

      return res.status(200).json({
        success: true,
        message: 'Order deleted successfully.'
      });
    } catch (error) {
      console.error('Delete order error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error deleting order.'
      });
    }
  }
};

module.exports = orderController;
