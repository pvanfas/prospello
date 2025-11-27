import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, FileText, CreditCard, Mail, User, Phone, Package, ShoppingCart, Calendar, Filter, Download, Plus, Eye, Edit, Trash2, X } from 'lucide-react';
import { getShippers, getShipperDetail, deactivateShipper, deleteShipper } from '../../services/adminApi';


const ShipperCard = ({ shipper, index, onView }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 truncate">{shipper.company_name}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
              shipper.is_active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {shipper.is_active ? '● Active' : '● Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 font-medium">GST:</span>
            <span className="text-slate-700 font-mono text-xs">{shipper.gst_number || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 font-medium">PAN:</span>
            <span className="text-slate-700 font-mono text-xs">{shipper.pan_number || 'N/A'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">{shipper.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>@{shipper.username}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>{shipper.phone_number}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Loads</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{shipper.total_loads || 0}</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-700 font-medium">Orders</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">{shipper.total_orders || 0}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(shipper.created_at)}</span>
        </div>
        
        <button
          onClick={() => onView(shipper)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Eye className="w-3 h-3" />
          View Details
        </button>
      </div>
    </motion.div>
  );
};

const DetailModal = ({ shipper, onClose }) => {
  if (!shipper) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{shipper.company_name}</h2>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                shipper.is_active 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-500 text-white'
              }`}>
                {shipper.is_active ? '● Active' : '● Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Tax Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500 mb-1">GST Number</div>
                  <div className="font-mono text-sm text-slate-900">{shipper.gst_number || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">PAN Number</div>
                  <div className="font-mono text-sm text-slate-900">{shipper.pan_number || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Contact Details</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Email</div>
                  <div className="text-sm text-slate-900">{shipper.email}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Phone</div>
                  <div className="text-sm text-slate-900">{shipper.phone_number}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Username</div>
                  <div className="text-sm text-slate-900">@{shipper.username}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Total Loads</span>
                </div>
                <div className="text-3xl font-bold text-blue-900">{shipper.total_loads || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-600">Total Orders</span>
                </div>
                <div className="text-3xl font-bold text-amber-900">{shipper.total_orders || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Registration Date</h3>
            </div>
            <div className="text-sm text-slate-700">{formatDate(shipper.created_at)}</div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => handleDeactivateShipper(shipper.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Deactivate
            </button>
            <button 
              onClick={() => handleDeleteShipper(shipper.id)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ShipperManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalShippers, setTotalShippers] = useState(0);

  // Fetch shippers data
  const fetchShippers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: currentPage * 20,
        limit: 20,
        search: searchQuery || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };
      
      const data = await getShippers(params);
      setShippers(data);
      setTotalShippers(data.length);
    } catch (err) {
      console.error('Error fetching shippers:', err);
      setError('Failed to fetch shippers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, searchQuery]);

  useEffect(() => {
    fetchShippers();
  }, [fetchShippers]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchShippers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchShippers]);

  // Filter shippers based on search query (client-side filtering for immediate response)
  const filteredShippers = shippers.filter(shipper =>
    shipper.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipper.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipper.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipper.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: totalShippers,
    active: shippers.filter(s => s.is_active).length,
    totalLoads: shippers.reduce((sum, s) => sum + (s.total_loads || 0), 0),
    totalOrders: shippers.reduce((sum, s) => sum + (s.total_orders || 0), 0)
  };

  // Handle shipper actions
  const handleViewShipper = async (shipperId) => {
    try {
      const shipperDetail = await getShipperDetail(shipperId);
      setSelectedShipper(shipperDetail);
    } catch (err) {
      console.error('Error fetching shipper detail:', err);
      setError('Failed to fetch shipper details.');
    }
  };

  const handleDeactivateShipper = async (shipperId) => {
    if (window.confirm('Are you sure you want to deactivate this shipper?')) {
      try {
        await deactivateShipper(shipperId);
        setShippers(shippers.filter(shipper => shipper.id !== shipperId));
        setSelectedShipper(null);
        setSuccess('Shipper deactivated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deactivating shipper:', err);
        setError('Failed to deactivate shipper.');
      }
    }
  };

  const handleDeleteShipper = async (shipperId) => {
    if (window.confirm('Are you sure you want to permanently delete this shipper? This action cannot be undone.')) {
      try {
        await deleteShipper(shipperId);
        setShippers(shippers.filter(shipper => shipper.id !== shipperId));
        setSelectedShipper(null);
        setSuccess('Shipper deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting shipper:', err);
        setError('Failed to delete shipper.');
      }
    }
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success State */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2 text-green-700">
              <span className="font-medium">Success</span>
            </div>
            <p className="text-green-600 mt-1">{success}</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2 text-red-700">
              <X size={20} />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchShippers();
              }}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Shipper Management</h1>
              <p className="text-slate-600">Manage and monitor all registered shippers</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md">
                <Plus className="w-4 h-4" />
                Add Shipper
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total Shippers</div>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
              <div className="text-sm text-green-700 mb-1">Active</div>
              <div className="text-2xl font-bold text-green-900">{stats.active}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Total Loads</div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalLoads}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-200">
              <div className="text-sm text-amber-700 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-amber-900">{stats.totalOrders}</div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilter('all')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('active')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusFilter('inactive')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  filterStatus === 'inactive'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
          
          {searchQuery && (
            <div className="mt-3 text-sm text-slate-600">
              Found <span className="font-semibold text-slate-900">{filteredShippers.length}</span> shipper{filteredShippers.length !== 1 ? 's' : ''}
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading shippers...</p>
            </div>
          </motion.div>
        )}

        {/* Shipper Cards Grid */}
        <AnimatePresence mode="wait">
          {!loading && !error && filteredShippers.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredShippers.map((shipper, index) => (
                <ShipperCard 
                  key={shipper.id} 
                  shipper={shipper} 
                  index={index}
                  onView={() => handleViewShipper(shipper.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16 bg-white rounded-2xl shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
                <Building2 className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No shippers found</h3>
              <p className="text-slate-600 mb-4">
                {searchQuery 
                  ? "Try adjusting your search criteria" 
                  : "Get started by adding your first shipper"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedShipper && (
          <DetailModal 
            shipper={selectedShipper} 
            onClose={() => setSelectedShipper(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}