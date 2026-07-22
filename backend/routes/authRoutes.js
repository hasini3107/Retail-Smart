const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route: POST /api/auth/register
router.post('/register', authController.register);

// Route: POST /api/auth/login
router.post('/login', authController.login);

// Route: GET /api/auth/profile (Protected)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
