import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './Login';
import MenuBar from './components/MenuBar';
import ProfilePage from './components/ProfilePage';
import AppointmentsCard from './components/AppointmentsCard';
import MedicationsCard from './components/MedicationsCard';
import LabReportsCard from './components/LabReportsCard';
import DiagnosisCard from './components/DiagnosisCard';
import { searchPatientByEmail } from './services/openmrsService';
import './App.css';

// Test email for patient query - using hardcoded email instead of Google login email
const TEST_PATIENT_EMAIL = 'perera@gmail.com';

function App() {
  const [user, setUser] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'profile'

  const fetchPatientData = async (email) => {
    setLoading(true);
    setError(null);
    setPatientData(null);

    try {
      const result = await searchPatientByEmail(email);
      
      if (result.success && result.patient) {
        // Store raw patient data for PatientInfoCard
        setPatientData(result.patient);
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
