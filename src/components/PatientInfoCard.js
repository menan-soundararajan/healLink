import React from 'react';
import SriLankanAvatar from './avatars/SriLankanAvatar';

const PatientInfoCard = ({ patient, loading, error }) => {

  // Format gender display
  const formatGender = (gender) => {
    if (!gender) return 'Not specified';
    const genderUpper = gender.toUpperCase();
    if (genderUpper === 'M' || genderUpper === 'MALE') return 'Male';
    if (genderUpper === 'F' || genderUpper === 'FEMALE') return 'Female';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="col-md-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading patient information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-md-4 mb-4">
        <div className="card shadow-sm border-danger">
          <div className="card-body">
            <div className="alert alert-danger mb-0" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient || !patient.person) {
    return (
      <div className="col-md-4 mb-4">
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <p className="text-muted">No patient data available</p>
          </div>
        </div>
      </div>
    );
  }

  const person = patient.person;
  
  // Get display name - try person.display first, then names array
  let displayName = person.display;
  if (!displayName && person.names && person.names.length > 0) {
    const name = person.names[0];
    displayName = name.display || `${name.givenName || ''} ${name.familyName || ''}`.trim() || 'Unknown Patient';
  }
  displayName = displayName || 'Unknown Patient';
  
  // Get age - try person.age first, then calculate from birthdate
  let age = person.age;
  if (age === undefined || age === null) {
    if (person.birthdate) {
      const birth = new Date(person.birthdate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      age = calculatedAge;
    }
  }
  const ageDisplay = age !== undefined && age !== null ? `${age} years` : 'Not specified';
  
  const gender = formatGender(person.gender);

  return (
    <div className="mb-4">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          {/* Profile Image */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle border border-3 border-primary d-inline-flex align-items-center justify-content-center"
              style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#f8f9fa',
                overflow: 'hidden'
              }}
            >
              <SriLankanAvatar 
                gender={person.gender} 
                size={120}
                className="rounded-circle"
              />
            </div>
          </div>

          {/* Patient Name */}
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="text-primary me-2"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              <h5 className="card-title mb-0 fw-bold">{displayName}</h5>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-3" />

          {/* Patient Details */}
          <div className="patient-details">
            {/* Age */}
            <div className="d-flex align-items-center mb-3">
              <div className="icon-wrapper bg-primary bg-opacity-10 rounded p-2 me-3">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  className="text-primary"
                >
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>
              </div>
              <div>
                <small className="text-muted d-block">Age</small>
                <strong className="text-dark">{ageDisplay}</strong>
              </div>
            </div>

            {/* Gender */}
            <div className="d-flex align-items-center mb-3">
              <div className="icon-wrapper bg-info bg-opacity-10 rounded p-2 me-3">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  className="text-info"
                >
                  <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
              </div>
              <div>
                <small className="text-muted d-block">Gender</small>
                <strong className="text-dark">{gender}</strong>
              </div>
            </div>

            {/* Patient ID */}
            {patient.uuid && (
              <div className="d-flex align-items-center">
                <div className="icon-wrapper bg-success bg-opacity-10 rounded p-2 me-3">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="text-success"
                  >
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                </div>
                <div>
                  <small className="text-muted d-block">Patient ID</small>
                  <strong className="text-dark text-truncate d-block" style={{ maxWidth: '200px' }}>{patient.uuid}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;

