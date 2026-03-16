# Migration from MySQL to PostgreSQL

## Summary of Changes

The Core Banking System has been migrated from MySQL to PostgreSQL to provide better compatibility with Vercel and cloud-based deployments. All functionality remains the same.

## What Changed

### 1. Database Configuration (`backend/config/database.js`)
- **Before**: Used MySQL dialect with `mysql2` driver
- **After**: Uses PostgreSQL dialect with `pg` driver
- Environment variables changed from `DB_*` to `POSTGRES_*`
- Removed timezone-specific settings (PostgreSQL handles this differently)

### 2. Dependencies (`backend/package.json`)
- **Removed**: `mysql2` package
- **Added**: `pg` and `pg-hstore` packages
- These provide PostgreSQL support for Sequelize ORM

### 3. Database Schema
- **Original**: `database/schema.sql` (MySQL syntax)
- **New**: `database/schema-postgres.sql` (PostgreSQL syntax)
- Key differences:
  - Table names now quoted: `"Users"` instead of `Users`
  - ENUM types converted to VARCHAR with CHECK constraints
  - AUTO_INCREMENT changed to SERIAL
  - ON CONFLICT syntax for handling duplicates

### 4. Database Initialization Script
- **New**: `scripts/init-db.js`
- Automatically creates all tables and views in PostgreSQL
- Handles connection and error reporting
- Can be run before deployment

### 5. Environment Configuration
- **Updated**: `.env.example` now shows PostgreSQL variables
- **New**: Documentation for Supabase and Neon database services

### 6. Documentation
- **Updated**: `DATABASE_SETUP.md` with PostgreSQL-focused instructions
- **Updated**: `README.md` with new tech stack information
- Clear setup instructions for Supabase (recommended)

## How to Migrate

### If You Have Existing MySQL Data

To migrate from MySQL to PostgreSQL:

1. **Export data from MySQL** (optional - start fresh if testing)
   ```bash
   mysqldump -u root -p core_banking_system > backup.sql
   ```

2. **Set up Supabase/PostgreSQL**
   - Follow instructions in `DATABASE_SETUP.md`
   - Create new empty database

3. **Update .env**
   ```env
   POSTGRES_HOST=your-supabase-host
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-password
   POSTGRES_DATABASE=postgres
   ```

4. **Initialize schema**
   ```bash
   cd backend
   npm install
   node ../scripts/init-db.js
   ```

5. **Manually migrate data** (if you have existing data)
   - Use tools like DBeaver or pgAdmin
   - Or write data migration scripts

### Starting Fresh

Just follow the quick start in `README.md`:

1. Create Supabase project
2. Copy `.env.example` to `.env` and fill in credentials
3. Run `node scripts/init-db.js`
4. Start the server

## Compatibility Notes

All Sequelize models work exactly the same way with PostgreSQL:
- No changes needed to controller code
- No changes needed to API endpoints
- Database queries work identically

The migration is transparent to the application layer.

## Benefits of PostgreSQL

✅ Better Vercel integration  
✅ Supabase makes setup easy  
✅ Scalable for production  
✅ Excellent community support  
✅ Free tier available with Supabase  

## Rollback

If you need to go back to MySQL:
1. Revert `backend/config/database.js` (change dialect and env vars)
2. Reinstall `mysql2`: `npm install mysql2`
3. Remove `pg` and `pg-hstore`
4. Use original `database/schema.sql`
5. Update `.env` with MySQL credentials

## Questions?

See `DATABASE_SETUP.md` for detailed troubleshooting and setup guides.
