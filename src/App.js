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
import { searchPatientByEmail } from './services/openmrsService';
import './App.css';

// Test email for patient query - using hardcoded email instead of Google login email
const TEST_PATIENT_EMAIL = 'perera@gmail.com';

function App() {
  const [user, setUser] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [gestationalAge, setGestationalAge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'profile'

  const fetchPatientData = async (email) => {
    setLoading(true);
    setError(null);
    setPatientData(null);
    setGestationalAge(null);

    try {
      const result = await searchPatientByEmail(email);
      
      if (result.success && result.patient) {
        // Store raw patient data for PatientInfoCard
        setPatientData(result.patient);
        
        // Fetch observations to get gestational age
        if (result.patient.uuid) {
          await fetchGestationalAge(result.patient.uuid);
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

  const fetchGestationalAge = async (patientUuid) => {
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

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        console.warn('Failed to fetch observations:', response.status);
        return;
      }

      const data = await response.json();
      
      // Find observation related to Gestational Age
      if (data.results && data.results.length > 0) {
        const gestationalAgeObs = data.results.find(obs => {
          // Check if display or concept.display contains "Gestational Age" or "Gestational age"
          const display = obs.display || '';
          const conceptDisplay = obs.concept?.display || '';
          const searchText = (display + ' ' + conceptDisplay).toLowerCase();
          
          return searchText.includes('gestational age') || 
                 searchText.includes('gestational age at birth');
        });

        if (gestationalAgeObs && gestationalAgeObs.display) {
          // Extract the value from display (e.g., "Gestational age at birth (weeks): 38")
          const displayText = gestationalAgeObs.display;
          setGestationalAge(displayText);
        }
      }
    } catch (err) {
      console.error('Error fetching gestational age:', err);
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

  if (!user) {
    return <Login onSuccess={handleLoginSuccess} onError={handleLoginError} />;
  }

  return (
    <div className="bg-white" style={{ minHeight: '100vh', paddingTop: '56px' }}>
      {/* Top Menu Bar - Fixed at top, 56px height */}
      <MenuBar 
        userName={user.name || 'User'} 
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
          <PatientInfoBar patientData={patientData} gestationalAge={gestationalAge} />
          
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
        </>
      )}
    </div>
  );
}

export default App;
