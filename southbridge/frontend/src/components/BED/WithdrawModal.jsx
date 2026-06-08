import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { walletAPI } from '../../services/api';
import {
    X,
    AlertCircle,
    CheckCircle,
    Loader,
    DollarSign,
    CreditCard,
    Smartphone
} from 'lucide-react';

const WithdrawModal = ({ isOpen, onClose, walletBalance, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
        upi_id: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' or 'upi'

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        
        if (parseFloat(amount) > walletBalance) {
            setError('Amount cannot exceed your wallet balance');
            return;
        }
        
        if (paymentMethod === 'bank') {
            if (!bankDetails.account_holder_name || !bankDetails.account_number || 
                !bankDetails.ifsc_code || !bankDetails.bank_name) {
                setError('Please fill all bank details');
                return;
            }
        } else if (paymentMethod === 'upi') {
            if (!bankDetails.upi_id) {
                setError('Please enter your UPI ID');
                return;
            }
        }
        
        try {
            setIsLoading(true);
            setError('');
            
            const withdrawData = {
                amount: parseFloat(amount),
                payment_method: paymentMethod,
                ...bankDetails
            };
            
            const response = await walletAPI.withdraw(withdrawData);
            
            if (response.status === 200) {
                setSuccess('Withdrawal request submitted successfully!');
                setTimeout(() => {
                    onSuccess && onSuccess();
                    handleClose();
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit withdrawal request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setBankDetails({
            account_holder_name: '',
            account_number: '',
            ifsc_code: '',
            bank_name: '',
            upi_id: ''
        });
        setError('');
        setSuccess('');
        setPaymentMethod('bank');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
                        <p className="text-sm text-gray-600">Transfer money to your account</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Available Balance */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 mb-4 border border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-medium text-orange-700 mb-1">Available Balance</div>
                                <div className="text-lg font-bold text-orange-900">
                                    ₹{walletBalance.toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <DollarSign className="w-4 h-4 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Withdrawal Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                min="1"
                                max={walletBalance}
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            {[500, 1000, 2000, 5000].map((quickAmount) => (
                                <button
                                    key={quickAmount}
                                    onClick={() => setAmount(quickAmount.toString())}
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    ₹{quickAmount}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setPaymentMethod('bank')}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    paymentMethod === 'bank'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <CreditCard className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                                <div className="text-xs font-medium">Bank Transfer</div>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    paymentMethod === 'upi'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Smartphone className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                                <div className="text-xs font-medium">UPI</div>
                            </button>
                        </div>
                    </div>

                    {/* Payment Details Form */}
                    {paymentMethod === 'bank' ? (
                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.account_holder_name}
                                    onChange={(e) => setBankDetails(prev => ({ ...prev, account_holder_name: e.target.value }))}
                                    placeholder="Enter full name"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.account_number}
                                    onChange={(e) => setBankDetails(prev => ({ ...prev, account_number: e.target.value }))}
                                    placeholder="Enter account number"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.ifsc_code}
                                    onChange={(e) => setBankDetails(prev => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))}
                                    placeholder="Enter IFSC code"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    value={bankDetails.bank_name}
                                    onChange={(e) => setBankDetails(prev => ({ ...prev, bank_name: e.target.value }))}
                                    placeholder="Enter bank name"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                UPI ID
                            </label>
                            <input
                                type="text"
                                value={bankDetails.upi_id}
                                onChange={(e) => setBankDetails(prev => ({ ...prev, upi_id: e.target.value }))}
                                placeholder="Enter UPI ID (e.g., user@paytm)"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                        </div>
                    )}

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-3 h-3 text-red-600" />
                                <span className="text-xs text-red-700">{error}</span>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-700">{success}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 py-2.5 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="w-3 h-3 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default WithdrawModal;
