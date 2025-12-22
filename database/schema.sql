
DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Accounts;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    name VARCHAR(255) NOT NULL,
    cnic VARCHAR(15) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    INDEX idx_cnic (cnic),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE Accounts (
    account_no VARCHAR(20) PRIMARY KEY,
    customer_id INT NOT NULL,
    account_type ENUM('savings', 'current', 'fixed_deposit') NOT NULL DEFAULT 'savings',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
    opened_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    CHECK (balance >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE Transactions (
    trans_id INT PRIMARY KEY AUTO_INCREMENT,
    from_account VARCHAR(20),
    to_account VARCHAR(20),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'completed',
    trans_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account) REFERENCES Accounts(account_no) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (to_account) REFERENCES Accounts(account_no) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    INDEX idx_from_account (from_account),
    INDEX idx_to_account (to_account),
    INDEX idx_trans_date (trans_date),
    INDEX idx_transaction_type (transaction_type),
    CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE AuditLogs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    operation VARCHAR(100) NOT NULL,
    table_affected VARCHAR(50) NOT NULL,
    record_id VARCHAR(50),
    user_email VARCHAR(255),
    user_role ENUM('admin', 'customer', 'system'),
    description TEXT,
    ip_address VARCHAR(45),
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_affected (table_affected),
    INDEX idx_log_date (log_date),
    INDEX idx_user_email (user_email),
    INDEX idx_operation (operation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE OR REPLACE VIEW customer_account_summary AS
SELECT 
    c.customer_id,
    c.name,
    c.cnic,
    c.phone,
    COUNT(a.account_no) as total_accounts,
    SUM(a.balance) as total_balance
FROM Customers c
LEFT JOIN Accounts a ON c.customer_id = a.customer_id AND a.status = 'active'
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
FROM Transactions t
LEFT JOIN Accounts a1 ON t.from_account = a1.account_no
LEFT JOIN Customers c1 ON a1.customer_id = c1.customer_id
LEFT JOIN Accounts a2 ON t.to_account = a2.account_no
LEFT JOIN Customers c2 ON a2.customer_id = c2.customer_id
ORDER BY t.trans_date DESC;


INSERT INTO Users (email, password, role) VALUES 
('admin@corebanking.com', '$2b$10$YourHashedPasswordHere', 'admin');

SELECT 'Database schema created successfully!' as message;