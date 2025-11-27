import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Navigation,
    Truck,
    Clock,
    Route,
    Eye,
    RefreshCw,
    TrendingUp,
    Zap,
    Users,
    Package,
} from "lucide-react";
import api from "../../services/api";

const RouteTrackingDashboard = ({ routeId, compact = false }) => {
    const [route, setRoute] = useState(null);
    const [pings, setPings] = useState([]);
    const [latestLocation, setLatestLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (routeId) {
            fetchRouteData();
        }
    }, [routeId]);

    const fetchRouteData = async () => {
        try {
            setLoading(true);
            const [routeResponse, trackResponse] = await Promise.all([
                api.get(`/v1/route/${routeId}/`),
                api.get(`/v1/route/${routeId}/track/`),
            ]);

            setRoute(routeResponse.data);
            setPings(trackResponse.data.pings || []);

            if (trackResponse.data.pings && trackResponse.data.pings.length > 0) {
                setLatestLocation(trackResponse.data.pings[0]);
            }
        } catch (error) {
            console.error("Error fetching route data:", error);
            setError("Failed to load tracking data");
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const calculateProgress = () => {
        if (!pings.length || !route) return 0;
        
        // Simple progress calculation based on number of checkpoints
        // In a real app, you'd calculate based on distance from start/end points
        const totalExpectedPings = 10; // Assume 10 expected pings for a route
        return Math.min((pings.length / totalExpectedPings) * 100, 100);
    };

    const getStatusColor = () => {
        if (!latestLocation) return "gray";
        
        const timestamp = new Date(latestLocation.timestamp);
        const now = new Date();
        const diffMinutes = (now - timestamp) / (1000 * 60);
        
        if (diffMinutes < 5) return "green";
        if (diffMinutes < 15) return "yellow";
        return "red";
    };

    const getStatusText = () => {
        if (!latestLocation) return "No data";
        
        const timestamp = new Date(latestLocation.timestamp);
        const now = new Date();
        const diffMinutes = (now - timestamp) / (1000 * 60);
        
        if (diffMinutes < 5) return "Live";
        if (diffMinutes < 15) return "Recent";
        return "Stale";
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="flex space-x-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !route) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking Unavailable</h3>
                    <p className="text-gray-600 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{route.name}</h4>
                            <p className="text-xs text-gray-500">Route Tracking</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                            getStatusColor() === 'green' ? 'bg-green-500' :
                            getStatusColor() === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-600">{getStatusText()}</span>
                    </div>
                </div>

                {latestLocation ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Last update:</span>
                            <span className="font-medium text-gray-900">
                                {formatTimestamp(latestLocation.timestamp)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Checkpoints:</span>
                            <span className="font-medium text-orange-600">{pings.length}</span>
                        </div>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="w-full mt-2 bg-orange-50 text-orange-600 py-2 px-3 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors flex items-center justify-center space-x-1"
                        >
                            <Eye className="w-3 h-3" />
                            <span>{showMap ? 'Hide Map' : 'View Map'}</span>
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500">Waiting for location data</p>
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{route.name}</h2>
                            <p className="text-sm text-gray-500">Route Tracking Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2"></div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {showMap && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                    >
                        <div className="h-64 bg-gray-100 rounded-lg border border-gray-200">
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm">Map view would be embedded here</p>
                                    <p className="text-xs text-gray-400">Use RouteMapWidget component</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-900">{pings.length}</p>
                                <p className="text-xs text-blue-700 font-medium">Checkpoints</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-900">{calculateProgress().toFixed(0)}%</p>
                                <p className="text-xs text-green-700 font-medium">Progress</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-900">{getStatusText()}</p>
                                <p className="text-xs text-purple-700 font-medium">Status</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-900">{route.orders?.length || 0}</p>
                                <p className="text-xs text-orange-700 font-medium">Orders</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Latest Location */}
                {latestLocation ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <h3 className="font-semibold text-gray-900">Latest Location</h3>
                            </div>
                            <span className="text-sm text-gray-500">
                                {formatTimestamp(latestLocation.timestamp)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Latitude</p>
                                <p className="font-mono text-sm font-medium text-gray-900">
                                    {latestLocation.latitude.toFixed(6)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Longitude</p>
                                <p className="font-mono text-sm font-medium text-gray-900">
                                    {latestLocation.longitude.toFixed(6)}
                                </p>
                            </div>
                        </div>

                        {/* Route Path */}
                        <div className="mt-4 pt-4 border-t border-green-200">
                            <div className="flex items-center space-x-3">
                                <Navigation className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-700 truncate">
                                    {route.start_location}
                                </span>
                            </div>
                            <div className="flex justify-center my-2">
                                <div className="w-6 h-0.5 bg-gradient-to-r from-green-400 to-blue-400"></div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700 truncate">
                                    {route.end_location}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Waiting for Location Data</h3>
                        <p className="text-sm text-gray-600">
                            The driver hasn't started sharing their location yet.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default RouteTrackingDashboard;
