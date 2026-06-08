/**
 * Activity Tracking Service
 * Manages recent activities with local storage and automatic cleanup
 */

const ACTIVITY_STORAGE_KEY = 'admin_activities';
const ACTIVITY_EXPIRY_HOURS = 1; // Activities expire after 1 hour

export const ActivityTypes = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  LOAD_CREATED: 'load_created',
  LOAD_UPDATED: 'load_updated',
  LOAD_DELETED: 'load_deleted',
  DRIVER_CREATED: 'driver_created',
  DRIVER_UPDATED: 'driver_updated',
  DRIVER_DEACTIVATED: 'driver_deactivated',
  DRIVER_DELETED: 'driver_deleted',
  SHIPPER_CREATED: 'shipper_created',
  SHIPPER_UPDATED: 'shipper_updated',
  SHIPPER_DEACTIVATED: 'shipper_deactivated',
  SHIPPER_DELETED: 'shipper_deleted',
  BROKER_CREATED: 'broker_created',
  BROKER_UPDATED: 'broker_updated',
  BROKER_DEACTIVATED: 'broker_deactivated',
  BROKER_DELETED: 'broker_deleted',
  PAYMENT_PROCESSED: 'payment_processed',
  PAYMENT_CREATED: 'payment_created',
  PAYMENT_UPDATED: 'payment_updated',
  PAYMENT_DELETED: 'payment_deleted',
  PAYOUT_CREATED: 'payout_created',
  PAYOUT_UPDATED: 'payout_updated',
  PAYOUT_DELETED: 'payout_deleted',
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  BID_CREATED: 'bid_created',
  BID_ACCEPTED: 'bid_accepted',
  SYSTEM_MAINTENANCE: 'system_maintenance'
};

class ActivityTracker {
  constructor() {
    this.initializeStorage();
    this.startCleanupInterval();
  }

  /**
   * Initialize local storage and clean expired activities
   */
  initializeStorage() {
    const activities = this.getStoredActivities();
    const cleanedActivities = this.cleanExpiredActivities(activities);
    this.saveActivities(cleanedActivities);
  }

