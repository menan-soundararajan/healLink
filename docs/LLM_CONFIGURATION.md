# LLM API Configuration Guide

This guide explains how to configure the LLM (Large Language Model) service for the Health Advisory feature.

## Supported Providers

The Health Advisory feature supports multiple LLM providers:

1. **OpenAI** (GPT-3.5, GPT-4, etc.) - Default
2. **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus, etc.)
3. **Custom API** (Any OpenAI-compatible API)

## Quick Setup

### Step 1: Get Your API Key

#### For OpenAI:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)

#### For Anthropic (Claude):
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-...`)

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory of your project (if it doesn't exist):

```env
# LLM Configuration
REACT_APP_LLM_PROVIDER=openai
REACT_APP_LLM_API_KEY=your_api_key_here
REACT_APP_LLM_MODEL=gpt-3.5-turbo
```

**For OpenAI:**
```env
REACT_APP_LLM_PROVIDER=openai
REACT_APP_LLM_API_KEY=sk-your-openai-api-key-here
REACT_APP_LLM_MODEL=gpt-3.5-turbo
```

**For Anthropic (Claude):**
```env
REACT_APP_LLM_PROVIDER=anthropic
REACT_APP_LLM_API_KEY=sk-ant-your-anthropic-api-key-here
```

**For Custom API:**
```env
REACT_APP_LLM_PROVIDER=custom
REACT_APP_LLM_API_URL=https://your-custom-api.com/v1/chat/completions
REACT_APP_LLM_API_KEY=your_custom_api_key_here
REACT_APP_LLM_MODEL=your-model-name
```

### Step 3: Restart Development Server

After adding environment variables, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_LLM_PROVIDER` | No | `openai` | LLM provider: `openai`, `anthropic`, or `custom` |
| `REACT_APP_LLM_API_KEY` | Yes* | - | Your API key for the LLM service |
| `REACT_APP_LLM_API_URL` | No* | Provider default | Custom API URL (only needed for `custom` provider) |
| `REACT_APP_LLM_MODEL` | No | `gpt-3.5-turbo` | Model name (OpenAI) or Claude model version |

*Required if you want to use LLM features. If not provided, the app will use a fallback message.

## Provider-Specific Configuration

### OpenAI

**Available Models:**
- `gpt-3.5-turbo` (default, cost-effective)
- `gpt-4` (more capable, higher cost)
- `gpt-4-turbo` (latest, best performance)

**Example Configuration:**
```env
REACT_APP_LLM_PROVIDER=openai
REACT_APP_LLM_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
REACT_APP_LLM_MODEL=gpt-4
```

**API URL:** `https://api.openai.com/v1/chat/completions` (automatic)

### Anthropic (Claude)

**Available Models:**
- `claude-3-5-sonnet-20241022` (default, balanced)
- `claude-3-opus-20240229` (most capable)
- `claude-3-sonnet-20240229` (fast and capable)
- `claude-3-haiku-20240307` (fastest, cost-effective)

**Example Configuration:**
```env
REACT_APP_LLM_PROVIDER=anthropic
REACT_APP_LLM_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
```

**API URL:** `https://api.anthropic.com/v1/messages` (automatic)

**Note:** The model is set in code. To change it, edit `src/services/llmService.js` line 59.

### Custom API

For OpenAI-compatible APIs (like local models, other providers, etc.):

**Example Configuration:**
```env
REACT_APP_LLM_PROVIDER=custom
REACT_APP_LLM_API_URL=https://api.example.com/v1/chat/completions
REACT_APP_LLM_API_KEY=your_custom_key
REACT_APP_LLM_MODEL=your-model-name
```

## Production Deployment (Vercel)

### Step 1: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

   **For OpenAI:**
   - `REACT_APP_LLM_PROVIDER` = `openai`
   - `REACT_APP_LLM_API_KEY` = `sk-your-key-here`
   - `REACT_APP_LLM_MODEL` = `gpt-3.5-turbo` (optional)

   **For Anthropic:**
   - `REACT_APP_LLM_PROVIDER` = `anthropic`
   - `REACT_APP_LLM_API_KEY` = `sk-ant-your-key-here`

