const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function initializeDatabase() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    ssl: process.env.POSTGRES_SSL !== 'false' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('\nExecuting database schema...');
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✓ Executed:', statement.substring(0, 60) + '...');
      } catch (err) {
        if (err.code !== '42P07' && err.code !== '42701') { // Ignore "already exists" errors
          console.error('Error executing statement:', statement.substring(0, 60), err.message);
        }
      }
    }

    console.log('\n✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeDatabase();
