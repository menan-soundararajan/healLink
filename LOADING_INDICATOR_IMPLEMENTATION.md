# Global Loading Indicator Implementation

## Overview

Implemented a global loading indicator system that tracks all OpenMRS API calls and displays a loading overlay with the message "Fetching data from OpenMRS, please wait..." while any API requests are in progress.

## What Was Changed

### 1. Created New Files

#### `src/contexts/OpenMRSLoadingContext.js`
- React Context Provider for managing global OpenMRS loading state
- Tracks active API requests and error states
- Provides `isLoading` and `error` state to all components
- Registers callbacks from `openmrsFetch` utility to receive loading updates

#### `src/components/LoadingOverlay.js`
- Full-screen loading overlay component
- Shows spinner and message: "Fetching data from OpenMRS, please wait..."
- Displays error toast at the top when API calls fail
- Error toast is dismissible
- Uses Bootstrap classes for styling

#### `src/utils/openmrsFetch.js`
- Centralized wrapper function for all OpenMRS API calls
- Tracks active requests using a Set
- Notifies registered callbacks when requests start/end
- Handles errors and notifies error callbacks
- Automatically manages loading state across all API calls

### 2. Modified Files

#### `src/index.js`
- Wrapped App with `OpenMRSLoadingProvider` to enable global loading state

#### `src/App.js`
- Added `LoadingOverlay` component
- Integrated with `useOpenMRSLoading` hook to get loading/error state
- Added error dismissal handler

#### `src/services/openmrsService.js`
- Updated `loginOpenMRS()` to use `openmrsFetch` wrapper
- Updated `searchPatientByEmail()` to use `openmrsFetch` wrapper
- Updated `getPatientDetails()` to use `openmrsFetch` wrapper

#### `src/components/AppointmentsList.js`
- Replaced `fetch()` with `openmrsFetch()` wrapper
- Added import for `openmrsFetch`

#### `src/components/MedicationsList.js`
- Replaced `fetch()` with `openmrsFetch()` wrapper
- Added import for `openmrsFetch`

#### `src/components/LabReportsList.js`
- Replaced `fetch()` with `openmrsFetch()` wrapper
- Added import for `openmrsFetch`

#### `src/components/DiagnosisList.js`
- Replaced `fetch()` with `openmrsFetch()` wrapper
- Added import for `openmrsFetch`

#### `src/components/HealthAdvisoryCard.js`
- Updated `fetchDiagnosis()` to use `openmrsFetch()` wrapper
- Updated `fetchMedications()` to use `openmrsFetch()` wrapper
- Added import for `openmrsFetch`

#### `src/App.js` (fetchGestationalAge)
- Updated to use `openmrsFetch()` wrapper

## How It Works

### Request Tracking

1. **When an API call starts:**
   - `openmrsFetch()` adds a unique request ID to `activeRequests` Set
   - Notifies all registered callbacks that loading has started
   - `OpenMRSLoadingContext` receives the callback and sets `isLoading = true`
   - `LoadingOverlay` component shows the loading spinner

2. **While requests are active:**
   - Loading overlay remains visible
   - Message: "Fetching data from OpenMRS, please wait..."
   - All OpenMRS API calls are tracked in the same Set

3. **When a request completes:**
   - Request ID is removed from `activeRequests` Set
   - If Set is empty, `isLoading = false` and overlay hides
   - If Set still has requests, overlay remains visible

4. **On error:**
   - Request is removed from Set
   - Error message is sent to error callbacks
   - Error toast appears at the top: "Failed to fetch data from OpenMRS"
   - Loading overlay hides (if no other requests are active)

### Parallel Requests

The system handles multiple parallel requests correctly:
- Each request gets a unique ID
- All active requests are tracked in a Set
- Loading overlay shows as long as ANY request is active
- Overlay only hides when ALL requests complete

## Features

✅ **Automatic Tracking**: All OpenMRS API calls are automatically tracked  
✅ **Single Overlay**: One loading indicator for all requests  
✅ **Error Handling**: Shows error toast on failure  
✅ **Dismissible Errors**: User can dismiss error messages  
✅ **Non-Blocking**: Overlay doesn't block UI (unless configured)  
✅ **Minimal Changes**: Only necessary files were modified  

## Usage

### For New OpenMRS API Calls

When adding new OpenMRS API calls, use the `openmrsFetch` wrapper:

```javascript
import { openmrsFetch } from '../utils/openmrsFetch';

// Instead of:
const response = await fetch(url, options);
const data = await response.json();

// Use:
const result = await openmrsFetch(url, options);
const data = result.data;
```

The loading indicator will automatically track the request.

## Testing

1. **Single Request**: Login and verify loading shows during patient fetch
2. **Multiple Parallel Requests**: Verify overlay stays visible until all cards load
3. **Error Handling**: Disconnect network and verify error toast appears
4. **Error Dismissal**: Click X on error toast to dismiss

## Files Summary

**New Files (3):**
- `src/contexts/OpenMRSLoadingContext.js`
- `src/components/LoadingOverlay.js`
- `src/utils/openmrsFetch.js`

**Modified Files (9):**
- `src/index.js`
- `src/App.js`
- `src/services/openmrsService.js`
- `src/components/AppointmentsList.js`
- `src/components/MedicationsList.js`
- `src/components/LabReportsList.js`
- `src/components/DiagnosisList.js`
- `src/components/HealthAdvisoryCard.js`

**Total Changes**: 12 files (3 new, 9 modified)

