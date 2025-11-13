import React from 'react';
import PatientInfoCard from './PatientInfoCard';

const ProfilePage = ({ patientData, loading, error, onBack }) => {
  return (
    <div className="container-fluid mt-4 px-4">
      <div className="row">
        {/* Back Button */}
        <div className="col-12 mb-3">
          <button
            className="btn btn-outline-primary"
            onClick={onBack}
            style={{ cursor: 'pointer' }}
          >
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="me-2"
            >
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Patient Card */}
        <div className="col-12">
          <div className="row justify-content-center">
            <div className="col-6">
              <PatientInfoCard 
                patient={patientData} 
                loading={loading} 
                error={error} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

