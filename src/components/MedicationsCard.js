import React from 'react';
import MedicationsList from './MedicationsList';

const MedicationsCard = ({ patientUuid }) => {
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
                className="text-success"
              >
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                <path d="M0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v1h12V2a1 1 0 0 0-1-1H2zm13 4H1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6z"/>
              </svg>
            </div>
            {/* Component name horizontally aligned to the right of icon */}
            <h5 className="card-title mb-0 fw-bold">Medications</h5>
          </div>
        </div>
        {/* Horizontal line below heading */}
        <hr className="my-0" />
        
        {/* Medications List inside the card */}
        <div className="p-3">
          <MedicationsList patientUuid={patientUuid} />
        </div>
      </div>
    </div>
  );
};

export default MedicationsCard;
