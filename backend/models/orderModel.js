const { db } = require('../config/firebase');

const Order = {
  // Retrieve all orders for a seller
  findAllBySeller: async (seller_id) => {
    if (!db) throw new Error('Firestore not initialized');
    const snapshot = await db.collection('orders')
      .where('seller_id', '==', seller_id)
      .get();

    if (snapshot.empty) return [];

    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate() : data.created_at) : new Date()
      });
    });

    // Sort by created_at descending
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return orders;
  },

  // Retrieve single order by ID
  findById: async (id, seller_id) => {
    if (!db) throw new Error('Firestore not initialized');
    const doc = await db.collection('orders').doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data();
    if (data.seller_id !== seller_id) return null;

    return {
      id: doc.id,
      ...data,
      created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate() : data.created_at) : new Date()
    };
  },

  // Create a new order with atomic inventory deduction
  create: async (seller_id, orderData) => {
    if (!db) throw new Error('Firestore not initialized');

    const { customer_name, customer_email, items } = orderData;
    let total_amount = 0;
    (items || []).forEach(item => {
      total_amount += (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
    });

    const newOrderRef = db.collection('orders').doc();

    await db.runTransaction(async (transaction) => {
      // 1. Deduct stock for each item
      for (const item of items) {
        const invRef = db.collection('inventory').doc(item.product_id);
        const invDoc = await transaction.get(invRef);
        if (invDoc.exists) {
          const currentQty = invDoc.data().quantity || 0;
          const newQty = Math.max(0, currentQty - parseInt(item.quantity));
          transaction.update(invRef, {
            quantity: newQty,
            updated_at: new Date()
          });
        }
      }

      // 2. Set new order document
      transaction.set(newOrderRef, {
        seller_id,
        customer_name,
        customer_email,
        total_amount: parseFloat(total_amount.toFixed(2)),
        status: 'Pending',
        items: items || [],
        created_at: new Date()
      });
    });

    const createdDoc = await newOrderRef.get();
    return {
      id: createdDoc.id,
      ...createdDoc.data()
    };
  },

  // Update order status with dynamic inventory stock restoration/deduction
  updateStatus: async (id, seller_id, newStatus) => {
    if (!db) throw new Error('Firestore not initialized');

    const orderRef = db.collection('orders').doc(id);
    
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(orderRef);
      if (!doc.exists || doc.data().seller_id !== seller_id) {
        throw new Error('Order not found or unauthorized.');
      }

      const currentStatus = doc.data().status;
      const items = doc.data().items || [];

      // If transitioning to Cancelled from an active status, restore stock
      if (newStatus === 'Cancelled' && currentStatus !== 'Cancelled') {
        for (const item of items) {
          const invRef = db.collection('inventory').doc(item.product_id);
          const invDoc = await transaction.get(invRef);
          if (invDoc.exists) {
            const currentQty = invDoc.data().quantity || 0;
            transaction.update(invRef, {
              quantity: currentQty + (parseInt(item.quantity) || 0),
              updated_at: new Date()
            });
          }
        }
      }

      // Update status
      transaction.update(orderRef, {
        status: newStatus,
        updated_at: new Date()
      });
    });

    const updatedDoc = await orderRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  },

  // Delete an order
  delete: async (id, seller_id) => {
    if (!db) throw new Error('Firestore not initialized');
    const orderRef = db.collection('orders').doc(id);
    const doc = await orderRef.get();
    if (!doc.exists || doc.data().seller_id !== seller_id) {
      throw new Error('Order not found or unauthorized.');
    }
    await orderRef.delete();
    return true;
  }
};

module.exports = Order;
