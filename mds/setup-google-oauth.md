# Google OAuth Setup Guide for Yami Betting Platform

## 🚀 Quick Setup Instructions

Follow these steps to enable Google OAuth in your Yami Betting Platform:

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Create a new project** or select an existing one:
   - Click the project dropdown (next to Google Cloud logo)
   - Click "New Project"
   - Name it "Yami Betting Platform"
   - Click "Create"

### Step 2: Enable APIs

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google+ API** 
   - **Google Identity Services**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public use)
3. Fill in required fields:
   - **App name**: "Yami Betting Platform"
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue** through all steps

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: "Yami Betting Platform Web Client"
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/callback
     ```

### Step 5: Copy Your Credentials

After creating, you'll see:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefg123456`

**⚠️ IMPORTANT**: Copy both values immediately!

### Step 6: Update Environment Files

#### Backend (.env file)
```bash
cd backend/main-service
cp env.example .env
```

Edit the `.env` file and replace:
```bash
GOOGLE_CLIENT_ID=your-actual-client-id-from-google-cloud-console
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google-cloud-console
```

With your real values:
```bash
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
```

#### Frontend (env.local file)
Edit `frontend/env.local` and replace:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id-from-google-cloud-console
```

With your real Client ID:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

### Step 7: Restart Your Services

```bash
# Stop current services (Ctrl+C in terminals)
# Then restart:
cd backend/main-service && npm start &
cd frontend && npm run dev &
```

### Step 8: Test Google OAuth

1. Open http://localhost:3000
2. Click "Continue with Google"
3. You should be redirected to Google's login page
4. After authentication, you'll be redirected back and logged in!

## ✅ What's Working Now

- **Google OAuth Button**: Active on login page
- **Full OAuth Flow**: Code exchange, token generation, user creation
- **Security**: State parameter validation, JWT tokens
- **User Management**: Auto-creates accounts from Google profile
- **Balance**: New Google users start with $1,000

## 🔧 Troubleshooting

### "Google OAuth Not Configured" Error
- Make sure you've set the environment variables correctly
- Restart both frontend and backend services
- Check that values don't contain the placeholder text

### "redirect_uri_mismatch" Error
- Verify your redirect URI in Google Cloud Console exactly matches:
  `http://localhost:3000/auth/callback`

### "invalid_client" Error
- Check your Client ID and Client Secret are correct
- Make sure you're using the Web Application client type

## 🎯 Production Setup

For production deployment, update redirect URIs to your production domain:
```
https://yourdomain.com/auth/callback
```

And update the FRONTEND_URL in your backend environment:
```
FRONTEND_URL=https://yourdomain.com
``` 