### Step 2: Redeploy

After adding environment variables, redeploy your application:

```bash
# Push to trigger redeploy
git push origin main

# Or manually redeploy from Vercel dashboard
```

## Testing the Configuration

1. **Check Console:**
   - Open browser developer tools (F12)
   - Check the console for any warnings
   - If you see "LLM API key not configured", your key isn't being read

2. **Test Health Advisory:**
   - Log in to the app
   - Ensure patient has:
     - Diagnosis: "History of pre-eclampsia" (Active)
     - Medication: "Aspirin" (Active)
   - The Health Advisory card should appear
   - If configured correctly, it will show AI-generated content
   - If not configured, it will show a fallback message

3. **Check Network Tab:**
   - Open browser developer tools > Network tab
   - Look for requests to the LLM API
   - Check if requests are successful (200 status)

## Troubleshooting

### Issue: "LLM API key not configured"

**Solution:**
1. Verify `.env` file exists in project root
2. Check variable names start with `REACT_APP_`
3. Restart development server after adding variables
4. For production, verify variables are set in Vercel

### Issue: "LLM API error: 401 Unauthorized"

**Solution:**
1. Verify API key is correct
2. Check if API key has expired
3. Ensure API key has proper permissions
4. For OpenAI, check billing/credits

### Issue: "LLM API error: 429 Too Many Requests"

**Solution:**
1. You've hit rate limits
2. Wait a few minutes and try again
3. Consider upgrading your API plan
4. Check API usage dashboard

### Issue: "LLM API error: 404 Not Found"

**Solution:**
1. Check `REACT_APP_LLM_API_URL` is correct
2. Verify the API endpoint exists
3. For custom APIs, ensure URL format matches OpenAI format

### Issue: Fallback message always shows

**Possible Causes:**
1. API key not configured
2. API request failed (check console for errors)
3. Network/CORS issues
4. Invalid API key

**Solution:**
1. Check browser console for error messages
2. Verify API key in `.env` file
3. Test API key directly with curl:
   ```bash
   # OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   
   # Anthropic
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "Content-Type: application/json" \
     -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
   ```

## Security Best Practices

1. **Never commit `.env` file:**
   - `.env` is already in `.gitignore`
   - Never share API keys in code or documentation

2. **Use different keys for dev/prod:**
   - Create separate API keys for development and production
   - Set different keys in Vercel environment variables

3. **Rotate keys regularly:**
   - Change API keys periodically
   - Revoke old keys if compromised

4. **Monitor usage:**
   - Check API usage regularly
   - Set up billing alerts
   - Monitor for unusual activity

## Cost Considerations

### OpenAI Pricing (as of 2024)
- GPT-3.5-turbo: ~$0.0015 per 1K tokens (input), $0.002 per 1K tokens (output)
- GPT-4: ~$0.03 per 1K tokens (input), $0.06 per 1K tokens (output)
- GPT-4 Turbo: ~$0.01 per 1K tokens (input), $0.03 per 1K tokens (output)

### Anthropic Pricing (as of 2024)
- Claude 3.5 Sonnet: ~$3 per 1M input tokens, $15 per 1M output tokens
- Claude 3 Opus: ~$15 per 1M input tokens, $75 per 1M output tokens

**Estimated cost per Health Advisory:**
- GPT-3.5-turbo: ~$0.001-0.002 per advisory
- GPT-4: ~$0.01-0.02 per advisory
- Claude 3.5 Sonnet: ~$0.01-0.02 per advisory

## Example .env File

```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# OpenMRS (optional - defaults are used)
REACT_APP_USE_PROXY=true
REACT_APP_PROXY_URL=http://localhost:3001/api/openmrs

# LLM Configuration - OpenAI
REACT_APP_LLM_PROVIDER=openai
REACT_APP_LLM_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
REACT_APP_LLM_MODEL=gpt-3.5-turbo

# OR for Anthropic
# REACT_APP_LLM_PROVIDER=anthropic
# REACT_APP_LLM_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
```

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

