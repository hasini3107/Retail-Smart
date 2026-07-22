const { db } = require('../config/firebase');

const Return = {
  // Retrieve all returns for a seller (joining product names in memory)
  findAllBySeller: async (seller_id) => {
    if (!db) throw new Error('Firestore not initialized');
    const snapshot = await db.collection('returns')
      .where('seller_id', '==', seller_id)
      .get();

    if (snapshot.empty) return [];

    const returnsList = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Fetch product details for thumbnail/name
      let product_name = 'Unknown Product';
      let product_price = 0;
      let image_url = '';

      if (data.product_id) {
        const prodDoc = await db.collection('products').doc(data.product_id).get();
        if (prodDoc.exists) {
          const p = prodDoc.data();
          product_name = p.name;
          product_price = p.price || 0;
          image_url = p.image_url || '';
        }
      }

      returnsList.push({
        id: doc.id,
        ...data,
        product_name,
        product_price,
        image_url,
        created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate() : data.created_at) : new Date()
      });
    }

    // Sort by created_at descending
    returnsList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return returnsList;
  },

  // Create a new return request ticket
  create: async (seller_id, returnData) => {
    if (!db) throw new Error('Firestore not initialized');
    const { order_id, product_id, reason } = returnData;

    const newReturnRef = db.collection('returns').doc();
    const docData = {
      seller_id,
      order_id,
      product_id,
      reason: reason || 'Item return requested by customer',
      status: 'Pending',
      refund_status: 'Pending',
      created_at: new Date()
    };

    await newReturnRef.set(docData);
    const doc = await newReturnRef.get();

    return {
      id: doc.id,
      ...doc.data()
    };
  },

  // Update return ticket status & issue refund update
  updateStatus: async (id, seller_id, status, refund_status) => {
    if (!db) throw new Error('Firestore not initialized');

    const returnRef = db.collection('returns').doc(id);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(returnRef);
      if (!doc.exists || doc.data().seller_id !== seller_id) {
        throw new Error('Return ticket not found or unauthorized.');
      }

      const order_id = doc.data().order_id;

      // Update return ticket status
      transaction.update(returnRef, {
        status,
        refund_status: refund_status || (status === 'Approved' ? 'Refunded' : 'Not Refunded'),
        updated_at: new Date()
      });

      // If approved & refunded, update matching payment record status to Refunded
      if (status === 'Approved' && order_id) {
        const paySnapshot = await db.collection('payments')
          .where('order_id', '==', order_id)
          .get();

        paySnapshot.forEach(payDoc => {
          transaction.update(payDoc.ref, {
            status: 'Refunded',
            updated_at: new Date()
          });
        });
      }
    });

    const updatedDoc = await returnRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  }
};

module.exports = Return;
