import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiveMap from '../components/driver/LiveMap';
import api from '../services/api';

const DriverTracking = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRouteData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📍 Fetching route data for:', routeId);
      const response = await api.get(`/v1/route/${routeId}/`);
      
      console.log('✅ Route data fetched:', response.data);
      console.log('📦 Route structure:', {
        hasRoute: !!response.data.route,
        hasOrders: !!response.data.route?.orders,
        ordersCount: response.data.route?.orders?.length || 0
      });
      
      // The API returns { route: {...} }, so we extract the route object
      setRouteData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching route data:', err);
      
      // Better error messages based on status code
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this route. Only drivers can access tracking.');
      } else if (err.response?.status === 404) {
        setError('Route not found. Please check the route ID.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load route information. Please try again.');
      }
      
      setLoading(false);
    }
  }, [routeId, navigate]);

  useEffect(() => {
    if (routeId) {
      fetchRouteData();
    }
  }, [routeId, fetchRouteData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have route data
  if (!routeData || !routeData.route) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No route data available</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🚛 Live Tracking</h1>
            <p className="text-sm text-blue-100">
              Route: {routeData.route.name || 'Route'}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Map Component */}
      <div className="flex-1">
        <LiveMap 
          driverRouteId={routeId} 
          initialRoute={routeData}
          viewOnly={false}
        />
      </div>
    </div>
  );
};

export default DriverTracking;
