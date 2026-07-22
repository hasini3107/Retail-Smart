const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No authorization token provided.'
    });
  }

  // Token is in the format "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Token format is invalid (should be Bearer TOKEN).'
    });
  }

  const token = parts[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'retailsmart_jwt_secret_key_2026');
    // Attach seller info (id, email) to request object
    req.seller = verified;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid or expired token.'
    });
  }
};

module.exports = authMiddleware;
