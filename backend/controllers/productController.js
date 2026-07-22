const Product = require('../models/productModel');
const { uploadToFirebaseStorage } = require('../middleware/uploadMiddleware');

const productController = {
  // Create a new product
  createProduct: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { name, description, price, low_stock_threshold } = req.body;

      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Product name and price are required.'
        });
      }

      let image_url = '';
      if (req.file) {
        image_url = await uploadToFirebaseStorage(req.file);
      }

      const productData = {
        seller_id,
        name,
        description: description || '',
        price: parseFloat(price),
        image_url
      };

      const newProduct = await Product.create(productData, parseInt(low_stock_threshold) || 10);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product: newProduct
      });
    } catch (error) {
      console.error('Create product error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error creating product.'
      });
    }
  },

  // Get all products for logged-in seller
  getProducts: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const search = req.query.search || '';

      const products = await Product.findAllBySeller(seller_id, search);

      return res.status(200).json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Get products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error retrieving products.'
      });
    }
  },

  // Get single product by ID
  getProductById: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { id } = req.params;

      const product = await Product.findById(id, seller_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      return res.status(200).json({
        success: true,
        product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error retrieving product.'
      });
    }
  },

  // Update product details
  updateProduct: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { id } = req.params;
      const { name, description, price } = req.body;

      const existingProduct = await Product.findById(id, seller_id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price) updateData.price = parseFloat(price);

      if (req.file) {
        updateData.image_url = await uploadToFirebaseStorage(req.file);
      }

      const updatedProduct = await Product.update(id, seller_id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Update product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error updating product.'
      });
    }
  },

  // Delete product and its associated inventory
  deleteProduct: async (req, res) => {
    try {
      const seller_id = req.seller.id;
      const { id } = req.params;

      const existingProduct = await Product.findById(id, seller_id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      await Product.delete(id, seller_id);

      return res.status(200).json({
        success: true,
        message: 'Product and associated inventory deleted successfully.'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error deleting product.'
      });
    }
  }
};

module.exports = productController;
