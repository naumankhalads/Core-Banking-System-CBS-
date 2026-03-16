const { Sequelize } = require('sequelize');
require('dotenv').config({ override: false });

// Use Supabase PostgreSQL database
// Environment variables come from Vercel Supabase integration or .env file
const sequelize = new Sequelize({
  database: process.env.POSTGRES_DATABASE || 'postgres',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  dialect: 'postgres',
  ssl: true,
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
});

const testConnection = async () => {
  try {
    console.log('\n🔗 Attempting database connection...');
    console.log(`   Host: ${process.env.POSTGRES_HOST || '(not set)'}`);
    console.log(`   Port: ${process.env.POSTGRES_PORT || 5432}`);
    console.log(`   User: ${process.env.POSTGRES_USER || '(not set)'}`);
    console.log(`   Database: ${process.env.POSTGRES_DATABASE || 'postgres'}`);
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Unable to connect to the database');
    console.error(`Error: ${error.message}\n`);
    console.error('📋 Environment Variables Check:');
    console.error(`   POSTGRES_HOST: ${process.env.POSTGRES_HOST ? '✓ Set' : '✗ Missing'}`);
    console.error(`   POSTGRES_PORT: ${process.env.POSTGRES_PORT ? '✓ Set' : '✗ Using default 5432'}`);
    console.error(`   POSTGRES_USER: ${process.env.POSTGRES_USER ? '✓ Set' : '✗ Missing'}`);
    console.error(`   POSTGRES_PASSWORD: ${process.env.POSTGRES_PASSWORD ? '✓ Set' : '✗ Missing'}`);
    console.error(`   POSTGRES_DATABASE: ${process.env.POSTGRES_DATABASE ? '✓ Set' : '✗ Using default postgres'}`);
    console.error('\n💡 Solutions:');
    console.error('   1. If using Supabase: Check that the integration is connected in project settings');
    console.error('   2. If using local .env file: Create backend/.env with POSTGRES_* variables');
    console.error('   3. Get Supabase credentials from: https://app.supabase.com -> Settings -> Database');
    console.error('\n⏳ Continuing server startup without database connection...\n');
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
