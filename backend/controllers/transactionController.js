const { Transaction, Account, Customer, sequelize } = require('../models');
const { createAuditLog, getClientIP } = require('../utils/auditLogger');
const { Op } = require('sequelize');


const deposit = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { account_no, amount, description } = req.body;

    // Validation
    if (!account_no || !amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid account number or amount'
      });
    }

  
    console.log('🔷 TCL: BEGIN TRANSACTION - Deposit Operation');

   
    const account = await Account.findOne({
      where: { account_no },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!account) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (account.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Calculate new balance
    const oldBalance = parseFloat(account.balance);
    const newBalance = oldBalance + parseFloat(amount);

    console.log(`Updating balance: ${oldBalance} + ${amount} = ${newBalance}`);

    // Update account balance
    await account.update({ balance: newBalance }, { transaction });

    // Create transaction record
    const transactionRecord = await Transaction.create({
      to_account: account_no,
      from_account: null,
      amount: amount,
      transaction_type: 'deposit',
      description: description || 'Deposit',
      status: 'completed'
    }, { transaction });

    // COMMIT TRANSACTION
    await transaction.commit();
    console.log('TCL: COMMIT - Transaction completed successfully');

    // Audit log (outside transaction)
    await createAuditLog({
      operation: 'DEPOSIT',
      table_affected: 'Accounts,Transactions',
      record_id: transactionRecord.trans_id,
      user_email: req.user?.email,
      user_role: req.user?.role,
      description: `Deposit of ${amount} to account ${account_no}`,
      ip_address: getClientIP(req)
    });

    res.status(200).json({
      success: true,
      message: 'Deposit completed successfully',
      data: {
        transaction_id: transactionRecord.trans_id,
        account_no: account_no,
        old_balance: oldBalance,
        amount: parseFloat(amount),
        new_balance: newBalance,
        trans_date: transactionRecord.trans_date
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('TCL: ROLLBACK - Error during deposit:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Deposit failed',
      error: error.message
    });
  }
};


const withdraw = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { account_no, amount, description } = req.body;

    // Validation
    if (!account_no || !amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid account number or amount'
      });
    }

    // BEGIN TRANSACTION
    console.log('TCL: BEGIN TRANSACTION - Withdrawal Operation');

    // Find account with lock
    const account = await Account.findOne({
      where: { account_no },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!account) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (account.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Account is not active'
      });
    }

    const currentBalance = parseFloat(account.balance);
    const withdrawAmount = parseFloat(amount);

    console.log(`Current balance: ${currentBalance}, Withdrawal: ${withdrawAmount}`);

    // Check insufficient funds - THIS WILL TRIGGER ROLLBACK
    if (currentBalance < withdrawAmount) {
      await transaction.rollback();
      console.log('TCL: ROLLBACK - Insufficient funds');
      
      // Log failed transaction attempt
      await createAuditLog({
        operation: 'WITHDRAWAL_FAILED',
        table_affected: 'Accounts',
        record_id: account_no,
        user_email: req.user?.email,
        user_role: req.user?.role,
        description: `Failed withdrawal attempt of ${amount} from ${account_no} - Insufficient funds`,
        ip_address: getClientIP(req)
      });

      return res.status(400).json({
        success: false,
        message: 'Insufficient funds',
        data: {
          current_balance: currentBalance,
          requested_amount: withdrawAmount,
          deficit: withdrawAmount - currentBalance
        }
      });
    }

    // Calculate new balance
    const newBalance = currentBalance - withdrawAmount;

    console.log(`Updating balance: ${currentBalance} - ${withdrawAmount} = ${newBalance}`);

    // Update account balance
    await account.update({ balance: newBalance }, { transaction });

    // Create transaction record
    const transactionRecord = await Transaction.create({
      from_account: account_no,
      to_account: null,
      amount: withdrawAmount,
      transaction_type: 'withdrawal',
      description: description || 'Withdrawal',
      status: 'completed'
    }, { transaction });

    // COMMIT TRANSACTION
    await transaction.commit();
    console.log('TCL: COMMIT - Withdrawal completed successfully');

    // Audit log
    await createAuditLog({
      operation: 'WITHDRAWAL',
      table_affected: 'Accounts,Transactions',
      record_id: transactionRecord.trans_id,
      user_email: req.user?.email,
      user_role: req.user?.role,
      description: `Withdrawal of ${amount} from account ${account_no}`,
      ip_address: getClientIP(req)
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal completed successfully',
      data: {
        transaction_id: transactionRecord.trans_id,
        account_no: account_no,
        old_balance: currentBalance,
        amount: withdrawAmount,
        new_balance: newBalance,
        trans_date: transactionRecord.trans_date
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('TCL: ROLLBACK - Error during withdrawal:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Withdrawal failed',
      error: error.message
    });
  }
};


const transfer = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { from_account, to_account, amount, description } = req.body;

    // Validation
    if (!from_account || !to_account || !amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid account numbers or amount'
      });
    }

    if (from_account === to_account) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same account'
      });
    }

    // BEGIN TRANSACTION
    console.log('TCL: BEGIN TRANSACTION - Transfer Operation');
    console.log(`From: ${from_account} →  To: ${to_account}, Amount: ${amount}`);

    // Find both accounts with lock (CRITICAL: lock both to prevent race conditions)
    const [senderAccount, receiverAccount] = await Promise.all([
      Account.findOne({
        where: { account_no: from_account },
        lock: transaction.LOCK.UPDATE,
        transaction
      }),
      Account.findOne({
        where: { account_no: to_account },
        lock: transaction.LOCK.UPDATE,
        transaction
      })
    ]);

    // Validate sender account
    if (!senderAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sender account not found'
      });
    }

    if (senderAccount.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Sender account is not active'
      });
    }

    // Validate receiver account
    if (!receiverAccount) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Receiver account not found'
      });
    }

    if (receiverAccount.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Receiver account is not active'
      });
    }

    const senderBalance = parseFloat(senderAccount.balance);
    const transferAmount = parseFloat(amount);

    // Check sufficient funds
    if (senderBalance < transferAmount) {
      await transaction.rollback();
      console.log('TCL: ROLLBACK - Insufficient funds for transfer');
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds',
        data: {
          current_balance: senderBalance,
          requested_amount: transferAmount
        }
      });
    }

    const senderNewBalance = senderBalance - transferAmount;
    const receiverOldBalance = parseFloat(receiverAccount.balance);
    const receiverNewBalance = receiverOldBalance + transferAmount;

    console.log(`Debiting sender: ${senderBalance} - ${transferAmount} = ${senderNewBalance}`);
    console.log(`Crediting receiver: ${receiverOldBalance} + ${transferAmount} = ${receiverNewBalance}`);

    
    await senderAccount.update({ balance: senderNewBalance }, { transaction });

    
    await receiverAccount.update({ balance: receiverNewBalance }, { transaction });

    
    const transactionRecord = await Transaction.create({
      from_account: from_account,
      to_account: to_account,
      amount: transferAmount,
      transaction_type: 'transfer',
      description: description || 'Transfer',
      status: 'completed'
    }, { transaction });

    // COMMIT TRANSACTION - All three operations succeed together
    await transaction.commit();
    console.log('TCL: COMMIT - Transfer completed successfully (ATOMIC)');

    // Audit log
    await createAuditLog({
      operation: 'TRANSFER',
      table_affected: 'Accounts,Transactions',
      record_id: transactionRecord.trans_id,
      user_email: req.user?.email,
      user_role: req.user?.role,
      description: `Transfer of ${amount} from ${from_account} to ${to_account}`,
      ip_address: getClientIP(req)
    });

    res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transaction_id: transactionRecord.trans_id,
        from_account: from_account,
        to_account: to_account,
        amount: transferAmount,
        sender_old_balance: senderBalance,
        sender_new_balance: senderNewBalance,
        receiver_old_balance: receiverOldBalance,
        receiver_new_balance: receiverNewBalance,
        trans_date: transactionRecord.trans_date
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('TCL: ROLLBACK - Error during transfer:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Transfer failed',
      error: error.message
    });
  }
};