  /**
   * Get all stored activities
   */
  getStoredActivities() {
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading activities from localStorage:', error);
      return [];
    }
  }

  /**
   * Save activities to local storage
   */
  saveActivities(activities) {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities to localStorage:', error);
    }
  }

  /**
   * Clean expired activities (older than 1 hour)
   */
  cleanExpiredActivities(activities) {
    const now = new Date();
    const expiryTime = new Date(now.getTime() - (ACTIVITY_EXPIRY_HOURS * 60 * 60 * 1000));
    
    return activities.filter(activity => {
      const activityTime = new Date(activity.timestamp);
      return activityTime > expiryTime;
    });
  }

  /**
   * Start automatic cleanup interval (runs every 10 minutes)
   */
  startCleanupInterval() {
    setInterval(() => {
      this.initializeStorage();
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Add a new activity
   */
  addActivity(activity) {
    const activities = this.getStoredActivities();
    const newActivity = {
      id: this.generateId(),
      type: activity.type,
      title: activity.title,
      description: activity.description,
      user: activity.user || 'Admin',
      timestamp: new Date().toISOString(),
      metadata: activity.metadata || {},
      severity: activity.severity || 'info' // info, warning, error, success
    };

    activities.unshift(newActivity); // Add to beginning
    
    // Keep only last 100 activities
    const limitedActivities = activities.slice(0, 100);
    this.saveActivities(limitedActivities);

    return newActivity;
  }

  /**
   * Get recent activities (last 20)
   */
  getRecentActivities(limit = 20) {
    const activities = this.getStoredActivities();
    return activities.slice(0, limit);
  }

  /**
   * Get activities by type
   */
  getActivitiesByType(type) {
    const activities = this.getStoredActivities();
    return activities.filter(activity => activity.type === type);
  }

  /**
   * Get activities by severity
   */
  getActivitiesBySeverity(severity) {
    const activities = this.getStoredActivities();
    return activities.filter(activity => activity.severity === severity);
  }

  /**
   * Clear all activities
   */
  clearAllActivities() {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  }

  /**
   * Clear expired activities manually
   */
  clearExpiredActivities() {
    const activities = this.getStoredActivities();
    const cleanedActivities = this.cleanExpiredActivities(activities);
    this.saveActivities(cleanedActivities);
    return activities.length - cleanedActivities.length;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get activity statistics
   */
  getActivityStats() {
    const activities = this.getStoredActivities();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const lastHour = activities.filter(a => new Date(a.timestamp) > oneHourAgo);
    const lastDay = activities.filter(a => new Date(a.timestamp) > oneDayAgo);

    return {
      total: activities.length,
      lastHour: lastHour.length,
      lastDay: lastDay.length,
      byType: this.getActivityCountByType(activities),
      bySeverity: this.getActivityCountBySeverity(activities)
    };
  }

  /**
   * Get activity count by type
   */
  getActivityCountByType(activities) {
    const counts = {};
    activities.forEach(activity => {
      counts[activity.type] = (counts[activity.type] || 0) + 1;
    });
    return counts;
  }

  /**
   * Get activity count by severity
   */
  getActivityCountBySeverity(activities) {
    const counts = {};
    activities.forEach(activity => {
      counts[activity.severity] = (counts[activity.severity] || 0) + 1;
    });
    return counts;
  }
}

// Create singleton instance
const activityTracker = new ActivityTracker();

// Export convenience functions
export const trackActivity = (activity) => activityTracker.addActivity(activity);
export const getRecentActivities = (limit) => activityTracker.getRecentActivities(limit);
export const getActivityStats = () => activityTracker.getActivityStats();
export const clearAllActivities = () => activityTracker.clearAllActivities();
export const clearExpiredActivities = () => activityTracker.clearExpiredActivities();

// Predefined activity creators
export const ActivityCreators = {
  // User activities
  userLogin: (user) => trackActivity({
    type: ActivityTypes.USER_LOGIN,
    title: 'User Login',
    description: `${user} logged in`,
    user,
    severity: 'success'
  }),

  userLogout: (user) => trackActivity({
    type: ActivityTypes.USER_LOGOUT,
    title: 'User Logout',
    description: `${user} logged out`,
    user,
    severity: 'info'
  }),

  // Load activities
  loadCreated: (loadId, user) => trackActivity({
    type: ActivityTypes.LOAD_CREATED,
    title: 'Load Created',
    description: `New load created with ID: ${loadId}`,
    user,
    severity: 'success',
    metadata: { loadId }
  }),

  loadUpdated: (loadId, user) => trackActivity({
    type: ActivityTypes.LOAD_UPDATED,
    title: 'Load Updated',
    description: `Load ${loadId} has been updated`,
    user,
    severity: 'info',
    metadata: { loadId }
  }),

  loadDeleted: (loadId, user) => trackActivity({
    type: ActivityTypes.LOAD_DELETED,
    title: 'Load Deleted',
    description: `Load ${loadId} has been deleted`,
    user,
    severity: 'warning',
    metadata: { loadId }
  }),

  // Driver activities
  driverCreated: (driverId, user) => trackActivity({
    type: ActivityTypes.DRIVER_CREATED,
    title: 'Driver Created',
    description: `New driver created with ID: ${driverId}`,
    user,
    severity: 'success',
    metadata: { driverId }
  }),

  driverDeactivated: (driverId, user) => trackActivity({
    type: ActivityTypes.DRIVER_DEACTIVATED,
    title: 'Driver Deactivated',
    description: `Driver ${driverId} has been deactivated`,
    user,
    severity: 'warning',
    metadata: { driverId }
  }),

  driverDeleted: (driverId, user) => trackActivity({
    type: ActivityTypes.DRIVER_DELETED,
    title: 'Driver Deleted',
    description: `Driver ${driverId} has been permanently deleted`,
    user,
    severity: 'error',
    metadata: { driverId }
  }),

  // Shipper activities
  shipperCreated: (shipperId, user) => trackActivity({
    type: ActivityTypes.SHIPPER_CREATED,
    title: 'Shipper Created',
    description: `New shipper created with ID: ${shipperId}`,
    user,
    severity: 'success',
    metadata: { shipperId }
  }),

  shipperDeactivated: (shipperId, user) => trackActivity({
    type: ActivityTypes.SHIPPER_DEACTIVATED,
    title: 'Shipper Deactivated',
    description: `Shipper ${shipperId} has been deactivated`,
    user,
    severity: 'warning',
    metadata: { shipperId }
  }),

  shipperDeleted: (shipperId, user) => trackActivity({
    type: ActivityTypes.SHIPPER_DELETED,
    title: 'Shipper Deleted',
    description: `Shipper ${shipperId} has been permanently deleted`,
    user,
    severity: 'error',
    metadata: { shipperId }
  }),

  // Broker activities
  brokerCreated: (brokerId, user) => trackActivity({
    type: ActivityTypes.BROKER_CREATED,
    title: 'Broker Created',
    description: `New broker created with ID: ${brokerId}`,
    user,
    severity: 'success',
    metadata: { brokerId }
  }),

  brokerDeactivated: (brokerId, user) => trackActivity({
    type: ActivityTypes.BROKER_DEACTIVATED,
    title: 'Broker Deactivated',
    description: `Broker ${brokerId} has been deactivated`,
    user,
    severity: 'warning',
    metadata: { brokerId }
  }),

  brokerDeleted: (brokerId, user) => trackActivity({
    type: ActivityTypes.BROKER_DELETED,
    title: 'Broker Deleted',
    description: `Broker ${brokerId} has been permanently deleted`,
    user,
    severity: 'error',
    metadata: { brokerId }
  }),

  // Payment activities
  paymentCreated: (paymentId, user) => trackActivity({
    type: ActivityTypes.PAYMENT_CREATED,
    title: 'Payment Created',
    description: `New payment created with ID: ${paymentId}`,
    user,
    severity: 'success',
    metadata: { paymentId }
  }),

  paymentUpdated: (paymentId, user) => trackActivity({
    type: ActivityTypes.PAYMENT_UPDATED,
    title: 'Payment Updated',
    description: `Payment ${paymentId} has been updated`,
    user,
    severity: 'info',
    metadata: { paymentId }
  }),

  paymentDeleted: (paymentId, user) => trackActivity({
    type: ActivityTypes.PAYMENT_DELETED,
    title: 'Payment Deleted',
    description: `Payment ${paymentId} has been deleted`,
    user,
    severity: 'warning',
    metadata: { paymentId }
  }),

  // Payout activities
  payoutCreated: (payoutId, user) => trackActivity({
    type: ActivityTypes.PAYOUT_CREATED,
    title: 'Payout Created',
    description: `New payout created with ID: ${payoutId}`,
    user,
    severity: 'success',
    metadata: { payoutId }
  }),

  payoutUpdated: (payoutId, user) => trackActivity({
    type: ActivityTypes.PAYOUT_UPDATED,
    title: 'Payout Updated',
    description: `Payout ${payoutId} has been updated`,
    user,
    severity: 'info',
    metadata: { payoutId }
  }),

  payoutDeleted: (payoutId, user) => trackActivity({
    type: ActivityTypes.PAYOUT_DELETED,
    title: 'Payout Deleted',
    description: `Payout ${payoutId} has been deleted`,
    user,
    severity: 'warning',
    metadata: { payoutId }
  }),

  // System activities
  systemMaintenance: (description, user) => trackActivity({
    type: ActivityTypes.SYSTEM_MAINTENANCE,
    title: 'System Maintenance',
    description,
    user,
    severity: 'info'
  })
};

export default activityTracker;
