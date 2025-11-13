import React from 'react';
import AppointmentsList from './AppointmentsList';

const AppointmentsCard = ({ patientUuid }) => {
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
                className="text-primary"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm8-7A8 8 0 1 0 0 8a8 8 0 0 0 16 0z"/>
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
              </svg>
            </div>
            {/* Component name horizontally aligned to the right of icon */}
            <h5 className="card-title mb-0 fw-bold">Appointments</h5>
          </div>
        </div>
        {/* Horizontal line below heading */}
        <hr className="my-0" />
        
        {/* Appointments List inside the card */}
        <div className="p-3">
          <AppointmentsList patientUuid={patientUuid} />
        </div>
      </div>
    </div>
  );
};

export default AppointmentsCard;
