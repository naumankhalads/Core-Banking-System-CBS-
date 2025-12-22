const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrCustomer } = require('../middleware/roleMiddleware');
const {
  createAccount,
  getAllAccounts,
  getAccount,
  updateAccount,
  deleteAccount
} = require('../controllers/accountController');

router.post('/', authenticateToken, isAdmin, createAccount);
router.get('/', authenticateToken, isAdminOrCustomer, getAllAccounts);
router.get('/:account_no', authenticateToken, isAdminOrCustomer, getAccount);
router.put('/:account_no', authenticateToken, isAdmin, updateAccount);
router.delete('/:account_no', authenticateToken, isAdmin, deleteAccount);

module.exports = router;