import React, { useState, useEffect, useCallback } from 'react';
import { openmrsFetch } from '../utils/openmrsFetch';

const HealthAdvisoryCard = ({ patientUuid }) => {
  const [advisoryMessage, setAdvisoryMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shouldShow, setShouldShow] = useState(false);

  const checkConditionsAndGenerateAdvisory = useCallback(async (patientUuid) => {
    setLoading(true);
    setError(null);
    setShouldShow(false);
    setAdvisoryMessage(null);

    try {
      const [diagnosisData, medicationData] = await Promise.all([
        fetchDiagnosis(patientUuid),
        fetchMedications(patientUuid)
      ]);

      const hasPreEclampsia = checkPreEclampsiaCondition(diagnosisData);
      const hasAspirin = checkAspirinCondition(medicationData);

      if (hasPreEclampsia && hasAspirin) {
        setShouldShow(true);
        const { generateHealthAdvisory } = await import('../services/llmService');
        const message = await generateHealthAdvisory(medicationData, diagnosisData);
        setAdvisoryMessage(message);
      } else {
        setShouldShow(false);
      }
    } catch (err) {
      console.error('Error checking conditions:', {
        message: err.message,
        stack: err.stack,
        patientUuid: patientUuid
      });
      setError(err.message || 'Failed to check health conditions');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since patientUuid is passed as parameter

  useEffect(() => {
    if (patientUuid) {
      checkConditionsAndGenerateAdvisory(patientUuid);
    }
  }, [patientUuid, checkConditionsAndGenerateAdvisory]);

  const fetchDiagnosis = async (patientUuid) => {
    const isVercel = window.location.hostname.includes('vercel.app') || process.env.NODE_ENV === 'production';
    const USE_PROXY = process.env.REACT_APP_USE_PROXY !== 'false';
    const PROXY_URL = isVercel
      ? '/api/openmrs'
      : (process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/openmrs');
    const OPENMRS_BASE_URL = USE_PROXY ? PROXY_URL : 'https://openmrs6.arogya.cloud';

    const url = USE_PROXY
      ? `${OPENMRS_BASE_URL}/ws/fhir2/R4/Condition?patient=${patientUuid}`
      : `${OPENMRS_BASE_URL}/openmrs/ws/fhir2/R4/Condition?patient=${patientUuid}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (!USE_PROXY) {
      const credentials = btoa('admin:Admin123');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const result = await openmrsFetch(url, {
      method: 'GET',
      headers: headers,
    });

    return result.data;
  };

  const fetchMedications = async (patientUuid) => {
    const isVercel = window.location.hostname.includes('vercel.app') || process.env.NODE_ENV === 'production';
    const USE_PROXY = process.env.REACT_APP_USE_PROXY !== 'false';
    const PROXY_URL = isVercel
      ? '/api/openmrs'
      : (process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/openmrs');
    const OPENMRS_BASE_URL = USE_PROXY ? PROXY_URL : 'https://openmrs6.arogya.cloud';

    const ORDER_TYPE_UUID = '131168f4-15f5-102d-96e4-000c29c2a5d7';
    const url = USE_PROXY
      ? `${OPENMRS_BASE_URL}/ws/rest/v1/order?patient=${patientUuid}&orderType=${ORDER_TYPE_UUID}&v=full`
      : `${OPENMRS_BASE_URL}/openmrs/ws/rest/v1/order?patient=${patientUuid}&orderType=${ORDER_TYPE_UUID}&v=full`;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (!USE_PROXY) {
      const credentials = btoa('admin:Admin123');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const result = await openmrsFetch(url, {
      method: 'GET',
      headers: headers,
    });

    return result.data;
  };

  const checkPreEclampsiaCondition = (diagnosisData) => {
    if (!diagnosisData || !diagnosisData.entry || diagnosisData.entry.length === 0) {
      return false;
    }

    for (const entry of diagnosisData.entry) {
      const condition = entry.resource;

      let diagnosticName = '';
      if (condition.code && condition.code.text) {
        diagnosticName = condition.code.text;
      } else if (condition.code && condition.code.coding && condition.code.coding.length > 0) {
        diagnosticName = condition.code.coding[0].display || condition.code.coding[0].code || '';
      } else if (condition.display) {
        diagnosticName = condition.display;
      }

      let statusCode = null;
      if (condition.clinicalStatus && condition.clinicalStatus.coding && condition.clinicalStatus.coding.length > 0) {
        statusCode = condition.clinicalStatus.coding[0].code || '';
      } else if (condition.clinicalStatus && condition.clinicalStatus.text) {
        statusCode = condition.clinicalStatus.text;
      }

      let isActive = false;
      if (statusCode) {
        const statusLower = statusCode.toLowerCase();
        isActive = statusLower === 'active';
      }

      const diagnosticNameLower = diagnosticName ? diagnosticName.toLowerCase() : '';
      const isPreEclampsia = diagnosticNameLower === 'history of pre-eclampsia';

      if (isPreEclampsia && isActive) {
        return true;
      }
    }

    return false;
  };

  const checkAspirinCondition = (medicationData) => {
    if (!medicationData || !medicationData.results || medicationData.results.length === 0) {
      return false;
    }

    for (const medication of medicationData.results) {
      const displayName = medication.display || '';
      const isAspirin = displayName.toLowerCase().includes('aspirin');
      const isActive = medication.dateStopped === null;

      if (isAspirin && isActive) {
        return true;
      }
    }

    return false;
  };

  const formatMessage = (message) => {
    if (!message) return '';

    let formatted = message;

    // Process numbered lists - find consecutive numbered items and group them into a single <ul> (bullet points)
    // This regex finds blocks of consecutive numbered list items (1., 2., 3., etc.) and converts them to bullet points
    formatted = formatted.replace(/((?:^|\n)\d+\.\s+[^\n]+(?:\n\d+\.\s+[^\n]+)*)/gm, (match) => {
      // Extract all numbered items from this block
      const items = [];
      const lines = match.trim().split('\n');
      
      for (const line of lines) {
        const itemMatch = line.match(/^\d+\.\s+(.+)$/);
        if (itemMatch) {
          let content = itemMatch[1].trim();
          // Remove any leading number pattern (e.g., "1. " or "1.") from the content
          content = content.replace(/^\d+\.\s*/, '');
          items.push(content);
        }
      }
      
      if (items.length > 0) {
        // Return a single <ul> with all items (bullet points) - same font size as other content
        return '<ul class="ps-3 mb-2">'  +
        items.map(item => `<li class="mb-1">${item}</li>`).join('') + 
          '</ul>';
      }
      return match;
    });

    // Process headings and formatting
    formatted = formatted
      .replace(/^### (.*$)/gim, '<div class="fw-bold mt-2 mb-1" style="font-size: 0.9rem;">$1</div>')
      .replace(/^## (.*$)/gim, '<div class="fw-bold mt-2 mb-1" style="font-size: 0.95rem;">$1</div>')
      .replace(/^# (.*$)/gim, '<div class="fw-bold mt-2 mb-1" style="font-size: 0.95rem;">$1</div>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Remove bold styling from Lifestyle section
    formatted = formatted.replace(
      /(## 🌱 Life style[^<]*<\/div>)([\s\S]*?)(?=##|$)/gi,
      (match, heading, content) => {
        // Remove all <strong> tags but preserve the text content
        const processedContent = content.replace(/<strong>(.*?)<\/strong>/gi, '$1');
        return heading + processedContent;
      }
    );

    // Remove all <br> tags immediately after headings (now divs)
    formatted = formatted.replace(/(<\/div>)\s*<br>\s*/gi, '$1');
    // Remove multiple consecutive <br> tags
    formatted = formatted.replace(/<br>\s*<br>/gi, '<br>');
    // Convert remaining newlines to <br>, but preserve list structure (no <br> inside <ul> or <ol>)
    formatted = formatted.replace(/\n/g, (match, offset, string) => {
      // Check if we're inside a list tag by counting open/close tags before this position
      const before = string.substring(0, offset);
      const ulOpenCount = (before.match(/<ul[^>]*>/gi) || []).length;
      const ulCloseCount = (before.match(/<\/ul>/gi) || []).length;
      const olOpenCount = (before.match(/<ol[^>]*>/gi) || []).length;
      const olCloseCount = (before.match(/<\/ol>/gi) || []).length;
      const divOpenCount = (before.match(/<div[^>]*>/gi) || []).length;
      const divCloseCount = (before.match(/<\/div>/gi) || []).length;
      
      // If we're inside a list tag or div (heading), don't add <br>
      if ((ulOpenCount > ulCloseCount) || (olOpenCount > olCloseCount) || (divOpenCount > divCloseCount)) {
        return '';
      }
      return '<br>';
    });

    return formatted;
  };

  if (!shouldShow && !loading) {
    return null;
  }

  return (
    <div className="col-12">
      <div className="card shadow-sm border-primary">
        <div className="card-body p-0">
          <div className="bg-primary bg-opacity-10 px-3 py-2">
            <div className="d-flex align-items-center">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="text-primary me-2"
              >
                <path d="M8 15.5c-1.5 0-3-1.69-3-3.5 0-1.41 1.72-2.83 3-4.5 1.28 1.67 3 3.09 3 4.5 0 1.81-1.5 3.5-3 3.5zm0-13C6.5 2.5 5 4.19 5 6c0 1.41 1.72 2.83 3 4.5 1.28-1.67 3-3.09 3-4.5 0-1.81-1.5-3.5-3-3.5z" />
              </svg>
              <h6 className="card-title mb-0 fw-bold text-primary">Health Advisory</h6>
            </div>
          </div>
          <hr className="my-0" />
          <div className="p-2">
            {loading && (
              <div className="text-center py-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <small className="d-block mt-2 text-muted">Generating health advisory...</small>
              </div>
            )}
            {error && (
              <div className="alert alert-warning py-2 mb-0" role="alert">
                <small className="mb-0">Unable to generate health advisory: {error}</small>
              </div>
            )}
            {advisoryMessage && !loading && (
              <div
                className="health-advisory-content"
                dangerouslySetInnerHTML={{ __html: formatMessage(advisoryMessage) }}
                style={{
                  lineHeight: '1.5',
                  color: '#333',
                  fontSize: '0.85rem'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAdvisoryCard;

