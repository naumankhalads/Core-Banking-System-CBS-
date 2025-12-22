const { Customer, User, Account, sequelize } = require('../models');
const { createAuditLog, getClientIP } = require('../utils/auditLogger');

// Get all customers (Admin only)
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'role', 'is_active']
        },
        {
          model: Account,
          as: 'accounts',
          attributes: ['account_no', 'account_type', 'balance', 'status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: customers
    });

  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Get single customer
const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // If customer role, verify they can only access their own data
    if (req.user.role === 'customer') {
      const ownCustomer = await Customer.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!ownCustomer || ownCustomer.customer_id !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own profile.'
        });
      }
    }

    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'role', 'is_active']
        },
        {
          model: Account,
          as: 'accounts',
          attributes: ['account_no', 'account_type', 'balance', 'status', 'opened_date']
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

// Update customer (Admin only)
const updateCustomer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, phone, address, date_of_birth } = req.body;

    const customer = await Customer.findByPk(id, { transaction });

    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Update customer
    await customer.update({
      name: name || customer.name,
      phone: phone || customer.phone,
      address: address !== undefined ? address : customer.address,
      date_of_birth: date_of_birth || customer.date_of_birth
    }, { transaction });

    await transaction.commit();

    // Audit log
    await createAuditLog({
      operation: 'UPDATE_CUSTOMER',
      table_affected: 'Customers',
      record_id: customer.customer_id,
      user_email: req.user.email,
      user_role: req.user.role,
      description: `Customer ${customer.name} updated`,
      ip_address: getClientIP(req)
    });

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Delete customer (Admin only)
const deleteCustomer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Account,
          as: 'accounts'
        }
      ],
      transaction
    });

    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has accounts with balance
    const accountsWithBalance = customer.accounts.filter(acc => parseFloat(acc.balance) > 0);
    if (accountsWithBalance.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with accounts having balance. Please close all accounts first.'
      });
    }

    const customerName = customer.name;
    const customerEmail = customer.user?.email;

    // Delete customer (will cascade to accounts)
    await customer.destroy({ transaction });

    await transaction.commit();

    // Audit log
    await createAuditLog({
      operation: 'DELETE_CUSTOMER',
      table_affected: 'Customers,Users',
      record_id: id,
      user_email: req.user.email,
      user_role: req.user.role,
      description: `Customer ${customerName} (${customerEmail}) deleted`,
      ip_address: getClientIP(req)
    });

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer
};