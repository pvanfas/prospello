import React, { useState } from 'react';
import { CreditCard, Plus, ArrowRight } from 'lucide-react';

const WithdrawSection = ({ onAddBank, onWithdraw, banks = [] }) => {
    const [selectedBank, setSelectedBank] = useState(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleWithdraw = async () => {
        if (!selectedBank || !amount) {
            alert('Please select a bank and enter amount');
            return;
        }

        if (parseFloat(amount) <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        setIsProcessing(true);
        try {
            await onWithdraw(selectedBank.id, parseFloat(amount));
            setAmount('');
            setSelectedBank(null);
        } catch (error) {
            console.error('Withdrawal failed:', error);
            alert('Withdrawal failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Bank Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Bank Account
                </label>
                <div className="space-y-2">
                    {banks.map((bank) => (
                        <div
                            key={bank.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedBank?.id === bank.id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedBank(bank)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 p-2 rounded-lg">
                                        <CreditCard className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{bank.account_holder_name}</p>
                                        <p className="text-sm text-gray-600">{bank.bank_name} - {bank.account_number}</p>
                                    </div>
                                </div>
                                {bank.is_default && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                        Default
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <button
                    onClick={onAddBank}
                    className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Bank Account
                </button>
            </div>

            {/* Amount Input */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Withdrawal Amount
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        ₹
                    </span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                        placeholder="Enter amount to withdraw"
                        min="1"
                        step="0.01"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Minimum withdrawal: ₹100
                </p>
            </div>

            {/* Withdraw Button */}
            <button
                onClick={handleWithdraw}
                disabled={!selectedBank || !amount || isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <ArrowRight className="w-5 h-5" />
                        Withdraw Funds
                    </>
                )}
            </button>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Withdrawals are processed within 1-2 business days. 
                    Please ensure your bank details are correct.
                </p>
            </div>
        </div>
    );
};

export default WithdrawSection;