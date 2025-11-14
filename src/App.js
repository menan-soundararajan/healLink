import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './Login';
import MenuBar from './components/MenuBar';
import ProfilePage from './components/ProfilePage';
import AppointmentsCard from './components/AppointmentsCard';
import MedicationsCard from './components/MedicationsCard';
import LabReportsCard from './components/LabReportsCard';
import DiagnosisCard from './components/DiagnosisCard';
import HealthAdvisoryCard from './components/HealthAdvisoryCard';
import PatientInfoBar from './components/PatientInfoBar';
import LoadingOverlay from './components/LoadingOverlay';
import { useOpenMRSLoading } from './contexts/OpenMRSLoadingContext';
import { searchPatientByEmail } from './services/openmrsService';
import './App.css';

// Test email for patient query - using hardcoded email instead of Google login email
const TEST_PATIENT_EMAIL = 'perera@gmail.com';

function App() {
  const [user, setUser] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [gestationalAge, setGestationalAge] = useState(null);
  const [lmpDate, setLmpDate] = useState(null);
  const [eddDate, setEddDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'profile'
  const { isLoading: openMRSLoading, error: openMRSError, clearError } = useOpenMRSLoading();

  const fetchPatientData = async (email) => {
    setLoading(true);
    setError(null);
    setPatientData(null);
    setGestationalAge(null);
    setLmpDate(null);
    setEddDate(null);

    try {
      const result = await searchPatientByEmail(email);
      
      if (result.success && result.patient) {
        // Store raw patient data for PatientInfoCard
        setPatientData(result.patient);
        
        // Fetch observations to get LMP, EDD, and calculate gestational age
        if (result.patient.uuid) {
          await fetchPregnancyData(result.patient.uuid);
        }
      } else {
        setError(result.error || 'Patient not found');
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError(err.message || 'Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPregnancyData = async (patientUuid) => {
    try {
      // Detect if running on Vercel or in production
      const isVercel = window.location.hostname.includes('vercel.app') || process.env.NODE_ENV === 'production';
      const USE_PROXY = process.env.REACT_APP_USE_PROXY !== 'false';
      
      // Use Vercel serverless function in production, local proxy in development
      const PROXY_URL = isVercel 
        ? '/api/openmrs' 
        : (process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/openmrs');
      const OPENMRS_BASE_URL = USE_PROXY ? PROXY_URL : 'https://openmrs6.arogya.cloud';
      
      const url = USE_PROXY
        ? `${OPENMRS_BASE_URL}/ws/rest/v1/obs?patient=${patientUuid}&v=full`
        : `${OPENMRS_BASE_URL}/openmrs/ws/rest/v1/obs?patient=${patientUuid}&v=full`;

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth header if not using proxy
      if (!USE_PROXY) {
        const credentials = btoa('admin:Admin123');
        headers['Authorization'] = `Basic ${credentials}`;
      }

      const { openmrsFetch } = await import('./utils/openmrsFetch');
      const result = await openmrsFetch(url, {
        method: 'GET',
        headers: headers,
      });

      const data = result.data;
      
      if (data.results && data.results.length > 0) {
        // Find LMP observation
        const lmpObs = data.results.find(obs => 
          obs.formFieldPath === 'rfe-forms-LMP' || 
          (obs.formFieldPath && obs.formFieldPath.includes('LMP'))
        );

        // Find EDD observation
        const eddObs = data.results.find(obs => 
          obs.formFieldPath === 'rfe-forms-EDD' || 
          (obs.formFieldPath && obs.formFieldPath.includes('EDD'))
        );

        // Extract LMP date
        if (lmpObs) {
          // Try to get date from value field first, then display
          const lmpValue = lmpObs.value || lmpObs.display || '';
          const lmpDisplay = lmpObs.display || '';
          const lmpText = lmpValue || lmpDisplay;
          
          // Try to extract date from text (format may vary)
          // Example: "2024-01-15" or "LMP: 2024-01-15" or "15/01/2024"
          const dateMatch = lmpText.match(/\d{4}-\d{2}-\d{2}/) || 
                           lmpText.match(/\d{2}\/\d{2}\/\d{4}/) ||
                           lmpText.match(/\d{2}-\d{2}-\d{4}/);
          
          if (dateMatch) {
            const dateStr = dateMatch[0];
            setLmpDate(dateStr);
            
            // Calculate gestational age in weeks from LMP
            // Handle different date formats
            let lmpDateObj;
            if (dateStr.includes('/')) {
              // DD/MM/YYYY format
              const [day, month, year] = dateStr.split('/');
              lmpDateObj = new Date(year, month - 1, day);
            } else if (dateStr.includes('-')) {
              // YYYY-MM-DD or DD-MM-YYYY format
              const parts = dateStr.split('-');
              if (parts[0].length === 4) {
                // YYYY-MM-DD
                lmpDateObj = new Date(dateStr);
              } else {
                // DD-MM-YYYY
                lmpDateObj = new Date(parts[2], parts[1] - 1, parts[0]);
              }
            } else {
              lmpDateObj = new Date(dateStr);
            }
            
            const today = new Date();
            const diffTime = today - lmpDateObj;
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            
            if (diffWeeks >= 0 && diffWeeks <= 40) {
              setGestationalAge(diffWeeks);
            }
          } else if (lmpText) {
            // If no date pattern found, use the text value as-is
            setLmpDate(lmpText);
          }
        }

        // Extract EDD date
        if (eddObs) {
          // Try to get date from value field first, then display
          const eddValue = eddObs.value || eddObs.display || '';
          const eddDisplay = eddObs.display || '';
          const eddText = eddValue || eddDisplay;
          
          // Try to extract date from text
          const dateMatch = eddText.match(/\d{4}-\d{2}-\d{2}/) || 
                           eddText.match(/\d{2}\/\d{2}\/\d{4}/) ||
                           eddText.match(/\d{2}-\d{2}-\d{4}/);
          
          if (dateMatch) {
            setEddDate(dateMatch[0]);
          } else if (eddText) {
            // If no date pattern found, use the text value as-is
            setEddDate(eddText);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching pregnancy data:', err);
      // Don't set error state, just log it - this is optional data
    }
  };

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      setUser(decoded);
      console.log('Login successful:', decoded);
      
      // After successful Google login, fetch patient data from OpenMRS using test email
      await fetchPatientData(TEST_PATIENT_EMAIL);
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Failed to process login');
    }
  };

  const handleLoginError = () => {
    console.error('Login failed');
    setError('Google login failed');
  };

  const handleLogout = () => {
    setUser(null);
    setPatientData(null);
    setGestationalAge(null);
    setLmpDate(null);
    setEddDate(null);
    setError(null);
    setLoading(false);
    setCurrentView('dashboard');
  };

  const handleProfile = () => {
    setCurrentView('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Extract patient display name from OpenMRS patient data
  const getPatientDisplayName = () => {
    if (patientData && patientData.person) {
      const person = patientData.person;
      // Try person.display first
      let displayName = person.display;
      // Fallback to names array if display is not available
      if (!displayName && person.names && person.names.length > 0) {
        const name = person.names[0];
        displayName = name.display || `${name.givenName || ''} ${name.familyName || ''}`.trim();
      }
      // Return display name if found, otherwise fall back to Google login name
      return displayName || user?.name || 'User';
    }
    // Fall back to Google login name if no patient data
    return user?.name || 'User';
  };

  if (!user) {
    return <Login onSuccess={handleLoginSuccess} onError={handleLoginError} />;
  }

  const handleDismissError = () => {
    clearError();
  };

  return (
    <div className="bg-white" style={{ minHeight: '100vh', paddingTop: '56px' }}>
      {/* Global Loading Overlay for OpenMRS API calls */}
      <LoadingOverlay 
        isLoading={openMRSLoading} 
        error={openMRSError}
        onDismissError={handleDismissError}
      />

      {/* Top Menu Bar - Fixed at top, 56px height */}
      <MenuBar 
        userName={getPatientDisplayName()} 
        onLogout={handleLogout}
        onProfile={handleProfile}
      />

      {/* Main Page Body */}
      {currentView === 'profile' ? (
        <ProfilePage 
          patientData={patientData}
          loading={loading}
          error={error}
          onBack={handleBackToDashboard}
        />
      ) : (
        <>
                 {/* Patient Info Bar - Only on Dashboard */}
                 <PatientInfoBar 
                   patientData={patientData} 
                   gestationalAge={gestationalAge}
                   lmpDate={lmpDate}
                   eddDate={eddDate}
                 />
          
          {/* Show "User not registered" message if patient not found */}
          {error && error === 'User not registered' && !loading && (
            <div className="container-fluid mt-4 px-4">
              <div className="alert alert-warning text-center" role="alert">
                <h5 className="mb-0">User not registered</h5>
                <p className="mb-0 mt-2 text-muted">No patient record found with the provided email address.</p>
              </div>
            </div>
          )}
          
          {/* Only show dashboard cards if patient data exists */}
          {patientData && (
            <div className="container-fluid mt-4 px-4">
            <div className="row g-4">
              {/* Row 1: Appointments (left) and Medications (right) */}
              <div className="col-md-6 col-sm-12">
                <AppointmentsCard patientUuid={patientData?.uuid} />
              </div>
              <div className="col-md-6 col-sm-12">
                <MedicationsCard patientUuid={patientData?.uuid} />
              </div>
              
              {/* Row 2: Lab Reports (left) and Diagnosis (right) */}
              <div className="col-md-6 col-sm-12">
                <LabReportsCard patientUuid={patientData?.uuid} />
              </div>
              <div className="col-md-6 col-sm-12">
                <DiagnosisCard patientUuid={patientData?.uuid} />
              </div>
              
              {/* Health Advisory - Only shows when conditions are met */}
              <HealthAdvisoryCard patientUuid={patientData?.uuid} />
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
