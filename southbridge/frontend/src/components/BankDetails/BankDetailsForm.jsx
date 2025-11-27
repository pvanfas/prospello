import React, { useState, useEffect } from 'react';
import { CreditCard, Save, X } from 'lucide-react';

const BankDetailsForm = ({ bank, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (bank) {
            setFormData({
                account_holder_name: bank.account_holder_name || '',
                bank_name: bank.bank_name || '',
                account_number: bank.account_number || '',
                ifsc_code: bank.ifsc_code || ''
            });
        }
    }, [bank]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.account_holder_name.trim()) {
            newErrors.account_holder_name = 'Account holder name is required';
        }
        
        if (!formData.bank_name.trim()) {
            newErrors.bank_name = 'Bank name is required';
        }
        
        if (!formData.account_number.trim()) {
            newErrors.account_number = 'Account number is required';
        } else if (!/^\d{9,18}$/.test(formData.account_number)) {
            newErrors.account_number = 'Account number must be 9-18 digits';
        }
        
        if (!formData.ifsc_code.trim()) {
            newErrors.ifsc_code = 'IFSC code is required';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code.toUpperCase())) {
            newErrors.ifsc_code = 'Invalid IFSC code format';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Error saving bank details:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Holder Name *
                    </label>
                    <input
                        type="text"
                        value={formData.account_holder_name}
                        onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 ${
                            errors.account_holder_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter account holder name"
                    />
                    {errors.account_holder_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.account_holder_name}</p>
                    )}
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bank Name *
                    </label>
                    <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => handleInputChange('bank_name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 ${
                            errors.bank_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter bank name"
                    />
                    {errors.bank_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.bank_name}</p>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Number *
                    </label>
                    <input
                        type="text"
                        value={formData.account_number}
                        onChange={(e) => handleInputChange('account_number', e.target.value.replace(/\D/g, ''))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 font-mono ${
                            errors.account_number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter account number"
                        maxLength={18}
                    />
                    {errors.account_number && (
                        <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>
                    )}
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        IFSC Code *
                    </label>
                    <input
                        type="text"
                        value={formData.ifsc_code}
                        onChange={(e) => handleInputChange('ifsc_code', e.target.value.toUpperCase())}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 font-mono ${
                            errors.ifsc_code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter IFSC code"
                        maxLength={11}
                    />
                    {errors.ifsc_code && (
                        <p className="text-red-500 text-xs mt-1">{errors.ifsc_code}</p>
                    )}
                </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : (bank ? 'Update Bank' : 'Add Bank')}
                </button>
            </div>
        </form>
    );
};

export default BankDetailsForm;