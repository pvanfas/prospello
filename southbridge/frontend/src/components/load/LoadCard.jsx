import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin,ArrowRight,Truck,Scale,IndianRupee,Users,Clock,Check,CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
const StatusBadge = ({ status, verified }) => {
    const getStatusConfig = () => {
        switch (status) {
            case "ACTIVE":
                return {
                    color: "bg-green-100 text-green-800 border-green-200",
                    text: "Active",
                };
            case "posted":
                return {
                    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    text: "Posted",
                };
            case "COMPLETED":
                return {
                    color: "bg-blue-100 text-blue-800 border-blue-200",
                    text: "Completed",
                };
            case "CANCELLED":
                return {
                    color: "bg-red-100 text-red-800 border-red-200",
                    text: "Cancelled",
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-800 border-gray-200",
                    text: "Unknown",
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="flex items-center gap-1.5">
            <span
                className={`px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}
            >
                {config.text}
            </span>
            {verified ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
                <Clock className="w-3.5 h-3.5 text-gray-400" />
            )}
        </div>
    );
};
const LoadCard = ({ 
    load, 
    index, 
    onEdit, 
    isSelectionMode, 
    isSelected, 
    onToggleSelection, 
    onEnterSelectionMode 
}) => {
    const [holdTimer, setHoldTimer] = useState(null);
    const [isHolding, setIsHolding] = useState(false);
    const cardRef = useRef(null);

    const handleMouseDown = (e) => {
        if (isSelectionMode) return;
        
        // Check if the click is on a button or interactive element
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        
        console.log('Mouse down - starting hold timer');
        setIsHolding(true);
        
        const timer = setTimeout(() => {
            console.log('Hold timer completed - entering selection mode');
            onEnterSelectionMode();
            setIsHolding(false);
        }, 500);
        setHoldTimer(timer);
    };

    const handleMouseUp = (e) => {
        console.log('Mouse up - clearing hold timer');
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
        setIsHolding(false);
    };

    const handleMouseLeave = (e) => {
        console.log('Mouse leave - clearing hold timer');
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
        setIsHolding(false);
    };

    // Touch events for mobile
    const handleTouchStart = (e) => {
        if (isSelectionMode) return;
        
        // Check if the touch is on a button or interactive element
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        
        console.log('Touch start - starting hold timer');
        setIsHolding(true);
        
        const timer = setTimeout(() => {
            console.log('Touch hold timer completed - entering selection mode');
            onEnterSelectionMode();
            setIsHolding(false);
        }, 500);
        setHoldTimer(timer);
    };

    const handleTouchEnd = (e) => {
        console.log('Touch end - clearing hold timer');
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
        setIsHolding(false);
    };

    const handleTouchCancel = (e) => {
        console.log('Touch cancel - clearing hold timer');
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
        setIsHolding(false);
    };

    const handleCardClick = (e) => {
        // Prevent click if we just entered selection mode
        if (holdTimer) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        if (isSelectionMode) {
            onToggleSelection();
        }
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.3,
                delay: index * 0.03,
                type: "spring",
                stiffness: 150,
                damping: 20,
            }}
            whileHover={{
                scale: isSelectionMode ? 1 : 1.01,
                y: isSelectionMode ? 0 : -1,
                transition: { duration: 0.15, type: "spring", stiffness: 400 },
            }}
            className={`w-full group cursor-pointer relative ${
                isSelectionMode ? 'cursor-pointer' : ''
            } ${isSelected ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onClick={handleCardClick}
        >
            <div className="relative overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
                {/* Hold indicator */}
                {isHolding && !isSelectionMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-orange-500 bg-opacity-20 flex items-center justify-center z-20"
                    >
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Hold to select
                        </div>
                    </motion.div>
                )}
                
                {/* Selection checkbox overlay */}
                {isSelectionMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-3 left-3 z-10"
                    >
                        <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                                isSelected
                                    ? 'bg-orange-500 border-orange-500'
                                    : 'bg-white border-gray-300 hover:border-orange-400'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelection();
                            }}
                        >
                            {isSelected && (
                                <Check className="w-4 h-4 text-white" />
                            )}
                        </div>
                    </motion.div>
                )}
                
                <div className="p-4">
                    {/* Header with status and created date */}
                    <div className="flex items-center justify-between mb-3">
                        <StatusBadge
                            status={load.status}
                            verified={load.creator_verified}
                        />
                        <div className="text-right">
                            <div className="text-xs text-gray-500">
                                {load.time_posted || "Recently"}
                            </div>
                            <div className="text-xs font-medium text-gray-700">
                                {load.created_by || "You"}
                            </div>
                        </div>
                    </div>
                    {load.image_url && (
                        <div className="mb-3">
                            <img src={load.image_url} alt={load.goods_type} className="w-full h-auto rounded-md" />
                        </div>
                    )}
                    {/* Route display */}
                    <div className="space-y-2 text-sm mb-3">
                        {/* Origin - Show first */}
                        <div className="flex items-start gap-1.5 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-200">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500 mb-1">Origin</div>
                                <div className="text-sm font-medium text-gray-800 break-words leading-tight">
                                    {load.origin_place || load.origin}
                                </div>
                            </div>
                        </div>
                        
                        {/* Arrow indicator */}
                        <div className="flex justify-center">
                            <ArrowRight className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        </div>
                        
                        {/* Destination - Show below origin */}
                        <div className="flex items-start gap-1.5 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-200">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500 mb-1">Destination</div>
                                <div className="text-sm font-medium text-gray-800 break-words leading-tight">
                                    {load.destination_place || load.destination}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Goods and weight info */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-md">
                            <Truck className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 mb-1">Goods</p>
                                <p className="text-xs font-bold text-gray-800 break-words leading-tight">
                                    {load.goods_type}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-md">
                            <Scale className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 mb-1">Weight</p>
                                <p className="text-xs font-bold text-gray-800 break-words leading-tight">
                                    {load.weight}Kg
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dimensions */}
                    {load.dimensions && (
                        <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-md mb-3">
                            {/* Add Package icon import at the top if not already */}
                            <span className="inline-flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 7l10 6 10-6" /></svg>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 mb-1">
                                    Dimensions
                                </p>
                                <p className="text-xs font-bold text-gray-800 break-words leading-tight">
                                    {load.dimensions}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Types */}
                    {load.vehicle_types && load.vehicle_types.length > 0 && (
                        <div className="flex items-start gap-1.5 p-2 bg-blue-50 rounded-md mb-3 border border-blue-100">
                            <Truck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-blue-600 mb-1">
                                    Vehicle Types
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {load.vehicle_types.map((type, idx) => (
                                        <span key={idx} className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full capitalize">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Special instructions */}
                    {load.special_instructions && (
                        <div className="p-2 bg-orange-50 border border-orange-100 rounded-md mb-3">
                            <p className="text-xs text-orange-600 font-medium mb-1">
                                Special Instructions
                            </p>
                            <p className="text-xs text-gray-800 line-clamp-2">
                                {load.special_instructions}
                            </p>
                        </div>
                    )}

                    {/* Rate and bidding info */}
                    <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                                {load.lowest_bid && <IndianRupee className="w-4 h-4 text-green-600" />}
                                <span className="text-lg font-bold text-green-600">
                                    {(
                                        load.lowest_bid ||
                                        "NO BIDS"
                                    ).toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {load.lowest_bid
                                        ? "lowest bid"
                                        : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">
                                    {load.bid_count || 0} bids
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {!isSelectionMode && (
                            <div className="grid grid-cols-2 gap-2">
                                <motion.button
                                    onClick={() => onEdit(load)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                                >
                                    Edit Load
                                </motion.button>
                                <Link
                                    to={`/load/${load.id}`}
                                    className={`flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                                        !load.bid_count || load.bid_count === 0
                                            ? "opacity-50 cursor-not-allowed pointer-events-none"
                                            : ""
                                    }`}
                                    tabIndex={
                                        !load.bid_count || load.bid_count === 0
                                            ? -1
                                            : 0
                                    }
                                    aria-disabled={
                                        !load.bid_count || load.bid_count === 0
                                    }
                                >
                                    Accept Bid
                                </Link>
                            </div>
                        )}
                        
                        {isSelectionMode && (
                            <div className="text-center py-2">
                                <span className="text-sm text-gray-500">
                                    {isSelected ? "Selected" : "Tap to select"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
export default LoadCard;