import React from 'react';
import LabReportsList from './LabReportsList';

const LabReportsCard = ({ patientUuid }) => {
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
                className="text-info"
              >
                <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z"/>
              </svg>
            </div>
            {/* Component name horizontally aligned to the right of icon */}
            <h5 className="card-title mb-0 fw-bold">Lab Reports</h5>
          </div>
        </div>
        {/* Horizontal line below heading */}
        <hr className="my-0" />
        
        {/* Lab Reports List inside the card */}
        <div className="p-3">
          <LabReportsList patientUuid={patientUuid} />
        </div>
      </div>
    </div>
  );
};

export default LabReportsCard;
