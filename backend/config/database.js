const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'core_banking_system',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      timezone: '+05:00'
    },
    timezone: '+05:00',
    define: {
      timestamps: false,
      underscored: false,
      freezeTableName: true
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('⚠️  Unable to connect to the database:', error.message);
    console.error('\n📋 Setup Instructions:');
    console.error('1. Install MySQL: https://dev.mysql.com/downloads/mysql/');
    console.error('2. Create a database: CREATE DATABASE core_banking_system;');
    console.error('3. Set environment variables in .env file:');
    console.error('   DB_HOST=localhost');
    console.error('   DB_PORT=3306');
    console.error('   DB_USER=root');
    console.error('   DB_PASSWORD=your_password');
    console.error('   DB_NAME=core_banking_system');
    console.error('\n🚀 Or use a cloud database service:');
    console.error('   - Neon (PostgreSQL): https://neon.tech');
    console.error('   - PlanetScale (MySQL): https://planetscale.com');
    console.error('   - AWS RDS: https://aws.amazon.com/rds');
    console.error('\n⏳ Starting server without database connection...\n');
    return false;
  }
};


const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log(`Database synchronized ${force ? '(forced)' : ''}`);
  } catch (error) {
    console.error('Error synchronizing database:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
