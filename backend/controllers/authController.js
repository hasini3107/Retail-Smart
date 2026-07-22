const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../models/sellerModel');
require('dotenv').config();

const authController = {
  // Register a new seller account
  register: async (req, res) => {
    try {
      const { business_name, email, password } = req.body;

      // Basic validations
      if (!business_name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields: business_name, email, password.'
        });
      }

      // Check if seller already exists
      const existingSeller = await Seller.findByEmail(email);
      if (existingSeller) {
        return res.status(400).json({
          success: false,
          message: 'A seller account with this email address already exists.'
        });
      }

      // Hash password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create seller
      const newSeller = await Seller.create({
        business_name,
        email,
        password: hashedPassword
      });

      // Generate JWT Token
      const token = jwt.sign(
        { id: newSeller.id, email: newSeller.email },
        process.env.JWT_SECRET || 'retailsmart_jwt_secret_key_2026',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Seller registration successful.',
        token,
        seller: {
          id: newSeller.id,
          business_name: newSeller.business_name,
          email: newSeller.email
        }
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed due to a server error.'
      });
    }
  },

  // Login handler
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email and password.'
        });
      }

      // Check if seller exists
      const seller = await Seller.findByEmail(email);
      if (!seller) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please verify your email and password.'
        });
      }

      // Check password using bcryptjs
      const isMatch = await bcrypt.compare(password, seller.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please verify your email and password.'
        });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: seller.id, email: seller.email },
        process.env.JWT_SECRET || 'retailsmart_jwt_secret_key_2026',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        seller: {
          id: seller.id,
          business_name: seller.business_name,
          email: seller.email
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed due to a server error.'
      });
    }
  },

  // Get authenticated seller's profile
  getProfile: async (req, res) => {
    try {
      // req.seller.id is set by authMiddleware
      const sellerId = req.seller.id;
      const seller = await Seller.findById(sellerId);

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller profile not found.'
        });
      }

      res.status(200).json({
        success: true,
        seller
      });
    } catch (error) {
      console.error('Get Profile Error:', error);
      res.status(500).json({
        success: false,
        message: 'Could not fetch profile details.'
      });
    }
  }
};

module.exports = authController;
