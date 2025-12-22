const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrCustomer } = require('../middleware/roleMiddleware');
const {
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

router.get('/', authenticateToken, isAdmin, getAllCustomers);
router.get('/:id', authenticateToken, isAdminOrCustomer, getCustomer);
router.put('/:id', authenticateToken, isAdmin, updateCustomer);
router.delete('/:id', authenticateToken, isAdmin, deleteCustomer);

module.exports = router;