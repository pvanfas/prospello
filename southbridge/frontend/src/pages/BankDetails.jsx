import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, ArrowLeft, Edit, Trash2, Star, StarOff, TrendingUp, User, CheckCircle, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BankDetailsCard from '../components/BankDetails/BankDetailsCard';
import BankDetailsForm from '../components/BankDetails/BankDetailsForm';
import WithdrawSection from '../components/BankDetails/WithdrawSection';
import { bankDetailsAPI } from '../services/bankDetailsAPI';

const BankDetailsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [showBankForm, setShowBankForm] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [showWithdrawSection, setShowWithdrawSection] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Fetch bank details from API
    const fetchBankDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await bankDetailsAPI.getBankDetails(page, 10);
            setBanks(response.data.banks);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching bank details:', error);
            setError('Failed to fetch bank details');
        } finally {
            setIsLoading(false);
        }
    };

    // Load bank details on component mount
    useEffect(() => {
        fetchBankDetails();
    }, [page]);

    // Bank details handlers
    const handleBankAdded = async (bankData) => {
        try {
            setIsLoading(true);
            const response = await bankDetailsAPI.createBankDetails(bankData);
            setBanks(prev => [...prev, response.data]);
            alert('Bank added successfully!');
            setShowBankForm(false);
        } catch (error) {
            console.error('Error adding bank:', error);
            alert('Failed to add bank details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBankUpdated = async (bankId, bankData) => {
        try {
            setIsLoading(true);
            const response = await bankDetailsAPI.updateBankDetails(bankId, bankData);
            setBanks(prev => prev.map(bank => 
                bank.id === bankId ? response.data : bank
            ));
            alert('Bank updated successfully!');
            setShowBankForm(false);
        } catch (error) {
            console.error('Error updating bank:', error);
            alert('Failed to update bank details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBankDeleted = async (bankId) => {
        if (confirm('Are you sure you want to delete this bank account?')) {
            try {
                setIsLoading(true);
                await bankDetailsAPI.deleteBankDetails(bankId);
                setBanks(prev => prev.filter(bank => bank.id !== bankId));
                alert('Bank deleted successfully!');
            } catch (error) {
                console.error('Error deleting bank:', error);
                alert('Failed to delete bank details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSetDefaultBank = async (bankId) => {
        try {
            setIsLoading(true);
            await bankDetailsAPI.setDefaultBank(bankId);
            setBanks(prev => prev.map(bank => ({
                ...bank,
                default: bank.id === bankId
            })));
            alert('Default bank updated successfully!');
        } catch (error) {
            console.error('Error setting default bank:', error);
            alert('Failed to set default bank. Please try again.');
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
        } catch (error) {
            console.error('Error creating withdrawal:', error);
            alert('Failed to create withdrawal request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigation = (path) => {
        console.log(`Navigating to: ${path}`);
        navigate(path);
    };

    const StatusBadge = ({ status, verified }) => (
        <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === 'Active' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
                {status}
            </span>
            {verified && (
                <div className="flex items-center gap-1 px-2 py-1 bg-teal-50 rounded-full border border-teal-200">
                    <CheckCircle className="w-3 h-3 text-teal-600" />
                    <span className="text-xs font-medium text-teal-700">Verified</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
                <div className="max-w-5xl mx-auto px-4 py-5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleNavigation('/profile')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Bank Details</h1>
                            <p className="text-sm text-slate-300 mt-1">Manage your bank accounts and withdrawals</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* 1. Bank Overview Card */}
                    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 md:col-span-2 border border-gray-100">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                                <CreditCard className="w-10 h-10 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Management</h2>
                                <StatusBadge status="Active" verified={true} />
                            </div>
                            <User className="w-7 h-7 text-orange-500" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{banks.length}</div>
                                    <div className="text-xs text-gray-600">Bank Accounts</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Secure</div>
                                    <div className="text-xs text-gray-600">Encrypted</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-5 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-orange-700 mb-1">Quick Actions</div>
                                    <div className="text-sm text-orange-900">Manage your banking needs</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleNavigation('/bank-details/add')}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                                    >
                                        Add Bank
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/bank-details/withdraw')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                                    >
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleNavigation('/wallet')}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Go to Wallet
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 2. Withdraw Section */}
                    {showWithdrawSection && (
                        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 md:col-span-2 border border-gray-100">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Withdraw Funds</h3>
                                    <p className="text-sm text-gray-600">Select bank account for withdrawal</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            
                            <WithdrawSection 
                                banks={banks}
                                onAddBank={() => setShowBankForm(true)}
                                onWithdraw={handleWithdraw}
                            />
                        </div>
                    )}

                    {/* 3. Bank Details Form */}
                    {showBankForm && (
                        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 md:col-span-2 border border-gray-100">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {editingBank ? 'Edit Bank Details' : 'Add Bank Details'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {editingBank ? 'Update your bank information' : 'Add a new bank account for withdrawals'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowBankForm(false);
                                        setEditingBank(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <BankDetailsForm 
                                bank={editingBank}
                                onSave={(bankData) => {
                                    if (editingBank) {
                                        handleBankUpdated(editingBank.id, bankData);
                                    } else {
                                        handleBankAdded(bankData);
                                    }
                                    setShowBankForm(false);
                                    setEditingBank(null);
                                }}
                                onCancel={() => {
                                    setShowBankForm(false);
                                    setEditingBank(null);
                                }}
                            />
                        </div>
                    )}

                    {/* 4. Bank Details List */}
                    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 md:col-span-2 border border-gray-100">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Your Bank Accounts</h3>
                                <p className="text-sm text-gray-600">
                                    {banks.length} bank account{banks.length !== 1 ? 's' : ''} registered
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    {banks.filter(bank => bank.is_default).length} default
                                </span>
                            </div>
                        </div>
                        
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading bank details...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8 text-red-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Banks</h4>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <button
                                    onClick={fetchBankDetails}
                                    className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : banks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8 text-gray-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Bank Accounts</h4>
                                <p className="text-gray-600 mb-6">Add your first bank account to start making withdrawals</p>
                                <button
                                    onClick={() => handleNavigation('/bank-details/add')}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Bank
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {banks.map((bank) => (
                                    <BankDetailsCard 
                                        key={bank.id}
                                        bank={bank}
                                        onEdit={(bank) => {
                                            setEditingBank(bank);
                                            setShowBankForm(true);
                                        }}
                                        onDelete={handleBankDeleted}
                                        onSetDefault={handleSetDefaultBank}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. Security Info Card */}
                    <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 md:col-span-2 border border-teal-400 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
                        <div className="relative">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Bank Security</h3>
                                    <p className="text-sm text-teal-100">Your banking information is secure</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <Star className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">Encrypted Storage</div>
                                            <div className="text-xs text-teal-100">Bank details are encrypted</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <Star className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">Secure Transfers</div>
                                            <div className="text-xs text-teal-100">All transfers are secure</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            <Star className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">24/7 Monitoring</div>
                                            <div className="text-xs text-teal-100">Continuous security monitoring</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleNavigation('/profile')}
                                className="w-full bg-white text-teal-600 font-semibold py-4 px-6 rounded-xl hover:bg-teal-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Profile
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BankDetailsPage;