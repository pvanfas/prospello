import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Phone, Mail, Edit2, Loader2, FileText, Hash, Save, X, AlertCircle, CheckCircle, Clock, XCircle, Upload, Trash2, Award, Download, Eye, X as CloseIcon, Wallet, TrendingUp, CreditCard, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { profileAPI, walletAPI } from '../../services/api';
import api from '../../services/api';
import BEDCard from '../BED/BEDCard';

const BrokerProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    agency_name: '',
    gst_number: '',
    pan_number: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    certificate_type: '',
    file: null
  });
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [walletData, setWalletData] = useState({
    balance: 0,
    total_earned: 0,
    total_withdrawn: 0
  });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getBrokerProfile();
        setProfileData(response.data);
        setCertificates(response.data.certificates || []);
        setEditForm({
          agency_name: response.data.agency_name || '',
          gst_number: response.data.gst_number || '',
          pan_number: response.data.pan_number || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        // Set fallback data from user state
        setProfileData({
          agency_name: user.company || 'Not set',
          gst_number: null,
          pan_number: null,
          user: {
            username: user.username,
            email: user.email,
            phone_number: user.phone_number
          }
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchWalletData = async () => {
      try {
        const walletResponse = await walletAPI.getWallet();
        setWalletData(walletResponse.data);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        // Set default wallet data if API fails
        setWalletData({
          balance: 0,
          total_earned: 0,
          total_withdrawn: 0
        });
      }
    };

    fetchProfileData();
    fetchWalletData();
  }, [user]);

  // Validation functions
  const validateGST = (gst) => {
    if (!gst) return null; // GST is optional
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/;
    if (gst.length !== 15) {
      return 'GST number must be 15 characters';
    }
    if (!gstPattern.test(gst)) {
      return 'Invalid GST number format';
    }
    return null;
  };

  const validatePAN = (pan) => {
    if (!pan) return null; // PAN is optional
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (pan.length !== 10) {
      return 'PAN number must be 10 characters';
    }
    if (!panPattern.test(pan)) {
      return 'Invalid PAN number format';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!editForm.agency_name.trim()) {
      newErrors.agency_name = 'Agency name is required';
    }
    
    const gstError = validateGST(editForm.gst_number);
    if (gstError) {
      newErrors.gst_number = gstError;
    }
    
    const panError = validatePAN(editForm.pan_number);
    if (panError) {
      newErrors.pan_number = panError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
    setSuccessMessage('');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      
      const response = await profileAPI.updateBrokerProfile(editForm);
      setProfileData(response.data);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setSuccessMessage('');
    setEditForm({
      agency_name: profileData?.agency_name || '',
      gst_number: profileData?.gst_number || '',
      pan_number: profileData?.pan_number || ''
    });
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get verification status badge
  const getVerificationBadge = (status) => {
    const badges = {
      pending: {
        icon: Clock,
        text: 'Pending Verification',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200'
      },
      verified: {
        icon: CheckCircle,
        text: 'Verified',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      },
      rejected: {
        icon: XCircle,
        text: 'Verification Rejected',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <div className={`flex items-center px-3 py-1.5 rounded-full border ${badge.bgColor} ${badge.borderColor}`}>
        <Icon className={`w-4 h-4 mr-2 ${badge.textColor}`} />
        <span className={`text-sm font-medium ${badge.textColor}`}>{badge.text}</span>
      </div>
    );
  };

  // Certificate handling functions
  const handleCertificateFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCertificate(prev => ({
          ...prev,
          file: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCertificate = async () => {
    if (!newCertificate.certificate_type || !newCertificate.file) {
      setError('Please select certificate type and file');
      return;
    }

    try {
      setIsUploadingCert(true);
      const response = await api.post('/v1/profile/certificate/', {
        certificate_type: newCertificate.certificate_type,
        certificate: newCertificate.file.split(',')[1] // Remove data:image/...;base64, prefix
      });

      setCertificates([...certificates, response.data]);
      setShowCertModal(false);
      setNewCertificate({ certificate_type: '', file: null });
      setError(null);
      setSuccessMessage('Certificate uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading certificate:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to upload certificate');
      }
    } finally {
      setIsUploadingCert(false);
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      await api.delete(`/v1/profile/certificate/${certId}`);
      setCertificates(certificates.filter(cert => cert.id !== certId));
      setSuccessMessage('Certificate deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError('Failed to delete certificate');
    }
  };

  const getCertificateTypeName = (type) => {
    const typeNames = {
      'gst_certificate': 'GST Certificate',
      'pan_card': 'PAN Card',
      'trade_license': 'Trade License',
      'incorporation_certificate': 'Incorporation Certificate',
      'msme_certificate': 'MSME Certificate',
      'iso_certificate': 'ISO Certificate',
      'other': 'Other'
    };
    return typeNames[type] || type;
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B35' }} />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const contactItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };


  return (
    <div className=" bg-gray-50" style={{ backgroundColor: '#F9FAFB' }}>
      <motion.div
        className="container mx-auto px-4 py-6 max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* BED Refer & Earn Card */}
        <BEDCard user={user} />

        {/* Wallet Card */}
        <motion.div
          className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl shadow-lg p-6 mb-6 hover:shadow-2xl transition-all duration-300 border border-teal-400 relative overflow-hidden"
          variants={cardVariants}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Wallet Balance</h3>
                <p className="text-sm text-teal-100">Your available funds</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="mb-5">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-teal-100 text-lg">₹</span>
                <span className="text-5xl font-bold text-white">
                  {walletData.balance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div>
                  <div className="text-xs text-teal-100 mb-1">Total Earned</div>
                  <div className="text-sm font-semibold text-white">₹{walletData.total_earned.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-teal-100 mb-1">Total Withdrawn</div>
                  <div className="text-sm font-semibold text-white">₹{walletData.total_withdrawn.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => window.location.href = '/wallet'}
                className="flex-1 bg-white text-teal-600 font-semibold py-4 px-6 rounded-xl hover:bg-teal-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-5 h-5" />
                Go to Wallet
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => window.location.href = '/bank-details'}
                className="flex-1 bg-white/20 text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <CreditCard className="w-5 h-5" />
                Bank Details
              </button>
            </div>
          </div>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
          variants={cardVariants}
        >
          <div className="flex flex-col items-center text-center">
            {/* Profile Picture Placeholder */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4"
              style={{ backgroundColor: '#FF6B35' }}
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'B'}
            </div>
            
            {/* Username */}
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
              {user.username}
            </h1>
            
            {/* Agency Name */}
            <div className="flex items-center text-base mb-3" style={{ color: '#6B7280' }}>
              <Building className="w-4 h-4 mr-2" />
              {profileData?.agency_name || 'Not set'}
            </div>

            {/* Verification Status Badge */}
            {profileData?.status && getVerificationBadge(profileData.status)}
          </div>
        </motion.div>

        {/* Contact Info Card */}
        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
          variants={cardVariants}
        >
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>
              Contact Information
            </h2>
            
            <div className="space-y-1">
              {/* Email */}
              <motion.div
                className="flex items-center py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                variants={contactItemVariants}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                  style={{ backgroundColor: '#FF6B35', opacity: 0.1 }}
                >
                  <Mail className="w-5 h-5" style={{ color: '#FF6B35' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                    Email
                  </p>
                  <p className="text-base" style={{ color: '#1F2937' }}>
                    {user.email}
                  </p>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="border-b" style={{ borderColor: '#E5E7EB' }}></div>

              {/* Phone */}
              <motion.div
                className="flex items-center py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                variants={contactItemVariants}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                  style={{ backgroundColor: '#FF6B35', opacity: 0.1 }}
                >
                  <Phone className="w-5 h-5" style={{ color: '#FF6B35' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                    Phone Number
                  </p>
                  <p className="text-base" style={{ color: '#1F2937' }}>
                    {user.phone_number}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Business Information Card */}
        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
          variants={cardVariants}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>
                Business Information
              </h2>
              {!isEditing && (
                <motion.button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: '#FF6B35', 
                    color: 'white',
                    opacity: 0.9
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </motion.button>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center"
              >
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-green-700 text-sm">{successMessage}</span>
              </motion.div>
            )}
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.agency_name}
                    onChange={(e) => handleInputChange('agency_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.agency_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter agency name"
                  />
                  {errors.agency_name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.agency_name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.gst_number}
                    onChange={(e) => handleInputChange('gst_number', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.gst_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                  {errors.gst_number && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.gst_number}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Format: 22AAAAA0000A1Z5 (15 characters)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                    PAN Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.pan_number}
                    onChange={(e) => handleInputChange('pan_number', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.pan_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="AAAAA0000A"
                    maxLength={10}
                  />
                  {errors.pan_number && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.pan_number}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Format: AAAAA0000A (10 characters)
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <motion.button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center"
                    style={{ backgroundColor: '#FF6B35' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 py-2 px-4 rounded-lg font-medium border transition-colors disabled:opacity-50 flex items-center justify-center"
                    style={{ 
                      borderColor: '#E5E7EB',
                      color: '#6B7280'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Agency Name */}
                <div className="flex items-center py-3 px-2 rounded-lg">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: '#FF6B35', opacity: 0.1 }}
                  >
                    <Building className="w-5 h-5" style={{ color: '#FF6B35' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                      Agency Name
                    </p>
                    <p className="text-base" style={{ color: '#1F2937' }}>
                      {profileData?.agency_name || 'Not set'}
                    </p>
                  </div>
                </div>
                
                {/* GST Number - Always show */}
                <div className="border-b" style={{ borderColor: '#E5E7EB' }}></div>
                <div className="flex items-center py-3 px-2 rounded-lg">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: '#FF6B35', opacity: 0.1 }}
                  >
                    <Hash className="w-5 h-5" style={{ color: '#FF6B35' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                      GST Number
                    </p>
                    <p className="text-base" style={{ color: '#1F2937' }}>
                      {profileData?.gst_number || (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </p>
                  </div>
                  {profileData?.gst_number && (
                    <div className="ml-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                
                {/* PAN Number - Always show */}
                <div className="border-b" style={{ borderColor: '#E5E7EB' }}></div>
                <div className="flex items-center py-3 px-2 rounded-lg">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: '#FF6B35', opacity: 0.1 }}
                  >
                    <FileText className="w-5 h-5" style={{ color: '#FF6B35' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                      PAN Number
                    </p>
                    <p className="text-base" style={{ color: '#1F2937' }}>
                      {profileData?.pan_number || (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </p>
                  </div>
                  {profileData?.pan_number && (
                    <div className="ml-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Certificates Section - Only show if verified */}
        {profileData?.status === 'verified' && (
          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
            variants={cardVariants}
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-2" style={{ color: '#FF6B35' }} />
                  <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>
                    Certificates
                  </h2>
                </div>
                <motion.button
                  onClick={() => setShowCertModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: '#FF6B35', 
                    color: 'white',
                    opacity: 0.9
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </motion.button>
              </div>

              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                  <p className="text-gray-500">No certificates uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-1">Upload your business certificates to build trust</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E7EB' }}>
                      <div 
                        className="flex items-center flex-1 cursor-pointer"
                        onClick={() => setViewingCertificate(cert)}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: '#FF6B35', opacity: 0.1 }}
                        >
                          <FileText className="w-5 h-5" style={{ color: '#FF6B35' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
                            {getCertificateTypeName(cert.certificate_type)}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7280' }}>
                            Uploaded {new Date(cert.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingCertificate(cert)}
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View certificate"
                        >
                          <Eye className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        </button>
                        <a
                          href={cert.certificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Download certificate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-4 h-4" style={{ color: '#6B7280' }} />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCertificate(cert.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete certificate"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Certificate Viewer Modal */}
        {viewingCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewingCertificate(null)}>
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#1F2937' }}>
                    {getCertificateTypeName(viewingCertificate.certificate_type)}
                  </h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    Uploaded {new Date(viewingCertificate.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={viewingCertificate.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </a>
                  <button
                    onClick={() => setViewingCertificate(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <CloseIcon className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)] bg-gray-50">
                {viewingCertificate.certificate.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={viewingCertificate.certificate}
                    className="w-full h-[70vh] border-0"
                    title="Certificate PDF"
                  />
                ) : (
                  <img
                    src={viewingCertificate.certificate}
                    alt={getCertificateTypeName(viewingCertificate.certificate_type)}
                    className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Certificate Upload Modal */}
        {showCertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-lg font-semibold" style={{ color: '#1F2937' }}>
                  Upload Certificate
                </h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                    Certificate Type *
                  </label>
                  <select
                    value={newCertificate.certificate_type}
                    onChange={(e) => setNewCertificate({...newCertificate, certificate_type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <option value="">Select type...</option>
                    <option value="gst_certificate">GST Certificate</option>
                    <option value="pan_card">PAN Card</option>
                    <option value="trade_license">Trade License</option>
                    <option value="incorporation_certificate">Incorporation Certificate</option>
                    <option value="msme_certificate">MSME Certificate</option>
                    <option value="iso_certificate">ISO Certificate</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                    Certificate File *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleCertificateFileChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#E5E7EB' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex space-x-3" style={{ borderColor: '#E5E7EB' }}>
                <button
                  onClick={() => {
                    setShowCertModal(false);
                    setNewCertificate({ certificate_type: '', file: null });
                  }}
                  disabled={isUploadingCert}
                  className="flex-1 py-2 px-4 rounded-lg font-medium border transition-colors disabled:opacity-50"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#6B7280'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadCertificate}
                  disabled={isUploadingCert || !newCertificate.certificate_type || !newCertificate.file}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  {isUploadingCert ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            variants={cardVariants}
          >
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BrokerProfile;
