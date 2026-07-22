const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve product images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const returnRoutes = require('./routes/returnRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'RetailSmart AI API is running successfully.' });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/analytics', analyticsRoutes);

// Direct root route to login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Listen on configured port
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`RetailSmart AI Server running on port ${PORT}`);
  console.log(`Local Access URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
