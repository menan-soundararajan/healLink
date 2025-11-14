/**
 * Wrapper for OpenMRS API fetch calls that integrates with global loading state
 * This function should be used by all components making OpenMRS API calls
 */

let requestCounter = 0;
let activeRequests = new Set();
let loadingCallbacks = new Set();
let errorCallbacks = new Set();

/**
 * Register callbacks for loading state changes
 */
export const registerLoadingCallbacks = (onLoadingChange, onError) => {
  loadingCallbacks.add(onLoadingChange);
  if (onError) {
    errorCallbacks.add(onError);
  }
  
  return () => {
    loadingCallbacks.delete(onLoadingChange);
    if (onError) {
      errorCallbacks.delete(onError);
    }
  };
};

/**
 * Notify all registered callbacks about loading state
 */
const notifyLoadingState = () => {
  const isLoading = activeRequests.size > 0;
  loadingCallbacks.forEach(callback => {
    try {
      callback(isLoading);
    } catch (err) {
      console.error('Error in loading callback:', err);
    }
  });
};

/**
 * Notify all registered callbacks about errors
 */
const notifyError = (error) => {
  errorCallbacks.forEach(callback => {
    try {
      callback(error);
    } catch (err) {
      console.error('Error in error callback:', err);
    }
  });
};

/**
 * Clear error state (called when user dismisses error)
 */
export const clearGlobalError = () => {
  notifyError(null);
};

/**
 * Wrapped fetch function for OpenMRS API calls
 * Automatically tracks loading state and errors
 */
export const openmrsFetch = async (url, options = {}) => {
  const requestId = `openmrs-${Date.now()}-${++requestCounter}`;
  
  try {
    // Start request
    activeRequests.add(requestId);
    notifyLoadingState();
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorMessage = `Failed to fetch data from OpenMRS: ${response.status} ${response.statusText}`;
      activeRequests.delete(requestId);
      notifyLoadingState();
      notifyError(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // End request successfully
    activeRequests.delete(requestId);
    notifyLoadingState();
    // Clear any previous errors on success
    notifyError(null);
    
    return { success: true, data };
  } catch (error) {
    // End request with error
    activeRequests.delete(requestId);
    notifyLoadingState();
    
    // Only notify error if it's not already handled
    if (error.message && !error.message.includes('Failed to fetch data from OpenMRS')) {
      const errorMessage = error.message || 'Failed to fetch data from OpenMRS';
      notifyError(errorMessage);
    } else if (error.message) {
      notifyError(error.message);
    } else {
      notifyError('Failed to fetch data from OpenMRS');
    }
    
    throw error;
  }
};

