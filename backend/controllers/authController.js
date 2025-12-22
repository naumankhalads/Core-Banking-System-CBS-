const jwt = require('jsonwebtoken');
const { User, Customer, sequelize } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');


const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Helper function to get client IP
const getClientIP = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress ||
         'unknown';
};

// Register new customer (Admin only)
const registerCustomer = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { email, password, name, cnic, phone, address, date_of_birth } = req.body;

    if (!email || !password || !name || !cnic || !phone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    const existingCNIC = await Customer.findOne({ where: { cnic } });
    if (existingCNIC) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'CNIC already registered.'
      });
    }

    const user = await User.create({
      email,
      password,
      role: 'customer',
      is_active: true
    }, { transaction });

    const customer = await Customer.create({
      user_id: user.user_id,
      name,
      cnic,
      phone,
      address,
      date_of_birth
    }, { transaction });

    await transaction.commit();

    await createAuditLog({
      operation: 'REGISTER_CUSTOMER',
      table_affected: 'Users,Customers',
      record_id: user.user_id,
      user_email: req.user?.email || 'system',
      user_role: req.user?.role || 'system',
      description: `New customer registered: ${email}`,
      ip_address: getClientIP(req)
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        user_id: user.user_id,
        customer_id: customer.customer_id,
        email: user.email,
        name: customer.name
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering customer',
      error: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['customer_id', 'name', 'cnic', 'phone']
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const token = generateToken(user);

    await createAuditLog({
      operation: 'LOGIN',
      table_affected: 'Users',
      record_id: user.user_id,
      user_email: user.email,
      user_role: user.role,
      description: `User logged in: ${user.email}`,
      ip_address: getClientIP(req)
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
          customer: user.customer
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};


const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['customer_id', 'name', 'cnic', 'phone', 'address', 'date_of_birth']
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

module.exports = {
  registerCustomer,
  login,
  getProfile
};