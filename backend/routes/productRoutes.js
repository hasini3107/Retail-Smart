const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Protect all routes in this file
router.use(authMiddleware);

// Route: GET /api/products - Get all products (supports ?search=)
router.get('/', productController.getProducts);

// Route: GET /api/products/:id - Get product details
router.get('/:id', productController.getProductById);

// Route: POST /api/products - Add a new product (handles file upload)
router.post('/', upload.single('image'), productController.createProduct);

// Route: PUT /api/products/:id - Update product (handles file upload)
router.put('/:id', upload.single('image'), productController.updateProduct);

// Route: DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
