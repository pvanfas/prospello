import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Truck, MapPin, Navigation, Package, Locate } from 'lucide-react';
import api from '../../services/api';

const TrackOrder = ({ orderId: orderIdProp, onClose }) => {
  // Get orderId from props or URL params
  const { orderId: orderIdParam } = useParams();
  const orderId = orderIdProp || orderIdParam;
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Google Maps API Key from environment variable
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

  // Recenter map to driver location
  const recenterToDriver = () => {
    if (mapInstanceRef.current && orderData?.current_location) {
      mapInstanceRef.current.panTo({
        lat: orderData.current_location.latitude,
        lng: orderData.current_location.longitude,
      });
      mapInstanceRef.current.setZoom(15);
      
      // Add bounce animation to driver marker
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          driverMarkerRef.current.setAnimation(null);
        }, 2000);
      }
    }
  };

  // Fetch tracking data from API
  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching tracking data for order:', orderId);
        
        const response = await api.get(`/v1/tracking/order/${orderId}/track`);
        console.log('Tracking data received:', response.data);
        
        setOrderData(response.data);
      } catch (err) {
        console.error('Error fetching tracking data:', err);
        setError(err.response?.data?.detail || 'Failed to fetch tracking data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [orderId]);

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps?.geometry?.encoding) {
        setMapReady(true);
        return;
      }

      // Check if API key is configured
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in .env file');
        setError('Google Maps API key is not configured');
        return;
      }

      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setMapReady(true);
          resolve();
        };
        script.onerror = () => {
          console.error('Failed to load Google Maps API');
          setError('Failed to load Google Maps. Please check your API key.');
        };
        document.head.appendChild(script);
      });
    };

    loadGoogleMaps();
  }, [GOOGLE_MAPS_API_KEY]);

  // Create accurate road-following route using Directions API
  const createAccurateRoute = (origin, destination, waypoints = []) => {
    return new Promise((resolve) => {
      const directionsService = new window.google.maps.DirectionsService();
      
      // Use more detailed routing options for better accuracy
      const directionsRequest = {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
        avoidFerries: false,
        optimizeWaypoints: true,
        provideRouteAlternatives: false,
        // Use detailed polyline for more accurate road following
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      };

      if (waypoints.length > 0) {
        directionsRequest.waypoints = waypoints.map(wp => ({
          location: new window.google.maps.LatLng(wp.lat, wp.lng),
          stopover: false
        }));
      }

      directionsService.route(directionsRequest, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const route = result.routes[0];
          
          // Get detailed path from each leg for maximum accuracy
          let detailedPath = [];
          route.legs.forEach(leg => {
            if (leg.steps) {
              leg.steps.forEach(step => {
                if (step.path) {
                  detailedPath = detailedPath.concat(step.path);
                }
              });
            }
          });

          // Use detailed path if available, otherwise use overview path
          const finalPath = detailedPath.length > 0 ? detailedPath : route.overview_path;
          
          resolve({
            path: finalPath,
            polyline: route.overview_polyline,
            legs: route.legs,
            distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
            duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
            detailedPath: detailedPath.length > 0
          });
        } else {
          console.warn('Directions request failed:', status);
          resolve(null);
        }
      });
    });
  };

  // Initialize and draw map
  useEffect(() => {
    if (!mapReady || !mapRef.current || !orderData || mapInstanceRef.current) return;

    const initializeMap = async () => {
      try {
        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 10,
          center: { 
            lat: orderData.destination_lat || 10.5, 
            lng: orderData.destination_lng || 76.0 
          },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // Try to create accurate route first
        let routeData = null;
        let polyline = null;

        // If we have origin and destination, try to get accurate road route
        if (orderData.origin_lat && orderData.origin_lng && orderData.destination_lat && orderData.destination_lng) {
          console.log('Creating accurate road-following route...');
          routeData = await createAccurateRoute(
            { lat: orderData.origin_lat, lng: orderData.origin_lng },
            { lat: orderData.destination_lat, lng: orderData.destination_lng }
          );
          
          if (routeData) {
            console.log('Accurate route created:', routeData.path.length, 'points', 
              routeData.detailedPath ? '(detailed path)' : '(overview path)');
            polyline = routeData.polyline;
          }
        }

        // If no route created with coordinates, try using addresses
        if (!routeData && orderData.origin && orderData.destination) {
          console.log('Attempting route creation using addresses...');
          try {
            // Create a geocoder to get coordinates from addresses
            const geocoder = new window.google.maps.Geocoder();
            
            const geocodeAddress = (address) => {
              return new Promise((resolve) => {
                geocoder.geocode({ address }, (results, status) => {
                  if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    resolve({ lat: location.lat(), lng: location.lng() });
                  } else {
                    console.warn('Geocoding failed for:', address);
                    resolve(null);
                  }
                });
              });
            };

            const originCoords = await geocodeAddress(orderData.origin);
            const destCoords = await geocodeAddress(orderData.destination);

            if (originCoords && destCoords) {
              console.log('Creating route from geocoded addresses...');
              routeData = await createAccurateRoute(originCoords, destCoords);
              
              if (routeData) {
                console.log('Address-based route created:', routeData.path.length, 'points');
                polyline = routeData.polyline;
              }
            }
          } catch (error) {
            console.warn('Address geocoding failed:', error);
          }
        }

        // Fallback to API polyline if no accurate route
        if (!routeData && orderData.driver_route_polyline) {
          console.log('Using API polyline as fallback');
          polyline = orderData.driver_route_polyline;
        }

        // Draw the route
        if (polyline) {
          let decodedPath;
          
          if (routeData) {
            // Use detailed path from Directions API for maximum accuracy
            decodedPath = routeData.path;
            console.log('Using detailed route path with', decodedPath.length, 'points for accurate road following');
          } else {
            // Decode API polyline
            decodedPath = window.google.maps.geometry.encoding.decodePath(polyline);
            console.log('Using API polyline with', decodedPath.length, 'points');
          }

          // Draw polyline with road-following accuracy
          new window.google.maps.Polyline({
            path: decodedPath,
            strokeColor: '#3B82F6',
            strokeWeight: 5,
            strokeOpacity: 0.8,
            map: map,
            geodesic: false, // Set to false for more accurate road following
            clickable: false,
          });

          // Fit bounds to include the route
          const bounds = new window.google.maps.LatLngBounds();
          decodedPath.forEach(point => bounds.extend(point));
          map.fitBounds(bounds, { padding: 100 });
        }

        // Create custom SVG icons
        const createMarkerIcon = (color, label) => {
        return {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: color,
          fillOpacity: 0.95,
          strokeColor: '#ffffff',
          strokeWeight: 3,
          scale: 2.2,
          anchor: new window.google.maps.Point(12, 22),
          labelOrigin: new window.google.maps.Point(12, 9),
        };
      };

      const createTruckIcon = () => {
        // Modern truck icon with circular background
        return {
          path: 'M0 12 C0 5.373 5.373 0 12 0 C18.627 0 24 5.373 24 12 C24 18.627 18.627 24 12 24 C5.373 24 0 18.627 0 12 Z M17 8 L15 8 L15 6 L9 6 C8.4 6 8 6.4 8 7 L8 15 L9 15 C9 16.1 9.9 17 11 17 C12.1 17 13 16.1 13 15 L15 15 C15 16.1 15.9 17 17 17 C18.1 17 19 16.1 19 15 L19.5 15 L19.5 11 Z M11 15.5 C10.7 15.5 10.5 15.3 10.5 15 C10.5 14.7 10.7 14.5 11 14.5 C11.3 14.5 11.5 14.7 11.5 15 C11.5 15.3 11.3 15.5 11 15.5 Z M17 15.5 C16.7 15.5 16.5 15.3 16.5 15 C16.5 14.7 16.7 14.5 17 14.5 C17.3 14.5 17.5 14.7 17.5 15 C17.5 15.3 17.3 15.5 17 15.5 Z M15 10 L18 10 L18 11.5 L15 11.5 Z',
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1.8,
          anchor: new window.google.maps.Point(12, 12),
        };
      };

      // Driver current location marker (Truck icon)
      if (orderData.current_location) {
        const driverMarker = new window.google.maps.Marker({
          position: {
            lat: orderData.current_location.latitude,
            lng: orderData.current_location.longitude,
          },
          map: map,
          title: orderData.driver_name || 'Driver Location',
          icon: createTruckIcon(),
          zIndex: 1000,
          optimized: false,
        });
        
        // Store marker reference for recenter functionality
        driverMarkerRef.current = driverMarker;

        // Add info window for driver
        const driverInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui;">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">
                🚛 ${orderData.driver_name || 'Driver'}
              </div>
              <div style="color: #6b7280; font-size: 12px;">
                Current Location
              </div>
            </div>
          `,
        });

        driverMarker.addListener('click', () => {
          driverInfoWindow.open(map, driverMarker);
        });
      }

      // Origin marker (Green)
      if (orderData.origin_lat && orderData.origin_lng) {
        const originMarker = new window.google.maps.Marker({
          position: {
            lat: orderData.origin_lat,
            lng: orderData.origin_lng,
          },
          map: map,
          title: 'Pickup Location',
          icon: createMarkerIcon('#10B981', 'A'),
          label: {
            text: '🏁',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 'bold',
          },
          zIndex: 999,
        });

        // Add info window for origin
        const originInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui;">
              <div style="font-weight: bold; color: #059669; margin-bottom: 4px;">
                📍 Pickup Location
              </div>
              <div style="color: #6b7280; font-size: 12px;">
                ${orderData.origin || 'Origin'}
              </div>
            </div>
          `,
        });

        originMarker.addListener('click', () => {
          originInfoWindow.open(map, originMarker);
        });
      }

      // Destination marker (Red)
      if (orderData.destination_lat && orderData.destination_lng) {
        const destMarker = new window.google.maps.Marker({
          position: {
            lat: orderData.destination_lat,
            lng: orderData.destination_lng,
          },
          map: map,
          title: 'Delivery Location',
          icon: createMarkerIcon('#EF4444', 'B'),
          label: {
            text: '📦',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 'bold',
          },
          zIndex: 999,
        });

        // Add info window for destination
        const destInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui;">
              <div style="font-weight: bold; color: #dc2626; margin-bottom: 4px;">
                📍 Delivery Location
              </div>
              <div style="color: #6b7280; font-size: 12px;">
                ${orderData.destination || 'Destination'}
              </div>
            </div>
          `,
        });

        destMarker.addListener('click', () => {
          destInfoWindow.open(map, destMarker);
        });
      }

        // If no polyline, fit bounds to include all markers
        if (!polyline) {
          const bounds = new window.google.maps.LatLngBounds();
          if (orderData.origin_lat && orderData.origin_lng) {
            bounds.extend({ lat: orderData.origin_lat, lng: orderData.origin_lng });
          }
          if (orderData.destination_lat && orderData.destination_lng) {
            bounds.extend({ lat: orderData.destination_lat, lng: orderData.destination_lng });
          }
          if (orderData.current_location) {
            bounds.extend({ 
              lat: orderData.current_location.latitude, 
              lng: orderData.current_location.longitude 
            });
          }
          map.fitBounds(bounds, { padding: 100 });
        }

      } catch (error) {
        console.error('Map error:', error);
        setError('Failed to render map');
      }
    };

    initializeMap();
  }, [mapReady, orderData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="text-center p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!orderData) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="text-center">
          <p className="text-gray-600">No tracking data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Order #{orderData.order_number}</h2>
            </div>
            
            {/* Destination */}
            <div className="flex items-start gap-2 text-blue-100 text-sm mt-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="flex-1">
                {orderData.destination || 'Destination not available'}
              </span>
            </div>
            
            {/* Driver Info */}
            {orderData.driver_name && (
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-2">
                <Truck className="w-4 h-4 flex-shrink-0" />
                <span>{orderData.driver_name}</span>
              </div>
            )}
            
            {/* Progress */}
            {orderData.route_tracking?.progress_percentage !== undefined && (
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-2">
                <Navigation className="w-4 h-4 flex-shrink-0" />
                <span>Progress: {orderData.route_tracking.progress_percentage.toFixed(1)}%</span>
              </div>
            )}
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full bg-gray-100 relative">
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        
        {/* Recenter Button */}
        {orderData?.current_location && (
          <button
            onClick={recenterToDriver}
            className="absolute bottom-24 right-6 bg-white hover:bg-gray-50 text-blue-600 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-10"
            title="Center on Driver"
            aria-label="Center map on driver location"
          >
            <Locate className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Info Footer */}
      {orderData.route_tracking && (
        <div className="bg-white p-4 shadow-md border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {orderData.route_tracking.distance_covered_km !== undefined && (
              <div>
                <p className="text-gray-500">Distance Covered</p>
                <p className="font-semibold text-gray-800">
                  {orderData.route_tracking.distance_covered_km.toFixed(1)} km
                </p>
              </div>
            )}
            {orderData.route_tracking.total_distance_km !== undefined && (
              <div>
                <p className="text-gray-500">Total Distance</p>
                <p className="font-semibold text-gray-800">
                  {orderData.route_tracking.total_distance_km.toFixed(1)} km
                </p>
              </div>
            )}
          </div>
          {orderData.estimated_arrival && (
            <div className="mt-3">
              <p className="text-gray-500 text-sm">Estimated Arrival</p>
              <p className="font-semibold text-gray-800">
                {new Date(orderData.estimated_arrival).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;