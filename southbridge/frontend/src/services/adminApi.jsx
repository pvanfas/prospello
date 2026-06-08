import axios from 'axios';
import { store } from '../redux/store'; // Import the store directly
import { refreshTokenSuccess, logout } from '../redux/authSlice';
import { ActivityCreators } from './activityTracker';

// Use backend URL from environment variable
const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000/api';
const AdminApi = axios.create({
  baseURL,
});
const skipAuthEndpoints = [
  '/v1/admin/login',
];
// Request interceptor to add token
AdminApi.interceptors.request.use(
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
AdminApi.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;
        // Call your refresh endpoint
        const res = await axios.post(`${baseURL}/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });
        store.dispatch(refreshTokenSuccess({
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
        }));
        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
        return AdminApi(originalRequest);
      } catch (err) {
        store.dispatch(logout());
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);



// ===== DASHBOARD API FUNCTIONS =====

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await AdminApi.get('/v1/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ===== BROKER API FUNCTIONS =====

// Get all brokers with optional search and filtering
export const getBrokers = async (params = {}) => {
  try {
    const response = await AdminApi.get('/v1/admin/brokers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching brokers:', error);
    throw error;
  }
};

// Get detailed broker information
export const getBrokerDetail = async (brokerId) => {
  try {
    const response = await AdminApi.get(`/v1/admin/brokers/${brokerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching broker detail:', error);
    throw error;
  }
};

// Create new broker
export const createBroker = async (brokerData) => {
  try {
    const response = await AdminApi.post('/v1/admin/brokers', brokerData);
    return response.data;
  } catch (error) {
    console.error('Error creating broker:', error);
    throw error;
  }
};

// Update broker information
export const updateBroker = async (brokerId, brokerData) => {
  try {
    const response = await AdminApi.put(`/v1/admin/brokers/${brokerId}`, brokerData);
    return response.data;
  } catch (error) {
    console.error('Error updating broker:', error);
    throw error;
  }
};

// Deactivate broker (soft delete)
export const deactivateBroker = async (brokerId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/brokers/${brokerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating broker:', error);
    throw error;
  }
};

// Permanently delete broker
export const deleteBroker = async (brokerId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/brokers/${brokerId}/permanent`);
    return response.data;
  } catch (error) {
    console.error('Error deleting broker:', error);
    throw error;
  }
};

export const verifyBroker = async (brokerId) => {
  try {
    const response = await AdminApi.post(`/v1/admin/brokers/${brokerId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Error verifying broker:', error);
    throw error;
  }
};

// ===== SHIPPER API FUNCTIONS =====

// Get all shippers with optional search and filtering
export const getShippers = async (params = {}) => {
  try {
    const response = await AdminApi.get('/v1/admin/shippers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching shippers:', error);
    throw error;
  }
};

// Get detailed shipper information
export const getShipperDetail = async (shipperId) => {
  try {
    const response = await AdminApi.get(`/v1/admin/shippers/${shipperId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shipper detail:', error);
    throw error;
  }
};

// Create new shipper
export const createShipper = async (shipperData) => {
  try {
    const response = await AdminApi.post('/v1/admin/shippers', shipperData);
    return response.data;
  } catch (error) {
    console.error('Error creating shipper:', error);
    throw error;
  }
};

// Update shipper information
export const updateShipper = async (shipperId, shipperData) => {
  try {
    const response = await AdminApi.put(`/v1/admin/shippers/${shipperId}`, shipperData);
    return response.data;
  } catch (error) {
    console.error('Error updating shipper:', error);
    throw error;
  }
};

// Deactivate shipper (soft delete)
export const deactivateShipper = async (shipperId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/shippers/${shipperId}`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating shipper:', error);
    throw error;
  }
};

// Permanently delete shipper
export const deleteShipper = async (shipperId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/shippers/${shipperId}/permanent`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shipper:', error);
    throw error;
  }
};

// ===== DRIVER API FUNCTIONS =====

// Get all drivers with optional search and filtering
export const getDrivers = async (params = {}) => {
  try {
    const response = await AdminApi.get('/v1/admin/drivers', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching drivers:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

// Get detailed driver information
export const getDriverDetail = async (driverId) => {
  try {
    const response = await AdminApi.get(`/v1/admin/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching driver detail:', error);
    throw error;
  }
};

// Verify driver
export const verifyDriver = async (driverId) => {
  try {
    const response = await AdminApi.post(`/v1/admin/drivers/${driverId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Error verifying driver:', error);
    throw error;
  }
};

// Reject driver
export const rejectDriver = async (driverId) => {
  try {
    const response = await AdminApi.post(`/v1/admin/drivers/${driverId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting driver:', error);
    throw error;
  }
};

// Create new driver
export const createDriver = async (driverData) => {
  try {
    const response = await AdminApi.post('/v1/admin/drivers', driverData);
    
    // Track activity
    ActivityCreators.driverCreated(response.data.id, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error creating driver:', error);
    throw error;
  }
};

// Update driver information
export const updateDriver = async (driverId, driverData) => {
  try {
    const response = await AdminApi.put(`/v1/admin/drivers/${driverId}`, driverData);
    return response.data;
  } catch (error) {
    console.error('Error updating driver:', error);
    throw error;
  }
};

// Deactivate driver (soft delete)
export const deactivateDriver = async (driverId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/drivers/${driverId}`);
    
    // Track activity
    ActivityCreators.driverDeactivated(driverId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error deactivating driver:', error);
    throw error;
  }
};

// Permanently delete driver
export const deleteDriver = async (driverId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/drivers/${driverId}/permanent`);
    
    // Track activity
    ActivityCreators.driverDeleted(driverId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
};

// ===== LOAD API FUNCTIONS =====

// Get all loads with optional search and filtering
export const getLoads = async (params = {}) => {
  try {
    const response = await AdminApi.get('/v1/admin/loads', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching loads:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

// Get load statistics by status
export const getLoadStats = async () => {
  try {
    const response = await AdminApi.get('/v1/admin/loads/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching load stats:', error);
    throw error;
  }
};

// Get detailed load information
export const getLoadDetail = async (loadId) => {
  try {
    const response = await AdminApi.get(`/v1/admin/loads/${loadId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching load detail:', error);
    throw error;
  }
};

// Create new load
export const createLoad = async (loadData) => {
  try {
    const response = await AdminApi.post('/v1/admin/loads', loadData);
    
    // Track activity
    ActivityCreators.loadCreated(response.data.id, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error creating load:', error);
    throw error;
  }
};

// Update load information
export const updateLoad = async (loadId, loadData) => {
  try {
    const response = await AdminApi.put(`/v1/admin/loads/${loadId}`, loadData);
    
    // Track activity
    ActivityCreators.loadUpdated(loadId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error updating load:', error);
    throw error;
  }
};

// Delete load
export const deleteLoad = async (loadId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/loads/${loadId}`);
    
    // Track activity
    ActivityCreators.loadDeleted(loadId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error deleting load:', error);
    throw error;
  }
};

// ===== PAYMENT API FUNCTIONS =====

// Get all payments with optional search and filtering
export const getPayments = async (params = {}) => {
  try {
    const response = await AdminApi.get('/v1/admin/payments', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

// Get detailed payment information
export const getPaymentDetail = async (paymentId) => {
  try {
    const response = await AdminApi.get(`/v1/admin/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment detail:', error);
    throw error;
  }
};

// Create new payment
export const createPayment = async (paymentData) => {
  try {
    const response = await AdminApi.post('/v1/admin/payments', paymentData);
    
    // Track activity
    ActivityCreators.paymentCreated(response.data.id, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Update payment information
export const updatePayment = async (paymentId, paymentData) => {
  try {
    const response = await AdminApi.put(`/v1/admin/payments/${paymentId}`, paymentData);
    
    // Track activity
    ActivityCreators.paymentUpdated(paymentId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// Delete payment
export const deletePayment = async (paymentId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/payments/${paymentId}`);
    
    // Track activity
    ActivityCreators.paymentDeleted(paymentId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

// ===== PAYOUT API FUNCTIONS =====

// Get all payouts with optional search and filtering
export const getPayouts = async (params = {}) => {
  try {
    const response = await AdminApi.get('/v1/admin/payouts', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching payouts:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

// Get detailed payout information
export const getPayoutDetail = async (payoutId) => {
  try {
    const response = await AdminApi.get(`/v1/admin/payouts/${payoutId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payout detail:', error);
    throw error;
  }
};

// Create new payout
export const createPayout = async (payoutData) => {
  try {
    const response = await AdminApi.post('/v1/admin/payouts', payoutData);
    
    // Track activity
    ActivityCreators.payoutCreated(response.data.id, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error creating payout:', error);
    throw error;
  }
};

// Update payout information
export const updatePayout = async (payoutId, payoutData) => {
  try {
    const response = await AdminApi.put(`/v1/admin/payouts/${payoutId}`, payoutData);
    
    // Track activity
    ActivityCreators.payoutUpdated(payoutId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error updating payout:', error);
    throw error;
  }
};

// Delete payout
export const deletePayout = async (payoutId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/payouts/${payoutId}`);
    
    // Track activity
    ActivityCreators.payoutDeleted(payoutId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error deleting payout:', error);
    throw error;
  }
};

// ===== ORDER API FUNCTIONS =====

// Get all orders with optional search and filtering
export const getOrders = async (params = {}) => {
  try {
    const response = await AdminApi.get('/v1/admin/orders', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

// Get detailed order information
export const getOrderDetail = async (orderId) => {
  try {
    const response = await AdminApi.get(`/v1/admin/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await AdminApi.put(`/v1/admin/orders/${orderId}/status`, statusData);
    
    // Track activity
    ActivityCreators.orderUpdated(orderId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    const response = await AdminApi.delete(`/v1/admin/orders/${orderId}`);
    
    // Track activity
    ActivityCreators.orderDeleted(orderId, 'Admin');
    
    return response.data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export default AdminApi;
// export { baseURL };