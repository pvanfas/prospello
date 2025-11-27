import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Users,
    Gift,
    ChevronRight,
    Star,
    DollarSign
} from 'lucide-react';

const BEDCard = ({ user }) => {
    const navigate = useNavigate();

    // Debug logging
    console.log('🔍 DEBUG: BEDCard - User data:', user);
    console.log('🔍 DEBUG: BEDCard - Referral code:', user?.refercode);
    
    // Show loading state if user data is not available
    if (!user) {
        return (
            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl shadow-xl p-4 mb-6 relative overflow-hidden">
                <div className="flex items-center justify-center h-32">
                    <div className="text-white/80 text-sm">Loading BED information...</div>
                </div>
            </div>
        );
    }
   

    const handleNavigateToBED = () => {
        navigate('/bed-dashboard');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl shadow-xl p-4 mb-6 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            
            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">Refer & Earn</h3>
                        <p className="text-orange-100 text-xs">Start earning commissions with BED system</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg ml-2">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-white/80 text-xs mb-1">Your Code</div>
                        <div className="text-sm font-bold text-white font-mono">
                            {user?.refercode || user?.referCode || 'Loading...'}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-white/80 text-xs mb-1">Earn Up To</div>
                        <div className="text-sm font-bold text-white">5% Commission</div>
                    </div>
                </div>
                
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-white/90 text-xs mb-2">
                        <Gift className="w-3 h-3" />
                        <span className="font-medium">Commission Benefits:</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                            <Star className="w-3 h-3" />
                            <span>5% on direct referrals</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                            <Users className="w-3 h-3" />
                            <span>Up to 5 levels deep</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-xs">
                            <DollarSign className="w-3 h-3" />
                            <span>Instant wallet credits</span>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={handleNavigateToBED}
                    className="w-full bg-white text-orange-600 font-semibold py-3 px-4 rounded-xl hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm"
                >
                    <TrendingUp className="w-4 h-4" />
                    View BED Dashboard
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export default BEDCard;
