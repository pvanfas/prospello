import React, { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BankDetailsForm from '../components/BankDetails/BankDetailsForm';
import { bankDetailsAPI } from '../services/bankDetailsAPI';

const BankAddPage = () => {
    const navigate = useNavigate();

    const handleBankAdded = async (bankData) => {
        try {
            await bankDetailsAPI.createBankDetails(bankData);
            alert('Bank added successfully!');
            navigate('/bank-details');
        } catch (error) {
            console.error('Error adding bank:', error);
            alert('Failed to add bank details. Please try again.');
        }
    };

    const handleCancel = () => {
        navigate('/bank-details');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
                <div className="max-w-5xl mx-auto px-4 py-5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/bank-details')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Add Bank Account</h1>
                            <p className="text-sm text-slate-300 mt-1">Add a new bank account for withdrawals</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 md:col-span-2 border border-gray-100">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Bank Details</h3>
                                <p className="text-sm text-gray-600">Enter your bank account information</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <CreditCard className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        
                        <BankDetailsForm 
                            bank={null}
                            onSave={handleBankAdded}
                            onCancel={handleCancel}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BankAddPage;
