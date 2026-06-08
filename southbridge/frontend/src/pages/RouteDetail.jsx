import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    Package,
    Calendar,
    DollarSign,
    Truck,
    CheckCircle,
    AlertCircle,
    Navigation,
    ChevronRight,
    Play,
    Map,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../services/api";
import Loader from "../components/Loader";

const RouteDetail = () => {
    const { routeId } = useParams();
    const navigate = useNavigate();
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRouteDetails = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/v1/route/${routeId}/`);
            console.log("Route details response:", response.data);
            
            // Backend returns { route: {...} }
            setRoute(response.data.route);
        } catch (error) {
            console.error("Error fetching route details:", error);
            
            // Better error messages
            if (error.response?.status === 401) {
                setError("Please log in to view route details");
                // Redirect to login after 2 seconds
                setTimeout(() => navigate('/login'), 2000);
            } else if (error.response?.status === 403) {
                setError("Only drivers can view route details. Please log in as a driver.");
            } else if (error.response?.status === 404) {
                setError("Route not found");
            } else {
                setError("Failed to load route details. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }, [routeId, navigate]);

    function formatDate(dateString) {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
 }

    useEffect(() => {
        fetchRouteDetails();
    }, [routeId, fetchRouteDetails]);

    const getRouteStatusConfig = (status) => {
        const configs = {
            active: {
                text: "Active",
                color: "bg-blue-100",
                textColor: "text-blue-700",
                icon: Truck,
            },
            completed: {
                text: "Completed",
                color: "bg-green-100",
                textColor: "text-green-700",
                icon: CheckCircle,
            },
            cancelled: {
                text: "Cancelled",
                color: "bg-red-100",
                textColor: "text-red-700",
                icon: AlertCircle,
            },
        };
        return configs[status] || configs.active;
    };

    const getStatusConfig = (status) => {
        const configs = {
            bid_accepted: {
                text: "Bid Accepted",
                color: "bg-blue-100",
                textColor: "text-blue-700",
                icon: CheckCircle,
            },
            driver_accepted: {
                text: "Accepted",
                color: "bg-green-100",
                textColor: "text-green-700",
                icon: CheckCircle,
            },
            picked_up: {
                text: "Picked Up",
                color: "bg-purple-100",
                textColor: "text-purple-700",
                icon: Package,
            },
            in_transit: {
                text: "In Transit",
                color: "bg-orange-100",
                textColor: "text-orange-700",
                icon: Truck,
            },
            delivered: {
                text: "Delivered",
                color: "bg-teal-100",
                textColor: "text-teal-700",
                icon: CheckCircle,
            },
            completed: {
                text: "Completed",
                color: "bg-green-100",
                textColor: "text-green-700",
                icon: CheckCircle,
            },
            canceled: {
                text: "Canceled",
                color: "bg-red-100",
                textColor: "text-red-700",
                icon: AlertCircle,
            },
        };
        return configs[status] || configs.bid_accepted;
    };

    

    const handleOrderClick = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    if (loading) {
        return <Loader />;
    }

    if (error || !route) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Error Loading Route
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate("/route")}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                    >
                        Back to Routes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate("/route")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900">
                                {route.name}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {route.destination_count || 0} Destinations
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Route Information */}
            <div className="px-4 py-4 space-y-4">
                {/* Route Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">
                                {route.name}
                            </h2>
                            {route.description && (
                                <p className="text-orange-100 text-sm">
                                    {route.description}
                                </p>
                            )}
                        </div>
                        {(() => {
                            const statusConfig = getRouteStatusConfig(route.status);
                            const StatusIcon = statusConfig.icon;
                            return (
                                <div className={`${statusConfig.color} ${statusConfig.textColor} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}>
                                    <StatusIcon className="w-4 h-4" />
                                    <span>{statusConfig.text}</span>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg text-orange-600">
                                <Navigation className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-orange-100 text-xs">
                                    Origin Location
                                </p>
                                <p className="font-semibold">
                                    {route.origin?.lat?.toFixed(6)}, {route.origin?.lng?.toFixed(6)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg text-orange-600">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-orange-100 text-xs">
                                    Destinations
                                </p>
                                <p className="font-semibold">
                                    {route.destination_count || 0} stops
                                </p>
                            </div>
                        </div>

                        {route.eta_minutes && (
                            <div className="flex items-center space-x-3">
                                <div className="bg-white bg-opacity-20 p-2 rounded-lg text-orange-600">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-orange-100 text-xs">
                                        Estimated Time
                                    </p>
                                    <p className="font-semibold">
                                        {Math.round(route.eta_minutes)} minutes
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-3">
                            <div className="bg-white bg-opacity-20 p-2 rounded-lg text-orange-600">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-orange-100 text-xs">
                                    Created
                                </p>
                                <p className="font-semibold">
                                    {formatDate(route.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {route.status === 'active' && (
                        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate(`/driver/tracking/${routeId}`)}
                                    className="w-full bg-white text-orange-600 font-semibold py-3 px-4 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center space-x-2 shadow-md"
                                    title="Start live tracking - Track your movement and update route"
                                >
                                    <Play className="w-5 h-5 " />
                                    <span>Start Tracking</span>
                                </button>
                                {/* <button
                                    onClick={() => navigate(`/track/${routeId}`)}
                                    className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl hover:bg-opacity-30 transition-colors flex items-center justify-center space-x-2 border border-white border-opacity-30"
                                    title="View on map - See all destinations like Google Maps navigation"
                                >
                                    <Map className="w-5 h-5" />
                                    <span>View on Map</span>
                                </button> */}
                            </div>
                            <p className="text-xs text-orange-100 mt-2 text-center">
                                Start Tracking: Real-time GPS • View on Map: See destinations
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Destinations List */}
                {route.destinations && route.destinations.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">
                            Route Stops ({route.destinations.length})
                        </h3>
                        <div className="space-y-2">
                            {route.destinations.map((dest, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-orange-100 text-orange-600 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    Stop #{index + 1}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                Lat: {dest.lat?.toFixed(6)}, Lng: {dest.lng?.toFixed(6)}
                                            </p>
                                            {dest.address && (
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {dest.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders List */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">
                        Orders ({route.orders?.length || 0})
                    </h3>

                    {route.orders && route.orders.length > 0 ? (
                        <div className="space-y-3">
                            {route.orders.map((order, index) => {
                                const statusConfig = getStatusConfig(
                                    order.status
                                );
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() =>
                                            handleOrderClick(order.id)
                                        }
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                                    >
                                        {/* Order Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-orange-100 text-orange-600 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">
                                                        {order.order_number}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(
                                                            order.created_at
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.textColor} flex items-center space-x-1`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    <span>
                                                        {statusConfig.text}
                                                    </span>
                                                </span>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>

                                        {/* Route */}
                                        <div className="flex items-center space-x-2 mb-3 bg-gray-50 rounded-lg p-3">
                                            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-sm font-medium text-gray-900 truncate flex-1">
                                                {order.load_origin}
                                            </span>
                                            <div className="flex-shrink-0 text-gray-400">
                                                →
                                            </div>
                                            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                                            <span className="text-sm font-medium text-gray-900 truncate flex-1">
                                                {order.load_destination}
                                            </span>
                                        </div>

                                        {/* Order Details Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center space-x-2">
                                                <Package className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Weight
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {order.load_weight}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Truck className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Type
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {order.load_goods_type}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Pickup
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formatDistanceToNow(order.picked_up)
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Bid Price
                                                    </p>
                                                    <p className="text-sm font-bold text-green-600">
                                                        ₹{order.bid_price}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {order.load_description && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Description
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    {order.load_description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Track Order Button */}
                                        {/* {(order.status === 'in_transit' || order.status === 'picked_up' || order.status === 'driver_accepted') && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/tracking/order/${order.id}`);
                                                    }}
                                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                                >
                                                    <Navigation className="w-4 h-4" />
                                                    <span>Track This Order</span>
                                                </button>
                                            </div>
                                        )} */}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                No orders in this route
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RouteDetail;