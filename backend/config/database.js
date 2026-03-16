const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use Supabase PostgreSQL database
const sequelize = new Sequelize(
  process.env.POSTGRES_DATABASE || 'postgres',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    ssl: process.env.POSTGRES_SSL !== 'false',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
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
    console.error('\n📋 Database Configuration:');
    console.error('Ensure these environment variables are set:');
    console.error('   POSTGRES_HOST - Database host (from Supabase)');
    console.error('   POSTGRES_PORT - Database port (usually 5432)');
    console.error('   POSTGRES_USER - Database user');
    console.error('   POSTGRES_PASSWORD - Database password');
    console.error('   POSTGRES_DATABASE - Database name');
    console.error('\n💡 Using Supabase? Get credentials from:');
    console.error('   https://app.supabase.com -> Settings -> Database');
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
