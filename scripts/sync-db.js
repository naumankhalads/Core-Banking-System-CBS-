// This script uses Sequelize to sync the database schema from the models

require('dotenv').config();

// Find the project root
const fs = require('fs');
const path = require('path');
let projectRoot = __dirname;
while (!fs.existsSync(path.join(projectRoot, 'backend')) && projectRoot !== '/') {
  projectRoot = path.dirname(projectRoot);
}

console.log(`[v0] Project root: ${projectRoot}`);
console.log(`[v0] Loading models from: ${path.join(projectRoot, 'backend', 'models')}`);

// Import models from backend
const models = require(path.join(projectRoot, 'backend', 'models', 'index'));
const { sequelize } = models;

async function syncDatabase() {
  try {
    console.log('\n🔗 Connecting to PostgreSQL database...');
    console.log(`   Host: ${process.env.POSTGRES_HOST}`);
    console.log(`   User: ${process.env.POSTGRES_USER}`);
    console.log(`   Database: ${process.env.POSTGRES_DATABASE || 'postgres'}\n`);
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Sync all models
    console.log('📊 Syncing database schema from models...\n');
    await sequelize.sync({ force: false }); // force: false = don't drop existing tables

    console.log('\n✅ Database schema synchronized successfully!');
    console.log('   Tables created:');
    console.log('   - Users');
    console.log('   - Customers');
    console.log('   - Accounts');
    console.log('   - Transactions');
    console.log('   - AuditLogs\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database sync failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

syncDatabase();
