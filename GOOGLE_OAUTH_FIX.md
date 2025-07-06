# Google OAuth Fix - Authentication Loop Issue Resolved

## What Was The Problem?

After logging in with Google, users were being redirected back to the login page. This was happening because:

1. The main service was switched from MongoDB-based auth (`auth.js`) to simple in-memory auth (`auth-simple.js`)
2. The Google OAuth flow was still expecting Passport.js middleware (GET endpoints)
3. The simple auth system uses POST endpoints and expects the authorization code

## What Was Fixed?

1. **Backend**: Switched from `auth.js` to `auth-simple.js` in `backend/main-service/src/index.js`
2. **Frontend Login**: Updated to use client-side OAuth flow instead of server-side Passport redirect
3. **Frontend Callback**: Updated to handle authorization code exchange with POST request

## Setup Instructions

### 1. Set Environment Variables

#### Backend (.env file)
Create or update `backend/main-service/.env`:
```bash
GOOGLE_CLIENT_ID=your-actual-client-id-from-google-cloud-console
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google-cloud-console
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
```

#### Frontend (.env.local file)
Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id-from-google-cloud-console
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API and Google Identity Services
4. Configure OAuth consent screen
5. Create OAuth 2.0 Client ID (Web application)
6. Add authorized redirect URI: `http://localhost:3000/auth/callback`

### 3. Restart Services

```bash
# Kill all processes and clear ports
killall node || true
lsof -ti:3000,3001,3002,3003,3004,3005,3006 | xargs kill -9 2>/dev/null || true

# Start backend services
cd backend/main-service && npm start &
cd backend/api-gateway && npm start &
cd backend/fixtures-service && npm start &
cd backend/odds-service && npm start &
cd backend/bet-service && npm start &
cd backend/wallet-service && npm start &
cd backend/result-service && npm start &

# Start frontend
cd frontend && npm run dev
```

### 4. Test Google OAuth

1. Open http://localhost:3000
2. Click "Continue with Google"
3. You'll be redirected to Google's login page
4. After authentication, you'll be redirected back and logged in!

## How It Works Now

1. User clicks "Continue with Google"
2. Frontend redirects to Google OAuth with client ID
3. Google redirects back to `/auth/callback` with authorization code
4. Frontend sends code to backend POST `/auth/google/callback`
5. Backend exchanges code for access token
6. Backend fetches user info from Google
7. Backend creates/updates user and returns JWT token
8. Frontend stores token and redirects to home page

## Troubleshooting

### "Google OAuth is not configured" error
- Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in frontend/.env.local
- Restart the frontend server after adding environment variables

### "redirect_uri_mismatch" error
- Ensure `http://localhost:3000/auth/callback` is added in Google Console
- Check that you're accessing the app via http://localhost:3000 (not 127.0.0.1)

### Still redirecting to login page
- Check browser console for errors
- Verify backend is running on port 3001
- Check that JWT token is being stored (check Application > Local Storage in DevTools)

## Notes

- The system now uses in-memory user storage (auth-simple.js)
- New Google users automatically get $1000 balance
- User data persists only while the backend is running
- For production, you'll need to switch back to MongoDB-based auth 