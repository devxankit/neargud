# City-Based Banner Filtering - Testing Guide

## Changes Made

### Backend Changes
1. **Updated `sliders.service.js`**: Modified `getActiveSliders()` to accept a `cityName` parameter
   - If city is provided: Returns city-specific sliders + universal sliders (empty city field)
   - If no city: Returns only universal sliders

2. **Updated `publicSlider.controller.js`**: Modified controller to accept `city` query parameter
   - Endpoint: `GET /api/public/hero-banners/active?city=CityName`

### Frontend Changes
1. **Updated `App.jsx`**: Added location store initialization
   - Now calls `initializeLocation()` on app startup to load saved city from localStorage

2. **Updated `Home.jsx`**: 
   - Removed duplicate location initialization
   - Changed API call from `cityId` to `city` parameter
   - Added debug logging to track city selection

3. **Cleaned up debug logs**: Removed excessive console.log statements

## How to Test

### Step 1: Check Initial State
1. Open browser at `http://localhost:5173/app`
2. Open DevTools Console
3. Look for: `console.log("currentCity", currentCity)` - should show `null` initially
4. Look for: `Fetching data for city: No city selected (Universal)` - confirms no city selected
5. You should see only **universal banners** (banners with empty city field)

### Step 2: Select a City
1. Click on "Select City" button in the header
2. Choose a city (e.g., "Indore")
3. Console should show: `currentCity` with the city object
4. Page should automatically refresh and fetch city-specific banners

### Step 3: Verify Persistence
1. Refresh the page (`F5` or `Ctrl+R`)
2. Console should show: `currentCity` with the previously selected city
3. Console should show: `Fetching data for city: Indore`
4. Banners should be city-specific + universal

### Step 4: Check localStorage
1. Open DevTools → Application → Local Storage → `http://localhost:5173`
2. Look for key: `selected-city`
3. Value should be a JSON object with city data

### Step 5: Test "All Cities" Option
1. Click "Select City" button
2. Select "All Cities" option
3. Console should show: `currentCity: null`
4. Should see only universal banners

## Expected Behavior

### Banner Display Logic
- **No city selected**: Show only universal banners (city field is empty/null)
- **City selected (e.g., "Indore")**: Show Indore-specific banners + universal banners
- **Different city (e.g., "Bhopal")**: Show Bhopal-specific banners + universal banners (NOT Indore banners)

## Troubleshooting

### If currentCity is still null after selecting:
1. Check browser console for errors
2. Verify localStorage has `selected-city` key
3. Check if `initialize()` is being called in App.jsx

### If banners are not filtering:
1. Check backend logs for the city parameter being received
2. Verify banner data in database has correct city field
3. Check network tab to see API request includes `?city=CityName`

### If page doesn't refresh after city selection:
1. Check if `useEffect(() => { fetchData(); }, [currentCity])` is working
2. Verify currentCity is actually changing in the store

## Database Setup

Make sure you have banners in your database with different city values:
- Some with `city: "Indore"`
- Some with `city: "Bhopal"`
- Some with `city: ""` or `city: null` (universal)

You can add these through the Admin panel at `/admin/offers/sliders`
