import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getBrokers, getBrokerDetail, deactivateBroker, deleteBroker, verifyBroker } from '../../services/adminApi';
import { 
  Search,
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
Check,
  Plus,
  X
} from 'lucide-react';


export default function BrokerManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBrokers, setTotalBrokers] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: currentPage * 20,
        limit: 20,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const data = await getBrokers(params);
      console.log("Fetched brokers successfully:", data);
      
      setBrokers(data);
      setTotalBrokers(data.length);
    } catch (err) {
      console.error('Error fetching brokers:', err);
      setError('Failed to fetch brokers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  // Fetch brokers data
  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBrokers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchBrokers]);

  // Filter brokers based on search query (client-side filtering for immediate response)
  const filteredBrokers = searchQuery 
    ? brokers.filter(broker =>
    broker.agency_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    broker.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : brokers;



  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle broker actions
  const handleViewBroker = async (brokerId) => {
    try {
      const brokerDetail = await getBrokerDetail(brokerId);
      setSelectedBroker(brokerDetail);
    } catch (err) {
      console.error('Error fetching broker detail:', err);
      setError('Failed to fetch broker details.');
    }
  };

  // const handleVerifyBroker = async (brokerId) => {
  //   try {
  //     const resposne = await axios.post("/v1/admin/broker/verify/", {
  //       broker_id: brokerId
  //     });
  //   setSuccess('Broker verified successfully');
  //     fetchBrokers();
  //   }
  //   catch (err) {
  //     console.error('Error verifying broker:', err);
  //     setError('Failed to verify broker.');
  //   }
  // };

  const handleDeactivateBroker = async (brokerId) => {
    if (window.confirm('Are you sure you want to deactivate this broker?')) {
      try {
        await deactivateBroker(brokerId);
        setBrokers(brokers.filter(broker => broker.id !== brokerId));
        setSelectedBroker(null);
        setSuccess('Broker deactivated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deactivating broker:', err);
        setError('Failed to deactivate broker.');
      }
    }
  };

  const handleDeleteBroker = async (brokerId) => {
    if (window.confirm('Are you sure you want to permanently delete this broker? This action cannot be undone.')) {
      try {
        await deleteBroker(brokerId);
        setBrokers(brokers.filter(broker => broker.id !== brokerId));
        setSelectedBroker(null);
        setSuccess('Broker deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting broker:', err);
        setError('Failed to delete broker.');
      }
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">Broker Management</h1>
              <p className="text-slate-600">Manage and view all registered brokers ({totalBrokers} total)</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                <Plus size={18} />
                <span className="font-medium">Add Broker</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-md border border-slate-200">
                <Download size={18} />
                <span className="font-medium">Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by agency name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-900 placeholder-slate-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm border border-slate-200">
              <Filter size={18} />
              <span className="font-medium">More Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Results Count */}
        {searchQuery && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-600 mb-4"
          >
            Found {filteredBrokers.length} broker{filteredBrokers.length !== 1 ? 's' : ''}
          </motion.p>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading brokers...</p>
            </div>
          </motion.div>
        )}

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
                fetchBrokers();
              }}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </motion.div>
        )}


        {/* Broker Cards Grid */}
        {!loading && !error && filteredBrokers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredBrokers.map((broker, index) => (
              <motion.div
                key={broker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ 
                  y: -4,
                  transition: { type: 'spring', stiffness: 400, damping: 17 }
                }}
                className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all border border-slate-200 relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    broker.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {broker.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Agency Name */}
                <div className="mb-4 pr-20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <Building2 className="text-blue-600" size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{broker.agency_name}</h3>
                  </div>
                </div>

                {/* Broker Details - Compact View */}
                <div className="space-y-3 mb-4">
                  {/* GST & PAN in one row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <p className="text-xs text-slate-600 font-medium mb-0.5 flex items-center gap-1">
                        <FileText size={12} />
                        GST
                      </p>
                      <p className="text-xs text-slate-900 font-mono truncate">{broker.gst_number || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <p className="text-xs text-slate-600 font-medium mb-0.5 flex items-center gap-1">
                        <CreditCard size={12} />
                        PAN
                      </p>
                      <p className="text-xs text-slate-900 font-mono truncate">{broker.pan_number || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="text-slate-400 flex-shrink-0" size={14} />
                      <p className="text-sm text-slate-700 truncate">{broker.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-slate-400 flex-shrink-0" size={14} />
                      <p className="text-sm text-slate-700">{broker.phone_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-slate-400 flex-shrink-0" size={14} />
                      <p className="text-sm text-slate-600">Joined {formatDate(broker.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => handleViewBroker(broker.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    onClick={() => handleDeactivateBroker(broker.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                      Reject
                  </button>
                  {broker.status !== 'verified' && <button 
                      onClick={() => verifyBroker(broker.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                    >
                      <Check size={16} />
                      Verify
                    </button>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm"
          >
            <div className="p-6 bg-slate-100 rounded-full mb-4">
              <Search className="text-slate-400" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No brokers found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your search query</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </motion.div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedBroker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedBroker(null)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Broker Details</h2>
              <button
                onClick={() => setSelectedBroker(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Agency Name</p>
                <p className="text-lg text-slate-900 font-semibold">{selectedBroker.agency_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">GST Number</p>
                  <p className="text-sm text-slate-900 font-mono">{selectedBroker.gst_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">PAN Number</p>
                  <p className="text-sm text-slate-900 font-mono">{selectedBroker.pan_number || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Email</p>
                <p className="text-sm text-slate-900">{selectedBroker.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Username</p>
                <p className="text-sm text-slate-900">{selectedBroker.username}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Phone Number</p>
                <p className="text-sm text-slate-900">{selectedBroker.phone_number}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Registration Date</p>
                <p className="text-sm text-slate-900">{formatDate(selectedBroker.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedBroker.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedBroker.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Additional Statistics */}
              {selectedBroker.total_loads !== undefined && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Total Loads</p>
                    <p className="text-lg text-slate-900 font-semibold">{selectedBroker.total_loads}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Total Orders</p>
                    <p className="text-lg text-slate-900 font-semibold">{selectedBroker.total_orders}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
              <button 
                onClick={() => handleDeactivateBroker(selectedBroker.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Deactivate
              </button>
              {selectedBroker.status !== 'verified' && <button 
                onClick={() => verifyBroker(selectedBroker.id)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Verify
              </button>}
              <button 
                onClick={() => setSelectedBroker(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}