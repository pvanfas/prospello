import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import api from "../services/api";
import Loader from "../components/Loader";
import LiveMap from "../components/driver/LiveMap";

const TrackRoute = () => {
    const { routeId } = useParams();
    const navigate = useNavigate();
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchRouteData = async (isRefresh = false) => {
        try {
            console.log("🔄 TrackRoute: fetchRouteData called", { isRefresh, routeId });
            
            if (!isRefresh) {
                setLoading(true);
                setError(null);
            } else {
                setRefreshing(true);
            }
            
            console.log("📡 TrackRoute: Fetching route data for routeId:", routeId);
            const routeResponse = await api.get(`/v1/route/${routeId}/`);
            console.log("✅ TrackRoute: Route data received:", routeResponse.data);
            setRoute(routeResponse.data);
        } catch (error) {
            console.error("❌ TrackRoute: Error fetching route data:", error);
            
            if (error.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
                setTimeout(() => navigate('/login'), 2000);
            } else if (error.response?.status === 403) {
                setError('You do not have permission to view this route.');
            } else if (error.response?.status === 404) {
                setError('Route not found.');
            } else {
                setError(error.response?.data?.detail || 'Failed to load route data.');
            }
        } finally {
            console.log("🏁 TrackRoute: fetchRouteData completed");
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        console.log("🚀 TrackRoute: useEffect triggered", { routeId });
        
        if (!routeId) {
            console.error("❌ TrackRoute: No routeId provided");
            setError("No route ID provided");
            setLoading(false);
            return;
        }
        
        fetchRouteData();
    }, [routeId]);

    if (loading) {
        console.log("🔄 TrackRoute: Showing loading spinner");
        return <Loader />;
    }

    if (error) {
        console.log("❌ TrackRoute: Showing error:", error);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Error Loading Route
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    if (!route) {
        console.log("⚠️ TrackRoute: No route data available");
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Route Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">The requested route could not be found.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 z-50">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    🗺️ View Route on Map
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {route?.route?.name || route?.name || 'Loading...'}
                                </p>
                            </div>
                        </div>
                            <button
                                onClick={() => fetchRouteData(true)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Refresh"
                                disabled={refreshing}
                            >
                                <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1">
                <LiveMap 
                    driverRouteId={routeId} 
                    initialRoute={route}
                    viewOnly={true}
                />
            </div>
        </div>
    );
};

export default TrackRoute;
