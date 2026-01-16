# API Base URL Configuration

## Overview
The frontend project uses Vite environment variables to configure API endpoints. The base URL is configured in multiple places throughout the codebase.

## Environment Variables Required

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Configuration
# Base URL for API requests (should include /api at the end)
VITE_API_BASE_URL=http://localhost:5000/api

# Socket.IO Server URL (without /api)
VITE_API_URL=http://localhost:5000

# Image Base URL (for serving images from backend)
# Leave empty if images are served from the same domain or use relative paths
VITE_IMAGE_BASE_URL=
```

## Where API Base URL is Used

### 1. Main API Configuration
- **File**: `src/utils/constants.js`
- **Variable**: `VITE_API_BASE_URL`
- **Default**: `http://localhost:5000/api`
- **Usage**: Used by the main axios instance in `src/utils/api.js`

### 2. Socket.IO Configuration
- **File**: `src/utils/socket.js`
- **Variable**: `VITE_API_URL`
- **Default**: `http://localhost:5000`
- **Note**: Socket URL should NOT include `/api` suffix

### 3. Image URLs
- **File**: `src/utils/helpers.js`
- **Variable**: `VITE_IMAGE_BASE_URL`
- **Default**: Empty string
- **Usage**: Used in `getImageUrl()` helper function

### 4. Dashboard API (Admin)
- **File**: `src/services/dashboardApi.js`
- **Variable**: `VITE_API_URL`
- **Default**: `http://localhost:5000/api`
- **Note**: This file uses `VITE_API_URL` instead of `VITE_API_BASE_URL`

### 5. Vendor Promotions API
- **File**: `src/modules/vendor/services/vendorPromotionsApi.js`
- **Variable**: `VITE_API_URL`
- **Default**: `http://localhost:5000/api`
- **Note**: This file uses `VITE_API_URL` instead of `VITE_API_BASE_URL`

## Vite Proxy Configuration

The `vite.config.js` file includes a proxy configuration that forwards `/api` requests to `http://localhost:5000`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

This means during development, you can use relative URLs like `/api/...` and they will be proxied to the backend server.

## Setup Instructions

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your actual API URLs:
   - For local development: Use `http://localhost:5000`
   - For production: Use your production API URL

3. **Restart the dev server** after creating/modifying `.env`:
   ```bash
   npm run dev
   ```

## Important Notes

- ⚠️ **Inconsistency**: Some files use `VITE_API_BASE_URL` while others use `VITE_API_URL`. Both should be set in your `.env` file.
- ⚠️ **Socket URL**: `VITE_API_URL` for sockets should NOT include `/api` suffix (just the base URL)
- ⚠️ **API URL**: `VITE_API_BASE_URL` should include `/api` suffix
- Environment variables must be prefixed with `VITE_` to be accessible in Vite
- The `.env` file is gitignored and should not be committed to version control
- Use `.env.example` as a template for other developers

## Production Deployment

For production builds, make sure to set these environment variables in your deployment platform (Vercel, Netlify, etc.):

- `VITE_API_BASE_URL` - Your production API URL with `/api` suffix
- `VITE_API_URL` - Your production API base URL (without `/api`) for Socket.IO
- `VITE_IMAGE_BASE_URL` - Your CDN or image server URL (if applicable)
