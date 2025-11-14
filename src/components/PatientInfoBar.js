import React from 'react';
import PregnancyProgressBar from './PregnancyProgressBar';

const PatientInfoBar = ({ patientData, gestationalAge, lmpDate, eddDate }) => {
  if (!patientData || !patientData.person) {
    return null;
  }

  const person = patientData.person;

  // Get display name
  let displayName = person.display;
  if (!displayName && person.names && person.names.length > 0) {
    const name = person.names[0];
    displayName = name.display || `${name.givenName || ''} ${name.familyName || ''}`.trim() || 'Unknown Patient';
  }
  displayName = displayName || 'Unknown Patient';

  // Get age
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

  // Get email address from patient identifiers
  const getEmailAddress = () => {
    // First, try to get email from patient identifiers
    if (patientData.identifiers && patientData.identifiers.length > 0) {
      const emailIdentifier = patientData.identifiers.find(
        identifier => identifier.display && identifier.display.startsWith('Email Address')
      );
      
      if (emailIdentifier) {
        // Extract email from the identifier
        // The display might be "Email Address: patient@example.com" or just the identifier value
        if (emailIdentifier.identifier) {
          return emailIdentifier.identifier;
        }
        // If identifier field is not available, try to extract from display
        const displayParts = emailIdentifier.display.split(':');
        if (displayParts.length > 1) {
          return displayParts[1].trim();
        }
        return emailIdentifier.display.replace('Email Address', '').trim();
      }
    }
    
    // Fallback: try person attributes if identifiers don't have email
    if (person.attributes && person.attributes.length > 0) {
      const emailAttribute = person.attributes.find(
        attr => attr.attributeType && (
          attr.attributeType.display === 'Email' ||
          attr.attributeType.uuid === '58f43b5e-5311-4512-b0d4-24a2a7f3a4e2' ||
          attr.attributeType.display?.toLowerCase().includes('email')
        )
      );

      if (emailAttribute) {
        return emailAttribute.value;
      }
    }

    return 'Not available';
  };

  const emailAddress = getEmailAddress();

  // Get avatar URL based on gender
  const getAvatarUrl = (gender) => {
    if (!gender) {
      return 'https://ui-avatars.com/api/?name=Patient&background=random&size=100';
    }

    const genderUpper = gender.toUpperCase();
    if (genderUpper === 'M' || genderUpper === 'MALE') {
      // Male avatar PNG
      return 'https://i.pravatar.cc/100?img=12';
    } else if (genderUpper === 'F' || genderUpper === 'FEMALE') {
      // Female avatar PNG
      return 'https://i.pravatar.cc/100?img=47';
    } else {
      return 'https://ui-avatars.com/api/?name=Patient&background=random&size=100';
    }
  };

  const avatarUrl = getAvatarUrl(person.gender);

  return (
    <div className="container-fluid px-4 py-3 bg-light border-bottom">
      <div className="row align-items-center">
        {/* Avatar Column - col-md-1 */}
        <div className="col-md-1 d-flex justify-content-center">
          <img
            src={avatarUrl}
            alt={displayName}
            className="rounded-circle"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              border: '2px solid #dee2e6'
            }}
            onError={(e) => {
              e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&background=random&size=100';
            }}
          />
        </div>

        {/* Patient Info Column - col-md-3 */}
        <div className="col-md-3">
          <div className="d-flex flex-column">
            <h6 className="mb-1 fw-bold text-dark">{displayName}</h6>
            <small className="text-muted mb-1">Age: {ageDisplay}</small>
            <small className="text-muted">Email: {emailAddress}</small>
          </div>
        </div>

        {/* Gestational Age Column - remaining space */}
        <div className="col-md d-flex align-items-center">
          <PregnancyProgressBar 
            gestationalAge={gestationalAge}
            lmpDate={lmpDate}
            eddDate={eddDate}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientInfoBar;

