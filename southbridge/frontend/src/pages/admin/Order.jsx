import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Package,
  MapPin,
  User,
  Phone,
  Truck,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Navigation,
  Box
} from 'lucide-react';
import { getOrders, getOrderDetail, updateOrderStatus, deleteOrder, getPayments } from '../../services/adminApi';

// Card Components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

// Button Component
const Button = ({ children, className = "", variant = "default", size = "default", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-slate-300 hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100 text-slate-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-8",
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

// Badge Component
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage] = useState(0);

  // Fetch orders and payments
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: currentPage * 20,
        limit: 20,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const [ordersData, paymentsData] = await Promise.all([
        getOrders(params),
        getPayments({ skip: 0, limit: 1000 })
      ]);
      
      console.log(ordersData);
      console.log(paymentsData);
      
      const mappedOrders = (ordersData || []).map(order => {
        const [origin, destination] = order.load_title
          ? order.load_title.split(' to ')
          : ['Unknown', 'Unknown'];
      
        return {
          ...order,
          amount: order.total_amount,
          origin: origin.trim(),
          destination: destination?.trim() || 'Unknown',
          picked_up_at: order.pickup_date,
          delivered_at: order.delivery_date,
          shipper: order.shipper_name,
          driver_name: order.driver_name,
          driver_phone: 'N/A', // Add if available later
          goods_type: 'General', // Add if available later
          weight: 100, // Add if available later
        };
      });
      
      setOrders(mappedOrders);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchOrders]);

  // Filter orders based on search query
  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.goods_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    const statusMap = {
      'completed': 'success',
      'delivered': 'success',
      'in_transit': 'info',
      'picked_up': 'info',
      'pending': 'warning',
      'bid_accepted': 'pending',
      'driver_accepted': 'pending',
      'canceled': 'error',
      'delivery_failed': 'error',
      'driver_rejected': 'error'
    };
    return statusMap[status] || 'default';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const iconMap = {
      'completed': CheckCircle,
      'delivered': CheckCircle,
      'in_transit': TrendingUp,
      'picked_up': Truck,
      'pending': Clock,
      'bid_accepted': AlertCircle,
      'driver_accepted': AlertCircle,
      'canceled': XCircle,
      'delivery_failed': XCircle,
      'driver_rejected': XCircle
    };
    const Icon = iconMap[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  // Format date
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

  // Format amount
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0.00';
    }
    return `₹${(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Handle view order
  // 1.  Always fetch the full / fresh order
const handleViewOrder = async (orderId) => {
  try {
    const fresh = await getOrderDetail(orderId);   // <-- freshest data
    setSelectedOrder(fresh);                       // <-- put it in state
  } catch (err) {
    console.error(err);
    setError('Could not load order details.');
  }
};
  

  // Handle update status
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to update this order status to ${newStatus}?`)) {
      try {
        await updateOrderStatus(orderId, { status: newStatus });
        setSuccess('Order status updated successfully');
        fetchOrders();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error updating order status:', err);
        setError('Failed to update order status.');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(orderId);
        setSuccess('Order deleted successfully');
        fetchOrders();
        setSelectedOrder(null);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order.');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Get payment for order
  const getPaymentForOrder = (orderId) => {
    return payments.find(p => p.order_id === orderId);
  };

  // Calculate statistics
  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
    inProgress: orders.filter(o => o.status === 'in_transit' || o.status === 'picked_up').length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'bid_accepted' || o.status === 'driver_accepted').length,
    failed: orders.filter(o => o.status === 'canceled' || o.status === 'delivery_failed').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + (o.amount || 0), 0)
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
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">Order Management</h1>
              <p className="text-slate-600">Track and manage all customer orders</p>
            </div>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="w-5 h-5 text-blue-600" />
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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-100 mb-1">Total Revenue</p>
                    <p className="text-xl font-bold">{formatAmount(stats.totalRevenue)}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by Order Number, Load ID, Shipper, Driver, or Goods Type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-slate-900 placeholder-slate-400"
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

                {/* Filter Toggle */}
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
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Order Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full md:w-auto px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="bid_accepted">Bid Accepted</option>
                          <option value="driver_accepted">Driver Accepted</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="canceled">Canceled</option>
                          <option value="delivery_failed">Delivery Failed</option>
                        </select>
                        
                        {statusFilter !== 'all' && (
                          <button
                            onClick={() => setStatusFilter('all')}
                            className="mt-2 text-sm text-slate-600 hover:text-slate-900 underline"
                          >
                            Clear filter
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active Filters Display */}
                {statusFilter !== 'all' && !showFilters && (
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('all')} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        {filteredOrders.length > 0 && (
          <div className="mb-4 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredOrders.length}</span> of <span className="font-semibold text-slate-900">{orders.length}</span> orders
          </div>
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
              <p className="text-slate-600">Loading orders...</p>
            </div>
          </motion.div>
        )}

        {/* Order Cards Grid */}
        {!loading && filteredOrders.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredOrders.map((order) => {
              const payment = getPaymentForOrder(order.id);
              return (
                <motion.div
                  key={order.id}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -4,
                    transition: { type: 'spring', stiffness: 400, damping: 17 }
                  }}
                  className="h-full"
                >
                  <Card className="shadow-md hover:shadow-xl transition-all h-full flex flex-col">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4" />
                            <span className="font-bold text-sm">{order.order_number}</span>
                          </div>
                          <p className="text-xs text-blue-100">Created {formatDate(order.created_at)}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1.5">
                          {getStatusIcon(order.status)}
                          {order.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* <div className="text-2xl font-bold">Rs {order.amount}</div> */}
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      {/* Load Information */}
                      <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-start gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-slate-900 truncate">{order.origin}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-semibold text-slate-900 truncate">{order.destination}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Box className="w-3 h-3" />
                            <span className="truncate">{order.goods_type}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Navigation className="w-3 h-3" />
                            <span>{order.weight} kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Driver Information */}
                      {order.driver_name && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Truck className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-green-900 mb-1">{order.driver_name}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-green-700">
                                {/* <Phone className="w-3 h-3" /> */}
                                {/* <span>{order.driver_phone}----</span> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Information */}
                      {payment && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-semibold text-amber-900">Payment</span>
                            </div>
                            <Badge variant={payment.status === 'captured' ? 'success' : payment.status === 'failed' ? 'error' : 'warning'}>
                              {payment.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="mt-2 text-xs text-amber-700">
                            Amount: {payment.amount}
                          </div>
                        </div>
                      )}

                      {/* Order Timeline */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Order Timeline</h4>
                        <div className="space-y-2 text-xs">
                          {order.created_at && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-3 h-3" />
                              <span>Created: {formatDate(order.created_at)}</span>
                            </div>
                          )}
                          {order.bid_accepted_at && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>Bid Accepted: {formatDate(order.bid_accepted_at)}</span>
                            </div>
                          )}
                          {order.driver_accepted_at && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Truck className="w-3 h-3 text-green-600" />
                              <span>Driver Accepted: {formatDate(order.driver_accepted_at)}</span>
                            </div>
                          )}
                          {order.picked_up_at && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <TrendingUp className="w-3 h-3 text-blue-600" />
                              <span>Picked Up: {formatDate(order.picked_up_at)}</span>
                            </div>
                          )}
                          {order.in_transit_at && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Navigation className="w-3 h-3 text-blue-600" />
                              <span>In Transit: {formatDate(order.in_transit_at)}</span>
                            </div>
                          )}
                          {order.delivered_at && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>Delivered: {formatDate(order.delivered_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Update Actions */}
                      <div className="mt-auto pt-3 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Update Status:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {order.status !== 'picked_up' && order.status !== 'in_transit' && order.status !== 'delivered' && (
                            <Button 
                              onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <Truck className="w-3 h-3 mr-1" />
                              Picked Up
                            </Button>
                          )}
                          {(order.status === 'picked_up' || order.status === 'in_transit') && (
                            <Button 
                              onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <TrendingUp className="w-3 h-3 mr-1" />
                              In Transit
                            </Button>
                          )}
                          {(order.status === 'in_transit' || order.status === 'picked_up') && (
                            <Button 
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              variant="success"
                              size="sm"
                              className="text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Delivered
                            </Button>
                          )}
                          {order.status !== 'canceled' && order.status !== 'completed' && (
                            <Button 
                              onClick={() => handleUpdateStatus(order.id, 'canceled')}
                              variant="danger"
                              size="sm"
                              className="text-xs"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => handleViewOrder(order.id)}
                          variant="outline"
                          className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDeleteOrder(order.id)}
                          variant="outline"
                          className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : !loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm"
          >
            <div className="p-6 bg-slate-100 rounded-full mb-4">
              <Package className="text-slate-400" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your search or filters</p>
            {(searchQuery || statusFilter !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                variant="default"
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        ) : null}
      </div>

      {/* Order Detail Modal */}
      // 2.  Modal body – show the fields you already mapped
{selectedOrder && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setSelectedOrder(null)}
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
    >
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{selectedOrder.order_number}</h2>
          <p className="text-sm text-slate-600">Order Details</p>
        </div>
        <button
          onClick={() => setSelectedOrder(null)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={24} className="text-slate-600" />
        </button>
      </div>

      {/* body – same keys you mapped */}
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 font-medium mb-1">Status</p>
            <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
              {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
          <div>
            <p className="text-slate-500 font-medium mb-1">Amount</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatAmount(selectedOrder.amount)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-slate-500 font-medium mb-1">Origin</p>
          <p className="text-slate-900">{selectedOrder.origin}</p>
        </div>

        <div>
          <p className="text-slate-500 font-medium mb-1">Destination</p>
          <p className="text-slate-900">{selectedOrder.destination}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 font-medium mb-1">Goods Type</p>
            <p className="text-slate-900">{selectedOrder.goods_type}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium mb-1">Weight</p>
            <p className="text-slate-900">{selectedOrder.weight} kg</p>
          </div>
        </div>

        {selectedOrder.driver_name && (
          <div>
            <p className="text-slate-500 font-medium mb-1">Driver</p>
            <p className="text-slate-900">{selectedOrder.driver_name}</p>
            {selectedOrder.driver_phone && (
              <p className="text-slate-600">{selectedOrder.driver_phone}</p>
            )}
          </div>
        )}

        <div>
          <p className="text-slate-500 font-medium mb-1">Created</p>
          <p className="text-slate-900">{formatDate(selectedOrder.created_at)}</p>
        </div>
      </div>

      {/* footer actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
        <Button
          onClick={() => {
            handleDeleteOrder(selectedOrder.id);
            setSelectedOrder(null);
          }}
          variant="danger"
          className="flex-1"
        >
          Delete Order
        </Button>
        <Button onClick={() => setSelectedOrder(null)} variant="outline" className="flex-1">
          Close
        </Button>
      </div>
    </motion.div>
  </motion.div>
)}
    </div>
  );
};