const demonstrateSavepoint = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('TCL: BEGIN TRANSACTION - Savepoint Demonstration');

    // First operation - create a test transaction
    const firstTransaction = await Transaction.create({
      from_account: null,
      to_account: 'TEST001',
      amount: 1000,
      transaction_type: 'deposit',
      description: 'First operation before savepoint',
      status: 'completed'
    }, { transaction });

    console.log('First transaction created:', firstTransaction.trans_id);

    // CREATE SAVEPOINT
    await transaction.connection.query('SAVEPOINT before_second_operation');
    console.log('SAVEPOINT created: before_second_operation');

    // Second operation - another transaction
    const secondTransaction = await Transaction.create({
      from_account: null,
      to_account: 'TEST002',
      amount: 2000,
      transaction_type: 'deposit',
      description: 'Second operation after savepoint',
      status: 'completed'
    }, { transaction });

    console.log('Second transaction created:', secondTransaction.trans_id);

    // Simulate an error or decision to undo second operation
    // ROLLBACK TO SAVEPOINT (keeps first, undoes second)
    await transaction.connection.query('ROLLBACK TO SAVEPOINT before_second_operation');
    console.log('ROLLBACK TO SAVEPOINT: Second operation undone');

    // Third operation - after rollback to savepoint
    const thirdTransaction = await Transaction.create({
      from_account: null,
      to_account: 'TEST003',
      amount: 3000,
      transaction_type: 'deposit',
      description: 'Third operation after rollback to savepoint',
      status: 'completed'
    }, { transaction });

    console.log('Third transaction created:', thirdTransaction.trans_id);

    // COMMIT entire transaction
    await transaction.commit();
    console.log('TCL: COMMIT - First and third operations persisted, second was rolled back');

    res.status(200).json({
      success: true,
      message: 'Savepoint demonstration completed',
      explanation: 'First and third transactions were committed. Second was rolled back to savepoint.',
      data: {
        first_transaction: firstTransaction.trans_id,
        second_transaction_rolled_back: secondTransaction.trans_id,
        third_transaction: thirdTransaction.trans_id
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('TCL: ROLLBACK - Error during savepoint demo:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Savepoint demonstration failed',
      error: error.message
    });
  }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const { account_no, type, limit = 50, offset = 0 } = req.query;
    
    let whereClause = {};
    
    // If customer, only show their transactions
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({
        where: { user_id: req.user.user_id },
        include: [{ model: Account, as: 'accounts' }]
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found'
        });
      }

      const accountNumbers = customer.accounts.map(acc => acc.account_no);
      
      whereClause = {
        [Op.or]: [
          { from_account: { [Op.in]: accountNumbers } },
          { to_account: { [Op.in]: accountNumbers } }
        ]
      };
    }

    // Filter by specific account if provided
    if (account_no) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { from_account: account_no },
          { to_account: account_no }
        ]
      };
    }

    // Filter by type if provided
    if (type) {
      whereClause.transaction_type = type;
    }

    const transactions = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Account,
          as: 'fromAccount',
          include: [{ model: Customer, as: 'customer', attributes: ['name', 'cnic'] }]
        },
        {
          model: Account,
          as: 'toAccount',
          include: [{ model: Customer, as: 'customer', attributes: ['name', 'cnic'] }]
        }
      ],
      order: [['trans_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        total: transactions.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction history',
      error: error.message
    });
  }
};

module.exports = {
  deposit,
  withdraw,
  transfer,
  demonstrateSavepoint,
  getTransactionHistory
};