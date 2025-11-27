import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ArrowLeft,
    MapPin,
    Navigation,
    Truck,
    RefreshCw,
    AlertCircle,
    Package,
    Crosshair,
} from "lucide-react";
import api from "../services/api";
import Loader from "../components/Loader";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

console.log("TrackOrder: GOOGLE_MAPS_API_KEY =", GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 20)}...` : "NOT SET");
console.log("TrackOrder: import.meta.env.VITE_GOOGLE_MAPS_API_KEY =", import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "SET" : "NOT SET");

const TrackOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const websocketState = useSelector(state => state.websocket || {});
    const { manualReconnect, refreshTokenAndReconnect } = websocketState;
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Debug loading state changes
    useEffect(() => {
        console.log("📊 TrackOrder: Loading state changed", { loading, isRefreshing, error: !!error });
    }, [loading, isRefreshing, error]);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRefs = useRef({
        origin: null,
        destination: null,
        current: null,
    });
    const polylineRef = useRef(null);
    const pingMarkersRef = useRef([]);

    // Create road-based route between location pings
    const createRoadRoute = useCallback((pings, map) => {
        if (pings.length < 2) return;

        // Clear existing polyline
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        // Create route between consecutive pings
        const routePromises = [];
        for (let i = 0; i < pings.length - 1; i++) {
            const origin = new window.google.maps.LatLng(pings[i].latitude, pings[i].longitude);
            const destination = new window.google.maps.LatLng(pings[i + 1].latitude, pings[i + 1].longitude);

            const request = {
                origin: origin,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
                avoidHighways: false,
                avoidTolls: false,
            };

            routePromises.push(
                new Promise((resolve) => {
                    const directionsService = new window.google.maps.DirectionsService();
                    directionsService.route(request, (result, status) => {
                        if (status === window.google.maps.DirectionsStatus.OK) {
                            resolve(result.routes[0].overview_path);
                        } else {
                            // Fallback to straight line if routing fails
                            resolve([origin, destination]);
                        }
                    });
                })
            );
        }

        // Wait for all routes to be calculated
        Promise.all(routePromises).then((routePaths) => {
            // Combine all route paths
            const combinedPath = routePaths.flat();
            
            // Create polyline with road-based path
            polylineRef.current = new window.google.maps.Polyline({
                path: combinedPath,
                geodesic: true,
                strokeColor: "#f97316",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map: map,
            });

            // Extend bounds to include the route
            const bounds = new window.google.maps.LatLngBounds();
            combinedPath.forEach((point) => bounds.extend(point));
            map.fitBounds(bounds);
        });
    }, []);

    const updateMap = useCallback((data) => {
        console.log("TrackOrder: updateMap called with data:", data);
        
        if (!mapInstanceRef.current) {
            console.log("TrackOrder: updateMap - map instance not ready");
            return;
        }
        
        if (!window.google) {
            console.log("TrackOrder: updateMap - Google Maps not loaded");
            return;
        }

        const map = mapInstanceRef.current;
        console.log("TrackOrder: updateMap - updating map with data");

        // Clear existing markers and polylines
        Object.values(markerRefs.current).forEach((marker) => {
            if (marker) marker.setMap(null);
        });
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }
        // Clear all ping markers
        pingMarkersRef.current.forEach(marker => {
            if (marker && marker.setMap) {
                marker.setMap(null);
            }
        });
        pingMarkersRef.current = [];

        const bounds = new window.google.maps.LatLngBounds();

        // Add origin marker if coordinates available
        if (data.load?.origin_lat && data.load?.origin_lng) {
            const originMarkerElement = document.createElement("div");
            originMarkerElement.innerHTML = `
                <div style="
                    width: 16px; 
                    height: 16px; 
                    background-color: #10b981; 
                    border: 2px solid #ffffff; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
            `;

            // Check if AdvancedMarkerElement is available, fallback to regular Marker
            if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
                markerRefs.current.origin = new window.google.maps.marker.AdvancedMarkerElement({
                    position: {
                        lat: data.load.origin_lat,
                        lng: data.load.origin_lng,
                    },
                    map: map,
                    content: originMarkerElement,
                    title: "Origin",
                });
            } else {
                // Fallback to regular Marker
                markerRefs.current.origin = new window.google.maps.Marker({
                    position: {
                        lat: data.load.origin_lat,
                        lng: data.load.origin_lng,
                    },
                    map: map,
                    title: "Origin",
                });
            }

            const originInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: #10b981;">Origin</h3>
                        <p style="margin: 0; font-size: 12px;">${data.load.origin}</p>
                    </div>
                `,
            });

            markerRefs.current.origin.addListener("click", () => {
                originInfoWindow.open(map, markerRefs.current.origin);
            });

            bounds.extend({
                lat: data.load.origin_lat,
                lng: data.load.origin_lng,
            });
        }

        // Add destination marker if coordinates available
        if (data.load?.destination_lat && data.load?.destination_lng) {
            const destMarkerElement = document.createElement("div");
            destMarkerElement.innerHTML = `
                <div style="
                    width: 16px; 
                    height: 16px; 
                    background-color: #ef4444; 
                    border: 2px solid #ffffff; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
            `;

            // Check if AdvancedMarkerElement is available, fallback to regular Marker
            if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
                markerRefs.current.destination = new window.google.maps.marker.AdvancedMarkerElement({
                    position: {
                        lat: data.load.destination_lat,
                        lng: data.load.destination_lng,
                    },
                    map: map,
                    content: destMarkerElement,
                    title: "Destination",
                });
            } else {
                // Fallback to regular Marker
                markerRefs.current.destination = new window.google.maps.Marker({
                    position: {
                        lat: data.load.destination_lat,
                        lng: data.load.destination_lng,
                    },
                    map: map,
                    title: "Destination",
                });
            }

            const destInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: #ef4444;">Destination</h3>
                        <p style="margin: 0; font-size: 12px;">${data.load.destination}</p>
                    </div>
                `,
            });

            markerRefs.current.destination.addListener("click", () => {
                destInfoWindow.open(map, markerRefs.current.destination);
            });

            bounds.extend({
                lat: data.load.destination_lat,
                lng: data.load.destination_lng,
            });
        }

        // If there are location pings, show the path and current location
        if (data.pings && data.pings.length > 0) {
            // Create road-based route between pings
            createRoadRoute(data.pings, map);

            // Removed blue checkpoint pins - only show origin, destination, and current location

            // Add current location marker (latest ping)
            const latest = data.pings[0];
            const truckMarkerElement = document.createElement("div");
            truckMarkerElement.innerHTML = `
                <div style="
                    width: 24px; 
                    height: 24px; 
                    background-color: #f97316; 
                    border: 3px solid #ffffff; 
                    border-radius: 50% 50% 50% 0; 
                    transform: rotate(-45deg);
                    box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        transform: rotate(45deg);
                        color: white;
                        font-size: 12px;
                        font-weight: bold;
                    ">🚛</div>
                </div>
            `;

            // Check if AdvancedMarkerElement is available, fallback to regular Marker with custom truck icon
            if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
                markerRefs.current.current = new window.google.maps.marker.AdvancedMarkerElement({
                    position: { lat: latest.latitude, lng: latest.longitude },
                    map: map,
                    content: truckMarkerElement,
                    title: "Current Location",
                    zIndex: 9999, // Make sure it's on top
                });
            } else {
                // Fallback to regular Marker using a custom SVG truck icon
                const truckSvg = {
                    path: "M8 1h6a2 2 0 0 1 2 2v5h2.5a1.5 1.5 0 0 1 1.341.835l1.5 3A1.5 1.5 0 0 1 21 14.5V17a2 2 0 0 1-2 2h-1a2.5 2.5 0 1 1-5 0H10a2.5 2.5 0 1 1-5 0H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h4zm8 2H8v5h8V3zm2 7h-2v2h4v-.5l-1.333-2.667A.5.5 0 0 0 18 10z",
                    fillColor: "#f97316",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 1,
                    scale: 1.2,
                    anchor: new window.google.maps.Point(12, 18)
                };
                markerRefs.current.current = new window.google.maps.Marker({
                    position: { lat: latest.latitude, lng: latest.longitude },
                    map: map,
                    title: "Current Location",
                    zIndex: 9999, // Make sure it's on top
                    icon: truckSvg
                });
            }

            const currentInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">Current Location</h3>
                        <p style="margin: 0; font-size: 12px; color: #666;">
                            ${new Date(latest.timestamp).toLocaleString()}
                        </p>
                    </div>
                `,
            });

            markerRefs.current.current.addListener("click", () => {
                currentInfoWindow.open(map, markerRefs.current.current);
            });

            // Extend bounds to include all pings
            data.pings.forEach((ping) => bounds.extend({ lat: ping.latitude, lng: ping.longitude }));
        }

        // Fit map to bounds
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds);
            
            // If only current location exists (no route), zoom in more
            if (data.pings && data.pings.length === 1) {
                setTimeout(() => {
                    map.setZoom(16);
                }, 100);
            }
        }
    }, []);

    const initMapInstance = useCallback(() => {
        if (!mapContainerRef.current) {
            console.log("TrackOrder: Cannot init map - container ref not ready");
            return;
        }
        
        // Check container dimensions
        const container = mapContainerRef.current;
        const rect = container.getBoundingClientRect();
        console.log("TrackOrder: Container dimensions:", { width: rect.width, height: rect.height });
        
        if (rect.width === 0 || rect.height === 0) {
            console.log("TrackOrder: Container has zero dimensions, retrying in 100ms");
            setTimeout(initMapInstance, 100);
            return;
        }
        
        if (mapInstanceRef.current) {
            console.log("TrackOrder: Map already initialized");
            return;
        }
        if (!window.google) {
            console.log("TrackOrder: Cannot init map - Google Maps not loaded");
            return;
        }

        console.log("🗺️ TrackOrder: Initializing map...");
        try {
            const map = new window.google.maps.Map(mapContainerRef.current, {
                center: { lat: 20.5937, lng: 78.9629 },
                zoom: 5,
                mapId: "DEMO_MAP_ID", // Required for Advanced Markers
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
            console.log("✅ TrackOrder: Map initialized successfully");
        } catch (error) {
            console.error("❌ TrackOrder: Map initialization failed:", error);
            setError("Failed to initialize map. Please check your Google Maps API key.");
        }
    }, []);

    const loadGoogleMapsScript = useCallback(() => {
        console.log("TrackOrder: loadGoogleMapsScript called");
        
        // Check if API key is configured
        if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
            console.error("Google Maps API key not configured");
            setError("Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.");
            return;
        }

        console.log("TrackOrder: API key OK, checking if Google Maps loaded...");
        
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            console.log("TrackOrder: Google Maps already loaded");
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                if (mapContainerRef.current) {
                    initMapInstance();
                }
            }, 100);
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector(
            `script[src*="maps.googleapis.com"]`
        );
        if (existingScript) {
            console.log("TrackOrder: Google Maps script already being loaded, waiting...");
            return; // Don't add another listener, script is already loading
        }

        console.log("TrackOrder: Loading Google Maps script...");
            // Load the script
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,marker`;
            script.async = true;
            script.defer = true;
        script.onload = () => {
            console.log("TrackOrder: Google Maps script loaded successfully");
            setTimeout(() => {
                if (mapContainerRef.current) {
                    initMapInstance();
                }
            }, 100);
        };
        script.onerror = (e) => {
            console.error("Failed to load Google Maps script:", e);
            setError("Failed to load Google Maps. Please check your API key and internet connection.");
        };
        document.head.appendChild(script);
    }, [initMapInstance]);

        const fetchTrackingData = useCallback(async (isManualRefresh = false) => {
            try {
                if (isManualRefresh) {
                    setIsRefreshing(true);
                    console.log("🔄 TrackOrder: Manual refresh triggered");
                } else {
                    setLoading(true);
                    console.log("🔄 TrackOrder: Initial loading started");
                }
                setError(null);
                const response = await api.get(`/v1/tracking/order/${orderId}/track`);
                console.log("TrackOrder: Fetched tracking data:", response.data);
                setTrackingData(response.data);

                // Ensure map is initialized before updating
                if (mapInstanceRef.current) {
                    console.log("TrackOrder: Map exists, updating...");
                    updateMap(response.data);
                } else if (window.google && window.google.maps && mapContainerRef.current) {
                    console.log("TrackOrder: Map not initialized, initializing now...");
                    initMapInstance();
                    setTimeout(() => {
                        console.log("TrackOrder: Updating map after init...");
                        updateMap(response.data);
                    }, 200);
                } else {
                    console.log("TrackOrder: Cannot initialize map - Google Maps not ready or container not ready");
                    console.log("TrackOrder: Google Maps loaded:", !!window.google);
                    console.log("TrackOrder: Container ready:", !!mapContainerRef.current);
                    
                    // Retry after a delay if Google Maps is still loading
                    if (!window.google && mapContainerRef.current) {
                        console.log("TrackOrder: Retrying map initialization in 1 second...");
                        setTimeout(() => {
                            if (window.google && window.google.maps) {
                                initMapInstance();
                                setTimeout(() => updateMap(response.data), 200);
                            }
                        }, 1000);
                    }
                }
            } catch (error) {
                console.error("Error fetching tracking data:", error);
                if (error.code === 'ERR_NETWORK' || error.message?.includes('Could not establish connection')) {
                    setError("Connection error. Please check your internet connection and try again.");
                } else {
                    setError("Failed to load tracking data");
                }
            } finally {
                console.log("🏁 TrackOrder: Loading completed");
                setLoading(false);
                setIsRefreshing(false);
            }
        }, [orderId, updateMap, initMapInstance]);

    useEffect(() => {
        fetchTrackingData();
        loadGoogleMapsScript();
        
        // Cleanup function
        return () => {
            // Clear markers
            if (markerRefs.current) {
                Object.values(markerRefs.current).forEach((marker) => {
                    if (marker && marker.setMap) {
                        marker.setMap(null);
                    }
                });
            }
            // Clear polyline
            if (polylineRef.current && polylineRef.current.setMap) {
                polylineRef.current.setMap(null);
            }
            // Clear ping markers
            pingMarkersRef.current.forEach(marker => {
                if (marker && marker.setMap) {
                    marker.setMap(null);
                }
            });
            pingMarkersRef.current = [];
        };
    }, [orderId, fetchTrackingData, loadGoogleMapsScript]);

    // WebSocket listener for real-time location updates
    useEffect(() => {
        if (!websocketState.isConnected || !websocketState.messages || !trackingData) return;

        const messages = websocketState.messages;
        if (messages.length === 0) return;
        
        const lastMessage = messages[messages.length - 1];

        // Check if the message is a location update for this order's route
        if (lastMessage && 
            (lastMessage.type === "location_update" || lastMessage.type === "order_location_update") && 
            trackingData.route && 
            lastMessage.route_id === trackingData.route.id) {
            
            console.log("📍 TrackOrder: WebSocket location update received", {
                routeId: lastMessage.route_id,
                location: lastMessage.data,
                timestamp: new Date().toISOString()
            });
            
            // Check if this is a new ping (not already processed)
            const isNewPing = !trackingData.pings || 
                trackingData.pings.length === 0 || 
                trackingData.pings[0].timestamp !== lastMessage.data.timestamp;
            
            if (isNewPing) {
                console.log("🔄 TrackOrder: Processing new location ping", {
                    isNewPing,
                    currentPingsCount: trackingData.pings?.length || 0,
                    newLocation: lastMessage.data
                });
                
                // Update tracking data with new ping
                setTrackingData(prev => ({
                    ...prev,
                    pings: [lastMessage.data, ...(prev.pings || [])]
                }));
                
                // Update map smoothly without full re-render
                if (mapInstanceRef.current && lastMessage.data) {
                    const map = mapInstanceRef.current;
                    const newLocation = { lat: lastMessage.data.latitude, lng: lastMessage.data.longitude };
                    
                    console.log("🗺️ TrackOrder: Updating map with new location", {
                        newLocation,
                        mapReady: !!mapInstanceRef.current,
                        markerExists: !!markerRefs.current.current
                    });
                    
                    // Update current location marker position
                    if (markerRefs.current.current) {
                        markerRefs.current.current.setPosition(newLocation);
                        console.log("✅ TrackOrder: Marker position updated");
                    } else {
                        console.warn("⚠️ TrackOrder: Current location marker not found");
                    }
                    
                    // Smooth pan to new location
                    map.panTo(newLocation);
                    console.log("🎯 TrackOrder: Map panned to new location");
                    
                    // If this is the first location, zoom in
                    if (trackingData.pings.length === 0) {
                        map.setZoom(16);
                        console.log("🔍 TrackOrder: Zoomed to first location");
                    }
                } else {
                    console.warn("⚠️ TrackOrder: Map not ready for location update", {
                        mapReady: !!mapInstanceRef.current,
                        locationData: !!lastMessage.data
                    });
                }
            } else {
                console.log("⏭️ TrackOrder: Skipping duplicate location update", {
                    timestamp: lastMessage.data.timestamp,
                    currentTimestamp: trackingData.pings?.[0]?.timestamp
                });
            }
        }
    }, [websocketState.messages, trackingData?.route?.id, websocketState.isConnected]);

    // WebSocket connection status logging
    useEffect(() => {
        console.log("🔌 TrackOrder: WebSocket status changed", {
            isConnected: websocketState.isConnected,
            routeId: trackingData?.route?.id,
            timestamp: new Date().toISOString()
        });
        
        if (!websocketState.isConnected && trackingData?.route?.id) {
            console.warn("⚠️ TrackOrder: WebSocket disconnected - live updates paused", {
                routeId: trackingData.route.id,
                lastPingCount: trackingData.pings?.length || 0,
                timestamp: new Date().toISOString()
            });
            
            // Show notification to user
            if (trackingData.pings && trackingData.pings.length > 0) {
                console.log("📢 TrackOrder: Showing offline notification to user");
            }
        } else if (websocketState.isConnected && trackingData?.route?.id) {
            console.log("✅ TrackOrder: WebSocket connected - live updates active", {
                routeId: trackingData.route.id,
                timestamp: new Date().toISOString()
            });
        }
    }, [websocketState.isConnected, trackingData?.route?.id]);

    // NO POLLING - Only WebSocket for live updates
    // Removed all polling logic - WebSocket handles everything

        // Update map only on initial load, not on every trackingData change
        useEffect(() => {
            if (trackingData && mapInstanceRef.current && trackingData.pings && trackingData.pings.length > 0) {
                // Only update map on initial load
                updateMap(trackingData);
                
                // Auto-zoom to current location when page first loads
                const latest = trackingData.pings[0];
                const map = mapInstanceRef.current;
                
                // Pan to current location
                map.panTo({ lat: latest.latitude, lng: latest.longitude });
                
                // Set appropriate zoom level
                setTimeout(() => {
                    map.setZoom(16);
                }, 500);
            }
        }, [trackingData?.pings?.length]); // Only re-run when ping count changes (initial load)

    // Initialize map when Google Maps becomes available
    useEffect(() => {
        if (window.google && window.google.maps && mapContainerRef.current && !mapInstanceRef.current && trackingData) {
            console.log("TrackOrder: Google Maps became available, initializing map...");
            initMapInstance();
            setTimeout(() => {
                if (mapInstanceRef.current) {
                    updateMap(trackingData);
                }
            }, 200);
        }
    }, [trackingData, initMapInstance, updateMap]);

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

    if (loading) {
        console.log("🔄 TrackOrder: Showing loading spinner");
        return <Loader />;
    }

    if (error || !trackingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Error Loading Tracking
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
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

    const latestLocation = trackingData.pings && trackingData.pings.length > 0 ? trackingData.pings[0] : null;

    const centerOnCurrentLocation = () => {
        if (!mapInstanceRef.current || !latestLocation) {
            console.log("TrackOrder: Cannot center - map or location not ready");
            return;
        }
        
        const map = mapInstanceRef.current;
        const currentPos = { lat: latestLocation.latitude, lng: latestLocation.longitude };
        
        console.log("TrackOrder: Centering on location:", currentPos);
        map.panTo(currentPos);
        map.setZoom(18); // Zoom in close (max street level)
    };

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
                                    Track Order
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {trackingData.order_number}
                                </p>
                            </div>
                        </div>
                        {trackingData.has_route && (
                            <div className="flex items-center space-x-2">
                                {/* Connection Status */}
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                                    websocketState.isConnected 
                                        ? "bg-green-100 text-green-700" 
                                        : "bg-red-100 text-red-700"
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        websocketState.isConnected ? "bg-green-500" : "bg-red-500"
                                    }`}></div>
                                    <span>
                                        {websocketState.isConnected 
                                            ? "Live" 
                                            : websocketState.isRefreshing 
                                                ? "Refreshing..." 
                                                : "Offline"
                                        }
                                    </span>
                                </div>
                                
                                {/* WebSocket Reconnection Button - Only show when offline */}
                                {!websocketState.isConnected && (
                                    <button
                                        onClick={() => {
                                            if (refreshTokenAndReconnect) {
                                                console.log('🔐 TrackOrder: Token refresh requested');
                                                refreshTokenAndReconnect();
                                            } else if (manualReconnect) {
                                                console.log('🔄 TrackOrder: Manual WebSocket reconnection requested');
                                                manualReconnect();
                                            }
                                        }}
                                        disabled={isRefreshing}
                                        className={`p-2 rounded-full transition-colors ${
                                            isRefreshing
                                                ? "bg-orange-100 text-orange-600"
                                                : "bg-red-100 text-red-600 hover:bg-red-200"
                                        }`}
                                        title="Reconnect to live tracking"
                                    >
                                        <RefreshCw
                                            className={`w-5 h-5 ${
                                                isRefreshing ? "animate-spin" : ""
                                            }`}
                                        />
                                    </button>
                                )}
                                
                                {/* Auto-refresh Toggle */}
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`p-2 rounded-full transition-colors ${
                                        autoRefresh
                                            ? "bg-orange-100 text-orange-600"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                    title={autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
                                >
                                    <RefreshCw
                                        className={`w-5 h-5 ${
                                            autoRefresh ? "animate-spin" : ""
                                        }`}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative" style={{ minHeight: "400px" }}>
                <div
                    ref={mapContainerRef}
                    className="absolute inset-0 z-10"
                    style={{ height: "100%", width: "100%", minHeight: "400px" }}
                ></div>

                {/* Floating Info Card */}
                {trackingData.has_route && latestLocation ? (
                    <div className="absolute bottom-20 left-4 right-4 z-20 mb-4">
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-orange-100 p-2 rounded-lg">
                                        <Truck className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            Current Location
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatTimestamp(latestLocation.timestamp)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={centerOnCurrentLocation}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Center on current location"
                                    >
                                        <Crosshair className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {trackingData.load && (
                                <div className="mb-3 pt-3 border-t border-gray-100">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="flex items-center space-x-1 mb-1">
                                                <MapPin className="w-3 h-3 text-green-600" />
                                                <p className="text-xs text-gray-500">Origin</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {trackingData.load.origin}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-1 mb-1">
                                                <MapPin className="w-3 h-3 text-red-600" />
                                                <p className="text-xs text-gray-500">Destination</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {trackingData.load.destination}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {trackingData.pings && trackingData.pings.length > 0 && (
                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Total checkpoints</span>
                                        <span className="font-medium text-orange-600">
                                            {trackingData.pings.length}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="absolute bottom-20 left-4 right-4 z-20 mb-4">
                        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-900 mb-1">
                                {trackingData.has_route ? "Waiting for Updates" : "No Route Assigned"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {trackingData.has_route
                                    ? "The driver hasn't started sharing location yet"
                                    : "This order hasn't been assigned to a route"}
                            </p>
                            {trackingData.load && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-left">
                                            <p className="text-xs text-gray-500 mb-1">Origin</p>
                                            <p className="font-medium text-gray-900">
                                                {trackingData.load.origin}
                                            </p>
                                        </div>
                                        <Navigation className="w-4 h-4 text-gray-400 mx-2" />
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">Destination</p>
                                            <p className="font-medium text-gray-900">
                                                {trackingData.load.destination}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;

