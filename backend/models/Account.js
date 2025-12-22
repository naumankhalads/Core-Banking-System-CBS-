module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    account_no: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      validate: {
        is: /^[A-Z0-9]+$/
      }
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'customer_id'
      }
    },
    account_type: {
      type: DataTypes.ENUM('savings', 'current', 'fixed_deposit'),
      allowNull: false,
      defaultValue: 'savings'
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      allowNull: false,
      defaultValue: 'active'
    },
    opened_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Accounts',
    timestamps: false,
    indexes: [
      {
        fields: ['customer_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Instance method to check if account is active
  Account.prototype.isActive = function() {
    return this.status === 'active';
  };

  // Instance method to check sufficient balance
  Account.prototype.hasSufficientBalance = function(amount) {
    return parseFloat(this.balance) >= parseFloat(amount);
  };

  return Account;
};