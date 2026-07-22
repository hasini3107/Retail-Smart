const { db } = require('../config/firebase');

const Inventory = {
  // Fetch all inventory items for a seller, joining product details in memory
  getInventory: async (seller_id) => {
    if (!db) throw new Error('Firestore not initialized');

    // 1. Get inventory docs for the seller
    const inventorySnapshot = await db.collection('inventory')
      .where('seller_id', '==', seller_id)
      .get();

    const inventoryItems = inventorySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        product_id: doc.id,
        ...data,
        updated_at: data.updated_at ? data.updated_at.toDate() : null
      };
    });

    if (inventoryItems.length === 0) return [];

    // 2. Get all products for the seller to match name and price
    const productsSnapshot = await db.collection('products')
      .where('seller_id', '==', seller_id)
      .get();

    const productMap = {};
    productsSnapshot.docs.forEach(doc => {
      productMap[doc.id] = doc.data();
    });

    // 3. Merge product details into inventory records
    return inventoryItems.map(item => ({
      ...item,
      product_name: productMap[item.product_id] ? productMap[item.product_id].name : 'Unknown Product',
      product_price: productMap[item.product_id] ? productMap[item.product_id].price : 0.00,
      image_url: productMap[item.product_id] ? productMap[item.product_id].image_url : null
    }));
  },

  // Update quantity and low stock threshold for a product
  updateStock: async (product_id, seller_id, quantity, low_stock_threshold) => {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = db.collection('inventory').doc(product_id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().seller_id !== seller_id) {
      return false;
    }

    const updates = {
      quantity: parseInt(quantity, 10),
      updated_at: new Date()
    };

    if (low_stock_threshold !== undefined) {
      updates.low_stock_threshold = parseInt(low_stock_threshold, 10);
    }

    await docRef.update(updates);
    return true;
  },

  // Query low stock items (quantity <= low_stock_threshold)
  getLowStockAlerts: async (seller_id) => {
    if (!db) throw new Error('Firestore not initialized');

    // 1. Get all inventory for this seller
    const inventorySnapshot = await db.collection('inventory')
      .where('seller_id', '==', seller_id)
      .get();

    const lowStockItems = [];
    const productIds = [];

    inventorySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.quantity <= data.low_stock_threshold) {
        lowStockItems.push({
          product_id: doc.id,
          ...data,
          updated_at: data.updated_at ? data.updated_at.toDate() : null
        });
        productIds.push(doc.id);
      }
    });

    if (lowStockItems.length === 0) return [];

    // 2. Fetch product names
    const productsSnapshot = await db.collection('products')
      .where('seller_id', '==', seller_id)
      .get();

    const productMap = {};
    productsSnapshot.docs.forEach(doc => {
      productMap[doc.id] = doc.data();
    });

    // 3. Merge names
    return lowStockItems.map(item => ({
      ...item,
      product_name: productMap[item.product_id] ? productMap[item.product_id].name : 'Unknown Product',
      product_price: productMap[item.product_id] ? productMap[item.product_id].price : 0.00
    }));
  }
};

module.exports = Inventory;
