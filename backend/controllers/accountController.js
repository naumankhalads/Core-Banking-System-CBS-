const { Account, Customer, User, sequelize } = require('../models');
const { createAuditLog, getClientIP } = require('../utils/auditLogger');

// Generate account number
const generateAccountNumber = () => {
  const prefix = 'ACC';
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Create account (Admin only)
const createAccount = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { customer_id, account_type, initial_balance } = req.body;

    if (!customer_id || !account_type) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Customer ID and account type are required'
      });
    }

    // Verify customer exists
    const customer = await Customer.findByPk(customer_id, { transaction });
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Generate unique account number
    let account_no;
    let isUnique = false;
    while (!isUnique) {
      account_no = generateAccountNumber();
      const existing = await Account.findByPk(account_no, { transaction });
      if (!existing) isUnique = true;
    }

    // Create account
    const account = await Account.create({
      account_no,
      customer_id,
      account_type,
      balance: initial_balance || 0,
      status: 'active',
      opened_date: new Date()
    }, { transaction });

    await transaction.commit();

    // Audit log
    await createAuditLog({
      operation: 'CREATE_ACCOUNT',
      table_affected: 'Accounts',
      record_id: account_no,
      user_email: req.user.email,
      user_role: req.user.role,
      description: `New ${account_type} account created for customer ${customer_id}`,
      ip_address: getClientIP(req)
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
};

// Get all accounts (Admin) or own accounts (Customer)
const getAllAccounts = async (req, res) => {
  try {
    let whereClause = {};

    // If customer, only show their accounts
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found'
        });
      }

      whereClause.customer_id = customer.customer_id;
    }

    const accounts = await Account.findAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['customer_id', 'name', 'cnic', 'phone'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: accounts
    });

  } catch (error) {
    console.error('Get all accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accounts',
      error: error.message
    });
  }
};

// Get single account
const getAccount = async (req, res) => {
  try {
    const { account_no } = req.params;

    const account = await Account.findByPk(account_no, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['customer_id', 'name', 'cnic', 'phone'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email', 'user_id']
            }
          ]
        }
      ]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // If customer role, verify ownership
    if (req.user.role === 'customer') {
      if (account.customer.user.user_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own accounts.'
        });
      }
    }

    res.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching account',
      error: error.message
    });
  }
};

// Update account (Admin only)
const updateAccount = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { account_no } = req.params;
    const { account_type, status } = req.body;

    const account = await Account.findByPk(account_no, { transaction });

    if (!account) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Update account
    await account.update({
      account_type: account_type || account.account_type,
      status: status || account.status
    }, { transaction });

    await transaction.commit();

    // Audit log
    await createAuditLog({
      operation: 'UPDATE_ACCOUNT',
      table_affected: 'Accounts',
      record_id: account_no,
      user_email: req.user.email,
      user_role: req.user.role,
      description: `Account ${account_no} updated`,
      ip_address: getClientIP(req)
    });

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: account
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating account',
      error: error.message
    });
  }
};

// Delete/Deactivate account (Admin only)
const deleteAccount = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { account_no } = req.params;

    const account = await Account.findByPk(account_no, { transaction });

    if (!account) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Check if account has balance
    if (parseFloat(account.balance) > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with positive balance. Please withdraw all funds first.'
      });
    }

    // Deactivate instead of deleting
    await account.update({ status: 'inactive' }, { transaction });

    await transaction.commit();

    // Audit log
    await createAuditLog({
      operation: 'DEACTIVATE_ACCOUNT',
      table_affected: 'Accounts',
      record_id: account_no,
      user_email: req.user.email,
      user_role: req.user.role,
      description: `Account ${account_no} deactivated`,
      ip_address: getClientIP(req)
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating account',
      error: error.message
    });
  }
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccount,
  updateAccount,
  deleteAccount
};