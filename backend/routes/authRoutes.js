const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { registerCustomer, login, getProfile } = require('../controllers/authController');

router.post('/register', authenticateToken, isAdmin, registerCustomer);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;