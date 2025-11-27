import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { walletAPI } from '../../services/api';
import {
  MapPin,
  Star,
  Weight,
  Truck,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  User,
  Edit3,
  Navigation,
  Route,
  Plus,
  X,
  FileText,
  Shield,
  CreditCard,
  Smartphone,
  Camera,
  Save,
  AlertCircle,
  Wallet,
  TrendingUp,
  Copy,
  Check,
  ChevronRight,
  Car,
  Building,
  Wrench,
  Calendar,
  Award,
  DollarSign
} from 'lucide-react';
import { useSelector } from 'react-redux';
import BEDCard from '../BED/BEDCard';

const ServiceProviderProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Enhanced service provider data state
  const [serviceProviderData, setServiceProviderData] = useState({
    profile: {
      name: user?.username || "Service Provider",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      status: "Available",
      rating: 0,
      totalBookings: 0,
      city: "Unknown",
      state: "Unknown",
      verified: false,
      phone: user?.phone_number || "",
      referCode: user?.refercode || ""
    },
    business: {
      name: "",
      type: "",
      gst: "",
      pan: "",
      experience: 0,
      serviceAreas: "",
      description: ""
    },
    services: {
      categories: [],
      totalServices: 0,
      activeServices: 0,
      completedServices: 0,
      status: "Available"
    },
    wallet: {
      balance: 0,
      lastPayout: "Never",
      pendingAmount: 0,
      currency: "INR"
    },
    payment: {
      method: "",
      accountType: "",
      accountNumber: "",
      verified: false
    }
  });

  // UI state
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    certificate_type: '',
    file: null
  });

  const getStatusColor = (status, type) => {
    const colors = {
      status: {
        Available: "bg-green-500",
        Busy: "bg-yellow-500",
        Offline: "bg-red-500",
      },
      verification: {
        Verified: "bg-blue-500",
        Pending: "bg-yellow-500",
        Rejected: "bg-red-500",
      },
    };
    return colors[type][status] || "bg-gray-500";
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch complete service provider profile data with wallet
      const response = await api.get('/v1/service-provider/profile/complete/');
      console.table(response.data);

      if (response.status === 200) {
        const data = response.data;
        
        // Determine payment method based on available fields
        let paymentMethod = "";
        let accountType = "";
        let accountNumber = "";
        
        if (data.upi_id) {
          paymentMethod = "UPI";
          accountType = "Google Pay";
          accountNumber = data.upi_id;
        } else if (data.bank_account_number && data.ifsc_code && data.account_holder_name) {
          paymentMethod = "Bank";
          accountType = "Bank Account";
          accountNumber = `****${data.bank_account_number.slice(-4)}`;
        }

        // Update service provider data with enhanced structure
        setServiceProviderData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            name: data.username || user?.username || "Service Provider",
            status: data.status || "Available",
            rating: data.rating || 0,
            totalBookings: data.total_bookings || 0,
            city: data.current_city || "Unknown",
            state: data.current_state || "Unknown",
            verified: data.verification_status === "verified",
            phone: data.phone_number || user?.phone_number || "",
            referCode: data.refercode || user?.refercode || ""
          },
          business: {
            name: data.business_name || "",
            type: data.business_type || "",
            gst: data.gst_number || "",
            pan: data.pan_number || "",
            experience: data.experience_years || 0,
            serviceAreas: data.service_areas || "",
            description: data.description || ""
          },
          services: {
            categories: data.service_categories || [],
            totalServices: data.total_services || 0,
            activeServices: data.active_services || 0,
            completedServices: data.completed_services || 0,
            status: data.status === "available" ? "Available" : "Busy"
          },
          wallet: {
            balance: data.wallet?.balance || 0,
            lastPayout: "Oct 10, 2025", // This would come from wallet history
            pendingAmount: 0, // This would be calculated from pending transactions
            currency: "INR"
          },
          payment: {
            method: paymentMethod,
            accountType: accountType,
            accountNumber: accountNumber,
            verified: data.verification_status === "verified"
          }
        }));
        
        // Set certificates
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error("Error fetching service provider data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions
  const handleCopyReferCode = () => {
    navigator.clipboard.writeText(serviceProviderData.profile.referCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  const StatusBadge = ({ status, verified }) => (
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === 'Available' 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}>
        {status}
      </span>
      {verified && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full border border-blue-200">
          <CheckCircle className="w-3 h-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Verified</span>
        </div>
      )}
    </div>
  );

  const ProgressBar = ({ current, max, label }) => {
    const percentage = (current / max) * 100;
    const getColor = () => {
      if (percentage < 50) return 'bg-green-500';
      if (percentage < 80) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className="mt-3">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-gray-700">{label}</span>
          <span className="text-gray-900">{current} / {max} services</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Service Completion</span>
          <span className="font-semibold">{percentage.toFixed(0)}%</span>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile-first responsive design */}
      <motion.div
        className="px-4 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={cardVariants} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Provider Profile</h1>
          <p className="text-gray-600">Manage your business profile and services</p>
        </motion.div>

        {/* Mobile-first grid - single column on mobile, responsive on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* 1. Service Provider Overview Card */}
          <motion.div 
            variants={cardVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300 lg:col-span-2"
          >
            <div className="flex items-start gap-4 mb-4">
              <img 
                src={serviceProviderData.profile.avatar} 
                alt={serviceProviderData.profile.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-orange-200 shadow-sm"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{serviceProviderData.profile.name}</h2>
                <StatusBadge status={serviceProviderData.profile.status} verified={serviceProviderData.profile.verified} />
              </div>
              <User className="w-6 h-6 text-orange-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{serviceProviderData.profile.rating}</div>
                  <div className="text-xs text-gray-600">{serviceProviderData.profile.totalBookings} bookings</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{serviceProviderData.profile.city}</div>
                  <div className="text-xs text-gray-600">{serviceProviderData.profile.state}</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleNavigation('/profile')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              View Full Profile
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* 2. Business Info Card */}
          <motion.div 
            variants={cardVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Business Info</h3>
                <p className="text-sm text-gray-600">Your business details</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingBusiness(!isEditingBusiness)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            {isEditingBusiness ? (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={serviceProviderData.business.name}
                    onChange={(e) => setServiceProviderData(prev => ({
                      ...prev,
                      business: { ...prev.business, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <input
                    type="text"
                    value={serviceProviderData.business.type}
                    onChange={(e) => setServiceProviderData(prev => ({
                      ...prev,
                      business: { ...prev.business, type: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="e.g., Mechanic, Towing, Weighbridge"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={serviceProviderData.business.experience}
                    onChange={(e) => setServiceProviderData(prev => ({
                      ...prev,
                      business: { ...prev.business, experience: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Enter years of experience"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingBusiness(false)}
                    className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingBusiness(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Business Name</span>
                  <span className="text-sm font-bold text-gray-900">{serviceProviderData.business.name || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Business Type</span>
                  <span className="text-sm font-bold text-gray-900">{serviceProviderData.business.type || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Experience</span>
                  <span className="text-sm font-bold text-gray-900">{serviceProviderData.business.experience ? `${serviceProviderData.business.experience} years` : "Not specified"}</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => handleNavigation('/business')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              View Business Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* 3. Services & Bookings Card */}
          <motion.div 
            variants={cardVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Services & Bookings</h3>
                <p className="text-sm text-gray-600">Service management</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-3 mb-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Service Categories</span>
                <span className="text-sm font-bold text-gray-900">{serviceProviderData.services.categories.length} categories</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-gray-700">Current Status</span>
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                  {serviceProviderData.services.status}
                </span>
              </div>
            </div>
            
            <ProgressBar 
              current={serviceProviderData.services.completedServices}
              max={serviceProviderData.services.totalServices}
              label="Completed Services"
            />
            
            <button 
              onClick={() => handleNavigation('/service-booking')}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              View Service Bookings
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* 4. Wallet Card - Mobile optimized */}
          <motion.div 
            variants={cardVariants}
            className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 lg:col-span-2 border border-orange-400 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Wallet Balance</h3>
                  <p className="text-sm text-orange-100">Your available funds</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-orange-100 text-lg">₹</span>
                  <span className="text-4xl font-bold text-white">
                    {serviceProviderData.wallet.balance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div>
                    <div className="text-xs text-orange-100 mb-1">Last Payout</div>
                    <div className="text-sm font-semibold text-white">{serviceProviderData.wallet.lastPayout}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-orange-100 mb-1">Pending</div>
                    <div className="text-sm font-semibold text-white">₹{serviceProviderData.wallet.pendingAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleNavigation('/wallet')}
                  className="flex-1 bg-white text-orange-600 font-semibold py-3 px-4 rounded-lg hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  Go to Wallet
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleNavigation('/bank-details')}
                  className="flex-1 bg-white/20 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  Bank Details
                </button>
              </div>
            </div>
          </motion.div>

          {/* 5. BED Card - Mobile optimized */}
          <motion.div variants={cardVariants} className="lg:col-span-2">
            <BEDCard user={{
              ...user,
              refercode: serviceProviderData.profile.referCode || user?.refercode,
              username: serviceProviderData.profile.name || user?.username,
              email: user?.email,
              phone_number: serviceProviderData.profile.phone || user?.phone_number
            }} />
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default ServiceProviderProfile;