require('dotenv').config();
const { User } = require('./models');
const { testConnection } = require('./config/database');

async function resetAdmin() {
  try {
    await testConnection();

    // Delete existing admin
    await User.destroy({ 
      where: { email: 'admin@corebanking.com' } 
    });
    
    console.log('🗑️  Old admin deleted');

    // Create new admin
    const admin = await User.create({
      email: 'admin@corebanking.com',
      password: 'admin123',
      role: 'admin',
      is_active: true
    });

    console.log('New admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: admin@corebanking.com');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin:', error.message);
    process.exit(1);
  }
}

resetAdmin();