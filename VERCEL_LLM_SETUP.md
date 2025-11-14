# LLM Setup for Vercel Production

## Quick Fix: Add Environment Variables in Vercel

The LLM feature requires environment variables to be set in Vercel. If they're not set, the app will use a fallback message.

### Step 1: Add LLM Environment Variables

1. Go to your **Vercel project dashboard**
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

#### For OpenAI:
```
REACT_APP_LLM_PROVIDER=openai
REACT_APP_LLM_API_KEY=sk-proj-your-openai-api-key-here
REACT_APP_LLM_MODEL=gpt-3.5-turbo
```

**Note:** Replace `sk-proj-your-openai-api-key-here` with your actual OpenAI API key from your `.env` file.

**Important:**
- Variable names must start with `REACT_APP_`
- No quotes around values
- No spaces around `=`
- Select **all environments** (Production, Preview, Development)

### Step 2: Redeploy

After adding environment variables:

1. **Automatic Redeploy**: Vercel will automatically redeploy when you save environment variables
2. **Manual Redeploy**: Or go to **Deployments** tab and click **Redeploy**

### Step 3: Verify

1. Open your deployed app
2. Open browser **Developer Tools** (F12)
3. Go to **Console** tab
4. Look for LLM configuration logs:
   ```
   LLM Configuration: { provider: 'openai', apiUrl: '...', hasApiKey: true, ... }
   ```
5. If you see "LLM API key not configured", the environment variables are not set correctly

## Troubleshooting

### Issue: Still seeing fallback message

**Check 1: Environment Variables**
- Go to Vercel > Settings > Environment Variables
- Verify all three variables are present:
  - `REACT_APP_LLM_PROVIDER`
  - `REACT_APP_LLM_API_KEY`
  - `REACT_APP_LLM_MODEL` (optional)

**Check 2: Variable Names**
- Must start with `REACT_APP_` (case-sensitive)
- No typos in variable names

**Check 3: Redeploy (CRITICAL)**
- Environment variables are only loaded during build
- **You MUST redeploy after adding/changing variables**
- Adding variables does NOT automatically update running deployments
- Go to **Deployments** tab > Click on latest deployment > Click **Redeploy**
- Or trigger a new deployment by pushing to your git branch

**Check 3a: Environment Selection**
- When adding variables, make sure to select **Production** environment
- If you only selected Preview/Development, Production won't have the variables
- Go back and edit each variable to include Production environment

**Check 4: Browser Console**
- Open Developer Tools (F12) > Console
- Look for error messages
- Check for "LLM API key not configured" warning

### Issue: API Errors

**Check 1: API Key Validity**
- Verify your OpenAI API key is valid
- Check OpenAI dashboard for usage/credits
- Ensure key hasn't expired

**Check 2: Network Tab**
- Open Developer Tools > Network tab
- Look for requests to `api.openai.com`
- Check response status codes
- 401 = Invalid API key
- 429 = Rate limit exceeded
- 500 = OpenAI server error

**Check 3: CORS Issues**
- LLM API calls go directly to OpenAI (not through proxy)
- Should not have CORS issues
- If CORS errors appear, check browser console

### Issue: Health Advisory Card Not Showing

**Check 1: Conditions Met**
- Patient must have:
  - Diagnosis: "History of pre-eclampsia" (Active)
  - Medication: "Aspirin" (Active)
- If conditions not met, card won't show (this is expected)

**Check 2: Console Errors**
- Check browser console for errors
- Look for failed API calls
- Check network tab for failed requests

## Environment Variables Reference

| Variable | Required | Example Value | Description |
|----------|----------|--------------|-------------|
| `REACT_APP_LLM_PROVIDER` | Yes | `openai` | LLM provider: `openai`, `anthropic`, or `custom` |
| `REACT_APP_LLM_API_KEY` | Yes | `sk-proj-...` | Your OpenAI API key |
| `REACT_APP_LLM_MODEL` | No | `gpt-3.5-turbo` | Model to use (default: `gpt-3.5-turbo`) |

## Testing in Production

1. **Login** to your app
2. **Ensure patient has required conditions:**
   - Diagnosis: "History of pre-eclampsia" (Active)
   - Medication: "Aspirin" (Active)
3. **Check Health Advisory card appears**
4. **Verify AI-generated content** (not fallback message)
5. **Check browser console** for any errors

## Quick Checklist

- [ ] Added `REACT_APP_LLM_PROVIDER` in Vercel
- [ ] Added `REACT_APP_LLM_API_KEY` in Vercel
- [ ] Added `REACT_APP_LLM_MODEL` in Vercel (optional)
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Redeployed application
- [ ] Verified in browser console that API key is configured
- [ ] Tested Health Advisory feature

## Still Not Working?

### Step 1: Verify Variables in Vercel Dashboard

1. Go to **Vercel** > **Settings** > **Environment Variables**
2. Verify you see these three variables:
   - `REACT_APP_LLM_PROVIDER` = `openai`
   - `REACT_APP_LLM_API_KEY` = `sk-proj-...` (your actual key)
   - `REACT_APP_LLM_MODEL` = `gpt-3.5-turbo` (optional)
3. **Check Environment column** - Make sure **Production** is checked for all variables
4. If Production is not checked, click on each variable and add Production environment

### Step 2: Force Redeploy

1. Go to **Vercel** > **Deployments**
2. Find your latest deployment
3. Click the **three dots** (⋯) menu
4. Click **Redeploy**
5. Make sure **Use existing Build Cache** is **UNCHECKED**
6. Click **Redeploy**
7. Wait for deployment to complete

### Step 3: Check Build Logs

1. Go to **Vercel** > **Deployments**
2. Click on the latest deployment
3. Click **Build Logs** tab
4. Look for environment variables being loaded
5. Check for any errors

### Step 4: Check Browser Console

1. Open your deployed app
2. Open **Developer Tools** (F12) > **Console**
3. Look for "Environment Variables Debug" log
4. Check if `hasREACT_APP_LLM_API_KEY: true`
5. If `false`, the variable is not being read

### Step 5: Verify Variable Names

Common mistakes:
- ❌ `LLM_API_KEY` (missing `REACT_APP_` prefix)
- ❌ `REACT_APP_llm_api_key` (wrong case - should be uppercase)
- ❌ `REACT_APP_LLM_API_KEY ` (trailing space)
- ✅ `REACT_APP_LLM_API_KEY` (correct)

### Step 6: Verify API Key Directly

Test your API key to ensure it's valid:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Step 7: Check OpenAI Dashboard

1. Go to https://platform.openai.com/
2. Verify API key is active
3. Check usage/credits
4. Ensure no rate limits

