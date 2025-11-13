import React from 'react';
import DiagnosisList from './DiagnosisList';

const DiagnosisCard = ({ patientUuid }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body p-0">
        {/* Header with gray background */}
        <div className="bg-secondary bg-opacity-10 p-3">
          <div className="d-flex align-items-center">
            {/* Icon at top-left */}
            <div className="me-3">
              <svg
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="text-warning"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
            </div>
            {/* Component name horizontally aligned to the right of icon */}
            <h5 className="card-title mb-0 fw-bold">Diagnosis</h5>
          </div>
        </div>
        {/* Horizontal line below heading */}
        <hr className="my-0" />
        
        {/* Diagnosis List inside the card */}
        <div className="p-3">
          <DiagnosisList patientUuid={patientUuid} />
        </div>
      </div>
    </div>
  );
};

export default DiagnosisCard;

