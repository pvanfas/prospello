import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle, DollarSign, User, Phone, Mail, CreditCard, Package, TrendingUp, IndianRupee, ChevronDown, ChevronUp, Calendar, ArrowRight, Eye, Edit, Trash2 } from 'lucide-react';
import { getPayments, getPaymentDetail, updatePayment, deletePayment, getPayouts, getPayoutDetail, updatePayout, deletePayout } from '../../services/adminApi';

// Card Components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-lg border border-slate-200 ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`p-6 pb-0 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// Button Component
const Button = ({ children, className = "", variant = "default", size = "default", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary"
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Alert Components
const Alert = ({ children, className = "", ...props }) => (
  <div className={`relative w-full rounded-lg border p-4 ${className}`} {...props}>
    {children}
  </div>
);

const AlertDescription = ({ children, className = "", ...props }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);

// Mock data removed - using real API data structure

const PaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);

  // Fetch payments and payouts data
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: currentPage * 20,
        limit: 20,
        search: searchTerm || undefined,
        status: paymentStatusFilter !== 'ALL' ? paymentStatusFilter.toLowerCase() : undefined
      };
      
      const [paymentsData, payoutsData] = await Promise.all([
        getPayments(params),
        getPayouts({ skip: 0, limit: 1000 })
      ]);
      
      setPayments(paymentsData || []);
      setPayouts(payoutsData || []);
      setTotalPayments((paymentsData || []).length);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payments. Please try again.');
      setPayments([]);
      setPayouts([]);
      setTotalPayments(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, paymentStatusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchPayments();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchPayments]);

  const handleViewPayment = async (paymentId) => {
    try {
      const paymentDetail = await getPaymentDetail(paymentId);
      setSelectedPayment(paymentDetail);
    } catch (err) {
      console.error('Error fetching payment detail:', err);
      setError('Failed to fetch payment details.');
    }
  };

  const handleViewPayout = async (payoutId) => {
    try {
      const payoutDetail = await getPayoutDetail(payoutId);
      setSelectedPayout(payoutDetail);
    } catch (err) {
      console.error('Error fetching payout detail:', err);
      setError('Failed to fetch payout details.');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await deletePayment(paymentId);
      setSuccess('Payment deleted successfully');
      fetchPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Failed to delete payment.');
    }
  };

  const handleDeletePayout = async (payoutId) => {
    try {
      await deletePayout(payoutId);
      setSuccess('Payout deleted successfully');
      fetchPayments();
    } catch (err) {
      console.error('Error deleting payout:', err);
      setError('Failed to delete payout.');
    }
  };

  const toggleCardExpansion = (paymentId) => {
    setExpandedCards(prev => ({
      ...prev,
      [paymentId]: !prev[paymentId]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      SUCCESS: 'bg-green-100 text-green-800 border-green-300',
      CAPTURED: 'bg-green-100 text-green-800 border-green-300',
      PROCESSING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      AUTHORIZED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      FAILED: 'bg-red-100 text-red-800 border-red-300',
      CREATED: 'bg-blue-100 text-blue-800 border-blue-300',
      INITIATED: 'bg-blue-100 text-blue-800 border-blue-300',
      REFUNDED: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      SUCCESS: CheckCircle,
      CAPTURED: CheckCircle,
      PROCESSING: Clock,
      AUTHORIZED: Clock,
      FAILED: XCircle,
      CREATED: AlertCircle,
      INITIATED: AlertCircle,
      REFUNDED: RefreshCw
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPayments = payments || [];

  const handleRefund = (paymentId) => {
    if (confirm('Are you sure you want to initiate a refund for this payment?')) {
      alert(`Refund initiated for payment: ${paymentId}`);
    }
  };

  const handleRetryPayment = (paymentId) => {
    alert(`Retrying payment: ${paymentId}`);
  };

  const handleRetryPayout = (paymentId) => {
    alert(`Retrying payout for payment: ${paymentId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPaymentStatusFilter('ALL');
    setPayoutStatusFilter('ALL');
  };

  // Calculate stats
  const stats = {
    total: (payments || []).length,
    captured: (payments || []).filter(p => p.status === 'captured').length,
    failed: (payments || []).filter(p => p.status === 'failed').length,
    totalAmount: (payments || []).reduce((sum, p) => sum + (p.status === 'captured' ? p.amount : 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-2"
          >
            💳 Payments & Payouts
          </motion.h1>
          <p className="text-slate-600 text-base md:text-lg">Manage your transactions with ease</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
          >
            {success}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Payments</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{stats.captured}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-100 mb-1">Total Revenue</p>
                    <p className="text-xl font-bold">{formatAmount(stats.totalAmount)}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search payments, shippers, drivers, or order IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm md:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Filters - Collapsible */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
                        <select
                          value={paymentStatusFilter}
                          onChange={(e) => setPaymentStatusFilter(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        >
                          <option value="ALL">All Statuses</option>
                          <option value="CREATED">Created</option>
                          <option value="AUTHORIZED">Authorized</option>
                          <option value="CAPTURED">Captured</option>
                          <option value="FAILED">Failed</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Payout Status</label>
                        <select
                          value={payoutStatusFilter}
                          onChange={(e) => setPayoutStatusFilter(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        >
                          <option value="ALL">All Statuses</option>
                          <option value="INITIATED">Initiated</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SUCCESS">Success</option>
                          <option value="FAILED">Failed</option>
                          <option value="NONE">No Payout</option>
                        </select>
                      </div>
                    </div>

                    {(paymentStatusFilter !== 'ALL' || payoutStatusFilter !== 'ALL' || searchTerm) && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 text-sm text-slate-600 hover:text-slate-900 underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Filters Display */}
              {(paymentStatusFilter !== 'ALL' || payoutStatusFilter !== 'ALL') && !showFilters && (
                <div className="flex flex-wrap gap-2">
                  {paymentStatusFilter !== 'ALL' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                      Payment: {paymentStatusFilter}
                      <button onClick={() => setPaymentStatusFilter('ALL')} className="hover:text-blue-900">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {payoutStatusFilter !== 'ALL' && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                      Payout: {payoutStatusFilter}
                      <button onClick={() => setPayoutStatusFilter('ALL')} className="hover:text-amber-900">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        {filteredPayments.length > 0 && (
          <div className="mb-4 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredPayments.length}</span> of <span className="font-semibold text-slate-900">{payments.length}</span> payments
          </div>
        )}

        {/* Payment Cards */}
        <AnimatePresence mode="popLayout">
          {filteredPayments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16 bg-white rounded-2xl shadow-md"
            >
              <Package className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No payments found</h3>
              <p className="text-slate-500 mb-4">Try adjusting your search or filters</p>
              {(searchTerm || paymentStatusFilter !== 'ALL' || payoutStatusFilter !== 'ALL') && (
                <Button onClick={clearFilters} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Card className="shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden h-full flex flex-col border-2 border-slate-100">
                    {/* Simplified Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4" />
                            <span className="font-semibold text-sm">Order #{payment.order_id}</span>
                          </div>
                          <p className="text-xs text-blue-100">ID: {payment.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(payment.status)} shadow-sm`}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </div>
                      
                      {/* Large Amount Display */}
                      <div className="text-3xl font-bold mb-1">{formatAmount(payment.amount)}</div>
                      <div className="flex items-center text-xs text-blue-100">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(payment.created_at)}
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      {/* Payment Info - Simplified */}
                      <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 mb-1 truncate">Payment #{payment.id}</h3>
                            <div className="space-y-0.5 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5 truncate">
                                <span>Order: #{payment.order_id}</span>
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <span>Razorpay: {payment.razorpay_order_id || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Statistics */}
                      {payment.total_payouts > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-green-900 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Payout Statistics
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white rounded-lg p-2">
                              <div className="text-xs text-slate-500">Total Payouts</div>
                              <div className="font-bold text-green-700">{payment.total_payouts}</div>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                              <div className="text-xs text-slate-500">Successful</div>
                              <div className="font-bold text-green-700">{payment.successful_payouts}</div>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                              <div className="text-xs text-slate-500">Failed</div>
                              <div className="font-bold text-red-700">{payment.failed_payouts}</div>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                              <div className="text-xs text-slate-500">Total Amount</div>
                              <div className="font-bold text-blue-700">{formatAmount(payment.total_payout_amount)}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Expandable Details */}
                      <div className="mt-auto">
                        <button
                          onClick={() => toggleCardExpansion(payment.id)}
                          className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {expandedCards[payment.id] ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Details
                            </>
                          )}
                        </button>

                        <AnimatePresence>
                          {expandedCards[payment.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 mt-3 border-t border-slate-200 space-y-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                  <p className="font-semibold text-slate-700 mb-2">Razorpay Details</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Order ID:</span>
                                      <span className="text-slate-700 font-mono text-xs">{payment.razorpay_order_id || 'N/A'}</span>
                                    </div>
                                    {payment.razorpay_payment_id && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Payment ID:</span>
                                        <span className="text-slate-700 font-mono text-xs">{payment.razorpay_payment_id}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Currency:</span>
                                      <span className="text-slate-700">{payment.currency}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-3 bg-green-50 rounded-lg">
                                  <p className="font-semibold text-green-700 mb-2">Payment Timeline</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Created:</span>
                                      <span className="text-slate-700">{formatDate(payment.created_at)}</span>
                                    </div>
                                    {payment.authorized_at && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Authorized:</span>
                                        <span className="text-slate-700">{formatDate(payment.authorized_at)}</span>
                                      </div>
                                    )}
                                    {payment.captured_at && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Captured:</span>
                                        <span className="text-slate-700">{formatDate(payment.captured_at)}</span>
                                      </div>
                                    )}
                                    {payment.refunded_at && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Refunded:</span>
                                        <span className="text-slate-700">{formatDate(payment.refunded_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <p className="font-semibold text-blue-700 mb-2">Order Information</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Order ID:</span>
                                      <span className="text-slate-700">#{payment.order_id}</span>
                                    </div>
                                    {payment.order_details && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Order Status:</span>
                                        <span className="text-slate-700">{payment.order_details.status || 'N/A'}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Payment UUID:</span>
                                      <span className="text-slate-700 font-mono text-xs truncate">{payment.uuid}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleViewPayment(payment.id)}
                          variant="outline"
                          className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDeletePayment(payment.id)}
                          variant="outline"
                          className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-50 font-medium"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPayment(null)}
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
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Payment Details</h2>
                    <p className="text-blue-100">ID: {selectedPayment.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Payment Information</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Amount</div>
                        <div className="text-sm text-slate-900">{formatAmount(selectedPayment.amount)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Status</div>
                        <div className="text-sm text-slate-900">{selectedPayment.status}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Currency</div>
                        <div className="text-sm text-slate-900">{selectedPayment.currency}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Order Information</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Order ID</div>
                        <div className="text-sm text-slate-900">{selectedPayment.order_id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Origin</div>
                        <div className="text-sm text-slate-900">{selectedPayment.order_origin || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Destination</div>
                        <div className="text-sm text-slate-900">{selectedPayment.order_destination || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Payout Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-slate-600">Total Payouts</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-900">{selectedPayment.total_payouts || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-slate-600">Successful</span>
                      </div>
                      <div className="text-3xl font-bold text-green-900">{selectedPayment.successful_payouts || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedPayment(null)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Payout Detail Modal */}
        {selectedPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPayout(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Payout Details</h2>
                    <p className="text-green-100">ID: {selectedPayout.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">Payout Information</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Amount</div>
                        <div className="text-sm text-slate-900">₹{selectedPayout.amount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Status</div>
                        <div className="text-sm text-slate-900">{selectedPayout.status}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Mode</div>
                        <div className="text-sm text-slate-900">{selectedPayout.mode}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">Driver Information</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Driver Name</div>
                        <div className="text-sm text-slate-900">{selectedPayout.driver_name || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Phone</div>
                        <div className="text-sm text-slate-900">{selectedPayout.driver_phone || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">License</div>
                        <div className="text-sm text-slate-900">{selectedPayout.driver_license || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedPayout(null)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentDashboard;