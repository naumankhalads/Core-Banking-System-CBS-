import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { accountAPI, transactionAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, TrendingUp, TrendingDown, ArrowRightLeft, Eye, Plus, Minus } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        accountAPI.getAll(),
        transactionAPI.getHistory({ limit: 10 })
      ]);

      setAccounts(accountsRes.data.data);
      setTransactions(transactionsRes.data.data.transactions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

  const AccountCard = ({ account }) => (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-blue-100 text-sm">Account Number</p>
          <p className="text-lg font-mono font-semibold">{account.account_no}</p>
        </div>
        <CreditCard size={32} className="text-blue-200" />
      </div>
      <div className="mb-4">
        <p className="text-blue-100 text-sm">Account Type</p>
        <p className="text-xl font-semibold capitalize">{account.account_type}</p>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-blue-100 text-sm">Balance</p>
          <p className="text-3xl font-bold">₨ {parseFloat(account.balance).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedAccount(account);
              setShowDepositModal(true);
            }}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            title="Deposit"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => {
              setSelectedAccount(account);
              setShowWithdrawModal(true);
            }}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            title="Withdraw"
          >
            <Minus size={20} />
          </button>
          <button
            onClick={() => {
              setSelectedAccount(account);
              setShowTransferModal(true);
            }}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            title="Transfer"
          >
            <ArrowRightLeft size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your accounts and transactions</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Total Accounts</p>
                  <p className="text-3xl font-bold text-blue-600">{accounts.length}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Balance</p>
                  <p className="text-3xl font-bold text-green-600">₨ {totalBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Recent Transactions</p>
                  <p className="text-3xl font-bold text-purple-600">{transactions.length}</p>
                </div>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">My Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(account => (
                  <AccountCard key={account.account_no} account={account} />
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
                <Link to="/transactions" className="text-blue-600 hover:text-blue-700 font-semibold">
                  View All →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map(trans => (
                      <tr key={trans.trans_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="capitalize font-medium">{trans.transaction_type}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold">₨ {parseFloat(trans.amount).toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(trans.trans_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            trans.status === 'completed' ? 'bg-green-100 text-green-800' :
                            trans.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {trans.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
