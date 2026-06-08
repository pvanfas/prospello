import axios from 'axios';
import { store } from '../redux/store'; // Import the store directly
import { refreshTokenSuccess, logout, setRefreshing } from '../redux/authSlice';

// Function to stop all background tracking and Service Worker
const stopAllTrackingOnLogout = async () => {
    try {
        // Stop Service Worker tracking
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'STOP_BACKGROUND_TRACKING'
            });
        }

        // Unregister all Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
                console.log('Service Worker unregistered on auto-logout:', registration.scope);
            }
        }

        // Clear all tracking states from localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('tracking_')) {
                localStorage.removeItem(key);
            }
        });

        console.log('All background tracking stopped on auto-logout');
    } catch (error) {
        console.error('Error stopping tracking on auto-logout:', error);
    }
};

// Use backend URL from environment variable
const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000/api';
const api = axios.create({
  baseURL,
});

// Global flag to prevent multiple refresh attempts
let isRefreshingToken = false;
const skipAuthEndpoints = [
  '/v1/auth/send-otp/',
  '/v1/auth/signup/',
  '/v1/auth/send-login-otp/',
  '/v1/auth/login/otp/',
  '/v1/auth/logout',
  '/v1/auth/refresh', // Add refresh endpoint to skip list to prevent infinite loops
  '/api/v1/auth/logout-all',
];
// Request interceptor to add token
api.interceptors.request.use(
  config => {
    // Skip adding token for specific endpoints
    if (!skipAuthEndpoints.some(endpoint => config.url.includes(endpoint))) {
      const state = store.getState();
      const token = state.auth.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !skipAuthEndpoints.some(endpoint => originalRequest.url.includes(endpoint))
    ) {
      originalRequest._retry = true;
      console.log('🚨 401 Unauthorized detected, attempting token refresh for:', originalRequest.url);
      
      const state = store.getState();
      const { refreshToken, isRefreshing, accessToken } = state.auth;
      
      console.log('Current auth state:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        isRefreshing,
        accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'None'
      });
      
      // Check if refresh token exists
      if (!refreshToken) {
        console.error('❌ No refresh token available');
        await stopAllTrackingOnLogout();
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      console.log('🔑 Refresh token found, proceeding with refresh...');
      
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingToken) {
        console.log('⏳ Refresh already in progress, waiting...');
        // Wait for the current refresh to complete
        return new Promise((resolve, reject) => {
          const maxWaitTime = 15000; // 15 seconds max wait
          const startTime = Date.now();
          
          const checkRefresh = () => {
            const elapsedTime = Date.now() - startTime;
            
            if (elapsedTime > maxWaitTime) {
              console.error('❌ Refresh timeout - waited too long, forcing logout');
              // Force logout and redirect
              isRefreshingToken = false;
              store.dispatch(logout());
              window.location.href = '/login';
              reject(new Error('Refresh token timeout'));
              return;
            }
            
            if (!isRefreshingToken) {
              // Refresh completed, retry original request with new token
              console.log('✅ Refresh completed, retrying original request');
              const currentState = store.getState();
              const newToken = currentState.auth.accessToken;
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(api(originalRequest));
              } else {
                console.error('❌ No new token available after refresh');
                reject(new Error('No new token after refresh'));
              }
            } else {
              // Still refreshing, check again
              setTimeout(checkRefresh, 200); // Check every 200ms
            }
          };
          checkRefresh();
        });
      }
      
      try {
        // Set global refreshing flag and Redux state
        isRefreshingToken = true;
        store.dispatch(setRefreshing(true));
        console.log('🔄 Attempting to refresh token...');
        
        // Call refresh endpoint with explicit error handling
        console.log('📡 Making refresh token request to:', `${baseURL}/v1/auth/refresh`);
        const res = await axios.post(`${baseURL}/v1/auth/refresh`, {
          refresh_token: refreshToken,
        }, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Token refresh successful');
        console.log('New tokens received:', {
          accessToken: res.data.access_token ? 'Present' : 'Missing',
          refreshToken: res.data.refresh_token ? 'Present' : 'Missing'
        });
        
        // Update the store with new tokens
        store.dispatch(refreshTokenSuccess({
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
        }));
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        console.error('❌ Token refresh failed:', err);
        console.error('Refresh error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url
        });
        
        // Reset global flag
        isRefreshingToken = false;
        
        // Stop all background tracking before logout
        await stopAllTrackingOnLogout();
        store.dispatch(logout());
        
        // Only redirect if this is not a timeout error (timeout errors are handled in the waiting logic)
        if (!err.message?.includes('timeout')) {
          console.log('🔄 Redirecting to login due to refresh failure');
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        // Ensure refreshing state is always reset
        console.log('🏁 Refresh attempt completed, resetting flags');
        isRefreshingToken = false;
        store.dispatch(setRefreshing(false));
      }
    }
    return Promise.reject(error);
  }
);

// Add bid functions directly to api instance
api.getDriverBids = () => api.get('/v1/bidding/driver/');
api.deleteBid = (bidId) => api.delete(`/v1/bidding/${bidId}`);
api.createBid = (loadId, bidData) => api.post(`/v1/bidding/loads/${loadId}/bids`, bidData);
api.getBidsForLoad = (loadId) => api.get(`/v1/bidding/loads/${loadId}/bids`);
api.acceptBid = (bidId, data) => api.post(`/v1/bidding/bids/${bidId}/accept`, data);
api.rejectBid = (bidId) => api.post(`/v1/bidding/${bidId}/reject`);

// Profile API functions
export const profileAPI = {
  // Get profile status
  getProfileStatus: () => api.get('/v1/profile/profile-status/'),
  
  // Shipper profile functions
  getShipperProfile: () => api.get('/v1/profile/shipper/'),
  createShipperProfile: (data) => api.post('/v1/profile/shipper/', data),
  updateShipperProfile: (data) => api.put('/v1/profile/shipper/', data),
  
  // Broker profile functions
  getBrokerProfile: () => api.get('/v1/profile/broker/'),
  createBrokerProfile: (data) => api.post('/v1/profile/broker/', data),
  updateBrokerProfile: (data) => api.put('/v1/profile/broker/', data),
  
  // Driver profile functions
  getDriverProfile: () => api.get('/v1/profile/driver/'),
  createDriverProfile: (data) => api.post('/v1/profile/driver/', data),
  updateDriverProfile: (data) => api.put('/v1/profile/driver/', data),
};

export const userAPI = {
  // Get current user info
  getCurrentUser: () => api.get('/v1/users/me'),
  getUserProfile: () => api.get('/v1/users/profile'),
};

// Wallet API functions
export const walletAPI = {
  // Get wallet balance
  getWallet: () => api.get('/v1/bed/wallet'),
  
  // Get wallet history
  getWalletHistory: (page = 1, limit = 10) => api.get(`/v1/bed/history?page=${page}&limit=${limit}`),
  
  // Get referral tree
  getReferralTree: () => api.get('/v1/bed/referal-tree'),
  
  // Get commission rules
  getCommissionRules: () => api.get('/v1/bed/commission-rules'),
  
  // Withdraw from wallet
  withdraw: (data) => api.post('/v1/bed/withdraw', data),
  
  // Generate referral code
  generateReferralCode: () => api.post('/v1/bed/generate-referral-code'),
};

export default api;
export { baseURL };