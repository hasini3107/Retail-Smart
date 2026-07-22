const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const authMiddleware = require('../middleware/authMiddleware');

// All return routes are protected by JWT auth
router.use(authMiddleware);

// GET /api/returns - Fetch return tickets
router.get('/', returnController.getReturns);

// POST /api/returns - Create a new return request ticket
router.post('/', returnController.createReturn);

// PUT /api/returns/:id/status - Approve/Reject return ticket & update refund status
router.put('/:id/status', returnController.updateReturnStatus);

module.exports = router;
