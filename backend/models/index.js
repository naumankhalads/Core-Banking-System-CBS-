const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import all models
const User = require('./User')(sequelize, DataTypes);
const Customer = require('./Customer')(sequelize, DataTypes);
const Account = require('./Account')(sequelize, DataTypes);
const Transaction = require('./Transaction')(sequelize, DataTypes);
const AuditLog = require('./AuditLog')(sequelize, DataTypes);

// Define associations

// User - Customer (One-to-One)
User.hasOne(Customer, {
  foreignKey: 'user_id',
  as: 'customer',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Customer.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Customer - Account (One-to-Many)
Customer.hasMany(Account, {
  foreignKey: 'customer_id',
  as: 'accounts',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Account.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Account - Transaction (One-to-Many for both from and to)
Account.hasMany(Transaction, {
  foreignKey: 'from_account',
  as: 'sentTransactions',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Account.hasMany(Transaction, {
  foreignKey: 'to_account',
  as: 'receivedTransactions',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Transaction.belongsTo(Account, {
  foreignKey: 'from_account',
  as: 'fromAccount',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Transaction.belongsTo(Account, {
  foreignKey: 'to_account',
  as: 'toAccount',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

module.exports = {
  sequelize,
  User,
  Customer,
  Account,
  Transaction,
  AuditLog
};