import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { useToast } from '../Toast';
import api from '../../services/api';

const BrokerProfileModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialEmail = '', 
  initialPhone = '' 
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    agency_name: '',
    gst_number: '',
    pan_number: '',

  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        agency_name: '',
        gst_number: '',
        pan_number: '',
      });
      setErrors({});
      setFocusedField('');
    }
  }, [isOpen, initialEmail, initialPhone]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.agency_name.trim()) {
      newErrors.agency_name = 'Agency name is required';
    }

    // GST validation: 15 characters, alphanumeric, specific pattern
    if (formData.gst_number && formData.gst_number.trim() !== "") {
      const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (formData.gst_number.length !== 15) {
        newErrors.gst_number = 'GST number must be 15 characters';
      } else if (!gstPattern.test(formData.gst_number)) {
        newErrors.gst_number = 'GST number format is invalid';
      }
    }

    // PAN validation: 10 characters, specific pattern
    if (formData.pan_number && formData.pan_number.trim() !== "") {
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (formData.pan_number.length !== 10) {
        newErrors.pan_number = 'PAN number must be 10 characters';
      } else if (!panPattern.test(formData.pan_number)) {
        newErrors.pan_number = 'PAN number format is invalid';
      }
    }

    setErrors(newErrors);
    showToast('error', newErrors.agency_name || newErrors.gst_number || newErrors.pan_number || 'Please fix the errors in the form.');
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
  try {
    // Send null for empty GST/PAN
    const payload = {
      ...formData,
      gst_number: formData.gst_number && formData.gst_number.trim() !== "" ? formData.gst_number : null,
      pan_number: formData.pan_number && formData.pan_number.trim() !== "" ? formData.pan_number : null,
    };

    const response = await api.post('/v1/profile/broker/', payload);
    if (response.status === 201) {
      setIsSubmitting(false);
      onClose();
      showToast('success', '✅ Profile completed successfully!');
      onSuccess(payload);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    setIsSubmitting(false);
    showToast('error', 'Failed to save profile. Please try again.');
  }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const inputVariants = {
    focused: { 
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    unfocused: { 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Complete Your Broker Profile
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    We need this info to verify your account and get you started.
                  </p>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 pt-3 space-y-4">
                {/* Agency Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agency Name *
                  </label>
                  <motion.input
                    variants={inputVariants}
                    animate={focusedField === 'agency_name' ? 'focused' : 'unfocused'}
                    type="text"
                    value={formData.agency_name}
                    onChange={(e) => handleInputChange('agency_name', e.target.value)}
                    onFocus={() => setFocusedField('agency_name')}
                    onBlur={() => setFocusedField('')}
                    onKeyPress={(e) => handleKeyPress(e, 'agency_name')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all ${
                      errors.agency_name
                        ? 'border-red-300 focus:border-red-500'
                        : focusedField === 'agency_name'
                        ? 'border-[#FF6B35]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter your agency name"
                  />
                  {errors.agency_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.agency_name}</p>
                  )}
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <motion.input
                    variants={inputVariants}
                    animate={focusedField === 'gst_number' ? 'focused' : 'unfocused'}
                    type="text"
                    value={formData.gst_number}
                    onChange={(e) => handleInputChange('gst_number', e.target.value)}
                    onFocus={() => setFocusedField('gst_number')}
                    onBlur={() => setFocusedField('')}
                    onKeyPress={(e) => handleKeyPress(e, 'gst_number')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all ${
                      focusedField === 'gst_number'
                        ? 'border-[#FF6B35]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter GST number (optional)"
                  />
                </div>

                {/* PAN Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number
                  </label>
                  <motion.input
                    variants={inputVariants}
                    animate={focusedField === 'pan_number' ? 'focused' : 'unfocused'}
                    type="text"
                    value={formData.pan_number}
                    onChange={(e) => handleInputChange('pan_number', e.target.value)}
                    onFocus={() => setFocusedField('pan_number')}
                    onBlur={() => setFocusedField('')}
                    onKeyPress={(e) => handleKeyPress(e, 'pan_number')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all ${
                      focusedField === 'pan_number'
                        ? 'border-[#FF6B35]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter PAN number (optional)"
                  />
                </div>

                

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 mb-16 sm:mb-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:order-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="sm:order-1 sm:flex-1 w-full bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#E55A2B] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save & Continue'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BrokerProfileModal;