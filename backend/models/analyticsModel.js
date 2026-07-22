const { db } = require('../config/firebase');

const Analytics = {
  // Retrieve comprehensive dashboard analytics summary for a seller
  getDashboardSummary: async (seller_id) => {
    if (!db) throw new Error('Firestore not initialized');

    // 1. Fetch all products of the seller
    const productsSnapshot = await db.collection('products')
      .where('seller_id', '==', seller_id)
      .get();
    const totalProducts = productsSnapshot.size;

    // 2. Fetch inventory for stock counts & valuation
    const inventorySnapshot = await db.collection('inventory')
      .where('seller_id', '==', seller_id)
      .get();

    const inventoryMap = {};
    let lowStockCount = 0;
    inventorySnapshot.docs.forEach(doc => {
      const inv = doc.data();
      inventoryMap[inv.product_id] = inv;
      if (inv.quantity <= inv.low_stock_threshold) {
        lowStockCount++;
      }
    });

    // Calculate Total Catalog Inventory Valuation (Price * Quantity)
    let totalCatalogValuation = 0;
    productsSnapshot.docs.forEach(doc => {
      const p = doc.data();
      const inv = inventoryMap[doc.id];
      const qty = inv ? (inv.quantity || 0) : 0;
      totalCatalogValuation += (parseFloat(p.price) || 0) * qty;
    });

    // 3. Fetch all orders of the seller
    const ordersSnapshot = await db.collection('orders')
      .where('seller_id', '==', seller_id)
      .get();
    
    let totalOrders = ordersSnapshot.size;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let monthlySalesMap = {};
    let dailySalesMap = {};
    let productSalesMap = {};

    const orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at ? data.created_at.toDate() : null
      };
    });

    // 4. Process orders in memory for metrics
    orders.forEach(order => {
      if (order.status === 'Pending') {
        pendingOrders++;
      } else if (order.status === 'Delivered') {
        completedOrders++;
      } else if (order.status === 'Cancelled') {
        cancelledOrders++;
      }

      if (order.status !== 'Cancelled') {
        const orderDate = order.created_at || new Date();
        const year = orderDate.getFullYear();
        const monthNum = orderDate.getMonth() + 1;
        const monthStr = `${year}-${monthNum.toString().padStart(2, '0')}`;
        const dayStr = orderDate.toISOString().split('T')[0];

        const amount = parseFloat(order.total_amount) || 0;

        monthlySalesMap[monthStr] = (monthlySalesMap[monthStr] || 0) + amount;
        dailySalesMap[dayStr] = (dailySalesMap[dayStr] || 0) + amount;

        (order.items || []).forEach(item => {
          const prodId = item.product_id;
          const qty = parseInt(item.quantity, 10) || 0;
          productSalesMap[prodId] = (productSalesMap[prodId] || 0) + qty;
        });
      }
    });

    // 5. Fetch all Completed Payments to calculate Revenue
    const paymentsSnapshot = await db.collection('payments')
      .where('seller_id', '==', seller_id)
      .where('status', '==', 'Completed')
      .get();

    let totalRevenue = 0;
    paymentsSnapshot.docs.forEach(doc => {
      totalRevenue += parseFloat(doc.data().amount) || 0;
    });

    // 6. Find Best Selling Products (top 5)
    const productMap = {};
    productsSnapshot.docs.forEach(doc => {
      productMap[doc.id] = doc.data();
    });

    const bestSellers = Object.keys(productSalesMap).map(prodId => ({
      product_id: prodId,
      name: productMap[prodId] ? productMap[prodId].name : 'Unknown Product',
      price: productMap[prodId] ? productMap[prodId].price : 0.00,
      image_url: productMap[prodId] ? productMap[prodId].image_url : null,
      quantity_sold: productSalesMap[prodId]
    }));

    bestSellers.sort((a, b) => b.quantity_sold - a.quantity_sold);
    const topBestSellers = bestSellers.slice(0, 5);

    // 7. Format Monthly Sales Chart Data
    const monthlySales = Object.keys(monthlySalesMap).map(month => ({
      month,
      sales: parseFloat(monthlySalesMap[month].toFixed(2))
    }));
    monthlySales.sort((a, b) => a.month.localeCompare(b.month));

    // 8. Format Daily Sales Chart Data
    const analyticsSnapshot = await db.collection('analytics')
      .where('seller_id', '==', seller_id)
      .get();

    let dailySales = [];
    if (!analyticsSnapshot.empty) {
      dailySales = analyticsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          date: data.date,
          sales: parseFloat(data.total_sales) || 0.00,
          revenue: parseFloat(data.total_revenue) || 0.00
        };
      });
    } else {
      dailySales = Object.keys(dailySalesMap).map(date => ({
        date,
        sales: parseFloat(dailySalesMap[date].toFixed(2)),
        revenue: parseFloat(dailySalesMap[date].toFixed(2))
      }));
    }
    dailySales.sort((a, b) => a.date.localeCompare(b.date));

    return {
      metrics: {
        total_products: totalProducts,
        total_catalog_valuation: parseFloat(totalCatalogValuation.toFixed(2)),
        total_orders: totalOrders,
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        cancelled_orders: cancelledOrders,
        low_stock_count: lowStockCount
      },
      monthly_sales: monthlySales,
      daily_sales: dailySales,
      best_sellers: topBestSellers
    };
  }
};

module.exports = Analytics;
