import React, { useState, useEffect } from "react";
import { ArrowLeft, HandCoins, Clock, MapPin, Package, Trash2, TruckIcon, ArrowRight } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const BidsPage = () => {
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBids();
    }, []);

    const fetchBids = async () => {
        try {
            const response = await api.getDriverBids();
            setBids(response.data);
        } catch (error) {
            console.error("Error fetching bids:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBid = async (bidId) => {
        if (!window.confirm("Are you sure you want to delete this bid? This action cannot be undone.")) {
            return;
        }

        try {
            await api.deleteBid(bidId);
            // Remove the bid from the local state
            setBids(prevBids => prevBids.filter(bid => bid.id !== bidId));
            alert("Bid deleted successfully!");
        } catch (error) {
            console.error("Error deleting bid:", error);
            alert("Failed to delete bid. Please try again.");
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepted':
                return 'text-green-600 bg-green-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'declined':
                return 'text-red-600 bg-red-50';
            case 'expired':
                return 'text-gray-600 bg-gray-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bids...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={handleBackClick}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">
                        My Bids
                    </h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {bids.length === 0 ? (
                    <div className="text-center py-12">
                        <HandCoins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bids yet</h3>
                        <p className="text-gray-500 mb-4">
                            You haven't placed any bids yet. Start bidding on loads to see them here.
                        </p>
                        <button
                            onClick={() => navigate("/load")}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Browse Loads
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bids.map((bid) => (
                            <div
                                key={bid.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Header with Amount and Status */}
                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b border-orange-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs text-orange-600 font-medium mb-1">Your Bid Amount</p>
                                            <h3 className="text-2xl font-bold text-orange-600">
                                                ₹{bid.amount?.toLocaleString()}
                                            </h3>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(bid.status)}`}
                                        >
                                            {bid.status || 'pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* Load Details */}
                                <div className="p-4 space-y-3">
                                    {/* Route */}
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                        {/* Origin - Show first */}
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs text-gray-500 mb-1 font-medium">Origin</div>
                                                <div className="text-sm font-medium text-gray-900 break-words leading-tight">
                                                    {bid.origin || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Arrow indicator */}
                                        <div className="flex justify-center">
                                            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        </div>
                                        
                                        {/* Destination - Show below origin */}
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs text-gray-500 mb-1 font-medium">Destination</div>
                                                <div className="text-sm font-medium text-gray-900 break-words leading-tight">
                                                    {bid.destination || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Load Info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Package className="w-4 h-4 text-blue-600" />
                                                <p className="text-xs text-blue-600 font-medium">Goods Type</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">{bid.goods_type || 'N/A'}</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <TruckIcon className="w-4 h-4 text-purple-600" />
                                                <p className="text-xs text-purple-600 font-medium">Weight</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">{bid.weight || '0'} kg</p>
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                                        <Clock className="w-4 h-4" />
                                        <span>Bid placed on {formatDate(bid.created_at)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {(bid.status === 'accepted' || bid.status === 'pending') && (
                                    <div className="px-4 pb-4">
                                        {bid.status === 'accepted' ? (
                                            <button
                                                onClick={() => navigate(`/order/${bid.load_id}`)}
                                                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold shadow-sm"
                                            >
                                                View Order Details
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteBid(bid.id)}
                                                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete Bid</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BidsPage;
