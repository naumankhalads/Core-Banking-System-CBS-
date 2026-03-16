# Supabase Integration Setup Guide

## Overview

The Core Banking System now works seamlessly with Supabase (a PostgreSQL database service). The application uses the Vercel Supabase integration, which automatically provides database credentials as environment variables.

## How It Works

When Supabase is connected as a Vercel integration:
- Environment variables like `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc. are automatically available
- The backend can connect without manual configuration in most cases
- No `.env` file is needed when deployed to Vercel

## Local Development Setup

### Prerequisites
1. Supabase project created (free at https://supabase.com)
2. Database credentials from your Supabase project

### Step 1: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** → **Database**
4. Copy the connection string (URI format)
5. Extract these values:
   - **Host**: The domain (e.g., `xyz.supabase.co`)
   - **Port**: Usually `5432`
   - **User**: Usually `postgres`
   - **Password**: The password you set
   - **Database**: Usually `postgres`

### Step 2: Create Local Environment File

```bash
cd backend
cp .env.local.example .env.local
```

### Step 3: Edit `.env.local`

Replace the placeholder values with your Supabase credentials:

```env
POSTGRES_HOST=your-project.supabase.co
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=postgres
POSTGRES_SSL=true
```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

### Step 5: Test Connection

```bash
# From backend directory
npm run dev
```

You should see:
```
🔗 Attempting database connection...
   Host: your-project.supabase.co
   Port: 5432
   User: postgres
   Database: postgres
✅ Database connection established successfully!

✅ Server running on port 5000
```

### Step 6: Initialize Database Tables (First Time Only)

```bash
# Set environment variable to sync database
export SYNC_DB=true

# Restart the server - this will create all tables
npm run dev
```

You should see:
```
Database synchronized
```

Then stop the server (`Ctrl+C`).

### Step 7: Continue Development

```bash
# Remove the SYNC_DB setting and start normally
npm run dev
```

## Troubleshooting

### Connection Refused Error
- **Problem**: `Error: connect ECONNREFUSED`
- **Solution**: 
  - Verify `POSTGRES_HOST` is correct (should be `something.supabase.co`)
  - Check firewall/network allows outbound connections
  - Verify Supabase project is active

### Authentication Failed
- **Problem**: `Error: FATAL: password authentication failed`
- **Solution**:
  - Verify `POSTGRES_PASSWORD` is correct
  - Double-check username is `postgres`
  - Check for trailing spaces in `.env.local`

### Table Not Found Error
- **Problem**: When running the app: `relation "Users" does not exist`
- **Solution**:
  - Run with `SYNC_DB=true` to create tables
  - Check server logs for "Database synchronized"

### Environment Variables Not Loaded
- **Problem**: Server shows "Environment Variables Check: POSTGRES_HOST ✗ Missing"
- **Solution**:
  - Ensure `.env.local` file exists in the `backend/` directory
  - Check file path is correct: `/vercel/share/v0-project/backend/.env.local`
  - Verify file is not named `.env` or other variations

## Vercel Deployment

When deploying to Vercel:

1. Connect your Supabase project through the Vercel dashboard
2. The integration automatically sets all environment variables
3. No need to create `.env` file for production
4. Database operations will work immediately after deployment

## Environment Variables Reference

| Variable | Example | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | `xyz.supabase.co` | Supabase database host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `your-password` | Database password |
| `POSTGRES_DATABASE` | `postgres` | Database name |
| `POSTGRES_SSL` | `true` | Enable SSL (required for Supabase) |
| `NODE_ENV` | `development` | Environment |
| `SYNC_DB` | `true` | Create tables on startup (first time only) |

## Getting Help

For Supabase-specific issues: https://supabase.com/docs
For application issues: Check `backend/config/database.js` for connection logic
