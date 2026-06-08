import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, MapPin, AlertCircle, CheckCircle, X } from "lucide-react";
import api from "../../services/api";

const LocationSender = ({ routeId, onClose, onBackgroundTrackingChange, onTrackingStart }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [lastSent, setLastSent] = useState(null);
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [sentCount, setSentCount] = useState(0);
    const [backgroundTracking, setBackgroundTracking] = useState(false);
    const watchIdRef = useRef(null);
    const intervalRef = useRef(null);
    const lastLocationRef = useRef(null);
    const lastSentTimeRef = useRef(null);

    // Check if tracking was active before (persistent state)
    useEffect(() => {
        const savedTrackingState = localStorage.getItem(`tracking_${routeId}`);
        if (savedTrackingState) {
            try {
                const { isActive, startTime } = JSON.parse(savedTrackingState);
                if (isActive) {
                    setBackgroundTracking(true);
                    setIsTracking(true);
                    console.log("LocationSender: Resuming background tracking for route", routeId);
                    
                    // Resume service worker tracking
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({
                            type: 'START_BACKGROUND_TRACKING',
                            data: { routeId: routeId }
                        });
                    }
                }
            } catch (error) {
                console.error("LocationSender: Error parsing saved tracking state:", error);
                localStorage.removeItem(`tracking_${routeId}`);
            }
        }
    }, [routeId]);

    useEffect(() => {
        // Don't auto-start tracking when component mounts
        // User needs to explicitly click "Start Tracking"

        return () => {
            // Stop tracking when component unmounts (modal closes)
            if (isTracking && !backgroundTracking) {
                stopTracking();
            }
        };
    }, [routeId, isTracking, backgroundTracking]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setIsTracking(true);
        setError(null);
        
        // Notify parent component that tracking has started
        if (onTrackingStart) {
            onTrackingStart();
        }

        // Geolocation options - improved for accuracy
        const geoOptions = {
            enableHighAccuracy: true, // Enable high accuracy to reduce drift
            maximumAge: 10000, // Reduce cache age to 10 seconds for fresher data
            timeout: 20000, // Increase timeout for better accuracy
        };

        // Get current position immediately
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setCurrentLocation(location);
                sendLocation(location);
            },
            (error) => {
                console.error("Error getting location:", error);
                let errorMsg = "Unable to get your location";
                if (error.code === 1) {
                    errorMsg = "Location permission denied. Please enable location access.";
                } else if (error.code === 2) {
                    errorMsg = "Location unavailable. Please check your GPS/network.";
                } else if (error.code === 3) {
                    errorMsg = "Location request timed out. Trying again...";
                }
                setError(errorMsg);
            },
            geoOptions
        );

        // Watch position for continuous tracking
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                // Check accuracy - reject if accuracy is too poor
                if (position.coords.accuracy > 100) { // Reject if accuracy > 100 meters
                    console.log("LocationSender: Rejecting location - poor accuracy:", position.coords.accuracy);
                    return;
                }

                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                };
                
                setCurrentLocation(location);
                setError(null); // Clear error on successful location update
                
                // Only send if location has changed significantly
                if (hasLocationChanged(location)) {
                    sendLocation(location);
                }
            },
            (error) => {
                console.error("Error watching location:", error);
                // Don't set error for watch position failures, just log them
                // This prevents constant error messages during tracking
            },
            geoOptions
        );

        // Send location every 2 minutes (only if moved significantly)
        intervalRef.current = setInterval(() => {
            if (currentLocation) {
                sendLocation(currentLocation);
            }
        }, 120000); // 2 minutes
    };

    const stopTracking = async () => {
        setIsTracking(false);
        setBackgroundTracking(false);

        // Clear localStorage
        localStorage.removeItem(`tracking_${routeId}`);

        // Stop Service Worker tracking
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'STOP_BACKGROUND_TRACKING'
            });
        }

        // Unregister Service Worker completely
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                    console.log('LocationSender: Service Worker unregistered:', registration.scope);
                }
            }
        } catch (error) {
            console.error('LocationSender: Error unregistering Service Worker:', error);
        }

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        console.log('LocationSender: All tracking stopped and Service Worker unregistered');
    };

    const toggleBackgroundTracking = () => {
        console.log("LocationSender: Toggle background tracking clicked, current state:", backgroundTracking);
        
        if (backgroundTracking) {
            // Stop background tracking
            setBackgroundTracking(false);
            localStorage.removeItem(`tracking_${routeId}`);
            console.log("LocationSender: Background tracking stopped");
            
            // Stop service worker tracking
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'STOP_BACKGROUND_TRACKING'
                });
            }
            
            // Notify parent component
            if (onBackgroundTrackingChange) {
                onBackgroundTrackingChange(false);
            }
        } else {
            // Start background tracking
            setBackgroundTracking(true);
            const trackingState = {
                isActive: true,
                startTime: new Date().toISOString(),
                routeId: routeId
            };
            localStorage.setItem(`tracking_${routeId}`, JSON.stringify(trackingState));
            console.log("LocationSender: Background tracking started");
            
            // Start service worker tracking
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Send auth token to Service Worker first
                const token = localStorage.getItem('access_token');
                navigator.serviceWorker.controller.postMessage({
                    type: 'UPDATE_TOKEN',
                    data: { token: token || '' }
                });
                
                // Then start background tracking
                navigator.serviceWorker.controller.postMessage({
                    type: 'START_BACKGROUND_TRACKING',
                    data: { routeId: routeId }
                });
            } else {
                console.warn("LocationSender: Service Worker not available for background tracking");
            }
            
            // Notify parent component
            if (onBackgroundTrackingChange) {
                onBackgroundTrackingChange(true);
            }
        }
    };

    // Calculate distance between two coordinates (in meters)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    };

    // Check if location has changed significantly
    const hasLocationChanged = (newLocation) => {
        if (!lastLocationRef.current) return true;
        
        const distance = calculateDistance(
            lastLocationRef.current.latitude,
            lastLocationRef.current.longitude,
            newLocation.latitude,
            newLocation.longitude
        );
        
        // Only send if moved more than 10 meters
        return distance > 10;
    };

    // Check if enough time has passed since last send
    const shouldSendLocation = (newLocation) => {
        const now = Date.now();
        const timeSinceLastSend = now - (lastSentTimeRef.current || 0);
        
        // Send if moved significantly OR if 5 minutes have passed (for periodic updates)
        return hasLocationChanged(newLocation) || timeSinceLastSend > 300000; // 5 minutes
    };

    const sendLocation = async (location) => {
        // Check if we should send this location
        if (!shouldSendLocation(location)) {
            console.log("LocationSender: Skipping location - no significant movement");
            return;
        }

        try {
            await api.post(`/v1/route/${routeId}/ping/`, {
                latitude: location.latitude,
                longitude: location.longitude,
            });
            
            // Update tracking variables
            lastLocationRef.current = location;
            lastSentTimeRef.current = Date.now();
            
            setLastSent(new Date());
            setSentCount((prev) => prev + 1);
            setError(null);
            
            console.log("LocationSender: Location sent successfully");
        } catch (error) {
            console.error("Error sending location:", error);
            setError("Failed to send location");
        }
    };

    const handleManualSend = () => {
        if (currentLocation) {
            sendLocation(currentLocation);
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setCurrentLocation(location);
                    sendLocation(location);
                },
                (error) => {
                    setError("Unable to get your location");
                }
            );
        }
    };

    const formatTimestamp = (date) => {
        if (!date) return "Never";
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        return date.toLocaleTimeString();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-16 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl mb-4"
            >
                {/* Handle */}
                <div className="flex justify-center py-3 border-b border-gray-200">
                    <div className="w-12 h-1 bg-gray-300 rounded-full" />
                </div>

                <div className="p-6 pb-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                Location Tracking
                            </h3>
                            <p className="text-sm text-gray-500">
                                Sharing your location for this route
                            </p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        )}
                    </div>

                    {/* Status */}
                    <div
                        className={`flex items-center space-x-3 p-4 rounded-xl mb-4 ${
                            isTracking
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50 border border-gray-200"
                        }`}
                    >
                        <div
                            className={`p-2 rounded-full ${
                                isTracking ? "bg-green-100" : "bg-gray-200"
                            }`}
                        >
                            {isTracking ? (
                                <Navigation className="w-5 h-5 text-green-600 animate-pulse" />
                            ) : (
                                <MapPin className="w-5 h-5 text-gray-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p
                                className={`font-medium ${
                                    isTracking ? "text-green-900" : "text-gray-700"
                                }`}
                            >
                                {isTracking ? "🟢 Tracking Active" : "🔴 Tracking Stopped"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {isTracking
                                    ? "📍 Sends location when you move >10m or every 5min"
                                    : "⏸️ Click 'Start Tracking' to begin sharing your location"}
                            </p>
                        </div>
                        <button
                            onClick={isTracking ? stopTracking : startTracking}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isTracking
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                        >
                            {isTracking ? "⏹️ Stop Tracking" : "▶️ Start Tracking"}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4"
                        >
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                    )}

                    {/* Background Tracking Toggle */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                                        🔄 Background Tracking
                                    </h4>
                                    <p className="text-xs text-blue-700">
                                        Continue tracking even when you close this window
                                    </p>
                                </div>
                            <button
                                onClick={toggleBackgroundTracking}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    backgroundTracking ? "bg-blue-600" : "bg-gray-200"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        backgroundTracking ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                            {backgroundTracking && (
                                <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                                    ✅ Background tracking is ON. You can close this window safely.
                                </div>
                            )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                📤 Last Sent
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {formatTimestamp(lastSent)}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">
                                📊 Total Sent
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {sentCount}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">🔴 Status</p>
                            <div className="flex items-center space-x-1">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        isTracking ? "bg-green-500" : "bg-gray-400"
                                    }`}
                                />
                                <p className="text-xs font-semibold text-gray-900">
                                    {isTracking ? "🟢 Live" : "🔴 Offline"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Current Location */}
                    {currentLocation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <p className="text-sm font-medium text-blue-900">
                                    📍 Current Location
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-blue-600">Lat:</span>{" "}
                                    <span className="text-blue-900 font-mono">
                                        {currentLocation.latitude.toFixed(6)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-blue-600">Lng:</span>{" "}
                                    <span className="text-blue-900 font-mono">
                                        {currentLocation.longitude.toFixed(6)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Manual Send Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleManualSend}
                        disabled={!isTracking}
                        className="w-full bg-orange-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        <Navigation className="w-5 h-5" />
                        <span>📤 Send Location Now</span>
                    </motion.button>

                    <p className="text-xs text-center text-gray-500 mt-3">
                        🔒 Location is shared securely and only visible to authorized users
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LocationSender;

