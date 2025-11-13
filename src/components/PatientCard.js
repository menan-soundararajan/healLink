import React from 'react';

const PatientCard = ({ patientData, loading, error }) => {
  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <p className="text-gray-500 text-center mt-4">Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 rounded-lg shadow-lg border border-red-200">
        <div className="flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 text-center mb-2">
          Error Loading Patient Data
        </h3>
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-yellow-50 rounded-lg shadow-lg border border-yellow-200">
        <p className="text-yellow-800 text-center">
          No patient data available. Please try searching with a different email.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Patient Information</h2>
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-24">
            <span className="text-sm font-semibold text-gray-600">Name:</span>
          </div>
          <div className="flex-1">
            <span className="text-base text-gray-800 font-medium">{patientData.name}</span>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 w-24">
            <span className="text-sm font-semibold text-gray-600">Gender:</span>
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {patientData.gender}
            </span>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 w-24">
            <span className="text-sm font-semibold text-gray-600">Age:</span>
          </div>
          <div className="flex-1">
            <span className="text-base text-gray-800">{patientData.age}</span>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 w-24">
            <span className="text-sm font-semibold text-gray-600">Email:</span>
          </div>
          <div className="flex-1">
            <span className="text-base text-gray-800 break-words">{patientData.email}</span>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 w-24">
            <span className="text-sm font-semibold text-gray-600">UUID:</span>
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-600 font-mono break-all">{patientData.uuid}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Data fetched from OpenMRS
        </div>
      </div>
    </div>
  );
};

export default PatientCard;

