# Core Banking System (CBS)

A modern, scalable core banking system built with Node.js, React, and PostgreSQL.

## Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL database (Supabase recommended)

### Setup

1. **Clone repository**
   ```bash
   git clone <repo>
   cd Core-Banking-System-CBS-
   ```

2. **Clean up old dependencies** (IMPORTANT - removes MySQL packages)
   ```bash
   # macOS/Linux
   bash scripts/setup.sh
   
   # Windows
   scripts/setup.bat
   ```
   Or manually:
   ```bash
   cd backend
   rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock
   npm install
   ```

3. **Configure database** (see [DATABASE_SETUP.md](./DATABASE_SETUP.md))
   ```bash
   cp backend/.env.example backend/.env
   # Edit with your database credentials
   ```

4. **Initialize database schema**
   ```bash
   cd backend
   node ../scripts/init-db.js
   ```

5. **Start backend**
   ```bash
   cd backend
   npm run dev
   # Runs on http://localhost:5000
   ```

6. **Start frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

## Database

Now using **PostgreSQL** (previously MySQL). See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for:
- Supabase setup (recommended)
- Neon setup
- Local PostgreSQL setup
- Troubleshooting connection issues

## Technology Stack

**Backend**
- Express.js - REST API
- Sequelize ORM - Database abstraction
- PostgreSQL - Primary database
- JWT - Authentication
- bcryptjs - Password hashing

**Frontend**
- React - UI library
- Vite - Build tool
- Tailwind CSS - Styling
- Context API - State management

## Features

- User authentication (Admin & Customer roles)
- Customer management
- Account management
- Transaction processing
- Audit logging
- Role-based access control

## Project Structure

```
├── backend/
│   ├── config/          # Database & app config
│   ├── controllers/     # Request handlers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Express app
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   └── services/    # API client
│   └── index.html
└── database/
    ├── schema.sql           # Original MySQL schema
    └── schema-postgres.sql  # PostgreSQL schema
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer
- `PUT /api/customers/:id` - Update customer

### Accounts
- `GET /api/accounts` - List accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts/:id` - Get account

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - List transactions

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables (POSTGRES_*)
4. Deploy

For detailed instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## Support

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database troubleshooting and setup guides.
