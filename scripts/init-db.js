const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Find the project root by looking for backend directory
let projectRoot = __dirname;
while (!fs.existsSync(path.join(projectRoot, 'backend')) && projectRoot !== '/') {
  projectRoot = path.dirname(projectRoot);
}

console.log(`[v0] Project root: ${projectRoot}`);

// Only load dotenv if environment variables are not already set
if (!process.env.POSTGRES_HOST) {
  const envPath = path.join(projectRoot, 'backend', '.env');
  console.log(`[v0] Attempting to load .env from: ${envPath}`);
  require('dotenv').config({ path: envPath });
}

async function initializeDatabase() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE || 'postgres',
    ssl: process.env.POSTGRES_SSL !== 'false' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('\n🔗 Connecting to PostgreSQL database...');
    console.log(`   Host: ${process.env.POSTGRES_HOST}`);
    console.log(`   User: ${process.env.POSTGRES_USER}`);
    console.log(`   Database: ${process.env.POSTGRES_DATABASE || 'postgres'}\n`);
    
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read and execute schema
    const schemaPath = path.join(projectRoot, 'database', 'schema-postgres.sql');
    console.log(`[v0] Looking for schema at: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found at: ${schemaPath}`);
      process.exit(1);
    }
    
    console.log(`📄 Using schema file: ${schemaPath}\n`);
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
