const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { isAdminOrCustomer } = require('../middleware/roleMiddleware');
const {
  deposit,
  withdraw,
  transfer,
  demonstrateSavepoint,
  getTransactionHistory
} = require('../controllers/transactionController');

router.post('/deposit', authenticateToken, isAdminOrCustomer, deposit);
router.post('/withdraw', authenticateToken, isAdminOrCustomer, withdraw);
router.post('/transfer', authenticateToken, isAdminOrCustomer, transfer);
router.post('/demo-savepoint', authenticateToken, demonstrateSavepoint);
router.get('/history', authenticateToken, isAdminOrCustomer, getTransactionHistory);

module.exports = router;