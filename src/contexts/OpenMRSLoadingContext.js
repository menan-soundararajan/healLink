import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { registerLoadingCallbacks } from '../utils/openmrsFetch';

const OpenMRSLoadingContext = createContext();

export const useOpenMRSLoading = () => {
  const context = useContext(OpenMRSLoadingContext);
  if (!context) {
    throw new Error('useOpenMRSLoading must be used within OpenMRSLoadingProvider');
  }
  return context;
};

export const OpenMRSLoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Register callbacks to receive loading state updates from openmrsFetch
    const unregister = registerLoadingCallbacks(
      (loading) => {
        setIsLoading(loading);
        // Don't clear error automatically - let user dismiss it
      },
      (errorMessage) => {
        // Set error if message provided, clear if null
        setError(errorMessage || null);
      }
    );

    return unregister;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <OpenMRSLoadingContext.Provider value={{ isLoading, error, clearError }}>
      {children}
    </OpenMRSLoadingContext.Provider>
  );
};

