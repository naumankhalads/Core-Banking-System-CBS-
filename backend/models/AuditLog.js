module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    table_affected: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    record_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    user_role: {
      type: DataTypes.ENUM('admin', 'customer', 'system'),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    log_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'AuditLogs',
    timestamps: false,
    indexes: [
      {
        fields: ['table_affected']
      },
      {
        fields: ['log_date']
      },
      {
        fields: ['user_email']
      },
      {
        fields: ['operation']
      }
    ]
  });

  return AuditLog;
};