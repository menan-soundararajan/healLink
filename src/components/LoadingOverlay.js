import React from 'react';

const LoadingOverlay = ({ isLoading, error, onDismissError }) => {
  if (!isLoading && !error) {
    return null;
  }

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
        >
          <div className="bg-white rounded p-4 d-flex flex-column align-items-center shadow-lg" style={{ minWidth: '300px' }}>
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mb-0 text-center fw-semibold">Fetching data from OpenMRS, please wait...</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{
            zIndex: 10000,
            minWidth: '300px',
            maxWidth: '90%'
          }}
        >
          <div className="alert alert-danger alert-dismissible fade show shadow-lg" role="alert">
            <strong>Error:</strong> {error}
            <button
              type="button"
              className="btn-close"
              onClick={onDismissError}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingOverlay;

