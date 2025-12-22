import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { auditAPI } from '../services/api';
import { FileText, Search, Filter, Calendar, User, Database, Activity, Shield } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterOperation, setFilterOperation] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 50;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filterTable, filterOperation]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        limit: logsPerPage,
        offset: (currentPage - 1) * logsPerPage
      };
      
      if (filterTable) params.table = filterTable;
      if (filterOperation) params.operation = filterOperation;

      const response = await auditAPI.getAll(params);
      setLogs(response.data.data.logs);
      setTotalLogs(response.data.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_affected.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || log.user_role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  const getOperationBadge = (operation) => {
    const colors = {
      'LOGIN': 'bg-blue-100 text-blue-800',
      'REGISTER_CUSTOMER': 'bg-green-100 text-green-800',
      'CREATE_ACCOUNT': 'bg-green-100 text-green-800',
      'UPDATE_CUSTOMER': 'bg-yellow-100 text-yellow-800',
      'UPDATE_ACCOUNT': 'bg-yellow-100 text-yellow-800',
      'DELETE_CUSTOMER': 'bg-red-100 text-red-800',
      'DEACTIVATE_ACCOUNT': 'bg-red-100 text-red-800',
      'DEPOSIT': 'bg-emerald-100 text-emerald-800',
      'WITHDRAWAL': 'bg-orange-100 text-orange-800',
      'TRANSFER': 'bg-purple-100 text-purple-800',
      'WITHDRAWAL_FAILED': 'bg-red-100 text-red-800'
    };
    return colors[operation] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role) => {
    const colors = {
      'admin': 'bg-purple-100 text-purple-800 border-purple-300',
      'customer': 'bg-blue-100 text-blue-800 border-blue-300',
      'system': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const uniqueTables = [...new Set(logs.map(log => log.table_affected))];
  const uniqueOperations = [...new Set(logs.map(log => log.operation))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <Shield size={40} className="text-blue-600" />
            Audit Logs
          </h1>
          <p className="text-gray-600 mt-2">Complete system activity tracking and monitoring</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Logs</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalLogs}</p>
              </div>
              <FileText size={40} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Tables Tracked</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{uniqueTables.length}</p>
              </div>
              <Database size={40} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Operations</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{uniqueOperations.length}</p>
              </div>
              <Activity size={40} className="text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Current Page</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{currentPage}/{totalPages}</p>
              </div>
              <Calendar size={40} className="text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Table</label>
              <select
                value={filterTable}
                onChange={(e) => setFilterTable(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tables</option>
                {uniqueTables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Operation</label>
              <select
                value={filterOperation}
                onChange={(e) => setFilterOperation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Operations</option>
                {uniqueOperations.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterTable('');
              setFilterOperation('');
              setFilterRole('');
              setCurrentPage(1);
            }}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Clear Filters
          </button>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Logs Found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-4 text-left font-semibold">Log ID</th>
                      <th className="px-4 py-4 text-left font-semibold">Operation</th>
                      <th className="px-4 py-4 text-left font-semibold">Table</th>
                      <th className="px-4 py-4 text-left font-semibold">User</th>
                      <th className="px-4 py-4 text-left font-semibold">Role</th>
                      <th className="px-4 py-4 text-left font-semibold">Description</th>
                      <th className="px-4 py-4 text-left font-semibold">IP Address</th>
                      <th className="px-4 py-4 text-left font-semibold">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 font-mono text-sm text-gray-600">#{log.log_id}</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOperationBadge(log.operation)}`}>
                            {log.operation}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-700">{log.table_affected}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{log.user_email || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getRoleBadge(log.user_role)}`}>
                            {log.user_role || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-md">
                          <p className="text-sm text-gray-600 truncate" title={log.description}>
                            {log.description || '—'}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-gray-500">
                          {log.ip_address || '—'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(log.log_date).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
              <div className="text-gray-600">
                Showing {(currentPage - 1) * logsPerPage + 1} to {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs} logs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;