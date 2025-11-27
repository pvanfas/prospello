import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Wrench,
  Truck,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Save,
  X,
  Check,
  AlertCircle,
  Users,
  ClipboardList,
  Star,
  Settings,
  BarChart3,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle
} from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

const Service = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState("categories");
  
  // Common state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { showToast } = useToast();

  // Categories state
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    icon_url: "",
    is_emergency: false,
    is_active: true
  });

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Action menu state
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // Providers state
  const [providers, setProviders] = useState([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    categories: { total: 0, active: 0, emergency: 0 },
    providers: { total: 0, verified: 0, pending: 0 },
    bookings: { total: 0, completed: 0, emergency: 0 },
    reviews: { total: 0, average_rating: 0 }
  });

  // Tab configuration
  const tabs = [
    { id: "categories", name: "Categories", icon: Wrench, color: "blue" },
    { id: "providers", name: "Providers", icon: Users, color: "green" },
    { id: "bookings", name: "Bookings", icon: ClipboardList, color: "purple" },
    { id: "reviews", name: "Reviews", icon: Star, color: "yellow" },
    { id: "stats", name: "Statistics", icon: BarChart3, color: "indigo" }
  ];

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case "categories":
          await fetchCategories();
          break;
        case "providers":
          await fetchProviders();
          break;
        case "bookings":
          await fetchBookings();
          break;
        case "reviews":
          await fetchReviews();
          break;
        case "stats":
          await fetchStats();
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      showToast("error", `Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Categories functions
  const fetchCategories = async () => {
    const response = await api.get("/v1/admin/service-categories");
    setCategories(response.data.categories || []);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      let iconUrl = categoryFormData.icon_url;
      
      // If a new file is selected, upload it
      if (selectedFile) {
        iconUrl = await uploadFile(selectedFile);
      }
      
      const categoryData = {
        ...categoryFormData,
        icon_url: iconUrl
      };
      
      const response = await api.post("/v1/admin/service-categories", categoryData);
      setCategories([...categories, response.data]);
      setShowCreateModal(false);
      resetForm();
      showToast("success", "Service category created successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      showToast("error", "Failed to create service category");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      let iconUrl = categoryFormData.icon_url;
      
      // If a new file is selected, upload it
      if (selectedFile) {
        iconUrl = await uploadFile(selectedFile);
      }
      
      const categoryData = {
        ...categoryFormData,
        icon_url: iconUrl
      };
      
      const response = await api.put(`/v1/admin/service-categories/${editingCategory.id}`, categoryData);
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? response.data : cat
      ));
      setShowEditModal(false);
      setEditingCategory(null);
      resetForm();
      showToast("success", "Service category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      showToast("error", "Failed to update service category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    try {
      await api.delete(`/v1/admin/service-categories/${categoryId}`);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      showToast("success", "Service category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast("error", "Failed to delete service category");
    }
  };

  const handleToggleCategoryStatus = async (categoryId) => {
    try {
      const response = await api.patch(`/v1/admin/service-categories/${categoryId}/toggle-status`);
      setCategories(categories.map(cat => 
        cat.id === categoryId ? response.data : cat
      ));
      showToast("success", "Category status updated");
    } catch (error) {
      console.error("Error toggling status:", error);
      showToast("error", "Failed to update category status");
    }
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      icon_url: category.icon_url || "",
      is_emergency: category.is_emergency,
      is_active: category.is_active
    });
    setPreviewUrl(category.icon_url || "");
    setSelectedFile(null);
    setShowEditModal(true);
  };

  // File upload functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast("error", "Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "File size must be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const uploadFile = async (file) => {
    try {
      setUploadingFile(true);
      
      // Convert file to base64
      const base64 = await convertFileToBase64(file);
      
      // Upload to your backend endpoint
      const response = await api.post('/v1/admin/service-categories/upload-icon', {
        image_base64: base64
      });
      
      return response.data.icon_url;
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast("error", "Failed to upload file");
      throw error;
    } finally {
      setUploadingFile(false);
    }
  };

  const resetForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      icon_url: "",
      is_emergency: false,
      is_active: true
    });
    setSelectedFile(null);
    setPreviewUrl("");
  };

  // Action menu functions
  const toggleActionMenu = (categoryId) => {
    setOpenActionMenu(openActionMenu === categoryId ? null : categoryId);
  };

  const closeActionMenu = () => {
    setOpenActionMenu(null);
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenu && !event.target.closest('.action-menu-container')) {
        closeActionMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenu]);

  // Providers functions
  const fetchProviders = async () => {
    const response = await api.get("/v1/admin/service-providers");
    setProviders(response.data.providers || []);
  };

  const handleVerifyProvider = async (providerId) => {
    try {
      await api.patch(`/v1/admin/service-providers/${providerId}/verify`);
      await fetchProviders();
      showToast("success", "Service provider verified");
    } catch (error) {
      console.error("Error verifying provider:", error);
      showToast("error", "Failed to verify provider");
    }
  };

  const handleRejectProvider = async (providerId) => {
    try {
      await api.patch(`/v1/admin/service-providers/${providerId}/reject`);
      await fetchProviders();
      showToast("success", "Service provider rejected");
    } catch (error) {
      console.error("Error rejecting provider:", error);
      showToast("error", "Failed to reject provider");
    }
  };

  // Bookings functions
  const fetchBookings = async () => {
    const response = await api.get("/v1/admin/service-bookings");
    setBookings(response.data.bookings || []);
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/v1/admin/service-bookings/${bookingId}/status`, null, {
        params: { status }
      });
      await fetchBookings();
      showToast("success", "Booking status updated");
    } catch (error) {
      console.error("Error updating booking status:", error);
      showToast("error", "Failed to update booking status");
    }
  };

  // Reviews functions
  const fetchReviews = async () => {
    const response = await api.get("/v1/admin/service-reviews");
    setReviews(response.data.reviews || []);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    try {
      await api.delete(`/v1/admin/service-reviews/${reviewId}`);
      setReviews(reviews.filter(review => review.id !== reviewId));
      showToast("success", "Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast("error", "Failed to delete review");
    }
  };

  // Stats functions
  const fetchStats = async () => {
    const response = await api.get("/v1/admin/service-stats");
    setStats(response.data);
  };

  // Filter functions
  const getFilteredData = () => {
    let data = [];
    switch (activeTab) {
      case "categories":
        data = categories;
        break;
      case "providers":
        data = providers;
        break;
      case "bookings":
        data = bookings;
        break;
      case "reviews":
        data = reviews;
        break;
      default:
        return [];
    }

    return data.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.booking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.review?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  };

  const getCategoryIcon = (category) => {
    if (category.icon_url) {
      return <img src={category.icon_url} alt={category.name} className="w-8 h-8 rounded-lg" />;
    }
    
    const name = category.name.toLowerCase();
    if (name.includes("mechanic") || name.includes("repair")) {
      return <Wrench className="w-8 h-8 text-blue-500" />;
    } else if (name.includes("towing") || name.includes("tow")) {
      return <Truck className="w-8 h-8 text-orange-500" />;
    } else if (name.includes("emergency") || name.includes("sos")) {
      return <AlertTriangle className="w-8 h-8 text-red-500" />;
    } else {
      return <Shield className="w-8 h-8 text-gray-500" />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "categories":
        return renderCategories();
      case "providers":
        return renderProviders();
      case "bookings":
        return renderBookings();
      case "reviews":
        return renderReviews();
      case "stats":
        return renderStats();
      default:
        return null;
    }
  };

  const renderCategories = () => {
    const filteredCategories = getFilteredData();
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Service Categories</h2>
            <p className="text-gray-600 mt-1">Manage service categories for the marketplace</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </motion.button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first service category</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Category
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(category)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      {category.is_emergency && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Emergency
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCategoryStatus(category.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        category.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={category.is_active ? 'Active' : 'Inactive'}
                    >
                      {category.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div className="relative action-menu-container">
                      <button 
                        onClick={() => toggleActionMenu(category.id)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                        title="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* Action Menu - Only show when clicked */}
                      {openActionMenu === category.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              openEditCategoryModal(category);
                              closeActionMenu();
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteCategory(category.id);
                              closeActionMenu();
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProviders = () => {
    const filteredProviders = getFilteredData();
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Service Providers</h2>
            <p className="text-gray-600 mt-1">Manage service providers and their verification status</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-500">No service providers have registered yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{provider.user?.username}</div>
                            <div className="text-sm text-gray-500">{provider.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{provider.business_name}</div>
                        <div className="text-sm text-gray-500">{provider.business_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : provider.verification_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {provider.verification_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {provider.rating || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {provider.verification_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyProvider(provider.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectProvider(provider.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBookings = () => {
    const filteredBookings = getFilteredData();
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Service Bookings</h2>
            <p className="text-gray-600 mt-1">Monitor and manage service bookings</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">No service bookings have been made yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emergency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.booking_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.user?.username}</div>
                        <div className="text-sm text-gray-500">{booking.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.service_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.is_emergency ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Emergency
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReviews = () => {
    const filteredReviews = getFilteredData();
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Service Reviews</h2>
            <p className="text-gray-600 mt-1">Monitor customer reviews and ratings</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">No reviews have been submitted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">by {review.user?.username}</span>
                    </div>
                    <p className="text-gray-900 mb-2">{review.review}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Service Quality: {review.service_quality}/5</span>
                      <span>Response Time: {review.response_time}/5</span>
                      <span>Professionalism: {review.professionalism}/5</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStats = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Service Marketplace Statistics</h2>
          <p className="text-gray-600 mt-1">Overview of service marketplace performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Categories Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.categories.total}</p>
                  <p className="text-xs text-gray-500">{stats.categories.active} active</p>
                </div>
              </div>
            </div>

            {/* Providers Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Providers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.providers.total}</p>
                  <p className="text-xs text-gray-500">{stats.providers.verified} verified</p>
                </div>
              </div>
            </div>

            {/* Bookings Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bookings.total}</p>
                  <p className="text-xs text-gray-500">{stats.bookings.completed} completed</p>
                </div>
              </div>
            </div>

            {/* Reviews Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-500">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.reviews.total}</p>
                  <p className="text-xs text-gray-500">Avg: {stats.reviews.average_rating}/5</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? `border-${tab.color}-500 text-${tab.color}-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

       {/* Create Category Modal */}
       {showCreateModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create Service Category</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mechanic, Towing, Weighbridge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of the service category"
                />
              </div>
              
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Category Icon
                 </label>
                 
                 {/* File Upload Section */}
                 <div className="space-y-3">
                   {/* File Input */}
                   <div className="flex items-center gap-3">
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleFileSelect}
                       className="hidden"
                       id="icon-upload"
                     />
                     <label
                       htmlFor="icon-upload"
                       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                     >
                       <Plus className="w-4 h-4" />
                       {selectedFile ? "Change Icon" : "Upload Icon"}
                     </label>
                     
                     {uploadingFile && (
                       <div className="flex items-center gap-2 text-blue-600">
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                         <span className="text-sm">Uploading...</span>
                       </div>
                     )}
                   </div>
                   
                   {/* Preview */}
                   {previewUrl && (
                     <div className="flex items-center gap-3">
                       <img
                         src={previewUrl}
                         alt="Icon preview"
                         className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                       />
                       <div className="flex-1">
                         <p className="text-sm text-gray-600">Icon Preview</p>
                         {selectedFile && (
                           <p className="text-xs text-gray-500">{selectedFile.name}</p>
                         )}
                       </div>
                       <button
                         type="button"
                         onClick={() => {
                           setSelectedFile(null);
                           setPreviewUrl("");
                         }}
                         className="text-red-600 hover:text-red-800 p-1"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   )}
                   
                   {/* Manual URL Input (Alternative) */}
                   <div className="border-t pt-3">
                     <label className="block text-sm font-medium text-gray-600 mb-1">
                       Or enter icon URL manually
                     </label>
                     <input
                       type="url"
                       value={categoryFormData.icon_url}
                       onChange={(e) => setCategoryFormData({...categoryFormData, icon_url: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="https://example.com/icon.png"
                     />
                   </div>
                 </div>
               </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryFormData.is_emergency}
                    onChange={(e) => setCategoryFormData({...categoryFormData, is_emergency: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Emergency Service</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryFormData.is_active}
                    onChange={(e) => setCategoryFormData({...categoryFormData, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

       {/* Edit Category Modal */}
       {showEditModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Service Category</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Category Icon
                 </label>
                 
                 {/* File Upload Section */}
                 <div className="space-y-3">
                   {/* File Input */}
                   <div className="flex items-center gap-3">
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleFileSelect}
                       className="hidden"
                       id="icon-upload-edit"
                     />
                     <label
                       htmlFor="icon-upload-edit"
                       className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                     >
                       <Plus className="w-4 h-4" />
                       {selectedFile ? "Change Icon" : "Upload New Icon"}
                     </label>
                     
                     {uploadingFile && (
                       <div className="flex items-center gap-2 text-blue-600">
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                         <span className="text-sm">Uploading...</span>
                       </div>
                     )}
                   </div>
                   
                   {/* Preview */}
                   {previewUrl && (
                     <div className="flex items-center gap-3">
                       <img
                         src={previewUrl}
                         alt="Icon preview"
                         className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                       />
                       <div className="flex-1">
                         <p className="text-sm text-gray-600">Icon Preview</p>
                         {selectedFile && (
                           <p className="text-xs text-gray-500">{selectedFile.name}</p>
                         )}
                       </div>
                       <button
                         type="button"
                         onClick={() => {
                           setSelectedFile(null);
                           setPreviewUrl(categoryFormData.icon_url || "");
                         }}
                         className="text-red-600 hover:text-red-800 p-1"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   )}
                   
                   {/* Manual URL Input (Alternative) */}
                   <div className="border-t pt-3">
                     <label className="block text-sm font-medium text-gray-600 mb-1">
                       Or enter icon URL manually
                     </label>
                     <input
                       type="url"
                       value={categoryFormData.icon_url}
                       onChange={(e) => setCategoryFormData({...categoryFormData, icon_url: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                   </div>
                 </div>
               </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryFormData.is_emergency}
                    onChange={(e) => setCategoryFormData({...categoryFormData, is_emergency: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Emergency Service</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryFormData.is_active}
                    onChange={(e) => setCategoryFormData({...categoryFormData, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Update
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Service;