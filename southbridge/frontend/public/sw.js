// Service Worker for Background Location Tracking
// This runs in the background even when the app is closed

const CACHE_NAME = 'logistics-tracking-v2';
// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = self.location.origin.includes('localhost') 
  ? 'http://localhost:8000/api' 
  : `${self.location.origin}/api`;

// Install event
self.addEventListener('install', () => {
    console.log('Service Worker: Installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => self.clients.claim())
    );
});

// Background location tracking variables
let trackingInterval = null;
let currentRouteId = null;
let lastLocation = null;
let authToken = null;

// Listen for messages from the main app
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'START_BACKGROUND_TRACKING':
            startBackgroundTracking(data.routeId);
            break;
        case 'STOP_BACKGROUND_TRACKING':
            stopBackgroundTracking();
            break;
        case 'UPDATE_ROUTE':
            currentRouteId = data.routeId;
            break;
        case 'UPDATE_TOKEN':
            // Update auth token from main app
            authToken = data.token;
            console.log('Service Worker: Auth token updated');
            break;
        case 'LOCATION_RESPONSE':
            // Handle location response from main app
            if (data.location && hasLocationChanged(data.location)) {
                sendLocationToServer(data.location);
                lastLocation = data.location;
            }
            break;
    }
});

// Start background tracking
function startBackgroundTracking(routeId) {
    console.log('Service Worker: Starting background tracking for route', routeId);
    currentRouteId = routeId;
    
    // Clear any existing interval
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }
    
    // Start tracking every 2 minutes
    trackingInterval = setInterval(() => {
        getCurrentLocation();
    }, 120000); // 2 minutes
    
    // Get initial location
    getCurrentLocation();
}

// Stop background tracking
function stopBackgroundTracking() {
    console.log('Service Worker: Stopping background tracking');
    
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    
    currentRouteId = null;
    lastLocation = null;
    authToken = null;
}

// Get current location and send to server
function getCurrentLocation() {
    if (!currentRouteId) return;
    
    // Service Workers cannot access navigator.geolocation directly
    // Instead, we'll use background sync to trigger location requests from the main app
    console.log('Service Worker: Requesting location from main app');
    
    // Send message to main app to get current location
    self.clients.matchAll().then(clients => {
        if (clients.length === 0) {
            console.log('Service Worker: No active clients found');
            return;
        }
        clients.forEach(client => {
            try {
                client.postMessage({
                    type: 'REQUEST_LOCATION',
                    routeId: currentRouteId
                });
            } catch (error) {
                console.error('Service Worker: Error sending message to client:', error);
            }
        });
    }).catch(error => {
        console.error('Service Worker: Error matching clients:', error);
    });
}

// Check if location has changed significantly
function hasLocationChanged(newLocation) {
    if (!lastLocation) return true;
    
    const distance = calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        newLocation.latitude,
        newLocation.longitude
    );
    
    // Only send if moved more than 10 meters
    return distance > 10;
}

// Calculate distance between two coordinates (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
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
}

// Send location to server
async function sendLocationToServer(location) {
    try {
        if (!authToken) {
            console.error('Service Worker: No auth token available');
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/v1/route/${currentRouteId}/ping/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                latitude: location.latitude,
                longitude: location.longitude
            })
        });
        
        if (response.ok) {
            console.log('Service Worker: Location sent successfully');
        } else {
            console.error('Service Worker: Failed to send location:', response.status);
        }
    } catch (error) {
        console.error('Service Worker: Error sending location:', error);
    }
}


// Handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-location-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(getCurrentLocation());
    }
});

// Handle push notifications (for future use)
self.addEventListener('push', () => {
    console.log('Service Worker: Push notification received');
    // Handle push notifications here
});

console.log('Service Worker: Initialized');
