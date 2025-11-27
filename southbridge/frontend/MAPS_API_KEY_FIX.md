# 🔧 Google Maps API Key Error Fix

## ❌ Current Error
```
Google Maps JavaScript API error: InvalidKeyMapError
```

## ✅ Quick Fix (2 minutes)

### Step 1: Create `.env` file

In the `SouthBridge-FrontEnd/` folder, create a file named `.env`:

```bash
# Inside SouthBridge-FrontEnd/ folder
touch .env
```

### Step 2: Add your Google Maps API Key

Open the `.env` file and add:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBV0Z_Bl-1l9PQfWD-uTRWCCz5fH_t-_IQ
VITE_BACKEND_URL=http://127.0.0.1:8000/api
```

**⚠️ IMPORTANT**: The API key above may be invalid/expired. Get a valid key:

1. Go to https://console.cloud.google.com/
2. Enable **Maps JavaScript API** and **Directions API**
3. Create an API key
4. Replace the key in `.env` file

### Step 3: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## 🎯 What Was Fixed

**File**: `src/components/tracking/TrackOrder.jsx`

**Changes**:
- ✅ Removed hardcoded API key
- ✅ Now uses environment variable: `VITE_GOOGLE_MAPS_API_KEY`
- ✅ Added error handling for missing/invalid API key
- ✅ Added API key validation

**Before** (Line 51):
```javascript
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBV0Z_Bl...';
```

**After** (Line 66):
```javascript
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
```

## 📋 Verify Fix

1. Check browser console - should see:
   ```
   ✅ Map initialized successfully
   ```

2. No errors like:
   ```
   ❌ InvalidKeyMapError
   ❌ Google Maps API key is not configured
   ```

## 📚 Full Setup Guide

For detailed instructions on getting a Google Maps API key, see:
- `GOOGLE_MAPS_SETUP.md` (in project root)

## 🔐 Security Note

**Never commit `.env` files to Git!** 

The `.gitignore` should already exclude `.env` files, but double-check:

```bash
# .gitignore should contain:
.env
.env.local
```

## 💡 Pro Tips

1. **Free Tier**: Google provides $200/month free credit
2. **Restrict Key**: In production, restrict API key to your domain
3. **Enable APIs**: Make sure these are enabled:
   - Maps JavaScript API
   - Directions API
   - Geocoding API (optional)


