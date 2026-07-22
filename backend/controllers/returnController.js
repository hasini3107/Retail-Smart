const Return = require('../models/returnModel');

const returnController = {
  // Fetch all return tickets for logged-in seller
  getReturns: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const returns = await Return.findAllBySeller(seller_id);

      return res.status(200).json({
        success: true,
        count: returns.length,
        returns
      });
    } catch (error) {
      console.error('Get returns error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error retrieving return tickets.'
      });
    }
  },

  // Create a new return request ticket
  createReturn: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { order_id, product_id, reason } = req.body;

      if (!order_id || !product_id) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and product ID are required for return requests.'
        });
      }

      const newReturn = await Return.create(seller_id, {
        order_id,
        product_id,
        reason
      });

      return res.status(201).json({
        success: true,
        message: 'Return request ticket created successfully.',
        return_ticket: newReturn
      });
    } catch (error) {
      console.error('Create return request error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error creating return request ticket.'
      });
    }
  },

  // Update return ticket status (Approved / Rejected) and refund disposition
  updateReturnStatus: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { id } = req.params;
      const { status, refund_status } = req.body;

      const validStatuses = ['Pending', 'Approved', 'Rejected'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
        });
      }

      const updatedTicket = await Return.updateStatus(id, seller_id, status, refund_status);

      return res.status(200).json({
        success: true,
        message: `Return request '${status}' successfully.`,
        return_ticket: updatedTicket
      });
    } catch (error) {
      console.error('Update return status error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error updating return status.'
      });
    }
  }
};

module.exports = returnController;
