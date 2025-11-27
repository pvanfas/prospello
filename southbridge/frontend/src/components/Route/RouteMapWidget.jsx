import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Navigation,
    Truck,
    RefreshCw,
    Play,
    Pause,
    Maximize2,
    Minimize2,
    Route,
    Eye,
    EyeOff,
    Map,
    Satellite,
    Crosshair,
    Clock,
    Zap,
    Layers,
} from "lucide-react";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

const RouteMapWidget = ({ 
    routeId, 
    route, 
    pings = [], 
    latestLocation, 
    onRefresh,
    websocketState = {},
    autoRefresh = true,
    isFullscreen = false,
    onToggleFullscreen,
    className = ""
}) => {
    const [mapType, setMapType] = useState('roadmap');
    const [showRoutePath, setShowRoutePath] = useState(true);
    const [showCheckpoints, setShowCheckpoints] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const polylineRef = useRef(null);
    const pingMarkersRef = useRef([]);
    const animationRef = useRef(null);

    // Initialize Google Maps
    useEffect(() => {
        if (window.google && window.google.maps && mapContainerRef.current) {
            initMap();
        } else {
            loadGoogleMapsScript();
        }
    }, []);

    // Update map when pings change
    useEffect(() => {
        if (pings.length > 0 && mapInstanceRef.current && window.google) {
            updateMap(pings);
        }
    }, [pings]);

    const loadGoogleMapsScript = () => {
        if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
            console.error("Google Maps API key not configured");
            return;
        }

        if (window.google && window.google.maps) {
            setTimeout(() => {
                if (mapContainerRef.current) {
                    initMap();
                }
            }, 100);
            return;
        }

        const existingScript = document.querySelector(
            `script[src*="maps.googleapis.com"]`
        );
        if (existingScript) {
            existingScript.addEventListener("load", () => {
                setTimeout(() => {
                    if (mapContainerRef.current) {
                        initMap();
                    }
                }, 100);
            });
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,marker`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setTimeout(() => {
                if (mapContainerRef.current) {
                    initMap();
                }
            }, 100);
        };
        script.onerror = (e) => {
            console.error("Failed to load Google Maps script:", e);
        };
        document.head.appendChild(script);
    };

    const initMap = () => {
        if (!mapContainerRef.current || mapInstanceRef.current || !window.google) return;

        const map = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: 20.5937, lng: 78.9629 }, // Center of India
            zoom: 5,
            mapId: "DEMO_MAP_ID",
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }],
                },
            ],
        });

        mapInstanceRef.current = map;
    };


    const updateMap = useCallback((locations) => {
        if (!mapInstanceRef.current || !window.google || locations.length === 0) return;

        const map = mapInstanceRef.current;

        // Clear existing markers and polylines
        if (markerRef.current) {
            markerRef.current.setMap(null);
        }
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }
        pingMarkersRef.current.forEach(marker => {
            if (marker && marker.setMap) {
                marker.setMap(null);
            }
        });
        pingMarkersRef.current = [];

        // Create road-based route between consecutive location pings
        if (locations.length > 1) {
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                suppressMarkers: true, // Don't show default markers
                polylineOptions: {
                    strokeColor: "#f97316",
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                },
            });
            directionsRenderer.setMap(map);

            // Create waypoints from intermediate locations (limit to 23 to stay under Google's 25 waypoint limit)
            // We use 23 because origin + destination + 23 waypoints = 25 total
            const intermediateLocations = locations.slice(1, -1);
            let waypoints = [];
            
            if (intermediateLocations.length <= 23) {
                // Use all intermediate locations as waypoints
                waypoints = intermediateLocations.map(loc => ({
                    location: new window.google.maps.LatLng(loc.latitude, loc.longitude),
                    stopover: false
                }));
            } else {
                // If too many waypoints, sample them evenly
                const step = Math.floor(intermediateLocations.length / 23);
                for (let i = 0; i < intermediateLocations.length; i += step) {
                    if (waypoints.length < 23) {
                        waypoints.push({
                            location: new window.google.maps.LatLng(intermediateLocations[i].latitude, intermediateLocations[i].longitude),
                            stopover: false
                        });
                    }
                }
            }

            // Create route request from start to current location
            const request = {
                origin: new window.google.maps.LatLng(locations[locations.length - 1].latitude, locations[locations.length - 1].longitude), // Start (last in array)
                destination: new window.google.maps.LatLng(locations[0].latitude, locations[0].longitude), // Current (first in array)
                waypoints: waypoints,
                travelMode: window.google.maps.TravelMode.DRIVING,
                avoidHighways: false,
                avoidTolls: false,
            };

            directionsService.route(request, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                    
                    // Fit map to show the entire route
                    const bounds = new window.google.maps.LatLngBounds();
                    result.routes[0].overview_path.forEach((point) => {
                        bounds.extend(point);
                    });
                    map.fitBounds(bounds);
                } else {
                    console.error('Directions request failed due to ' + status);
                    // Fallback to simple polyline if directions fail
                    const path = locations.map(loc => ({
                        lat: loc.latitude,
                        lng: loc.longitude
                    }));

                    polylineRef.current = new window.google.maps.Polyline({
                        path: path,
                        geodesic: true,
                        strokeColor: "#f97316",
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        map: map,
                        visible: showRoutePath,
                    });

                    // Fit map to show all locations
                    const bounds = new window.google.maps.LatLngBounds();
                    locations.forEach((loc) => bounds.extend({ lat: loc.latitude, lng: loc.longitude }));
                    map.fitBounds(bounds);
                }
            });
        } else {
            // If only one location, just fit to that location
            map.setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
            map.setZoom(15);
        }

        // Add markers for all ping locations (except the latest one)
        locations.slice(1).forEach((loc, index) => {
            if (!showCheckpoints) return;

            const pingMarkerElement = document.createElement("div");
            pingMarkerElement.innerHTML = `
                <div style="
                    width: 12px; 
                    height: 12px; 
                    background-color: #3b82f6; 
                    border: 2px solid #ffffff; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
            `;

            const pingMarker = new window.google.maps.marker.AdvancedMarkerElement({
                position: { lat: loc.latitude, lng: loc.longitude },
                map: map,
                content: pingMarkerElement,
                title: `Checkpoint ${locations.length - index - 1}`,
                zIndex: index,
                visible: showCheckpoints,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; min-width: 150px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Checkpoint ${locations.length - index - 1}</h3>
                        <p style="margin: 0; font-size: 12px; color: #666;">
                            ${new Date(loc.timestamp).toLocaleString()}
                        </p>
                    </div>
                `,
            });

            pingMarker.addListener("click", () => {
                infoWindow.open(map, pingMarker);
            });

            pingMarkersRef.current.push(pingMarker);
        });

        // Add custom truck marker for latest location
        const latest = locations[0];
        
        const truckMarkerElement = document.createElement("div");
        truckMarkerElement.innerHTML = `
            <div style="
                width: 32px; 
                height: 32px; 
                background-color: #f97316; 
                border: 3px solid #ffffff; 
                border-radius: 8px 8px 8px 2px; 
                transform: rotate(-45deg);
                box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            ">
                <div style="
                    transform: rotate(45deg);
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                ">🚛</div>
            </div>
        `;

        markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: latest.latitude, lng: latest.longitude },
            map: map,
            content: truckMarkerElement,
            title: "Current Location",
            zIndex: 9999,
        });

        const infoWindow = new window.google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; min-width: 150px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Current Location</h3>
                    <p style="margin: 0; font-size: 12px; color: #666;">
                        ${new Date(latest.timestamp).toLocaleString()}
                    </p>
                </div>
            `,
        });

        markerRef.current.addListener("click", () => {
            infoWindow.open(map, markerRef.current);
        });

        // Fit map to show all locations
        const bounds = new window.google.maps.LatLngBounds();
        locations.forEach((loc) => bounds.extend({ lat: loc.latitude, lng: loc.longitude }));
        map.fitBounds(bounds);
        
        if (locations.length === 1) {
            map.setZoom(15);
        }
    }, [createRoadRoute, showCheckpoints]);

    const centerOnCurrentLocation = () => {
        try {
            if (!mapInstanceRef.current || !latestLocation) return;
            
            const map = mapInstanceRef.current;
            const currentPos = { lat: latestLocation.latitude, lng: latestLocation.longitude };
            
            map.panTo(currentPos);
            map.setZoom(18);
        } catch (error) {
            console.warn('Error centering on current location:', error);
        }
    };

    const toggleMapType = () => {
        const newMapType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
        setMapType(newMapType);
        
        if (mapInstanceRef.current && window.google) {
            mapInstanceRef.current.setMapTypeId(newMapType);
        }
    };

    const animateRoute = () => {
        if (pings.length < 2 || isAnimating) return;
        
        setIsAnimating(true);
        let currentIndex = 0;
        
        const animate = () => {
            if (currentIndex >= pings.length - 1) {
                setIsAnimating(false);
                return;
            }
            
            const currentPing = pings[currentIndex];
            
            if (markerRef.current) {
                markerRef.current.setPosition({
                    lat: currentPing.latitude,
                    lng: currentPing.longitude
                });
            }
            
            currentIndex++;
            animationRef.current = setTimeout(animate, 1000 / animationSpeed);
        };
        
        animate();
    };

    const stopAnimation = () => {
        setIsAnimating(false);
        if (animationRef.current) {
            clearTimeout(animationRef.current);
        }
        
        if (latestLocation && markerRef.current) {
            markerRef.current.setPosition({
                lat: latestLocation.latitude,
                lng: latestLocation.longitude
            });
        }
    };

    const toggleRoutePath = () => {
        setShowRoutePath(!showRoutePath);
        if (polylineRef.current) {
            polylineRef.current.setVisible(!showRoutePath);
        }
    };

    const toggleCheckpoints = () => {
        setShowCheckpoints(!showCheckpoints);
        pingMarkersRef.current.forEach(marker => {
            if (marker && marker.setVisible) {
                marker.setVisible(!showCheckpoints);
            }
        });
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return date.toLocaleDateString();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (markerRef.current && markerRef.current.setMap) {
                markerRef.current.setMap(null);
            }
            if (polylineRef.current && polylineRef.current.setMap) {
                polylineRef.current.setMap(null);
            }
            pingMarkersRef.current.forEach(marker => {
                if (marker && marker.setMap) {
                    marker.setMap(null);
                }
            });
            pingMarkersRef.current = [];
            
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
        };
    }, []);

    return (
        <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Map Container */}
            <div className="w-full h-full relative">
                <div
                    ref={mapContainerRef}
                    className="absolute inset-0 z-10"
                    style={{ height: "100%", width: "100%" }}
                />

                {/* Floating Controls */}
                <div className="absolute top-4 right-4 z-20 space-y-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={centerOnCurrentLocation}
                        className="bg-white shadow-lg hover:shadow-xl p-3 rounded-full transition-all duration-200 border border-gray-200 hover:border-blue-300"
                        title="Center on current location"
                    >
                        <Crosshair className="w-5 h-5 text-gray-700 hover:text-blue-600 transition-colors" />
                    </motion.button>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleRoutePath}
                        className={`shadow-lg hover:shadow-xl p-3 rounded-full transition-all duration-200 ${
                            showRoutePath
                                ? "bg-orange-500 text-white"
                                : "bg-white text-gray-700"
                        }`}
                        title={showRoutePath ? "Hide route path" : "Show route path"}
                    >
                        <Route className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleCheckpoints}
                        className={`shadow-lg hover:shadow-xl p-3 rounded-full transition-all duration-200 ${
                            showCheckpoints
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-700"
                        }`}
                        title={showCheckpoints ? "Hide checkpoints" : "Show checkpoints"}
                    >
                        <MapPin className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMapType}
                        className={`shadow-lg hover:shadow-xl p-3 rounded-full transition-all duration-200 ${
                            mapType === 'satellite'
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-700"
                        }`}
                        title={`Switch to ${mapType === 'roadmap' ? 'Satellite' : 'Road'} view`}
                    >
                        {mapType === 'roadmap' ? (
                            <Satellite className="w-5 h-5" />
                        ) : (
                            <Map className="w-5 h-5" />
                        )}
                    </motion.button>

                    {onToggleFullscreen && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleFullscreen}
                            className="bg-white shadow-lg hover:shadow-xl p-3 rounded-full transition-all duration-200"
                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-5 h-5 text-gray-700" />
                            ) : (
                                <Maximize2 className="w-5 h-5 text-gray-700" />
                            )}
                        </motion.button>
                    )}
                </div>

                {/* Animation Controls */}
                {pings.length > 1 && (
                    <div className="absolute top-4 left-4 z-20">
                        <div className="bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2">
                            <button
                                onClick={isAnimating ? stopAnimation : animateRoute}
                                className={`p-2 rounded-md transition-colors ${
                                    isAnimating
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : "bg-green-500 text-white hover:bg-green-600"
                                }`}
                                title={isAnimating ? "Stop Animation" : "Animate Route"}
                            >
                                {isAnimating ? (
                                    <Pause className="w-4 h-4" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </button>
                            <select
                                value={animationSpeed}
                                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                                className="text-xs bg-gray-50 border rounded px-2 py-1"
                                disabled={isAnimating}
                            >
                                <option value={0.5}>0.5x</option>
                                <option value={1}>1x</option>
                                <option value={2}>2x</option>
                                <option value={4}>4x</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Status Indicator */}
                <div className="absolute bottom-4 left-4 z-20">
                    <div className="bg-white shadow-lg rounded-lg p-3 flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                                websocketState.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-700">
                                {websocketState.isConnected ? 'Live' : 'Offline'}
                            </span>
                        </div>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 text-gray-600 ${
                                    autoRefresh ? 'animate-spin' : ''
                                }`} />
                            </button>
                        )}
                    </div>
                </div>

                {/* No Data State */}
                {!latestLocation && pings.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-white bg-opacity-90">
                        <div className="text-center p-6">
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                            >
                                <MapPin className="w-8 h-8 text-white" />
                            </motion.div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                🚛 Waiting for Location Data
                            </h3>
                            <p className="text-gray-600 text-sm">
                                No tracking data available yet
                            </p>
                        </div>
                    </div>
                )}

                {/* Recenter Button at Bottom - User Friendly Design */}
                {latestLocation && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={centerOnCurrentLocation}
                            className="bg-white shadow-xl hover:shadow-2xl px-6 py-4 rounded-2xl transition-all duration-200 border border-gray-200 hover:border-blue-300 flex items-center space-x-3 min-w-[140px] justify-center"
                            title="Center on current location"
                        >
                            <div className="bg-blue-50 p-2 rounded-full">
                                <Crosshair className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">Recenter</span>
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default RouteMapWidget;
