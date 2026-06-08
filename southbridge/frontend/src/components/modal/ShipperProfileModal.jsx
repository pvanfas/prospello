import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Building2, Users, Phone, Mail } from 'lucide-react';
import { useToast } from '../Toast';
import api from '../../services/api';

const ShipperProfileModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialPhone = '',
  initialEmail = '',
  isEmailVerified = false 
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    company_name: '', 
  });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');

  // Update form when props change

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
        

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
    });
    setErrors({});
    setFocusedField('');
  };

  const handleSubmit = async() => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      showToast('error', '❌ Please fix the errors in the form.');
      return;
    }
    
    try {
        const response  = await api.post("/v1/profile/shipper/", formData);
        if (response.status === 201) {
            showToast('success', '✅ Profile updated successfully!');
            onSuccess(response.data);
            onClose();
            resetForm();
        }
    } catch (error) {
        showToast('error', '❌ An error occurred while submitting the form.');
    }
    // Close modal first
    
    
    // Show success toast
    // showToast('success', '✅ Profile completed successfully!');
    
    // Call onSuccess callback with form data
    if (onSuccess) {
      onSuccess(formData);
    }
  };

  const handleCancel = () => {
    onClose();
    resetForm();
  };

  const inputClasses = (fieldName, disabled = false) => `
    w-full px-4 py-3 pl-12 border-2 rounded-lg transition-all duration-300
    ${disabled 
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' 
      : 'bg-white text-slate-800'
    }
    placeholder-slate-500
    ${focusedField === fieldName && !disabled
      ? 'border-orange-500 shadow-lg shadow-orange-200 scale-[1.02]' 
      : errors[fieldName] 
        ? 'border-red-600' 
        : 'border-slate-200 hover:border-slate-300'
    }
    focus:outline-none ${!disabled ? 'focus:border-orange-500 focus:shadow-lg focus:shadow-orange-200 focus:scale-[1.02]' : ''}
  `;

  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case 'company_name':
        return <Building2 size={20} className="text-slate-400" />;
      case 'businessType':
        return <Users size={20} className="text-slate-400" />;
      case 'phoneNumber':
        return <Phone size={20} className="text-slate-400" />;
      case 'email':
        return <Mail size={20} className={isEmailVerified ? "text-green-500" : "text-slate-400"} />;
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && handleCancel()}
          >
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full sm:w-full sm:max-w-lg max-h-[95vh] bg-white sm:rounded-xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 sm:px-6 sm:py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                      Complete Your Shipper Profile
                    </h2>
                    <p className="mt-1 text-sm sm:text-base text-slate-600">
                      We need this info to verify your account and get you started.
                    </p>
                  </div>
                  
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-6 sm:py-6 space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-800 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      {getFieldIcon('company_name')}
                    </div>
                    <motion.input
                      type="text"
                      className={inputClasses('company_name')}
                      placeholder="Enter your company name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      onFocus={() => setFocusedField('company_name')}
                      onBlur={() => setFocusedField('')}
                      animate={focusedField === 'company_name' ? {
                        scale: 1.02
                      } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  {errors.company_name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.company_name}
                    </motion.p>
                  )}
                </div>

                </div>

              {/* Footer Buttons */}
              <div className="bg-white border-t border-slate-200 p-6 mb-16 sm:mb-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ backgroundColor: '#FF6B35' }}
                    className="w-full sm:flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg hover:bg-orange-600 order-2 sm:order-1"
                  >
                    Save & Continue
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors duration-200 order-1 sm:order-2"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShipperProfileModal;
