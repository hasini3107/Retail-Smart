const path = require('path');
const fs = require('fs');

// Ensure module resolution includes backend/node_modules
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccountPath = path.join(__dirname, '../backend/config/firebase-service-account.json');
const projectId = 'retail-smart-628eb';

if (getApps().length === 0) {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('✔ Firebase Admin SDK connected to Live Cloud Firestore using serviceAccountKey.json.');
  } else {
    console.log(`Initializing Firebase for Project ID: [${projectId}]`);
    initializeApp({
      projectId: projectId
    });
  }
}

const db = getFirestore();

// Mock Data Definitions
const SELLER_ID = 'demo_seller';

const seedData = async () => {
  try {
    console.log('Starting Firestore Seeding for project retail-smart-628eb...');

    // 1. Seed Seller
    await db.collection('sellers').doc(SELLER_ID).set({
      business_name: 'TechGadgets Store',
      email: 'demo@retailsmart.com',
      password: '$2a$10$dqZAELex6Bo0UCA3zht0cuyFCLJHlugC/v6NVsVA2q3H1V4ILQ5WK', // 'password123' bcrypt
      created_at: new Date('2026-05-01')
    });
    console.log('✔ Sellers collection seeded.');

    // 2. Seed Products and 3. Inventory
    const products = [
      {
        id: 'prod_1',
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Premium over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.',
        price: 199.99,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
        inventory: { quantity: 45, low_stock_threshold: 10 }
      },
      {
        id: 'prod_2',
        name: 'Mechanical Gaming Keyboard',
        description: 'Tactile mechanical switch keyboard with RGB backlighting, durable aluminum plate, and custom macros.',
        price: 89.99,
        image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
        inventory: { quantity: 8, low_stock_threshold: 10 }
      },
      {
        id: 'prod_3',
        name: 'Ergonomic Wireless Mouse',
        description: 'Rechargeable wireless ergonomic mouse with adjustable DPI and side scroll wheels for productivity.',
        price: 49.99,
        image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80',
        inventory: { quantity: 110, low_stock_threshold: 15 }
      },
      {
        id: 'prod_4',
        name: 'Smart Fitness Watch',
        description: 'Waterproof fitness tracker with heart rate monitor, sleep analysis, and GPS tracking features.',
        price: 129.99,
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
        inventory: { quantity: 3, low_stock_threshold: 5 }
      },
      {
        id: 'prod_5',
        name: 'USB-C Dual Monitor Docking Station',
        description: 'High-speed docking station supporting dual 4K monitors, USB Power Delivery, and Ethernet connection.',
        price: 149.99,
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        inventory: { quantity: 18, low_stock_threshold: 5 }
      }
    ];

    for (const prod of products) {
      await db.collection('products').doc(prod.id).set({
        seller_id: SELLER_ID,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        image_url: prod.image_url,
        created_at: new Date('2026-05-10')
      });

      await db.collection('inventory').doc(prod.id).set({
        product_id: prod.id,
        seller_id: SELLER_ID,
        quantity: prod.inventory.quantity,
        low_stock_threshold: prod.inventory.low_stock_threshold,
        updated_at: new Date()
      });
    }
    console.log('✔ Products and Inventory collections seeded.');

    // 4. Seed Orders
    const orders = [
      {
        id: 'order_1',
        customer_name: 'Alice Smith',
        customer_email: 'alice@example.com',
        total_amount: 289.98,
        status: 'Delivered',
        created_at: new Date('2026-06-15T10:30:00Z'),
        items: [
          { product_id: 'prod_1', name: 'Wireless Noise-Canceling Headphones', quantity: 1, price: 199.99 },
          { product_id: 'prod_3', name: 'Ergonomic Wireless Mouse', quantity: 1, price: 49.99 },
          { product_id: 'prod_2', name: 'Mechanical Gaming Keyboard', quantity: 1, price: 89.99 }
        ]
      },
      {
        id: 'order_2',
        customer_name: 'Bob Johnson',
        customer_email: 'bob@example.com',
        total_amount: 49.99,
        status: 'Delivered',
        created_at: new Date('2026-06-28T14:15:00Z'),
        items: [
          { product_id: 'prod_3', name: 'Ergonomic Wireless Mouse', quantity: 1, price: 49.99 }
        ]
      },
      {
        id: 'order_3',
        customer_name: 'Charlie Brown',
        customer_email: 'charlie@example.com',
        total_amount: 199.99,
        status: 'Processing',
        created_at: new Date('2026-07-18T09:00:00Z'),
        items: [
          { product_id: 'prod_1', name: 'Wireless Noise-Canceling Headphones', quantity: 1, price: 199.99 }
        ]
      },
      {
        id: 'order_4',
        customer_name: 'Diana Prince',
        customer_email: 'diana@example.com',
        total_amount: 179.98,
        status: 'Pending',
        created_at: new Date('2026-07-19T16:45:00Z'),
        items: [
          { product_id: 'prod_2', name: 'Mechanical Gaming Keyboard', quantity: 2, price: 89.99 }
        ]
      },
      {
        id: 'order_5',
        customer_name: 'Evan Wright',
        customer_email: 'evan@example.com',
        total_amount: 389.97,
        status: 'Delivered',
        created_at: new Date('2026-07-20T11:20:00Z'),
        items: [
          { product_id: 'prod_1', name: 'Wireless Noise-Canceling Headphones', quantity: 1, price: 199.99 },
          { product_id: 'prod_5', name: 'USB-C Dual Monitor Docking Station', quantity: 1, price: 149.99 },
          { product_id: 'prod_3', name: 'Ergonomic Wireless Mouse', quantity: 1, price: 49.99 }
        ]
      },
      {
        id: 'order_6',
        customer_name: 'Fiona Gallagher',
        customer_email: 'fiona@example.com',
        total_amount: 89.99,
        status: 'Cancelled',
        created_at: new Date('2026-07-20T13:10:00Z'),
        items: [
          { product_id: 'prod_2', name: 'Mechanical Gaming Keyboard', quantity: 1, price: 89.99 }
        ]
      }
    ];

    for (const ord of orders) {
      await db.collection('orders').doc(ord.id).set({
        seller_id: SELLER_ID,
        customer_name: ord.customer_name,
        customer_email: ord.customer_email,
        total_amount: ord.total_amount,
        status: ord.status,
        created_at: ord.created_at,
        items: ord.items
      });
    }
    console.log('✔ Orders collection seeded.');

    // 5. Seed Payments
    const payments = [
      { id: 'pay_1', order_id: 'order_1', amount: 289.98, payment_method: 'Credit Card', status: 'Completed', transaction_id: 'TXN-982736192', created_at: new Date('2026-06-15T10:35:00Z') },
      { id: 'pay_2', order_id: 'order_2', amount: 49.99, payment_method: 'PayPal', status: 'Completed', transaction_id: 'TXN-102938475', created_at: new Date('2026-06-28T14:20:00Z') },
      { id: 'pay_3', order_id: 'order_3', amount: 199.99, payment_method: 'Credit Card', status: 'Completed', transaction_id: 'TXN-293847102', created_at: new Date('2026-07-18T09:05:00Z') },
      { id: 'pay_4', order_id: 'order_4', amount: 179.98, payment_method: 'PayPal', status: 'Pending', transaction_id: 'TXN-874635291', created_at: new Date('2026-07-19T16:45:00Z') },
      { id: 'pay_5', order_id: 'order_5', amount: 389.97, payment_method: 'Bank Transfer', status: 'Completed', transaction_id: 'TXN-382910482', created_at: new Date('2026-07-20T11:30:00Z') },
      { id: 'pay_6', order_id: 'order_6', amount: 89.99, payment_method: 'Credit Card', status: 'Failed', transaction_id: 'TXN-482019384', created_at: new Date('2026-07-20T13:12:00Z') }
    ];

    for (const pay of payments) {
      await db.collection('payments').doc(pay.id).set({
        seller_id: SELLER_ID,
        order_id: pay.order_id,
        amount: pay.amount,
        payment_method: pay.payment_method,
        status: pay.status,
        transaction_id: pay.transaction_id,
        created_at: pay.created_at
      });
    }
    console.log('✔ Payments collection seeded.');

    // 6. Seed Returns
    const returns = [
      {
        id: 'ret_1',
        order_id: 'order_2',
        product_id: 'prod_3',
        reason: 'Mouse scroll wheel feels sticky after a day of use.',
        status: 'Pending',
        refund_status: 'Pending',
        created_at: new Date('2026-06-30T09:15:00Z')
      }
    ];

    for (const ret of returns) {
      await db.collection('returns').doc(ret.id).set({
        seller_id: SELLER_ID,
        order_id: ret.order_id,
        product_id: ret.product_id,
        reason: ret.reason,
        status: ret.status,
        refund_status: ret.refund_status,
        created_at: ret.created_at
      });
    }
    console.log('✔ Returns collection seeded.');

    // 7. Seed Analytics Snapshot Summaries
    const analytics = [
      { id: `${SELLER_ID}_2026-06-15`, date: '2026-06-15', total_sales: 289.98, total_orders: 1, total_revenue: 289.98 },
      { id: `${SELLER_ID}_2026-06-28`, date: '2026-06-28', total_sales: 49.99, total_orders: 1, total_revenue: 49.99 },
      { id: `${SELLER_ID}_2026-07-18`, date: '2026-07-18', total_sales: 199.99, total_orders: 1, total_revenue: 199.99 },
      { id: `${SELLER_ID}_2026-07-19`, date: '2026-07-19', total_sales: 179.98, total_orders: 1, total_revenue: 0.00 },
      { id: `${SELLER_ID}_2026-07-20`, date: '2026-07-20', total_sales: 389.97, total_orders: 1, total_revenue: 389.97 }
    ];

    for (const record of analytics) {
      await db.collection('analytics').doc(record.id).set({
        seller_id: SELLER_ID,
        date: record.date,
        total_sales: record.total_sales,
        total_orders: record.total_orders,
        total_revenue: record.total_revenue
      });
    }
    console.log('✔ Analytics collection seeded.');
    console.log('====================================================');
    console.log('🎉 Firestore Database successfully seeded for project: retail-smart-628eb!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
    process.exit(1);
  }
};

seedData();
