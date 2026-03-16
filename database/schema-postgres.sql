-- Core Banking System Schema for PostgreSQL (Supabase)

DROP TABLE IF EXISTS "AuditLogs" CASCADE;
DROP TABLE IF EXISTS "Transactions" CASCADE;
DROP TABLE IF EXISTS "Accounts" CASCADE;
DROP TABLE IF EXISTS "Customers" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- Users table
CREATE TABLE "Users" (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON "Users"(email);
CREATE INDEX idx_users_role ON "Users"(role);

-- Customers table
CREATE TABLE "Customers" (
    customer_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    name VARCHAR(255) NOT NULL,
    cnic VARCHAR(15) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "Users"(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_customers_cnic ON "Customers"(cnic);
CREATE INDEX idx_customers_user_id ON "Customers"(user_id);

-- Accounts table
CREATE TABLE "Accounts" (
    account_no VARCHAR(20) PRIMARY KEY,
    customer_id INT NOT NULL,
    account_type VARCHAR(20) NOT NULL DEFAULT 'savings' CHECK (account_type IN ('savings', 'current', 'fixed_deposit')),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    opened_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES "Customers"(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (balance >= 0)
);

CREATE INDEX idx_accounts_customer_id ON "Accounts"(customer_id);
CREATE INDEX idx_accounts_status ON "Accounts"(status);

-- Transactions table
CREATE TABLE "Transactions" (
    trans_id SERIAL PRIMARY KEY,
    from_account VARCHAR(20),
    to_account VARCHAR(20),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    trans_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account) REFERENCES "Accounts"(account_no) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (to_account) REFERENCES "Accounts"(account_no) ON DELETE SET NULL ON UPDATE CASCADE,
    CHECK (amount > 0)
);

CREATE INDEX idx_transactions_from_account ON "Transactions"(from_account);
CREATE INDEX idx_transactions_to_account ON "Transactions"(to_account);
CREATE INDEX idx_transactions_trans_date ON "Transactions"(trans_date);
CREATE INDEX idx_transactions_type ON "Transactions"(transaction_type);

-- AuditLogs table
CREATE TABLE "AuditLogs" (
    log_id SERIAL PRIMARY KEY,
    operation VARCHAR(100) NOT NULL,
    table_affected VARCHAR(50) NOT NULL,
    record_id VARCHAR(50),
    user_email VARCHAR(255),
    user_role VARCHAR(20) CHECK (user_role IN ('admin', 'customer', 'system')),
    description TEXT,
    ip_address VARCHAR(45),
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditlogs_table_affected ON "AuditLogs"(table_affected);
CREATE INDEX idx_auditlogs_log_date ON "AuditLogs"(log_date);
CREATE INDEX idx_auditlogs_user_email ON "AuditLogs"(user_email);
CREATE INDEX idx_auditlogs_operation ON "AuditLogs"(operation);

-- Views
CREATE OR REPLACE VIEW customer_account_summary AS
SELECT 
    c.customer_id,
    c.name,
    c.cnic,
    c.phone,
    COUNT(a.account_no) as total_accounts,
    SUM(a.balance) as total_balance
FROM "Customers" c
LEFT JOIN "Accounts" a ON c.customer_id = a.customer_id AND a.status = 'active'
GROUP BY c.customer_id, c.name, c.cnic, c.phone;

CREATE OR REPLACE VIEW transaction_history_view AS
SELECT 
    t.trans_id,
    t.transaction_type,
    t.amount,
    t.status,
    t.description,
    t.trans_date,
    t.from_account,
    t.to_account,
    c1.name as from_customer_name,
    c2.name as to_customer_name
FROM "Transactions" t
LEFT JOIN "Accounts" a1 ON t.from_account = a1.account_no
LEFT JOIN "Customers" c1 ON a1.customer_id = c1.customer_id
LEFT JOIN "Accounts" a2 ON t.to_account = a2.account_no
LEFT JOIN "Customers" c2 ON a2.customer_id = c2.customer_id
ORDER BY t.trans_date DESC;

-- Insert default admin user (password needs to be hashed)
INSERT INTO "Users" (email, password, role) VALUES 
('admin@corebanking.com', '$2b$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (email) DO NOTHING;

SELECT 'PostgreSQL database schema created successfully!' as message;
