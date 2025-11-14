// LLM Service for generating health advisory messages
// Supports OpenAI, Anthropic (Claude), and other compatible LLM APIs

// Configuration - Set these in your .env file
const LLM_PROVIDER = process.env.REACT_APP_LLM_PROVIDER || 'openai'; // 'openai', 'anthropic', or 'custom'
const LLM_API_KEY = process.env.REACT_APP_LLM_API_KEY;

// API URLs for different providers
const LLM_API_URLS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  custom: process.env.REACT_APP_LLM_API_URL || 'https://api.openai.com/v1/chat/completions'
};

const LLM_API_URL = LLM_API_URLS[LLM_PROVIDER] || LLM_API_URLS.openai;

/**
 * Extract only essential patient information (age and gender only)
 */
const extractPatientSummary = (patientData) => {
  if (!patientData) return null;
  
  const person = patientData.person || {};
  
  return {
    age: person.age || null,
    gender: person.gender || null
  };
};

/**
 * Extract only filtered observations (Hypertension/Diabetes only)
 */
const extractFilteredObservations = (observationsData) => {
  if (!observationsData || !observationsData.results) return [];
  
  return observationsData.results
    .filter(obs => {
      const formFieldPath = obs.formFieldPath || '';
      return formFieldPath === 'rfe-forms-Hypertension' || formFieldPath === 'rfe-forms-Diabetes';
    })
    .map(obs => ({
      formFieldPath: obs.formFieldPath || '',
      display: obs.display || '',
      value: obs.value || obs.valueText || obs.valueNumeric || null,
      concept: obs.concept?.display || obs.concept?.name?.display || '',
      obsDatetime: obs.obsDatetime || null
    }));
};

/**
 * Extract only Aspirin medication information (exclude other medications)
 */
const extractAspirinMedication = (medicationData) => {
  if (!medicationData || !medicationData.results) return [];
  
  return medicationData.results
    .filter(med => {
      const displayName = (med.display || '').toLowerCase();
      return displayName.includes('aspirin');
    })
    .map(med => ({
      displayName: med.display || '',
      status: med.dateStopped === null ? 'Active' : 'Past',
      dateActivated: med.dateActivated || null,
      dateStopped: med.dateStopped || null
    }))
    .filter(m => m.status === 'Active'); // Only active Aspirin
};

/**
 * Generate health advisory message using LLM
 * @param {Object} patientQueryResponse - Patient query response from OpenMRS
 * @param {Object} medicationResponse - Medication data from OpenMRS
 * @param {Object} observationsResponse - Observations data from OpenMRS (filtered)
 * @returns {Promise<string>} Generated health advisory message
 */
