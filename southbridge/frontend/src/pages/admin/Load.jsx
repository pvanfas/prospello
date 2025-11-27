import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Package, MapPin, User, TrendingDown, Calendar, AlertCircle, Filter, SlidersHorizontal, ArrowRight, Weight, Ruler, DollarSign, Users, X, Eye, Edit, CheckCircle } from 'lucide-react';
import { getLoads, getLoadDetail, updateLoad, deleteLoad, getLoadStats } from '../../services/adminApi';

// Card Component
const Card = ({ className = '', children }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className = '', children }) => (
  <div className={className}>
    {children}
  </div>
);

// Button Component
const Button = ({ 
  children, 
  className = '', 
  variant = 'default', 
  onClick,
  type = 'button'
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center';
  const variants = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50',
    ghost: 'hover:bg-slate-100 text-slate-600'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  className = '' 
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

// Alert Dialog Components
const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-50 w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  );
};

const AlertDialogContent = ({ className = '', children }) => (
  <div className={`bg-white rounded-2xl shadow-2xl p-6 mx-4 ${className}`}>
    {children}
  </div>
);

const AlertDialogHeader = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

const AlertDialogTitle = ({ className = '', children }) => (
  <h2 className={`text-xl font-bold text-slate-900 ${className}`}>
    {children}
  </h2>
);

const AlertDialogDescription = ({ className = '', children }) => (
  <p className={`text-slate-600 mt-2 ${className}`}>
    {children}
  </p>
);

const AlertDialogFooter = ({ className = '', children }) => (
  <div className={`flex gap-3 mt-6 ${className}`}>
    {children}
  </div>
);

const AlertDialogCancel = ({ className = '', children, onClick }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className={`flex-1 ${className}`}
  >
    {children}
  </Button>
);

const AlertDialogAction = ({ className = '', children, onClick }) => (
  <Button
    onClick={onClick}
    className={`flex-1 ${className}`}
  >
    {children}
  </Button>
);

// Sample Data
const SAMPLE_LOADS = [
  {
    id: 1,
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    goodsType: 'Electronics',
    category: 'Fragile',
    weight: '2,500 lbs',
    dimensions: '48" × 40" × 60"',
    specialInstructions: 'Temperature controlled, handle with care',
    status: 'BIDDING',
    bidCount: 12,
    lowestBid: '₹3,200',
    assignedDriver: null,
    broker: 'John Smith Logistics',
    createdAt: '2024-10-01'
  },
  {
    id: 2,
    origin: 'Chicago, IL',
    destination: 'Miami, FL',
    goodsType: 'Furniture',
    category: 'General',
    weight: '4,800 lbs',
    dimensions: '96" × 48" × 72"',
    specialInstructions: null,
    status: 'ASSIGNED',
    bidCount: 8,
    lowestBid: '₹2,850',
    assignedDriver: 'Mike Johnson',
    broker: 'FastShip Inc.',
    createdAt: '2024-09-28'
  },
  {
    id: 3,
    origin: 'Houston, TX',
    destination: 'Seattle, WA',
    goodsType: 'Construction Materials',
    category: 'Heavy',
    weight: '12,000 lbs',
    dimensions: '120" × 96" × 84"',
    specialInstructions: 'Requires flatbed truck',
    status: 'POSTED',
    bidCount: 0,
    lowestBid: null,
    assignedDriver: null,
    broker: 'BuildRight Shipping',
    createdAt: '2024-10-02'
  },
  {
    id: 4,
    origin: 'Boston, MA',
    destination: 'Denver, CO',
    goodsType: 'Medical Supplies',
    category: 'Urgent',
    weight: '850 lbs',
    dimensions: '36" × 30" × 40"',
    specialInstructions: 'Expedited delivery required, refrigerated',
    status: 'BIDDING',
    bidCount: 15,
    lowestBid: '₹4,100',
    assignedDriver: null,
    broker: 'MedTrans Solutions',
    createdAt: '2024-10-01'
  },
  {
    id: 5,
    origin: 'Phoenix, AZ',
    destination: 'Portland, OR',
    goodsType: 'Food & Beverages',
    category: 'Perishable',
    weight: '3,200 lbs',
    dimensions: '60" × 48" × 54"',
    specialInstructions: 'Keep refrigerated at 38°F',
    status: 'ASSIGNED',
    bidCount: 10,
    lowestBid: '₹2,950',
    assignedDriver: 'Sarah Williams',
    broker: 'Fresh Freight Co.',
    createdAt: '2024-09-30'
  },
  {
    id: 6,
    origin: 'Atlanta, GA',
    destination: 'Dallas, TX',
    goodsType: 'Textiles',
    category: 'General',
    weight: '1,800 lbs',
    dimensions: '72" × 42" × 48"',
    specialInstructions: null,
    status: 'POSTED',
    bidCount: 3,
    lowestBid: '₹1,850',
    assignedDriver: null,
    broker: 'Southern Transport',
    createdAt: '2024-10-02'
  }
];

