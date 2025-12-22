import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { transactionAPI, accountAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Search, Filter, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, deposit, withdraw, transfer
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // deposit, withdraw, transfer
  const [formData, setFormData] = useState({
    account_no: '',
    from_account: '',
    to_account: '',
    amount: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, accountsRes] = await Promise.all([
        transactionAPI.getHistory({ limit: 100 }),
        accountAPI.getAll()
      ]);
      setTransactions(transactionsRes.data.data.transactions);
      setAccounts(accountsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleTransactionClick = (type) => {
    setModalType(type);
    setFormData({
      account_no: '',
      from_account: '',
      to_account: '',
      amount: '',
      description: ''
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let response;
      if (modalType === 'deposit') {
        response = await transactionAPI.deposit({
          account_no: formData.account_no,
          amount: parseFloat(formData.amount),
          description: formData.description
        });
      } else if (modalType === 'withdraw') {
        response = await transactionAPI.withdraw({
          account_no: formData.account_no,
          amount: parseFloat(formData.amount),
          description: formData.description
        });
      } else if (modalType === 'transfer') {
        response = await transactionAPI.transfer({
          from_account: formData.from_account,
          to_account: formData.to_account,
          amount: parseFloat(formData.amount),
          description: formData.description
        });
      }

      setSuccess(response.data.message);
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Transaction failed');
    }
  };

  const filteredTransactions = transactions.filter(trans => {
    const matchesTab = activeTab === 'all' || trans.transaction_type === activeTab;
    const matchesSearch = 
      trans.trans_id.toString().includes(searchTerm) ||
      trans.from_account?.includes(searchTerm) ||
      trans.to_account?.includes(searchTerm) ||
      trans.amount.toString().includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'deposit': return <ArrowDownCircle className="text-green-600" size={24} />;
      case 'withdrawal': return <ArrowUpCircle className="text-red-600" size={24} />;
      case 'transfer': return <ArrowRightLeft className="text-blue-600" size={24} />;
      default: return <DollarSign className="text-gray-600" size={24} />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    const icons = {
      completed: <CheckCircle size={16} />,
      pending: <Clock size={16} />,
      failed: <XCircle size={16} />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <ArrowRightLeft size={40} className="text-blue-600" />
            Transactions
          </h1>
          <p className="text-gray-600 mt-2">View and manage all transactions</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}
        {error && !showModal && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <XCircle size={20} />
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleTransactionClick('deposit')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all group"
          >
            <ArrowDownCircle size={32} className="mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold">Deposit</h3>
            <p className="text-sm text-green-100">Add funds to account</p>
          </button>

          <button
            onClick={() => handleTransactionClick('withdraw')}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all group"
          >
            <ArrowUpCircle size={32} className="mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold">Withdraw</h3>
            <p className="text-sm text-red-100">Withdraw funds</p>
          </button>

          <button
            onClick={() => handleTransactionClick('transfer')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all group"
          >
            <ArrowRightLeft size={32} className="mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold">Transfer</h3>
            <p className="text-sm text-blue-100">Transfer between accounts</p>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'deposit', 'withdrawal', 'transfer'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by transaction ID, account number, or amount..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ArrowRightLeft size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Transactions Found</h3>
            <p className="text-gray-600">Start by making your first transaction</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                    <th className="px-6 py-4 text-left font-semibold">From Account</th>
                    <th className="px-6 py-4 text-left font-semibold">To Account</th>
                    <th className="px-6 py-4 text-left font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((trans) => (
                    <tr key={trans.trans_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">#{trans.trans_id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(trans.transaction_type)}
                          <span className="font-semibold capitalize">{trans.transaction_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">
                        {trans.from_account || '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">
                        {trans.to_account || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-lg text-gray-800">
                          ₨ {parseFloat(trans.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(trans.trans_date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(trans.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className={`p-6 text-white rounded-t-2xl ${
              modalType === 'deposit' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              modalType === 'withdraw' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {modalType === 'deposit' && <ArrowDownCircle size={28} />}
                {modalType === 'withdraw' && <ArrowUpCircle size={28} />}
                {modalType === 'transfer' && <ArrowRightLeft size={28} />}
                {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {modalType !== 'transfer' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Account
                  </label>
                  <select
                    value={formData.account_no}
                    onChange={(e) => setFormData({ ...formData, account_no: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose an account</option>
                    {accounts.map(account => (
                      <option key={account.account_no} value={account.account_no}>
                        {account.account_no} - Balance: ₨{parseFloat(account.balance).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Account
                    </label>
                    <select
                      value={formData.from_account}
                      onChange={(e) => setFormData({ ...formData, from_account: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose source account</option>
                      {accounts.map(account => (
                        <option key={account.account_no} value={account.account_no}>
                          {account.account_no} - Balance: ₨{parseFloat(account.balance).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      To Account
                    </label>
                    <input
                      type="text"
                      value={formData.to_account}
                      onChange={(e) => setFormData({ ...formData, to_account: e.target.value })}
                      placeholder="Enter destination account number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₨)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  placeholder="Add a note..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className={`flex-1 text-white py-3 rounded-lg font-semibold transition-all shadow-lg ${
                    modalType === 'deposit' ? 'bg-green-600 hover:bg-green-700' :
                    modalType === 'withdraw' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirm {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;