# Service Provider Profile System with Google Places & Map Integration

## 🎯 Overview

The service provider profile system now supports both **Google Places autocomplete** and **map-based location selection** for the frontend. This provides a seamless user experience for setting up shop locations.

## 📍 Location Selection Methods

### 1. **Google Places Autocomplete**
- Users can search for their shop location using Google Places API
- Provides accurate address information and coordinates
- Supports business name search and address autocomplete

### 2. **Map-Based Selection**
- Users can drop a pin on the map to select their location
- Provides manual address entry with map coordinates
- Useful when the exact address isn't found in Google Places

## 🔧 API Endpoints

### **Profile Management**
```bash
# Get comprehensive profile
GET /service-provider-profile/profile

# Create new profile
POST /service-provider-profile/profile

# Update profile
PUT /service-provider-profile/profile

# Check profile status
GET /service-provider-profile/profile/status
```

### **Location Management**
```bash
# Update location from Google Places
PUT /service-provider-profile/location/google-place

# Update location from map
PUT /service-provider-profile/location/map

# Get current location
GET /service-provider-profile/location

# Update location (legacy)
PUT /service-provider-profile/location
```

## 📝 Request/Response Examples

### **1. Google Places Integration**

#### **Update Location from Google Places:**
```bash
PUT /service-provider-profile/location/google-place
Content-Type: application/json

{
  "place_id": "ChIJd8BlQ2BZwokRAFQEcDlJRAI",
  "formatted_address": "123 Main St, Bangalore, Karnataka 560001, India",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "place_name": "ABC Auto Services",
  "address_components": {
    "street_number": "123",
    "route": "Main St",
    "locality": "Bangalore",
    "administrative_area_level_1": "Karnataka",
    "country": "India",
    "postal_code": "560001"
  }
}
```

#### **Response:**
```json
{
  "id": 1,
  "user_id": "uuid",
  "business_name": "ABC Auto Services",
  "shop_location_latitude": 12.9716,
  "shop_location_longitude": 77.5946,
  "shop_location_address": "123 Main St, Bangalore, Karnataka 560001, India",
  "verification_status": "pending",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### **2. Map-Based Selection**

#### **Update Location from Map:**
```bash
PUT /service-provider-profile/location/map
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "123 Main Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "postal_code": "560001"
}
```

### **3. Get Current Location**

#### **Request:**
```bash
GET /service-provider-profile/location
```

#### **Response:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "123 Main St, Bangalore, Karnataka 560001, India",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "postal_code": "560001",
  "place_id": "ChIJd8BlQ2BZwokRAFQEcDlJRAI",
  "formatted_address": "123 Main St, Bangalore, Karnataka 560001, India",
  "last_updated": "2024-01-01T00:00:00Z"
}
```

## 🎨 Frontend Integration

### **Google Places Autocomplete Setup**

```javascript
// Initialize Google Places Autocomplete
function initializeGooglePlaces() {
  const input = document.getElementById('shop-location-input');
  const autocomplete = new google.maps.places.Autocomplete(input);
  
  autocomplete.addListener('place_changed', function() {
    const place = autocomplete.getPlace();
    
    if (place.geometry && place.geometry.location) {
      const locationData = {
        place_id: place.place_id,
        formatted_address: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        place_name: place.name,
        address_components: extractAddressComponents(place.address_components)
      };
      
      // Send to backend
      updateLocationFromGooglePlace(locationData);
    }
  });
}

// Extract address components
function extractAddressComponents(components) {
  const addressComponents = {};
  
  components.forEach(component => {
    const types = component.types;
    if (types.includes('street_number')) {
      addressComponents.street_number = component.long_name;
    } else if (types.includes('route')) {
      addressComponents.route = component.long_name;
    } else if (types.includes('locality')) {
      addressComponents.locality = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      addressComponents.administrative_area_level_1 = component.long_name;
    } else if (types.includes('country')) {
      addressComponents.country = component.long_name;
    } else if (types.includes('postal_code')) {
      addressComponents.postal_code = component.long_name;
    }
  });
  
  return addressComponents;
}

// API call to update location
async function updateLocationFromGooglePlace(locationData) {
  try {
    const response = await fetch('/service-provider-profile/location/google-place', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(locationData)
    });
    
    if (response.ok) {
      console.log('Location updated successfully');
    }
  } catch (error) {
    console.error('Error updating location:', error);
  }
}
```

### **Map-Based Selection Setup**

```javascript
// Initialize Google Map for location selection
function initializeMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 13
  });
  
  const marker = new google.maps.Marker({
    position: { lat: 12.9716, lng: 77.5946 },
    map: map,
    draggable: true
  });
  
  // Update location when marker is dragged
  marker.addListener('dragend', function() {
    const position = marker.getPosition();
    const lat = position.lat();
    const lng = position.lng();
    
    // Reverse geocoding to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, function(results, status) {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        const addressComponents = extractAddressComponents(results[0].address_components);
        
        const locationData = {
          latitude: lat,
          longitude: lng,
          address: address,
          city: addressComponents.locality,
          state: addressComponents.administrative_area_level_1,
          country: addressComponents.country,
          postal_code: addressComponents.postal_code
        };
        
        // Send to backend
        updateLocationFromMap(locationData);
      }
    });
  });
}

// API call to update location from map
async function updateLocationFromMap(locationData) {
  try {
    const response = await fetch('/service-provider-profile/location/map', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(locationData)
    });
    
    if (response.ok) {
      console.log('Location updated successfully');
    }
  } catch (error) {
    console.error('Error updating location:', error);
  }
}
```

## 🔍 Profile Completion Status

### **Check Profile Status:**
```bash
GET /service-provider-profile/profile/status
```

### **Response:**
```json
{
  "profile_exists": true,
  "profile_complete": false,
  "missing_fields": ["business_phone", "license_number"]
}
```

## 📊 Comprehensive Profile Response

### **Get Full Profile:**
```bash
GET /service-provider-profile/profile
```

### **Response:**
```json
{
  "user_id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "phone_number": "9876543210",
  "service_provider": {
    "id": 1,
    "business_name": "ABC Auto Services",
    "business_type": "Individual",
    "business_phone": "9876543210",
    "shop_location_latitude": 12.9716,
    "shop_location_longitude": 77.5946,
    "shop_location_address": "123 Main St, Bangalore, Karnataka 560001, India",
    "max_service_radius": 50,
    "rating": 4.5,
    "total_services": 150,
    "verification_status": "verified"
  },
  "current_latitude": 12.9716,
  "current_longitude": 77.5946,
  "profile_complete": true,
  "missing_fields": []
}
```

## 🚀 Key Features

### **1. Dual Location Selection**
- **Google Places**: For accurate business addresses
- **Map Selection**: For precise coordinate-based locations

### **2. Address Components**
- Street number, route, locality
- Administrative areas, country, postal code
- Formatted addresses for display

### **3. Profile Completion Tracking**
- Automatic detection of missing fields
- Progress indicators for profile setup
- Validation for required information

### **4. Real-time Location Updates**
- Current location tracking
- Last update timestamps
- Location history (if needed)

## 🔧 Validation Rules

### **Coordinates:**
- Latitude: -90 to 90
- Longitude: -180 to 180

### **Phone Numbers:**
- Indian format: 10 digits starting with 6-9
- Automatic formatting and validation

### **Addresses:**
- Minimum 2 characters for business name
- Required coordinates for location
- Optional address components

This system provides a comprehensive solution for service provider location management with both Google Places integration and map-based selection! 🎉

