import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { accountAPI, customerAPI } from '../services/api';
import { CreditCard, Plus, Edit2, Trash2, Search, DollarSign, TrendingUp, Users, X, CheckCircle, XCircle, Lock, Unlock, Eye } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    account_type: 'savings',
    initial_balance: 0,
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, customersRes] = await Promise.all([
        accountAPI.getAll(),
        customerAPI.getAll()
      ]);
      setAccounts(accountsRes.data.data);
      setCustomers(customersRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setModalMode('add');
    setFormData({
      customer_id: '',
      account_type: 'savings',
      initial_balance: 0,
      status: 'active'
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleEditClick = (account) => {
    setModalMode('edit');
    setSelectedAccount(account);
    setFormData({
      account_type: account.account_type,
      status: account.status
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = async (accountNo) => {
    if (window.confirm('Are you sure you want to deactivate this account? This action will set the account status to inactive.')) {
      try {
        await accountAPI.delete(accountNo);
        setSuccess('Account deactivated successfully');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to deactivate account');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'add') {
        await accountAPI.create(formData);
        setSuccess('Account created successfully');
      } else {
        await accountAPI.update(selectedAccount.account_no, formData);
        setSuccess('Account updated successfully');
      }
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.account_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.customer?.cnic.includes(searchTerm);
    
    const matchesStatus = !filterStatus || account.status === filterStatus;
    const matchesType = !filterType || account.account_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
  const totalAccounts = accounts.length;

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-300',
      inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      blocked: 'bg-red-100 text-red-800 border-red-300'
    };
    const icons = {
      active: <CheckCircle size={16} />,
      inactive: <Lock size={16} />,
      blocked: <XCircle size={16} />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      savings: 'bg-blue-100 text-blue-800',
      current: 'bg-purple-100 text-purple-800',
      fixed_deposit: 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <CreditCard size={40} className="text-blue-600" />
                Account Management
              </h1>
              <p className="text-gray-600 mt-2">Manage customer bank accounts and balances</p>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Create Account
            </button>
          </div>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Accounts</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalAccounts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard size={32} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Accounts</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{activeAccounts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Balance</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">₨ {totalBalance.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign size={32} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="inline mr-2" size={18} />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by account, customer, CNIC..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="fixed_deposit">Fixed Deposit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading accounts...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Accounts Found</h3>
            <p className="text-gray-600">Start by creating your first account</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <div key={account.account_no} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                {/* Card Header */}
                <div className={`p-6 text-white ${
                  account.account_type === 'savings' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  account.account_type === 'current' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm opacity-90">Account Number</p>
                      <p className="text-xl font-bold font-mono">{account.account_no}</p>
                    </div>
                    <CreditCard size={32} className="opacity-80" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Account Type</p>
                    <p className="text-lg font-semibold capitalize">
                      {account.account_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Customer Info */}
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-gray-500 mb-1">Account Holder</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <Users size={18} className="text-blue-500" />
                      {account.customer?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 font-mono mt-1">
                      CNIC: {account.customer?.cnic || 'N/A'}
                    </p>
                  </div>

                  {/* Balance */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                    <p className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                      <TrendingUp size={24} className="text-green-500" />
                      ₨ {parseFloat(account.balance).toLocaleString()}
                    </p>
                  </div>

                  {/* Status and Date */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {getStatusBadge(account.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Opened</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(account.opened_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleViewDetails(account)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition font-semibold"
                      title="View Details"
                    >
                      <Eye size={18} />
                      View
                    </button>
                    <button
                      onClick={() => handleEditClick(account)}
                      className="flex-1 flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 py-2 rounded-lg hover:bg-yellow-200 transition font-semibold"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(account.account_no)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition font-semibold"
                      title="Deactivate"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CreditCard size={28} />
                {modalMode === 'add' ? 'Create New Account' : 'Edit Account'}
              </h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-lg transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {modalMode === 'add' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Customer
                    </label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose a customer</option>
                      {customers.map(customer => (
                        <option key={customer.customer_id} value={customer.customer_id}>
                          {customer.name} - {customer.cnic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Initial Balance (₨)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.initial_balance}
                      onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                </select>
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  {modalMode === 'add' ? 'Create Account' : 'Update Account'}
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

      {/* Details Modal */}
      {showDetailsModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">Account Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="hover:bg-white/20 p-2 rounded-lg transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="text-lg font-bold text-gray-800 font-mono">{selectedAccount.account_no}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getAccountTypeColor(selectedAccount.account_type)}`}>
                    {selectedAccount.account_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="text-2xl font-bold text-green-600">₨ {parseFloat(selectedAccount.balance).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedAccount.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Holder</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedAccount.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CNIC</p>
                  <p className="text-lg font-mono text-gray-800">{selectedAccount.customer?.cnic}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-lg text-gray-800">{selectedAccount.customer?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg text-gray-800">{selectedAccount.customer?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Opened Date</p>
                  <p className="text-lg text-gray-800">{new Date(selectedAccount.opened_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-lg text-gray-800">{new Date(selectedAccount.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;