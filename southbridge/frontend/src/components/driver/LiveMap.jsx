import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Navigation, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

const LiveMap = ({ driverRouteId, initialRoute, viewOnly = false }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [traversedPath, setTraversedPath] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const watchIdRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const traversedPolylineRef = useRef(null);
  const destinationMarkersRef = useRef([]);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  // Load Google Maps Script
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
      setError("Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✅ Google Maps loaded successfully");
      setMapLoaded(true);
    };
    script.onerror = (e) => {
      console.error("❌ Failed to load Google Maps:", e);
      setError("Failed to load Google Maps. Please check your API key.");
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
      
      // Initialize Directions Service and Renderer for road-following routes
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // We'll use custom markers
        preserveViewport: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 6,
          zIndex: 50,
        },
      });
      
      console.log("✅ Map initialized successfully");
    } catch (err) {
      console.error("❌ Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [mapLoaded]);

  // Decode polyline string to coordinates
  const decodePolyline = (encoded) => {
  if (!encoded) return [];
  
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    
      poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  
  return poly;
  };

  // Parse destinations and display route polyline
  useEffect(() => {
    console.log('🔍 useEffect triggered for route visualization');
    console.log('Conditions check:', {
      hasInitialRoute: !!initialRoute,
      hasMap: !!mapInstanceRef.current,
      hasGoogle: !!window.google,
    });
    
    if (!initialRoute || !mapInstanceRef.current || !window.google) {
      console.warn('⚠️ Route visualization blocked - missing requirements');
      return;
    }

    try {
      console.log('🗺️ Setting up route visualization...');
      console.log('Initial route data:', initialRoute);
      
      let parsedDestinations = [];
      
      // Get destinations from orders
      const orders = initialRoute.route?.orders || initialRoute.orders || [];
      console.log('Orders found:', orders.length, orders);
      
      orders.forEach((order, index) => {
        console.log(`Order ${index}:`, {
          has_lat: !!order.load_destination_lat,
          has_lng: !!order.load_destination_lng,
          lat: order.load_destination_lat,
          lng: order.load_destination_lng,
          address: order.load_destination
        });
        
        if (order.load_destination_lat && order.load_destination_lng) {
          parsedDestinations.push({
            lat: order.load_destination_lat,
            lng: order.load_destination_lng,
            address: order.load_destination,
            order_number: order.order_number,
            order_id: order.id,
            index: index
          });
        }
      });

      setDestinations(parsedDestinations);
      console.log(`📍 Found ${parsedDestinations.length} destinations:`, parsedDestinations);

      // Clear existing markers and polylines
      destinationMarkersRef.current.forEach(marker => marker.setMap(null));
      destinationMarkersRef.current = [];
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
      }

      // Display route polyline - Try Directions API first, fallback to backend polyline
      if (parsedDestinations.length > 0) {
        console.log('📍 Setting up route polyline visualization...');
        console.log('Has destinations:', parsedDestinations.length);
        
        // First, always try to display backend polyline as fallback
        const routePolyline = initialRoute.route?.overview_polyline || initialRoute.overview_polyline;
        console.log('Backend polyline available:', !!routePolyline);
        console.log('Backend polyline length:', routePolyline?.length);
        
        if (routePolyline) {
          console.log('📍 Displaying backend polyline...');
          const decodedPath = decodePolyline(routePolyline);
          console.log('Decoded path points:', decodedPath.length);
          
          if (decodedPath.length > 0) {
            routePolylineRef.current = new window.google.maps.Polyline({
              path: decodedPath,
              geodesic: false,
              strokeColor: '#3B82F6',
              strokeOpacity: 0.7,
              strokeWeight: 6,
              map: mapInstanceRef.current,
              zIndex: 50,
            });
            console.log(`✅ Backend polyline displayed with ${decodedPath.length} points`);
          } else {
            console.error('❌ Decoded path is empty!');
          }
        } else {
          console.warn('⚠️ No backend polyline available - will try Directions API');
        }
        
        // Always try Google Directions API for accurate road-following route
        if (directionsServiceRef.current && directionsRendererRef.current && parsedDestinations.length >= 1) {
          console.log('📍 Requesting accurate road-following route from Google Directions API...');
          
          // Get origin from route data or use first destination
          const origin = initialRoute.route?.origin || initialRoute.origin;
          const originPoint = origin?.lat && origin?.lng 
            ? { lat: origin.lat, lng: origin.lng }
            : { lat: parsedDestinations[0].lat, lng: parsedDestinations[0].lng };
          
          console.log('📌 Origin:', originPoint);
          console.log('📌 Number of destinations:', parsedDestinations.length);
          console.log('📌 All destinations:', parsedDestinations);
          
          // Build the directions request
          let request;
          
          if (parsedDestinations.length === 1) {
            // Single destination - direct route
            request = {
              origin: originPoint,
              destination: { lat: parsedDestinations[0].lat, lng: parsedDestinations[0].lng },
              travelMode: window.google.maps.TravelMode.DRIVING,
            };
            console.log('📍 Single destination route request:', request);
          } else {
            // Multiple destinations - use waypoints for all intermediate stops
            const waypoints = parsedDestinations.slice(0, -1).map((dest, idx) => {
              console.log(`Waypoint ${idx}:`, dest);
              return {
                location: new window.google.maps.LatLng(dest.lat, dest.lng),
                stopover: true
              };
            });
            
            const finalDestination = parsedDestinations[parsedDestinations.length - 1];
            console.log('Final destination:', finalDestination);
            
            request = {
              origin: originPoint,
              destination: { lat: finalDestination.lat, lng: finalDestination.lng },
              waypoints: waypoints.slice(0, 23), // Google limit is 25 (origin + 23 waypoints + destination)
              travelMode: window.google.maps.TravelMode.DRIVING,
              optimizeWaypoints: false, // Keep order from backend
            };
            console.log('📍 Multiple destination route request:', {
              origin: request.origin,
              destination: request.destination,
              waypointsCount: request.waypoints.length
            });
          }
          
          // Request directions from Google
          directionsServiceRef.current.route(request, (result, status) => {
            console.log('📍 Directions API response status:', status);
            
            if (status === window.google.maps.DirectionsStatus.OK) {
              // Remove backend polyline since we have accurate route
              if (routePolylineRef.current) {
                console.log('🗑️ Removing backend polyline');
                routePolylineRef.current.setMap(null);
                routePolylineRef.current = null;
              }
              
              // Display accurate road-following route
              directionsRendererRef.current.setDirections(result);
              directionsRendererRef.current.setOptions({
                suppressMarkers: true, // We use custom markers
                polylineOptions: {
                  strokeColor: '#3B82F6',
                  strokeOpacity: 0.8,
                  strokeWeight: 6,
                  zIndex: 60,
                },
              });
              
              console.log('✅ Accurate road-following route displayed!');
              console.log('📏 Route legs:', result.routes[0].legs.length);
            } else {
              console.error('❌ Directions API failed with status:', status);
              console.error('Error details:', result);
              console.warn('⚠️ Keeping backend polyline as fallback');
            }
          });
        } else {
          const reason = !directionsServiceRef.current ? 'No directions service' :
                        !directionsRendererRef.current ? 'No directions renderer' :
                        'No destinations';
          console.log(`ℹ️ Using backend polyline only - ${reason}`);
        }
    } else {
        console.warn('⚠️ No destinations available for route display');
      }

      // Add destination markers with order icons
      parsedDestinations.forEach((dest, index) => {
        const markerElement = document.createElement("div");
        markerElement.innerHTML = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <div style="
              background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
              color: white;
              width: 40px;
              height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
              <span style="transform: rotate(45deg); font-weight: bold; font-size: 16px;">${index + 1}</span>
            </div>
          </div>
        `;

        const marker = new window.google.maps.Marker({
          position: { lat: dest.lat, lng: dest.lng },
          map: mapInstanceRef.current,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0 C10 0 2 8 2 18 C2 28 20 50 20 50 S38 28 38 18 C38 8 30 0 20 0 Z" fill="#EF4444" stroke="white" stroke-width="2"/>
                <text x="20" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="white">${index + 1}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 50),
            anchor: new window.google.maps.Point(20, 50),
          },
          title: dest.address || `Stop ${index + 1}`,
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px;">
              <div style="font-weight: bold; font-size: 16px; color: #EF4444; margin-bottom: 8px;">
                📦 Stop ${index + 1}
              </div>
              <div style="margin-bottom: 6px;">
                <strong>Order:</strong> ${dest.order_number || 'N/A'}
              </div>
              <div style="color: #666; font-size: 14px;">
                ${dest.address || 'Destination'}
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          // Close all other info windows
          destinationMarkersRef.current.forEach(m => {
            if (m.infoWindow) m.infoWindow.close();
          });
          infoWindow.open(mapInstanceRef.current, marker);
        });

        marker.infoWindow = infoWindow;
        destinationMarkersRef.current.push(marker);
      });

      // Fit map to show all destinations and route
      if (parsedDestinations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        parsedDestinations.forEach(dest => {
          bounds.extend({ lat: dest.lat, lng: dest.lng });
        });
        
        // Also include route origin if available
        const origin = initialRoute.route?.origin || initialRoute.origin;
        if (origin?.lat && origin?.lng) {
          bounds.extend({ lat: origin.lat, lng: origin.lng });
        }
        
        mapInstanceRef.current.fitBounds(bounds);
      }

      console.log(`✅ Route visualization complete: ${parsedDestinations.length} stops marked`);
    } catch (err) {
      console.error("❌ Error setting up route:", err);
    }
  }, [initialRoute, mapLoaded]);

  // Send location update to server
  const sendLocationUpdate = useCallback(async (locationData) => {
    try {
      await api.post('/v1/tracking/driver/location', locationData);
      console.log('📍 Location update sent');
    } catch (error) {
      console.error('Error sending location update:', error);
    }
  }, []);

  // Start location tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    console.log('🚀 Starting GPS tracking...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: gpsAccuracy, speed: gpsSpeed, heading: gpsHeading } = position.coords;
        
        const newLocation = { lat: latitude, lng: longitude };
        console.log('📍 Location update:', newLocation);
        
        setCurrentLocation(newLocation);
        setAccuracy(gpsAccuracy);
        setSpeed(gpsSpeed ? (gpsSpeed * 3.6).toFixed(1) : 0);
        setHeading(gpsHeading || 0);

        // Add to traversed path
        setTraversedPath(prev => [...prev, newLocation]);

        // Update current marker
        if (mapInstanceRef.current) {
          if (currentMarkerRef.current) {
            currentMarkerRef.current.setMap(null);
          }

          const marker = new window.google.maps.Marker({
            position: newLocation,
            map: mapInstanceRef.current,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" fill="#10B981" stroke="white" stroke-width="4"/>
                  <text x="24" y="32" text-anchor="middle" font-size="28">🚛</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 24),
            },
            title: "Your Current Location",
            zIndex: 10000,
          });

          currentMarkerRef.current = marker;

          // Auto-center map on current location (like Google Maps navigation)
          mapInstanceRef.current.panTo(newLocation);
          if (mapInstanceRef.current.getZoom() < 16) {
            mapInstanceRef.current.setZoom(16);
          }
        }

        // Send location update to server
        sendLocationUpdate({
          latitude,
          longitude,
          accuracy: gpsAccuracy,
          speed: gpsSpeed ? gpsSpeed * 3.6 : null,
          heading: gpsHeading,
          driver_route_id: driverRouteId
        });
      },
      (error) => {
        console.error('❌ Location error:', error);
        alert(`Location error: ${error.message}. Please enable location permissions.`);
      },
      options
    );

    setIsTracking(true);
    console.log('✅ GPS tracking started');
  }, [driverRouteId, sendLocationUpdate]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    console.log('⏸️ GPS tracking stopped');
  }, []);

  // Toggle tracking
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // Update traversed polyline on map (green line showing where driver has been)
  useEffect(() => {
    if (!mapInstanceRef.current || traversedPath.length < 2) return;

    // Remove old polyline
    if (traversedPolylineRef.current) {
      traversedPolylineRef.current.setMap(null);
    }

    // Create new polyline for traversed path
    traversedPolylineRef.current = new window.google.maps.Polyline({
      path: traversedPath,
      geodesic: true,
      strokeColor: "#10B981", // Green
      strokeOpacity: 1.0,
      strokeWeight: 6,
      map: mapInstanceRef.current,
      zIndex: 100,
    });

    console.log(`✅ Updated traversed path: ${traversedPath.length} points`);
  }, [traversedPath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (currentMarkerRef.current) currentMarkerRef.current.setMap(null);
      if (traversedPolylineRef.current) traversedPolylineRef.current.setMap(null);
      if (routePolylineRef.current) routePolylineRef.current.setMap(null);
      if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
      destinationMarkersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [stopTracking]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Map</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Control Panel - Only show if not view-only */}
      {!viewOnly && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-white shadow-lg z-20 relative"
        >
          <div className="px-4 py-4">
            {/* Main Control */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Navigation className="w-6 h-6 text-blue-600" />
                  <span>Live Navigation</span>
                </h2>
                <p className="text-sm text-gray-500">
                  {destinations.length} stops • {traversedPath.length} location updates
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTracking}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center space-x-2 ${
              isTracking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
                {isTracking ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Stop Tracking</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Tracking</span>
                  </>
                )}
              </motion.button>
        </div>
        
        {/* Status Info */}
            <AnimatePresence>
        {isTracking && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-3 gap-3"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                      <p className="text-xs text-blue-700 font-medium">Speed</p>
                    </div>
                    <p className="text-lg font-bold text-blue-900">{speed} km/h</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MapPin className="w-4 h-4 text-green-600 mr-1" />
                      <p className="text-xs text-green-700 font-medium">Accuracy</p>
            </div>
                    <p className="text-lg font-bold text-green-900">
                      {accuracy ? `±${accuracy.toFixed(0)}m` : 'N/A'}
              </p>
            </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Navigation className="w-4 h-4 text-orange-600 mr-1" />
                      <p className="text-xs text-orange-700 font-medium">Heading</p>
            </div>
                    <p className="text-lg font-bold text-orange-900">{heading.toFixed(0)}°</p>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        )}

      {/* Map */}
      <div className="flex-1 relative">
        <div
          ref={mapContainerRef}
          className="absolute inset-0"
          style={{ height: "100%", width: "100%" }}
        />
        
        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-30">
                <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Loading navigation map...</p>
            </div>
                </div>
        )}
        
        {/* Info overlay showing route loaded */}
        {!isTracking && destinations.length > 0 && mapLoaded && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-20 max-w-xs">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Optimal Route Loaded</h3>
                <p className="text-sm text-gray-600">
                  {destinations.length} stop{destinations.length !== 1 ? 's' : ''} marked on the map
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Click "Start Tracking" to begin navigation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;
