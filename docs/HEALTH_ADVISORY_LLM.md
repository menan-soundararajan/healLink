# Health Advisory LLM Feature Documentation

## Overview

The Health Advisory feature is an AI-powered component that provides personalized health guidance to patients based on their diagnosis and medication data. It uses a Large Language Model (LLM) to generate empathetic, evidence-based health advice when specific medical conditions are detected.

## Feature Description

The Health Advisory card automatically appears on the patient dashboard when both of the following conditions are met:

1. **Diagnosis Condition:**
   - Patient has a diagnosis of "History of pre-eclampsia"
   - The diagnosis status is "Active"

2. **Medication Condition:**
   - Patient has a medication with "Aspirin" in the display name
   - The medication status is "Active"

When both conditions are satisfied, the system:
- Fetches the patient's diagnosis and medication data from OpenMRS
- Sends this data to an LLM (Large Language Model) service
- Generates a personalized health advisory message
- Displays the message in a compact, user-friendly card

## Component Structure

### Files

- **`src/components/HealthAdvisoryCard.js`**: Main React component that handles condition checking and UI rendering
- **`src/services/llmService.js`**: Service that communicates with the LLM API

### Component Location

The Health Advisory card appears in the dashboard layout:
- **Row 1**: Appointments | Medications
- **Row 2**: Lab Reports | Diagnosis
- **Row 3**: Health Advisory (full width, conditional)

## Condition Checking Logic

### Diagnosis Check (`checkPreEclampsiaCondition`)

```javascript
// Checks if:
1. diagnosticName === "History of pre-eclampsia" (exact match, case-insensitive)
2. statusBadge === "Active" (statusCode === 'active')
```

**Data Source:** OpenMRS FHIR API
- Endpoint: `/ws/fhir2/R4/Condition?patient={uuid}`
- Extracts diagnostic name from `condition.code.text` or `condition.code.coding[0].display`
- Checks clinical status from `condition.clinicalStatus.coding[0].code`

### Medication Check (`checkAspirinCondition`)

```javascript
// Checks if:
1. displayName.toLowerCase().includes('aspirin')
2. statusInfo === "Active" (dateStopped === null)
```

**Data Source:** OpenMRS REST API
- Endpoint: `/ws/rest/v1/order?patient={uuid}&orderType={medication_order_type_uuid}&v=full`
- Checks medication `display` field for "Aspirin"
- Verifies medication is active (not stopped)

## LLM Integration

### Service Configuration

The LLM service is configured via environment variables:

```env
REACT_APP_LLM_API_URL=https://api.openai.com/v1/chat/completions
REACT_APP_LLM_API_KEY=your_api_key_here
```

### LLM Prompt

When conditions are met, the system sends the following prompt to the LLM:

```
Now act as my health advisor, suggest in a gentle and empathetic way:

1. Explain what Pre-eclampsia is and why it matters.

2. Explain simply why the patient should take Aspirin to manage Pre-eclampsia.

3. Provide 3-5 short, positive lifestyle suggestions based on Google Health guidelines 
   (such as diet, rest, stress reduction, and blood pressure monitoring).

Patient Diagnosis Data: [JSON data]
Patient Medication Data: [JSON data]

Format the response with clear sections using ## for main headings. 
Be warm, supportive, and easy to understand.
```

### LLM Response Format

The LLM generates a message with three main sections:

1. **Explanation**: What Pre-eclampsia is and why it matters
2. **Why Aspirin**: Simple explanation of why Aspirin is prescribed
3. **Lifestyle Tips**: 3-5 short, positive lifestyle suggestions

### Fallback Message

If the LLM API is not configured or fails, the system displays a pre-written fallback message with the same structure and content.

## UI Design

### Card Layout

- **Header**: Light blue background (`bg-primary bg-opacity-10`)
  - Heart icon (20x20px)
  - "Health Advisory" title (h6, bold, primary color)
- **Body**: Compact padding (`p-2`)
  - Formatted LLM response with sections
  - Minimal spacing between elements

### Styling

- **Card**: `shadow-sm`, `border-primary`
- **Text**: `fontSize: 0.9rem`, `lineHeight: 1.5`
- **Headings**: `mt-2 mb-0` (minimal spacing)
- **Lists**: Compact with minimal padding

### States

1. **Loading**: Shows spinner with "Generating health advisory..." message
2. **Error**: Shows warning alert with error message
3. **Success**: Displays formatted LLM response
4. **Hidden**: Component returns `null` if conditions are not met

## Setup Instructions

### 1. Configure LLM API (Optional)

If you want to use a real LLM service:

1. **Get API Key:**
   - Sign up for OpenAI API (or another LLM service)
   - Generate an API key

