# Production Deployment Guide

## Fixing Refresh Issues in Production

This guide addresses the common SPA (Single Page Application) refresh issues in production environments.

### Issues Fixed

1. **SPA Routing**: Configured Vite to handle client-side routing in production
2. **Service Worker**: Updated to use dynamic API URLs based on environment
3. **Environment Variables**: Added proper configuration for production

### Changes Made

#### 1. Vite Configuration (`vite.config.js`)
- Added `historyApiFallback: true` for both server and preview
- Set `base: './'` for proper asset paths
- Added build optimizations

#### 2. Service Worker (`public/sw.js`)
- Dynamic API URL detection based on current origin
- Fallback to localhost for development

#### 3. Redirects File (`public/_redirects`)
- Added SPA fallback rule for static hosting platforms

#### 4. Environment Configuration (`env.example`)
- Template for production environment variables

### Deployment Steps

#### For Static Hosting (Netlify, Vercel, etc.)

1. **Set Environment Variables**:
   ```bash
   VITE_BACKEND_URL=https://your-backend-domain.com/api
   VITE_WEBSOCKET_URL=wss://your-backend-domain.com
   ```

2. **Build the Application**:
   ```bash
   npm run build:prod
   ```

3. **Deploy the `dist` folder**

#### For Server Deployment

1. **Configure Nginx/Apache**:
   ```nginx
   # Nginx configuration
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

2. **Or use the included `_redirects` file** (for platforms that support it)

### Testing the Fix

1. **Build and preview locally**:
   ```bash
   npm run build:prod
   npm run preview:prod
   ```

2. **Test refresh on deep routes**:
   - Navigate to `/profile` or `/load`
   - Refresh the page
   - Should load correctly without 404 errors

### Common Issues and Solutions

#### Issue: 404 on refresh
**Solution**: Ensure your hosting platform supports SPA routing with the `_redirects` file or server configuration

#### Issue: API calls failing
**Solution**: Set the correct `VITE_BACKEND_URL` environment variable

#### Issue: WebSocket connection failing
**Solution**: Set the correct `VITE_WEBSOCKET_URL` environment variable

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API base URL | `https://api.yourapp.com/api` |
| `VITE_WEBSOCKET_URL` | WebSocket server URL | `wss://api.yourapp.com` |

### Notes

- The service worker will automatically detect the environment and use the appropriate API URL
- All client-side routes should now work correctly on refresh
- The `_redirects` file ensures SPA routing works on most static hosting platforms
