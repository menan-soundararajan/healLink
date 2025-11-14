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
 * Generate health advisory message using LLM
 * @param {Object} medicationResponse - Medication data from OpenMRS
 * @param {Object} diagnosisResponse - Diagnosis data from OpenMRS
 * @returns {Promise<string>} Generated health advisory message
 */
export const generateHealthAdvisory = async (medicationResponse, diagnosisResponse) => {
  // Check if running in production and log configuration status
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Debug: Log all environment variables (for troubleshooting)
  if (isProduction) {
    console.log('Environment Variables Debug:', {
      NODE_ENV: process.env.NODE_ENV,
      hasREACT_APP_LLM_PROVIDER: !!process.env.REACT_APP_LLM_PROVIDER,
      REACT_APP_LLM_PROVIDER: process.env.REACT_APP_LLM_PROVIDER,
      hasREACT_APP_LLM_API_KEY: !!process.env.REACT_APP_LLM_API_KEY,
      REACT_APP_LLM_API_KEY_length: process.env.REACT_APP_LLM_API_KEY?.length || 0,
      REACT_APP_LLM_API_KEY_prefix: process.env.REACT_APP_LLM_API_KEY?.substring(0, 10) || 'not set',
      hasREACT_APP_LLM_MODEL: !!process.env.REACT_APP_LLM_MODEL,
      REACT_APP_LLM_MODEL: process.env.REACT_APP_LLM_MODEL,
      // Also check the constants
      LLM_PROVIDER: LLM_PROVIDER,
      LLM_API_KEY_set: !!LLM_API_KEY,
      LLM_API_URL: LLM_API_URL
    });
  }
  
  if (!LLM_API_KEY) {
    const errorMsg = isProduction 
      ? 'LLM API key not configured in Vercel. Please add REACT_APP_LLM_API_KEY environment variable. Using fallback message.'
      : 'LLM API key not configured. Using fallback message.';
    console.warn(errorMsg);
    console.warn('LLM Provider:', LLM_PROVIDER);
    console.warn('LLM API URL:', LLM_API_URL);
    console.warn('Troubleshooting: Check Vercel Settings > Environment Variables and ensure REACT_APP_LLM_API_KEY is set for Production environment.');
    return getFallbackMessage();
  }

  if (isProduction) {
    console.log('LLM Configuration:', {
      provider: LLM_PROVIDER,
      apiUrl: LLM_API_URL,
      hasApiKey: !!LLM_API_KEY,
      apiKeyPrefix: LLM_API_KEY.substring(0, 10) + '...'
    });
  }

  try {
    const prompt = `Now act as my health advisor, suggest in a gentle and empathetic way:

1. Briefly explain what Pre-eclampsia is and why it matters, using limited words (20–45).  
   This explanation must appear under the heading: "🩺 Pre-eclampsia"  
   (Use a small, medically relevant icon before the heading.)

2. "Why aspirin has been given" – describe using limited words (20–45).  
   This explanation must appear under the heading: "💊 Why aspirin has been given"  
   (Use a small pill/medicine-related icon before the heading.)

3. Provide a limited-word description explaining why it is important for the patient to take the medication.  
   This section must appear under the heading: "⚠️ Importance of taking it"  
   (Use a small warning/importance icon.)

4. Provide 3–5 short, positive lifestyle suggestions based on Google Health guidelines  
   (such as diet, rest, stress reduction, and blood pressure monitoring).  
   Each lifestyle suggestion should contain 30–50 words.  
   This section must appear under the heading: "🌱 Life style"  
   (Use a small healthy-living icon.)

Patient Diagnosis Data:
${JSON.stringify(diagnosisResponse, null, 2)}

Patient Medication Data:
${JSON.stringify(medicationResponse, null, 2)}

Format the response with clear sections using ## for main headings. Be warm, supportive, and easy to understand.`;

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
          model: 'claude-3-5-sonnet-20241022', // or 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'
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
          model: process.env.REACT_APP_LLM_MODEL || 'gpt-3.5-turbo', // Can be 'gpt-4', 'gpt-4-turbo', etc.
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

    const response = await fetch(LLM_API_URL, requestConfig);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: LLM_API_URL,
        provider: LLM_PROVIDER
      });
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (LLM_PROVIDER === 'anthropic') {
      // Anthropic returns content in data.content array
      if (data.content && data.content.length > 0 && data.content[0].text) {
        return data.content[0].text;
      }
    } else {
      // OpenAI and compatible APIs return choices array
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
    }
    
    throw new Error('No response from LLM');
  } catch (error) {
    console.error('Error generating health advisory:', {
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
  return `## Pre-eclampsia

Pre-eclampsia is a pregnancy complication characterized by high blood pressure and signs of damage to another organ system, most often the liver and kidneys. It typically begins after 20 weeks of pregnancy and can affect both the mother and the developing baby.

## Why aspirin has been given

Low-dose Aspirin is often prescribed during pregnancy for women at risk of pre-eclampsia. Research has shown that taking a low dose of Aspirin (typically 81mg) daily, starting early in pregnancy, can help reduce the risk of developing pre-eclampsia. Aspirin works by helping to improve blood flow to the placenta and reducing inflammation.

## Importance of taking it

Taking Aspirin as prescribed is crucial for managing pre-eclampsia risk. It helps improve blood flow to the placenta, which is essential for your baby's growth and development. Consistent use can significantly reduce the risk of complications for both you and your baby.

## Life style

1. **Regular Prenatal Care:** Attend all scheduled prenatal appointments to monitor your blood pressure and overall health. Regular check-ups allow your healthcare provider to detect any changes early and adjust your treatment plan as needed. This proactive approach helps ensure the best outcomes for you and your baby.

2. **Healthy Diet:** Focus on a balanced diet rich in fruits, vegetables, whole grains, and lean proteins. Limit processed foods and sodium intake. A nutritious diet supports healthy blood pressure and provides essential nutrients for your baby's development. Consider working with a nutritionist to create a meal plan that meets your specific needs.

3. **Stay Hydrated:** Drink plenty of water throughout the day to support healthy blood circulation. Proper hydration helps maintain blood volume and can support healthy blood pressure levels. Aim for at least 8-10 glasses of water daily, and adjust based on your activity level and healthcare provider's recommendations.

4. **Rest and Sleep:** Ensure you get adequate rest and sleep, as fatigue can impact blood pressure. Aim for 7-9 hours of quality sleep each night and take breaks during the day when needed. Creating a comfortable sleep environment and establishing a regular sleep routine can help improve your rest quality.

5. **Monitor Symptoms:** Be aware of warning signs such as severe headaches, vision changes, or sudden swelling, and contact your healthcare provider immediately if these occur. Keep a symptom diary to track any changes and share this information with your healthcare team during appointments.`;
};

