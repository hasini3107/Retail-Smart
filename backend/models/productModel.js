const { db } = require('../config/firebase');

const Product = {
  // Create a new product and initialize stock in inventory using a Firestore transaction
  create: async (productData) => {
    if (!db) throw new Error('Firestore not initialized');
    const { seller_id, name, description, price, image_url } = productData;

    const productRef = db.collection('products').doc();
    const inventoryRef = db.collection('inventory').doc(productRef.id);

    await db.runTransaction(async (transaction) => {
      // Set product document
      transaction.set(productRef, {
        seller_id,
        name,
        description: description || null,
        price: parseFloat(price),
        image_url: image_url || null,
        created_at: new Date()
      });

      // Set corresponding inventory document (using product ID as the key)
      transaction.set(inventoryRef, {
        product_id: productRef.id,
        seller_id,
        quantity: 0,
        low_stock_threshold: 10,
        updated_at: new Date()
      });
    });

    return { 
      id: productRef.id, 
      seller_id, 
      name, 
      description, 
      price, 
      image_url 
    };
  },

  // Find all products for a seller and merge their inventory details in memory
  findAllBySeller: async (seller_id, search = '') => {
    if (!db) throw new Error('Firestore not initialized');
    
    // 1. Fetch products
    const productsSnapshot = await db.collection('products')
      .where('seller_id', '==', seller_id)
      .get();
      
    const products = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at ? data.created_at.toDate() : null
      };
    });

    // 2. Fetch inventory records
    const inventorySnapshot = await db.collection('inventory')
      .where('seller_id', '==', seller_id)
      .get();
      
    const inventoryMap = {};
    inventorySnapshot.docs.forEach(doc => {
      inventoryMap[doc.id] = doc.data(); // doc.id matches product_id
    });

    // 3. Merge products with inventory data
    let results = products.map(product => ({
      ...product,
      quantity: inventoryMap[product.id] ? inventoryMap[product.id].quantity : 0,
      low_stock_threshold: inventoryMap[product.id] ? inventoryMap[product.id].low_stock_threshold : 10
    }));

    // 4. Perform in-memory search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchLower)) || 
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort by created_at descending
    results.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

    return results;
  },

  // Find a specific product and merge its inventory details
  findById: async (id, seller_id) => {
    if (!db) throw new Error('Firestore not initialized');
    
    const productDoc = await db.collection('products').doc(id).get();
    if (!productDoc.exists) return null;
    
    const productData = productDoc.data();
    if (productData.seller_id !== seller_id) return null;

    const inventoryDoc = await db.collection('inventory').doc(id).get();
    const inventoryData = inventoryDoc.exists ? inventoryDoc.data() : { quantity: 0, low_stock_threshold: 10 };

    return {
      id: productDoc.id,
      ...productData,
      created_at: productData.created_at ? productData.created_at.toDate() : null,
      quantity: inventoryData.quantity,
      low_stock_threshold: inventoryData.low_stock_threshold
    };
  },

  // Update a product document and automatically cascade cost changes across all connected collections
  update: async (id, seller_id, productData) => {
    if (!db) throw new Error('Firestore not initialized');
    const { name, description, price, image_url } = productData;

    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists || productDoc.data().seller_id !== seller_id) {
      return false;
    }

    const newPrice = parseFloat(price);
    const updates = {
      name,
      description: description || null,
      price: newPrice
    };

    if (image_url !== undefined) {
      updates.image_url = image_url;
    }

    await productRef.update(updates);

    // Automatic cascade price updates across connected collections
    try {
      // 1. Cascade update to orders containing this product
      const ordersSnapshot = await db.collection('orders')
        .where('seller_id', '==', seller_id)
        .get();

      for (const orderDoc of ordersSnapshot.docs) {
        const order = orderDoc.data();
        let itemsModified = false;
        let newTotal = 0;

        const updatedItems = (order.items || []).map(item => {
          if (item.product_id === id) {
            itemsModified = true;
            const updatedItem = { ...item, price: newPrice, name: name || item.name };
            newTotal += updatedItem.price * (updatedItem.quantity || 1);
            return updatedItem;
          } else {
            newTotal += (parseFloat(item.price) || 0) * (item.quantity || 1);
            return item;
          }
        });

        if (itemsModified) {
          await orderDoc.ref.update({
            items: updatedItems,
            total_amount: parseFloat(newTotal.toFixed(2))
          });

          // 2. Cascade update to corresponding payments
          const paymentsSnapshot = await db.collection('payments')
            .where('seller_id', '==', seller_id)
            .where('order_id', '==', orderDoc.id)
            .get();

          for (const payDoc of paymentsSnapshot.docs) {
            await payDoc.ref.update({
              amount: parseFloat(newTotal.toFixed(2))
            });
          }
        }
      }

      // 3. Cascade update to returns tickets for this product
      const returnsSnapshot = await db.collection('returns')
        .where('seller_id', '==', seller_id)
        .where('product_id', '==', id)
        .get();

      for (const returnDoc of returnsSnapshot.docs) {
        await returnDoc.ref.update({
          product_price: newPrice
        });
      }
    } catch (err) {
      console.error('Error cascading product price update to orders/payments:', err);
    }

    return true;
  },

  // Delete a product and its associated inventory document
  delete: async (id, seller_id) => {
    if (!db) throw new Error('Firestore not initialized');

    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists || productDoc.data().seller_id !== seller_id) {
      return false;
    }

    const inventoryRef = db.collection('inventory').doc(id);

    // Delete both documents atomically
    const batch = db.batch();
    batch.delete(productRef);
    batch.delete(inventoryRef);
    await batch.commit();

    return true;
  }
};

module.exports = Product;