export const generateHealthAdvisory = async (patientQueryResponse, medicationResponse, observationsResponse) => {
  console.log('[LLM Service] generateHealthAdvisory called');
  
  // Check if running in production and log configuration status
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!LLM_API_KEY) {
    const errorMsg = isProduction 
      ? 'LLM API key not configured in Vercel. Please add REACT_APP_LLM_API_KEY environment variable. Using fallback message.'
      : 'LLM API key not configured. Using fallback message.';
    console.warn('[LLM Service]', errorMsg);
    return getFallbackMessage();
  }

  try {
    console.log('[LLM Service] Extracting data...');
    // Extract only minimal essential data to reduce token usage
    const patientSummary = extractPatientSummary(patientQueryResponse);
    const filteredObservations = extractFilteredObservations(observationsResponse);
    const aspirinMedication = extractAspirinMedication(medicationResponse);
    
    console.log('[LLM Service] Data extracted:', {
      patientSummary,
      observationsCount: filteredObservations.length,
      aspirinCount: aspirinMedication.length
    });
    
    // Generate fresh prompt each time (no caching)
    const prompt = `Now act as my health advisor, suggest in a gentle and empathetic way:

1. "💊 Why aspirin has been given" – describe using limited words (30–45), and mention which diagnosis (Hypertension or Diabetes) is relevant.

2. "🩺 Pre-eclampsia" – briefly explain what Pre-eclampsia is and why it matters during pregnancy, using limited words (20–45).

3. "⚠️ Importance of taking it" – provide a limited-word description explaining why it is important for the patient to take the medication.

4. "🌱 Life style" – provide 3–5 short, positive lifestyle suggestions tailored for the identified diagnosis to help reduce the risk of pre-eclampsia. Each suggestion must contain 30–50 words.

You are acting as a doctor. Analyze the following patient data to understand:
- Why aspirin has been given and which diagnosis causes the risk.
- Which diagnosis increases the patient's chance of developing pre-eclampsia.

Patient Information (age and gender only):
${JSON.stringify(patientSummary)}

Filtered Diagnosis Observations (Hypertension/Diabetes only):
${JSON.stringify(filteredObservations)}

Aspirin Medication:
${JSON.stringify(aspirinMedication)}

Format the response with clear sections using ## for main headings with the icons (💊, 🩺, ⚠️, 🌱). Be warm, supportive, and easy to understand.`;

    // Configure request based on provider
    let requestConfig;
    
    if (LLM_PROVIDER === 'anthropic') {
      // Anthropic Claude API format
      requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LLM_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `You are a gentle, supportive Health Advisor who provides clear, empathetic health information to patients.\n\n${prompt}`
            }
          ]
        })
      };
    } else {
      // OpenAI or compatible API format
      requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.REACT_APP_LLM_MODEL || 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a gentle, supportive Health Advisor who provides clear, empathetic health information to patients.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      };
    }

    console.log('[LLM Service] Sending request to LLM API...');
    const response = await fetch(LLM_API_URL, requestConfig);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LLM Service] API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: LLM_API_URL,
        provider: LLM_PROVIDER
      });
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[LLM Service] Response received from LLM');
    
    // Handle different response formats
    let message = null;
    if (LLM_PROVIDER === 'anthropic') {
      // Anthropic returns content in data.content array
      if (data.content && data.content.length > 0 && data.content[0].text) {
        message = data.content[0].text;
      }
    } else {
      // OpenAI and compatible APIs return choices array
      if (data.choices && data.choices.length > 0) {
        message = data.choices[0].message.content;
      }
    }
    
    if (!message) {
      console.error('[LLM Service] No message in response:', data);
      throw new Error('No response from LLM');
    }
    
    console.log('[LLM Service] Message extracted, length:', message.length);
    return message;
  } catch (error) {
    console.error('[LLM Service] Error generating health advisory:', {
      message: error.message,
      stack: error.stack,
      provider: LLM_PROVIDER,
      apiUrl: LLM_API_URL,
      hasApiKey: !!LLM_API_KEY
    });
    return getFallbackMessage();
  }
};

/**
 * Fallback message when LLM is not available
 */
const getFallbackMessage = () => {
  return `## 💊 Why aspirin has been given

Low-dose Aspirin is often prescribed during pregnancy for women at risk of pre-eclampsia, particularly those with conditions like Diabetes or Hypertension. Research has shown that taking a low dose of Aspirin (typically 81mg) daily can help reduce the risk of developing pre-eclampsia by improving blood flow to the placenta and reducing inflammation.

## 🩺 Pre-eclampsia

Pre-eclampsia is a pregnancy complication characterized by high blood pressure and signs of damage to another organ system, most often the liver and kidneys. It typically begins after 20 weeks of pregnancy and can affect both the mother and the developing baby.

## ⚠️ Importance of taking it

Taking Aspirin as prescribed is crucial for managing pre-eclampsia risk. It helps improve blood flow to the placenta, which is essential for your baby's growth and development. Consistent use can significantly reduce the risk of complications for both you and your baby.

## 🌱 Life style

1. **Regular Prenatal Care:** Attend all scheduled prenatal appointments to monitor your blood pressure and overall health. Regular check-ups allow your healthcare provider to detect any changes early and adjust your treatment plan as needed.

2. **Healthy Diet:** Focus on a balanced diet rich in fruits, vegetables, whole grains, and lean proteins. Limit processed foods and sodium intake. A nutritious diet supports healthy blood pressure and provides essential nutrients for your baby's development.

3. **Stay Hydrated:** Drink plenty of water throughout the day to support healthy blood circulation. Proper hydration helps maintain blood volume and can support healthy blood pressure levels.

4. **Rest and Sleep:** Ensure you get adequate rest and sleep, as fatigue can impact blood pressure. Aim for 7-9 hours of quality sleep each night and take breaks during the day when needed.

5. **Monitor Symptoms:** Be aware of warning signs such as severe headaches, vision changes, or sudden swelling, and contact your healthcare provider immediately if these occur.`;
};

export default generateHealthAdvisory;

