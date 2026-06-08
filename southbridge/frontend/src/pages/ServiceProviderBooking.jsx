import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Star,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Wrench,
  Truck
} from "lucide-react";
import api from "../services/api";
import { useToast } from "../components/Toast";

const ServiceProviderBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const { showToast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/service-provider/bookings");
      if (response.status === 200) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showToast("error", "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingStatusUpdate = async (bookingId, status) => {
    try {
      const response = await api.patch(`/v1/service-provider/bookings/${bookingId}/status`, {
        status
      });
      
      if (response.status === 200) {
        showToast("success", `Booking ${status} successfully`);
        fetchBookings(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      showToast("error", "Failed to update booking status");
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    // Filter by tab
    if (activeTab === "pending") {
      filtered = filtered.filter(booking => booking.status === "pending");
    } else if (activeTab === "confirmed") {
      filtered = filtered.filter(booking => booking.status === "confirmed");
    } else if (activeTab === "completed") {
      filtered = filtered.filter(booking => booking.status === "completed");
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter(booking => booking.status === "cancelled");
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.service_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.booking_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getServiceIcon = (category) => {
    const name = category?.toLowerCase() || "";
    if (name.includes("mechanic") || name.includes("repair")) {
      return <Wrench className="w-6 h-6 text-blue-500" />;
    } else if (name.includes("towing") || name.includes("tow")) {
      return <Truck className="w-6 h-6 text-orange-500" />;
    } else if (name.includes("emergency") || name.includes("sos")) {
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    } else {
      return <Wrench className="w-6 h-6 text-gray-500" />;
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile-first header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Service Bookings</h1>
            <p className="text-gray-600 text-sm">Manage your service bookings</p>
          </div>
        </div>

        {/* Mobile-first search and filter */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Mobile-first tab navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: "pending", label: "Pending", count: bookings.filter(b => b.status === "pending").length },
            { id: "confirmed", label: "Confirmed", count: bookings.filter(b => b.status === "confirmed").length },
            { id: "completed", label: "Completed", count: bookings.filter(b => b.status === "completed").length },
            { id: "cancelled", label: "Cancelled", count: bookings.filter(b => b.status === "cancelled").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id ? "bg-orange-200 text-orange-800" : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile-first content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchTerm ? "No bookings match your search criteria" : "You don't have any bookings yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                variants={cardVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getServiceIcon(booking.service_category)}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{booking.service_description}</h3>
                      <p className="text-xs text-gray-600">ID: {booking.booking_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="w-3 h-3" />
                    <span className="truncate">{booking.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span className="truncate">{booking.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span className="truncate">{new Date(booking.booking_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600">
                      <strong>Notes:</strong> {booking.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className="font-semibold text-gray-900">₹{booking.amount}</span>
                  </div>
                  
                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookingStatusUpdate(booking.id, "confirmed")}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBookingStatusUpdate(booking.id, "cancelled")}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleBookingStatusUpdate(booking.id, "completed")}
                      className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ServiceProviderBooking;
