# Core Banking System - Database Setup Guide

## Database Configuration: PostgreSQL (Supabase)

The application is now configured to use PostgreSQL via Supabase. This provides a cloud-hosted database that works seamlessly with Vercel deployments.

## IMPORTANT: Clean Up Dependencies First ⚠️

Since the package configuration was recently changed from MySQL to PostgreSQL, you MUST clean up and reinstall dependencies:

**On macOS/Linux:**
```bash
cd backend
rm -rf node_modules
rm -f package-lock.json pnpm-lock.yaml yarn.lock
npm install
cd ..
```

**On Windows:**
```bash
cd backend
rmdir /s /q node_modules (or use File Explorer to delete the folder)
del package-lock.json pnpm-lock.yaml yarn.lock
npm install
cd ..
```

**Or run the automated setup script:**
```bash
# macOS/Linux
bash scripts/setup.sh

# Windows
scripts/setup.bat
```

---

## Option 1: Supabase (Recommended for Vercel) ⭐

### Setup Steps

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub or email
   - Create a new organization

2. **Create New Project**
   - Click "New Project"
   - Choose a name: `core-banking-system`
   - Set a strong password
   - Choose region closest to you
   - Click "Create new project"

3. **Get Database Credentials**
   - Go to **Settings** → **Database** → **Connection Strings**
   - Select "URI" tab
   - Copy the PostgreSQL connection string (it will look like: `postgresql://postgres:password@host.supabase.co:5432/postgres`)

4. **Extract Connection Details**
   From the connection string, extract:
   - **POSTGRES_HOST**: `host.supabase.co` (the domain part)
   - **POSTGRES_PORT**: `5432`
   - **POSTGRES_USER**: `postgres`
   - **POSTGRES_PASSWORD**: Your project password
   - **POSTGRES_DATABASE**: `postgres`

5. **Create .env file in backend folder**
   ```bash
   cp backend/.env.example backend/.env
   ```

6. **Update backend/.env** with your Supabase credentials:
   ```env
   POSTGRES_HOST=xxxxx.supabase.co
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-password-here
   POSTGRES_DATABASE=postgres
   POSTGRES_SSL=true
   
   NODE_ENV=development
   SYNC_DB=false
   ```

7. **Initialize Database Schema**
   ```bash
   cd backend
   npm install
   node ../scripts/init-db.js
   ```

8. **Start the server**
   ```bash
   npm run dev
   ```

You should see:
```
✅ Connected to database
✅ Server running on port 5000
```

---

## Option 2: Neon (PostgreSQL Alternative)

### Setup Steps

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up and create a project

2. **Get Connection Details**
   - Copy the connection string
   - Extract host, user, password, and database

3. **Update .env with Neon credentials**
   ```env
   POSTGRES_HOST=ep-xxxxx.us-east-2.neon.tech
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-password
   POSTGRES_DATABASE=neondb
   POSTGRES_SSL=true
   ```

4. **Initialize and start**
   ```bash
   npm install
   node ../scripts/init-db.js
   npm run dev
   ```

---

## Initializing Database Schema

After configuring your environment variables, you need to create the database tables:

```bash
cd backend
npm install
node ../scripts/init-db.js
```

This script will:
- Connect to your PostgreSQL database
- Create all required tables (Users, Customers, Accounts, Transactions, AuditLogs)
- Create views for reporting
- Insert default admin user

---

## Verifying Connection

Once configured:

```bash
cd backend
npm run dev
```

Look for messages like:
```
✅ Connected to database
✅ Server running on port 5000
```

If you see errors, check:
- Supabase project is active
- Database credentials are correct (copy-paste carefully)
- Network allows connection from your location
- `POSTGRES_SSL=true` is set (required for Supabase)

---

## Troubleshooting

### Error: "connect ECONNREFUSED"
- Database credentials are incorrect
- Supabase project hasn't finished provisioning (wait a few minutes)
- Network/firewall blocking connection

### Error: "Unknown database" 
- Database name is wrong (usually `postgres` for Supabase)
- Check spelling carefully

### SSL Connection Error
- Ensure `POSTGRES_SSL=true` in .env
- Some networks require SSL connections to Supabase

### Need to Recreate Tables?
```bash
# Delete and recreate (careful in production!)
node ../scripts/init-db.js
```

---

## Deploying to Vercel

1. **Add Environment Variables to Vercel**
   - Go to Project Settings → Environment Variables
   - Add all POSTGRES_* variables
   - Redeploy the application

2. **Run Database Initialization** (if needed)
   - Create a deployment-time script or run manually once

3. **Verify Production Connection**
   - Check Vercel logs: `npm run dev` equivalent should show successful connection

---

## Database Models

The system uses these tables:
- **Users**: Authentication and authorization
- **Customers**: Customer information
- **Accounts**: Bank accounts per customer
- **Transactions**: Transfers and account activities
- **AuditLogs**: System audit trail

All tables are created automatically by the init-db.js script.
