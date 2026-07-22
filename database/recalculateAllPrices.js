const path = require('path');
const fs = require('fs');

module.paths.push(path.join(__dirname, '../backend/node_modules'));

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccountPath = path.join(__dirname, '../backend/config/firebase-service-account.json');
const projectId = 'retail-smart-628eb';

if (getApps().length === 0) {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp({ projectId });
  }
}

const db = getFirestore();
const SELLER_ID = 'demo_seller';

const syncPrices = async () => {
  try {
    console.log('🔄 Starting Full Database Price Sync & Recalculation...');

    // 1. Fetch all current product prices
    const productsSnapshot = await db.collection('products')
      .where('seller_id', '==', SELLER_ID)
      .get();

    const productMap = {};
    productsSnapshot.docs.forEach(doc => {
      const p = doc.data();
      productMap[doc.id] = p;
    });

    console.log('✔ Fetched current product prices:');
    Object.keys(productMap).forEach(id => {
      console.log(`   - ${productMap[id].name}: ₹${productMap[id].price}`);
    });

    // 2. Update all Orders with new product prices and recalculate totals
    const ordersSnapshot = await db.collection('orders')
      .where('seller_id', '==', SELLER_ID)
      .get();

    const orderTotalsMap = {};

    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      let newTotal = 0;

      const updatedItems = (order.items || []).map(item => {
        const prod = productMap[item.product_id];
        const newUnitPrice = prod ? parseFloat(prod.price) : (parseFloat(item.price) || 0);
        const qty = parseInt(item.quantity, 10) || 1;
        newTotal += newUnitPrice * qty;

        return {
          ...item,
          name: prod ? prod.name : item.name,
          price: newUnitPrice
        };
      });

      const roundedTotal = parseFloat(newTotal.toFixed(2));
      orderTotalsMap[orderDoc.id] = roundedTotal;

      await orderDoc.ref.update({
        items: updatedItems,
        total_amount: roundedTotal
      });
      console.log(`✔ Updated Order #${orderDoc.id.substring(0, 8)} Total: ₹${roundedTotal}`);
    }

    // 3. Update all Payments with new order totals
    const paymentsSnapshot = await db.collection('payments')
      .where('seller_id', '==', SELLER_ID)
      .get();

    for (const payDoc of paymentsSnapshot.docs) {
      const pay = payDoc.data();
      const newAmount = orderTotalsMap[pay.order_id] || pay.amount;

      await payDoc.ref.update({
        amount: newAmount
      });
      console.log(`✔ Updated Payment #${payDoc.id} Amount: ₹${newAmount}`);
    }

    // 4. Update Returns ticket refund values
    const returnsSnapshot = await db.collection('returns')
      .where('seller_id', '==', SELLER_ID)
      .get();

    for (const returnDoc of returnsSnapshot.docs) {
      const ret = returnDoc.data();
      const prod = productMap[ret.product_id];
      if (prod) {
        await returnDoc.ref.update({
          product_price: parseFloat(prod.price)
        });
      }
    }
    console.log('✔ Updated Returns ticket refund values.');

    console.log('====================================================');
    console.log('🎉 Database Price Sync completed successfully!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing prices:', error);
    process.exit(1);
  }
};

syncPrices();
