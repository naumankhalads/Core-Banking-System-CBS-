# Core Banking System - Database Setup Guide

## Error: "connect ECONNREFUSED 127.0.0.1:3306"

This error means the application cannot connect to a MySQL database. Here are the solutions:

## Option 1: Local MySQL Setup (Development)

### Prerequisites
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) (optional but recommended)

### Setup Steps

1. **Install MySQL**
   ```bash
   # macOS (using Homebrew)
   brew install mysql
   brew services start mysql
   
   # Or download from: https://dev.mysql.com/downloads/mysql/
   ```

2. **Create Database**
   ```bash
   mysql -u root -p
   # Enter password (if set) or press Enter
   
   CREATE DATABASE core_banking_system;
   ```

3. **Create .env file in backend folder**
   ```bash
   cp backend/.env.example backend/.env
   ```

4. **Edit backend/.env**
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password  # Leave empty if no password set
   DB_NAME=core_banking_system
   NODE_ENV=development
   SYNC_DB=true
   ```

5. **Start the server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

---

## Option 2: PlanetScale (MySQL - Recommended for Production)

### Setup Steps

1. **Create PlanetScale Account**
   - Go to [planetscale.com](https://planetscale.com)
   - Sign up and create a new organization

2. **Create Database**
   - Click "Create a database"
   - Name it `core_banking_system`
   - Choose your region

3. **Get Connection String**
   - Go to "Connect" tab
   - Select "Node.js" from the dropdown
   - Copy the connection string

4. **Update .env**
   ```
   DATABASE_URL=mysql://[username]:[password]@[host]/[database]
   NODE_ENV=production
   ```

5. **Connect the database**
   - Use the provided connection string
   - The Sequelize ORM will work with PlanetScale out of the box

---

## Option 3: Neon (PostgreSQL)

If you want to use PostgreSQL instead, you'll need to:

1. Update database configuration to use PostgreSQL dialect
2. Modify the database.js file

### Steps
```bash
# Install PostgreSQL driver
npm install pg pg-hstore

# Update backend/config/database.js
# Change dialect from 'mysql' to 'postgres'
# Update connection parameters
```

---

## Option 4: AWS RDS

1. Create RDS MySQL instance on AWS
2. Configure security groups to allow connections
3. Get the endpoint and credentials
4. Update .env with RDS connection details

---

## Verifying Connection

Once configured, run:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Server running on port 5000
```

If you still get the error, check:
- MySQL service is running: `mysql -u root -p -e "SELECT 1"`
- Database exists: `mysql -u root -p -e "SHOW DATABASES LIKE 'core_banking_system'"`
- .env file is in the correct location (backend/.env)
- .env has correct values with no extra spaces

---

## Troubleshooting

### MySQL Server Not Running
```bash
# macOS
brew services restart mysql

# Linux
sudo systemctl restart mysql

# Windows
# Use MySQL Services in Admin Tools
```

### Connection Timeout
- Increase timeout in database.js (acquire: 60000)
- Check firewall settings
- Verify host and port are correct

### Authentication Failed
- Verify username and password
- Check if user has proper permissions: `GRANT ALL ON core_banking_system.* TO 'root'@'localhost';`

### Cannot Find Database
```bash
# Create it manually
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS core_banking_system;"
```

---

## Quick Start with Docker

If you have Docker installed:

```bash
# Run MySQL in Docker
docker run --name mysql-cbs -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=core_banking_system -p 3306:3306 -d mysql:latest

# Update .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=core_banking_system

# Start the server
npm run dev
```

---

For production deployment to Vercel, use PlanetScale or another managed database service.
