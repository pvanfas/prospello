import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { walletAPI, userAPI } from '../services/api';
import { updateUser } from '../redux/authSlice';
import WithdrawModal from '../components/BED/WithdrawModal';
import {
    Wallet,
    TrendingUp,
    Users,
    DollarSign,
    Copy,
    Check,
    ArrowLeft,
    Download,
    Share2,
    Gift,
    Star,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    UserPlus,
    PieChart,
    BarChart3
} from 'lucide-react';

const BEDDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    
    // State management
    const [walletData, setWalletData] = useState({
        balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        pending_amount: 0
    });
    
    const [referralTree, setReferralTree] = useState([]);
    const [walletHistory, setWalletHistory] = useState([]);
    const [commissionRules, setCommissionRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    // Fetch fresh user data and BED data on component mount
    useEffect(() => {
        console.log('🔍 DEBUG: BEDDashboard - User data:', user);
        console.log('🔍 DEBUG: BEDDashboard - User refercode:', user?.refercode);
        console.log('🔍 DEBUG: BEDDashboard - User object keys:', user ? Object.keys(user) : 'No user');
        
        // Fetch fresh user data to ensure we have the latest refercode
        refreshUserData();
        fetchBEDData();
    }, []);

    const refreshUserData = async () => {
        try {
            console.log('🔍 DEBUG: Refreshing user data...');
            const response = await userAPI.getCurrentUser();
            console.log('🔍 DEBUG: Fresh user data from API:', response.data);
            
            // Update Redux store with fresh user data
            if (response.data) {
                dispatch(updateUser({ user: response.data }));
                console.log('🔍 DEBUG: Updated Redux with fresh user data:', response.data);
            }
        } catch (error) {
            console.error('🔍 DEBUG: Error refreshing user data:', error);
        }
    };

    const fetchBEDData = async () => {
        try {
            setIsLoading(true);
            
            const [walletResponse, treeResponse, historyResponse, rulesResponse] = await Promise.all([
                walletAPI.getWallet(),
                walletAPI.getReferralTree(),
                walletAPI.getWalletHistory(1, 10),
                walletAPI.getCommissionRules()
            ]);

            if (walletResponse.data) {
                setWalletData(walletResponse.data);
            }
            
            if (treeResponse.data) {
                setReferralTree(treeResponse.data);
            }
            
            if (historyResponse.data) {
                setWalletHistory(historyResponse.data.transactions || []);
            }
            
            if (rulesResponse.data) {
                setCommissionRules(rulesResponse.data.commission_rules || []);
            }
        } catch (error) {
            console.error('Error fetching BED data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyReferCode = () => {
        navigator.clipboard.writeText(user?.refercode || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerateReferralCode = async () => {
        try {
            const response = await walletAPI.generateReferralCode();
            if (response.data?.refercode) {
                // Update the user object with the new referral code
                // This will trigger a re-render with the new code
                window.location.reload(); // Simple solution for now
            }
        } catch (error) {
            console.error('Failed to generate referral code:', error);
        }
    };

    const handleShareReferral = () => {
        const referralText = `Join South Bridge Logistics and start earning! Use my referral code: ${user?.refercode}`;
        if (navigator.share) {
            navigator.share({
                title: 'Join South Bridge Logistics',
                text: referralText,
                url: window.location.origin
            });
        } else {
            navigator.clipboard.writeText(referralText);
            alert('Referral message copied to clipboard!');
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'commission':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'withdrawal':
                return <Download className="w-4 h-4 text-blue-600" />;
            case 'bonus':
                return <Gift className="w-4 h-4 text-purple-600" />;
            default:
                return <DollarSign className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'commission':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'withdrawal':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'bonus':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your BED dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Refer & Earn</h1>
                            <p className="text-xs text-orange-100 mt-1">BED Commission Dashboard</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto px-4 py-4 pb-6">
                {/* Wallet Overview Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl shadow-xl p-4 mb-4 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                    
                    <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-white mb-1">Your BED Wallet</h2>
                                <p className="text-orange-100 text-xs">Broker Endorsed Driver Commission</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg ml-2">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="text-white/80 text-xs mb-1">Available Balance</div>
                                <div className="text-lg font-bold text-white">
                                    {formatAmount(walletData.balance)}
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                <div className="text-white/80 text-xs mb-1">Total Earned</div>
                                <div className="text-lg font-bold text-white">
                                    {formatAmount(walletData.total_earned)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                className="flex-1 bg-white text-orange-600 font-semibold py-3 px-3 rounded-xl hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Withdraw
                            </button>
                            <button
                                onClick={fetchBEDData}
                                className="px-3 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-md p-3 border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-600">Referrals</div>
                                <div className="text-sm font-bold text-gray-900">
                                    {referralTree.length} Active
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-md p-3 border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-600">This Month</div>
                                <div className="text-sm font-bold text-gray-900">
                                    {formatAmount(walletData.total_earned)}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-md p-3 border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-600">Total Withdrawn</div>
                                <div className="text-sm font-bold text-gray-900">
                                    {formatAmount(walletData.total_withdrawn)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Referral Code Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 mb-1">Your Referral Code</h3>
                            <p className="text-xs text-gray-600">Share this code to earn commissions</p>
                        </div>
                        <div className="bg-orange-100 p-2 rounded-lg ml-2">
                            <Share2 className="w-4 h-4 text-orange-600" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 mb-3 border border-orange-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-xs font-medium text-orange-700 mb-1">Referral Code</div>
                                <div className="text-lg font-bold text-orange-900 tracking-wider font-mono">
                                    {user?.refercode || 'No Code Yet'}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {user?.refercode ? (
                                    <button
                                        onClick={handleCopyReferCode}
                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                                            copied 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-orange-600 text-white hover:bg-orange-700'
                                        }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3 h-3" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3 h-3" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleGenerateReferralCode}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 bg-orange-600 text-white hover:bg-orange-700"
                                    >
                                        <Gift className="w-3 h-3" />
                                        Generate Code
                                    </button>
                                )}
                                <button
                                    onClick={handleShareReferral}
                                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs hover:bg-blue-700 transition-all duration-200"
                                >
                                    <Share2 className="w-3 h-3" />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded">
                                <UserPlus className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-blue-900 mb-1">How it works</div>
                                <div className="text-xs text-blue-700">
                                    When someone uses your referral code to join, you earn 5% commission on their first 10 orders. 
                                    Plus, you get ongoing commissions from their network!
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-md mb-4 border border-gray-100">
                    <div className="flex border-b border-gray-200">
                        {[
                            { id: 'overview', label: 'Overview', icon: PieChart },
                            { id: 'referrals', label: 'Referrals', icon: Users },
                            { id: 'history', label: 'History', icon: BarChart3 }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1 py-3 px-3 font-semibold text-xs transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                }`}
                            >
                                <tab.icon className="w-3 h-3" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4">
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-base font-bold text-gray-900 mb-3">Commission Structure</h4>
                                    <div className="space-y-2">
                                        {commissionRules.length > 0 ? (
                                            commissionRules.map((rule) => (
                                                <div key={rule.level} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-gray-700">Level {rule.level}</span>
                                                        <span className="text-sm font-bold text-orange-600">{rule.percentage}%</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600">{rule.description}</div>
                                                </div>
                                            ))
                                        ) : (
                                            // Fallback to default structure if API fails
                                            [
                                                { level: 1, percentage: 5, description: 'Direct referrals' },
                                                { level: 2, percentage: 3, description: 'Level 2 referrals' },
                                                { level: 3, percentage: 2, description: 'Level 3 referrals' },
                                                { level: 4, percentage: 1, description: 'Level 4 referrals' },
                                                { level: 5, percentage: 0.5, description: 'Level 5 referrals' }
                                            ].map((item) => (
                                                <div key={item.level} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-gray-700">Level {item.level}</span>
                                                        <span className="text-sm font-bold text-orange-600">{item.percentage}%</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600">{item.description}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'referrals' && (
                            <div>
                                <h4 className="text-base font-bold text-gray-900 mb-3">Your Referral Network</h4>
                                {referralTree.length > 0 ? (
                                    <div className="space-y-2">
                                        {referralTree.map((referral, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{referral.username}</div>
                                                        <div className="text-xs text-gray-600">
                                                            Direct Referral {referral.network_size > 0 && `• ${referral.network_size} sub-referrals`}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-semibold text-orange-600">
                                                            {formatAmount(referral.total_commission || 0)}
                                                        </div>
                                                        <div className="text-xs text-gray-600">Commission</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                        <div className="text-sm text-gray-600 mb-1">No referrals yet</div>
                                        <div className="text-xs text-gray-500">Start sharing your referral code to build your network!</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div>
                                <h4 className="text-base font-bold text-gray-900 mb-3">Transaction History</h4>
                                {walletHistory.length > 0 ? (
                                    <div className="space-y-2">
                                        {walletHistory.map((transaction, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg border ${getTransactionColor(transaction.type)}`}>
                                                            {getTransactionIcon(transaction.type)}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-semibold text-gray-900 capitalize">
                                                                {transaction.type} Commission
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                {formatDate(transaction.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-semibold text-gray-900">
                                                            {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {transaction.status === 'completed' ? (
                                                                <span className="text-green-600 flex items-center gap-1">
                                                                    <CheckCircle className="w-2 h-2" />
                                                                    Completed
                                                                </span>
                                                            ) : (
                                                                <span className="text-yellow-600 flex items-center gap-1">
                                                                    <Clock className="w-2 h-2" />
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                        <div className="text-sm text-gray-600 mb-1">No transactions yet</div>
                                        <div className="text-xs text-gray-500">Your commission history will appear here</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Withdraw Modal */}
            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                walletBalance={walletData.balance}
                onSuccess={() => {
                    fetchBEDData(); // Refresh data after successful withdrawal
                }}
            />
        </div>
    );
};

export default BEDDashboard;
