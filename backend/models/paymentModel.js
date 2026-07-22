const { db } = require('../config/firebase');

const Payment = {
  // Fetch all payment transactions for a seller
  findAllBySeller: async (seller_id) => {
    if (!db) throw new Error('Firestore not initialized');
    const snapshot = await db.collection('payments')
      .where('seller_id', '==', seller_id)
      .get();

    if (snapshot.empty) return [];

    const payments = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate() : data.created_at) : new Date()
      });
    });

    // Sort by created_at descending
    payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return payments;
  },

  // Create a new payment record
  create: async (seller_id, paymentData) => {
    if (!db) throw new Error('Firestore not initialized');
    const { order_id, amount, payment_method, status, transaction_id } = paymentData;

    const newPaymentRef = db.collection('payments').doc();
    const docData = {
      seller_id,
      order_id,
      amount: parseFloat(amount) || 0,
      payment_method: payment_method || 'Credit Card',
      status: status || 'Completed',
      transaction_id: transaction_id || `TXN-${Date.now().toString().substring(5)}`,
      created_at: new Date()
    };

    await newPaymentRef.set(docData);
    const doc = await newPaymentRef.get();

    return {
      id: doc.id,
      ...doc.data()
    };
  },

  // Get revenue summary metrics
  getBillingSummary: async (seller_id) => {
    if (!db) throw new Error('Firestore not initialized');
    const snapshot = await db.collection('payments')
      .where('seller_id', '==', seller_id)
      .get();

    let total_revenue = 0;
    let pending_payments = 0;
    let transaction_count = 0;

    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        const pay = doc.data();
        transaction_count++;
        if (pay.status === 'Completed') {
          total_revenue += (parseFloat(pay.amount) || 0);
        } else if (pay.status === 'Pending') {
          pending_payments += (parseFloat(pay.amount) || 0);
        }
      });
    }

    return {
      total_revenue: parseFloat(total_revenue.toFixed(2)),
      pending_payments: parseFloat(pending_payments.toFixed(2)),
      transaction_count
    };
  }
};

module.exports = Payment;
