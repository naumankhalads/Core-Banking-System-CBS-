module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    trans_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    from_account: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'account_no'
      }
    },
    to_account: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'account_no'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    transaction_type: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'completed'
    },
    trans_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Transactions',
    timestamps: false,
    indexes: [
      {
        fields: ['from_account']
      },
      {
        fields: ['to_account']
      },
      {
        fields: ['trans_date']
      },
      {
        fields: ['transaction_type']
      }
    ]
  });

  return Transaction;
};