2. **Set Environment Variables:**
   
   **For Development:**
   Create a `.env` file in the project root:
   ```env
   REACT_APP_LLM_API_URL=https://api.openai.com/v1/chat/completions
   REACT_APP_LLM_API_KEY=sk-your-api-key-here
   ```

   **For Production (Vercel):**
   - Go to Vercel project settings
   - Navigate to **Environment Variables**
   - Add:
     - `REACT_APP_LLM_API_URL`
     - `REACT_APP_LLM_API_KEY`
   - Redeploy the application

### 2. Fallback Mode

If LLM API is not configured:
- The component will still work
- It will display a pre-written fallback message
- No API calls will be made
- All functionality remains the same

## API Endpoints Used

### Diagnosis Data
- **Endpoint**: `/ws/fhir2/R4/Condition?patient={uuid}`
- **Method**: GET
- **Authentication**: Basic Auth (via proxy or direct)
- **Response**: FHIR Bundle with Condition resources

### Medication Data
- **Endpoint**: `/ws/rest/v1/order?patient={uuid}&orderType={uuid}&v=full`
- **Method**: GET
- **Authentication**: Basic Auth (via proxy or direct)
- **Response**: OpenMRS REST response with order results

## Data Flow

```
1. Component mounts with patientUuid
   ↓
2. Fetch diagnosis data (FHIR Condition API)
   ↓
3. Fetch medication data (REST Order API)
   ↓
4. Check conditions:
   - Diagnosis: "History of pre-eclampsia" + "Active"?
   - Medication: Contains "Aspirin" + "Active"?
   ↓
5. If both true:
   - Send data to LLM service
   - Generate health advisory
   - Display formatted message
   ↓
6. If either false:
   - Component returns null (hidden)
```

## Error Handling

The component handles various error scenarios:

1. **API Errors**: Shows error message in alert
2. **LLM Errors**: Falls back to pre-written message
3. **Network Errors**: Displays user-friendly error message
4. **Missing Data**: Component remains hidden

## Testing

### Manual Testing

1. **Test Condition Matching:**
   - Ensure patient has "History of pre-eclampsia" diagnosis (Active)
   - Ensure patient has "Aspirin" medication (Active)
   - Verify card appears

2. **Test LLM Integration:**
   - Configure LLM API key
   - Verify LLM response is generated
   - Check message formatting

3. **Test Fallback:**
   - Remove LLM API key
   - Verify fallback message displays
   - Check all sections are present

### Test Cases

- ✅ Card appears when both conditions are met
- ✅ Card is hidden when conditions are not met
- ✅ Loading state displays during API calls
- ✅ Error state displays on API failure
- ✅ LLM response is properly formatted
- ✅ Fallback message displays when LLM unavailable

## Customization

### Changing Conditions

To modify the conditions, edit `HealthAdvisoryCard.js`:

```javascript
// Change diagnosis check
const isPreEclampsia = diagnosticNameLower === 'your-diagnosis-name';

// Change medication check
const isAspirin = displayName.toLowerCase().includes('your-medication-name');
```

### Modifying LLM Prompt

Edit the prompt in `src/services/llmService.js`:

```javascript
const prompt = `Your custom prompt here...`;
```

### Styling Changes

Modify the card styling in `HealthAdvisoryCard.js`:

```javascript
// Change card classes
<div className="card shadow-sm border-primary">
  // Your custom styling
</div>
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use `.env` files for local development
3. **Data Privacy**: LLM receives patient data - ensure compliance with HIPAA/privacy regulations
4. **Error Messages**: Don't expose sensitive information in error messages

## Troubleshooting

### Card Not Appearing

1. **Check Conditions:**
   - Verify diagnosis name is exactly "History of pre-eclampsia"
   - Verify diagnosis status is "Active"
   - Verify medication contains "Aspirin"
   - Verify medication is active (dateStopped === null)

2. **Check Console:**
   - Look for API errors
   - Check network requests
   - Verify patient UUID is correct

### LLM Not Working

1. **Check API Key:**
   - Verify `REACT_APP_LLM_API_KEY` is set
   - Check key is valid and has credits

2. **Check API URL:**
   - Verify `REACT_APP_LLM_API_URL` is correct
   - Test API endpoint directly

3. **Check Fallback:**
   - If LLM fails, fallback message should display
   - Check console for LLM errors

### Formatting Issues

1. **Check Message Format:**
   - LLM should return markdown with `##` headings
   - Verify `formatMessage` function is working

2. **Check Styling:**
   - Verify Bootstrap classes are applied
   - Check inline styles are correct

## Future Enhancements

Potential improvements:

1. **Multiple Conditions**: Support for other diagnosis/medication combinations
2. **Caching**: Cache LLM responses to reduce API calls
3. **Customization**: Allow healthcare providers to customize prompts
4. **Multi-language**: Support for multiple languages
5. **Analytics**: Track which advisories are most helpful

## Related Documentation

- [OpenMRS Integration Guide](./OPENMRS_INTEGRATION.md)
- [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md)
- [Quick Start Guide](./QUICK_START.md)

