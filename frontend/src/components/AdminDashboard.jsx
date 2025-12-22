import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { customerAPI, accountAPI, transactionAPI } from '../services/api';
import { Users, CreditCard, Activity, FileText, TrendingUp, DollarSign } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color, link }) => (
  <Link to={link} className="block">
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={32} style={{ color }} />
        </div>
      </div>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    accounts: 0,
    transactions: 0,
    totalBalance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [customersRes, accountsRes, transactionsRes] = await Promise.all([
        customerAPI.getAll(),
        accountAPI.getAll(),
        transactionAPI.getHistory({ limit: 1000 })
      ]);

      const totalBalance = accountsRes.data.data.reduce((sum, acc) => 
        sum + parseFloat(acc.balance), 0
      );

      setStats({
        customers: customersRes.data.data.length,
        accounts: accountsRes.data.data.length,
        transactions: transactionsRes.data.data.transactions.length,
        totalBalance: totalBalance.toFixed(2)
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your banking system overview.</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Total Customers"
              value={stats.customers}
              color="#3b82f6"
              link="/admin/customers"
            />
            <StatCard
              icon={CreditCard}
              title="Total Accounts"
              value={stats.accounts}
              color="#10b981"
              link="/admin/accounts"
            />
            <StatCard
              icon={Activity}
              title="Transactions"
              value={stats.transactions}
              color="#f59e0b"
              link="/transactions"
            />
            <StatCard
              icon={DollarSign}
              title="Total Balance"
              value={`₨ ${parseFloat(stats.totalBalance).toLocaleString()}`}
              color="#8b5cf6"
              link="/admin/accounts"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/customers" className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold text-gray-800">Manage Customers</p>
                <p className="text-sm text-gray-600">Add, edit, or remove customers</p>
              </div>
            </Link>
            
            <Link to="/admin/accounts" className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <CreditCard className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-gray-800">Manage Accounts</p>
                <p className="text-sm text-gray-600">Create and manage accounts</p>
              </div>
            </Link>
            
            <Link to="/admin/audit-logs" className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
              <FileText className="text-purple-600" size={24} />
              <div>
                <p className="font-semibold text-gray-800">Audit Logs</p>
                <p className="text-sm text-gray-600">View system activity logs</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;