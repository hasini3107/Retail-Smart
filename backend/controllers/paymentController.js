const Payment = require('../models/paymentModel');

const paymentController = {
  // Fetch all payment transactions for logged-in seller
  getPayments: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const payments = await Payment.findAllBySeller(seller_id);

      return res.status(200).json({
        success: true,
        count: payments.length,
        payments
      });
    } catch (error) {
      console.error('Get payments error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error retrieving payments.'
      });
    }
  },

  // Create a new payment record
  createPayment: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { order_id, amount, payment_method, status, transaction_id } = req.body;

      if (!order_id || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and payment amount are required.'
        });
      }

      const newPayment = await Payment.create(seller_id, {
        order_id,
        amount,
        payment_method,
        status,
        transaction_id
      });

      return res.status(201).json({
        success: true,
        message: 'Payment transaction logged successfully.',
        payment: newPayment
      });
    } catch (error) {
      console.error('Create payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error logging payment transaction.'
      });
    }
  },

  // Fetch billing revenue summary metrics
  getBillingSummary: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const summary = await Payment.getBillingSummary(seller_id);

      return res.status(200).json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('Get billing summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error generating billing summary.'
      });
    }
  }
};

module.exports = paymentController;
