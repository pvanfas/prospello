import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WithdrawSection from '../components/BankDetails/WithdrawSection';
import { bankDetailsAPI } from '../services/bankDetailsAPI';

const BankWithdrawPage = () => {
    const navigate = useNavigate();
    const [banks, setBanks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch banks on component mount
    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            setIsLoading(true);
            const response = await bankDetailsAPI.getBankDetails(1, 10);
            setBanks(response.data.banks);
        } catch (error) {
            console.error('Error fetching banks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async (bankId, amount) => {
        try {
            setIsLoading(true);
            const response = await bankDetailsAPI.createWithdrawal({
                bank_id: bankId,
                amount: amount,
                reason: 'Withdrawal request'
            });
            alert(`Withdrawal request submitted for ₹${amount}. Transaction ID: ${response.data.transaction_id}`);
            navigate('/bank-details');
        } catch (error) {
            console.error('Error creating withdrawal:', error);
            alert('Failed to create withdrawal request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBank = () => {
        navigate('/bank-details/add');
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
                            <h1 className="text-2xl font-bold tracking-tight">Withdraw Funds</h1>
                            <p className="text-sm text-slate-300 mt-1">Withdraw money to your bank account</p>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Withdraw Funds</h3>
                                <p className="text-sm text-gray-600">Select bank account and enter amount</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        
                        <WithdrawSection 
                            banks={banks}
                            onAddBank={handleAddBank}
                            onWithdraw={handleWithdraw}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BankWithdrawPage;