const STATUS_CONFIG = {
  POSTED: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Available', icon: '📢' },
  BIDDING: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Accepting Bids', icon: '💰' },
  ASSIGNED: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Assigned', icon: '✓' },
  IN_TRANSIT: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'In Transit', icon: '🚚' },
  DELIVERED: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Delivered', icon: '✓' }
};

// Main Component
export default function LoadManagement() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loadToDelete, setLoadToDelete] = useState(null);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLoads, setTotalLoads] = useState(0);
  const [statsCounts, setStatsCounts] = useState({
    total: 0,
    posted: 0,
    bidding: 0,
    assigned: 0
  });

  const fetchLoads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: currentPage * 20,
        limit: 20,
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter.toLowerCase() : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter.toLowerCase() : undefined
      };
      
      const data = await getLoads(params);
      setLoads(data || []);
      setTotalLoads((data || []).length);
    } catch (err) {
      console.error('Error fetching loads:', err);
      setError('Failed to fetch loads. Please try again.');
      setLoads([]);
      setTotalLoads(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, categoryFilter]);

  const fetchLoadStats = useCallback(async () => {
    try {
      const stats = await getLoadStats();
      setStatsCounts({
        total: stats.total,
        posted: stats.posted,
        bidding: stats.bidding,
        assigned: stats.assigned
      });
    } catch (err) {
      console.error('Error fetching load stats:', err);
      // Keep existing stats on error
    }
  }, []);

  useEffect(() => {
    fetchLoads();
    fetchLoadStats();
  }, [fetchLoads, fetchLoadStats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchLoads();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchLoads]);

  const handleViewLoad = async (loadId) => {
    try {
      const loadDetail = await getLoadDetail(loadId);
      setSelectedLoad(loadDetail);
    } catch (err) {
      console.error('Error fetching load detail:', err);
      setError('Failed to fetch load details.');
    }
  };

  const handleDeleteLoad = async (loadId) => {
    try {
      await deleteLoad(loadId);
      setSuccess('Load deleted successfully');
      fetchLoads();
      fetchLoadStats(); // Refresh stats after deletion
      setDeleteDialogOpen(false);
      setLoadToDelete(null);
    } catch (err) {
      console.error('Error deleting load:', err);
      setError('Failed to delete load.');
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    setCurrentPage(0);
  };

  const filteredLoads = loads || [];

  const handleDeleteClick = (load) => {
    setLoadToDelete(load);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (loadToDelete) {
      handleDeleteLoad(loadToDelete.id);
    }
  };


  const clearSearch = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  // Stats are now fetched from the backend and stored in state

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Load Management</h1>
              <p className="text-slate-600 text-sm sm:text-base">Track and manage all your freight loads in one place</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hidden sm:flex">
              <Package className="w-4 h-4 mr-2" />
              Add Load
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total Loads', value: statsCounts.total, color: 'bg-slate-600', icon: Package },
              { label: 'Available', value: statsCounts.posted, color: 'bg-amber-500', icon: TrendingDown },
              { label: 'Bidding', value: statsCounts.bidding, color: 'bg-blue-600', icon: DollarSign },
              { label: 'Assigned', value: statsCounts.assigned, color: 'bg-green-600', icon: Users }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search origin, destination, or goods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-10 py-6 w-full text-base border-2 border-slate-200 focus:border-blue-600 rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {['ALL', 'POSTED', 'BIDDING', 'ASSIGNED'].map(status => (
                  <Button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    className={`whitespace-nowrap ${
                      statusFilter === status 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-2'
                    }`}
                  >
                    {status === 'ALL' ? 'All Loads' : STATUS_CONFIG[status].label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || statusFilter !== 'ALL') && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-blue-600">{filteredLoads.length}</span> of <span className="font-semibold">{loads.length}</span> loads
                </p>
                <Button
                  onClick={clearSearch}
                  variant="ghost"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </motion.div>

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

        {/* Load Cards Grid */}
        {!loading && filteredLoads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-md p-12 text-center"
          >
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">No loads found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search or filter criteria</p>
            <Button onClick={clearSearch} className="bg-blue-600 hover:bg-blue-700">
              Clear All Filters
            </Button>
          </motion.div>
        ) : !loading && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredLoads.map((load, index) => (
                <motion.div
                  key={load.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card className="rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-slate-200 hover:border-blue-300 bg-white">
                    <CardContent className="p-5 sm:p-6">
                      {/* Header with Status and Delete */}
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 ${STATUS_CONFIG[load.status?.toUpperCase()]?.color || 'bg-gray-100 text-gray-800 border-gray-200'} flex items-center gap-1.5`}>
                          <span>{STATUS_CONFIG[load.status?.toUpperCase()]?.icon || '📦'}</span>
                          {STATUS_CONFIG[load.status?.toUpperCase()]?.label || load.status}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(load)}
                          className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all duration-200"
                          title="Delete load"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>

                      {/* Route - Vertical Layout */}
                      <div className="mb-5 bg-gradient-to-br from-blue-50 to-amber-50 p-4 rounded-xl border border-blue-100">
                        {/* Origin - Show first */}
                        <div className="mb-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-600 p-1.5 rounded-lg flex-shrink-0">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-slate-500 font-medium mb-1">Origin</p>
                              <p className="text-sm sm:text-base font-bold text-slate-900 break-words leading-tight">{load.origin}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Arrow indicator */}
                        <div className="flex justify-center mb-3">
                          <ArrowRight className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        {/* Destination - Show below origin */}
                        <div>
                          <div className="flex items-start gap-3">
                            <div className="bg-amber-500 p-1.5 rounded-lg flex-shrink-0">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-slate-500 font-medium mb-1">Destination</p>
                              <p className="text-sm sm:text-base font-bold text-slate-900 break-words leading-tight">{load.destination}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Goods Info - Card Style */}
                      <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="w-5 h-5 text-blue-600" />
                          <div>
                            <span className="font-bold text-slate-900 text-base">{load.goods_type}</span>
                            <span className="ml-2 text-xs px-2 py-0.5 bg-white rounded-full text-slate-600 border border-slate-200">
                              {load.category}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Weight className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{load.weight}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Ruler className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{load.dimensions}</span>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions - Enhanced */}
                      {load.specialInstructions && (
                        <div className="mb-4 p-3 bg-amber-50 rounded-xl border-2 border-amber-200">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-amber-800 mb-1">Special Requirements</p>
                              <p className="text-sm text-amber-900 leading-relaxed">{load.specialInstructions}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bid Info - More Prominent */}
                      <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-blue-700 mb-1">Bid Activity</p>
                            <p className="text-sm text-blue-900">
                              <span className="font-bold text-lg">{load.bid_count || 0}</span> {(load.bid_count || 0) === 1 ? 'bid' : 'bids'} received
                            </p>
                          </div>
                          {load.lowest_bid && (
                            <div className="text-right">
                              <p className="text-xs font-semibold text-blue-700 mb-1">Lowest Bid</p>
                              <p className="text-2xl font-bold text-blue-600">₹{load.lowest_bid}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Assigned Driver - More Visual */}
                      {load.assigned_driver_id && (
                        <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-600 p-3 rounded-full">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-green-700">Assigned Driver</p>
                              <p className="text-base font-bold text-green-900">Driver #{load.assigned_driver_id}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 border-t-2 border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{load.shipper_name || load.broker_name || 'Unknown'}</span>
                          {load.creator_verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" title="Verified Creator" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleViewLoad(load.id)}
                            className="text-xs px-3 py-1.5"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs px-3 py-1.5"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* Footer - Cleaner */}
                      <div className="pt-2 flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(load.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{load.total_bids || 0} bids</span>
                          <span>•</span>
                          <span>{load.total_orders || 0} orders</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Mobile Add Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 sm:hidden"
        >
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-2xl w-14 h-14 rounded-full">
            <Package className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog - More Friendly */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Delete this load?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              You're about to delete the load from <span className="font-semibold text-slate-900">{loadToDelete?.origin}</span> to <span className="font-semibold text-slate-900">{loadToDelete?.destination}</span>.
              <br /><br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto m-0" onClick={() => setDeleteDialogOpen(false)}>
              Keep Load
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto m-0"
            >
              Yes, Delete Load
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Load Detail Modal */}
      {selectedLoad && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLoad(null)}
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
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Load Details</h2>
                  <p className="text-blue-100">ID: {selectedLoad.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoad(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Route Information</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Origin - Show first */}
                    <div>
                      <div className="text-xs text-slate-500 mb-2 font-medium">Origin</div>
                      <div className="text-sm text-slate-900 break-words leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {selectedLoad.origin}
                      </div>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                    
                    {/* Destination - Show below origin */}
                    <div>
                      <div className="text-xs text-slate-500 mb-2 font-medium">Destination</div>
                      <div className="text-sm text-slate-900 break-words leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                        {selectedLoad.destination}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Goods Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Goods Type</div>
                      <div className="text-sm text-slate-900 break-words leading-relaxed">{selectedLoad.goods_type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Weight</div>
                      <div className="text-sm text-slate-900 break-words leading-relaxed">{selectedLoad.weight} kg</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Category</div>
                      <div className="text-sm text-slate-900 break-words leading-relaxed">{selectedLoad.category}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-slate-600">Total Bids</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-900">{selectedLoad.total_bids || 0}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-amber-600" />
                      <span className="text-sm text-slate-600">Total Orders</span>
                    </div>
                    <div className="text-3xl font-bold text-amber-900">{selectedLoad.total_orders || 0}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Created Date</h3>
                </div>
                <div className="text-sm text-slate-700">{new Date(selectedLoad.created_at).toLocaleString()}</div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedLoad(null)}
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
    </div>
  );
}