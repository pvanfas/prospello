import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import api from "../../services/api";
import { useToast } from "../Toast";
import { Link } from "react-router-dom";

const ServiceProviderDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const { showToast } = useToast();

  const fetchBookings = async () => {
    try {
      const response = await api.get("/v1/service-provider/bookings");
      if (response.status === 200) {
        const bookingsData = response.data.bookings || [];
        setBookings(bookingsData);
        
        // Calculate stats
        const totalBookings = bookingsData.length;
        const pendingBookings = bookingsData.filter(booking => booking.status === "pending").length;
        const completedBookings = bookingsData.filter(booking => booking.status === "completed").length;
        const totalEarnings = bookingsData
          .filter(booking => booking.status === "completed")
          .reduce((sum, booking) => sum + (booking.amount || 0), 0);
        const averageRating = bookingsData.length > 0 
          ? bookingsData.reduce((sum, booking) => sum + (booking.rating || 0), 0) / bookingsData.length 
          : 0;

        setStats({
          totalBookings,
          pendingBookings,
          completedBookings,
          totalEarnings,
          averageRating
        });
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const response = await api.get("/v1/service/provider/categories/");
      if (response.status === 200) {
        setServiceCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching service categories:", error);
    }
  };

  const fetchAvailableCategories = async () => {
    try {
      const response = await api.get("/v1/service/service-categories/");
      if (response.status === 200) {
        setAvailableCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching available categories:", error);
    }
  };

  const addServiceCategory = async (categoryId, priceFrom, priceTo) => {
    try {
      setLoading(true);
      const response = await api.post(`/v1/service/provider/categories/add/?category_id=${categoryId}&price_from=${priceFrom}&price_to=${priceTo}`);
      if (response.status === 200) {
        showToast("success", "Service category added successfully");
        fetchServiceCategories();
        setShowAddCategory(false);
      }
    } catch (error) {
      console.error("Error adding service category:", error);
      showToast("error", "Failed to add service category");
    } finally {
      setLoading(false);
    }
  };

  const updateServiceCategory = async (categoryId, updateData) => {
    try {
      setLoading(true);
      const response = await api.put(`/v1/service/provider/categories/${categoryId}/`, updateData);
      if (response.status === 200) {
        showToast("success", "Service category updated successfully");
        fetchServiceCategories();
        setEditingCategory(null);
      }
    } catch (error) {
      console.error("Error updating service category:", error);
      showToast("error", "Failed to update service category");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchServiceCategories();
    fetchAvailableCategories();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getServiceIcon = (category) => {
    const name = category?.toLowerCase() || "";
    if (name.includes("mechanic") || name.includes("repair")) {
      return <Wrench className="w-6 h-6 text-blue-500" />;
    } else if (name.includes("towing") || name.includes("tow")) {
      return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    } else if (name.includes("emergency") || name.includes("sos")) {
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    } else {
      return <Wrench className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile-first header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Service Provider Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage your service bookings and earnings</p>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4 space-y-6"
      >
        {/* Mobile-first stats cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-500">{stats.pendingBookings}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-500">{stats.completedBookings}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Earnings</p>
                <p className="text-2xl font-bold text-blue-500">₹{stats.totalEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>
        </div>

        {/* Mobile-first quick actions */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/service-booking"
              className="bg-orange-500 text-white p-4 rounded-xl flex items-center justify-center hover:bg-orange-600 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              View Bookings
            </Link>
            <Link
              to="/orders"
              className="bg-blue-500 text-white p-4 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Orders
            </Link>
          </div>
        </motion.div>

        {/* Service Categories Management */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Services</h2>
            <button
              onClick={() => setShowAddCategory(true)}
              className="bg-orange-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          {serviceCategories.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services added</h3>
              <p className="text-gray-500 mb-4">Add service categories to start receiving bookings</p>
              <button
                onClick={() => setShowAddCategory(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Your First Service
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {serviceCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.category.name}</h4>
                        <p className="text-sm text-gray-600">{category.category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category.current_status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.current_status}
                      </span>
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price Range:</span>
                      <p className="font-medium text-gray-900">
                        ₹{category.price_from || 0} - ₹{category.price_to || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Emergency:</span>
                      <p className="font-medium text-gray-900">
                        {category.emergency_available ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Mobile-first recent bookings */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link
              to="/service-booking"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500">You'll see your service bookings here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    {getServiceIcon(booking.service_category)}
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{booking.service_description}</h4>
                      <p className="text-xs text-gray-600">{booking.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">₹{booking.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Mobile-first performance metrics */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-600">Completion Rate</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Service Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Service Category</h3>
              <button
                onClick={() => setShowAddCategory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const categoryId = formData.get('categoryId');
              const priceFrom = formData.get('priceFrom');
              const priceTo = formData.get('priceTo');
              addServiceCategory(categoryId, priceFrom, priceTo);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                  <select
                    name="categoryId"
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price From (₹)</label>
                    <input
                      type="number"
                      name="priceFrom"
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price To (₹)</label>
                    <input
                      type="number"
                      name="priceTo"
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Service Category</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updateData = {
                current_status: formData.get('status'),
                price_from: parseFloat(formData.get('priceFrom')) || null,
                price_to: parseFloat(formData.get('priceTo')) || null,
                emergency_available: formData.get('emergency') === 'on'
              };
              updateServiceCategory(editingCategory.id, updateData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue={editingCategory.current_status}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price From (₹)</label>
                    <input
                      type="number"
                      name="priceFrom"
                      min="0"
                      step="0.01"
                      defaultValue={editingCategory.price_from || ''}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price To (₹)</label>
                    <input
                      type="number"
                      name="priceTo"
                      min="0"
                      step="0.01"
                      defaultValue={editingCategory.price_to || ''}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="emergency"
                    defaultChecked={editingCategory.emergency_available}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Available for emergency services</label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceProviderDashboard;
