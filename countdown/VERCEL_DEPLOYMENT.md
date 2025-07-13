# Vercel Deployment Guide

## 🚀 Quick Fix for Build Error

The build is failing because Google OAuth credentials are missing. Follow these steps:

## 1. Set Up Google OAuth (Required)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### Step 2: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required info:
   - App name: "Date Calculator"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (your email)

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google` (for local development)
5. Copy the Client ID and Client Secret

## 2. Configure Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Open your project in Vercel dashboard
2. Go to Settings → Environment Variables

### Step 2: Add These Variables
```
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=HCA1G3CgrfWwFi1a4s7/srtCOMN34dzTGqgE4e1oRbA=
GOOGLE_CLIENT_ID=your-google-client-id-from-step-3
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-step-3
```

### Step 3: Deploy Settings
- **Production**: ✅ (check this)
- **Preview**: ✅ (check this)
- **Development**: ✅ (check this)

## 3. Alternative: Disable Authentication Temporarily

If you want to deploy without authentication first, you can temporarily disable it:

### Option A: Remove Auth Dependencies
```bash
npm uninstall next-auth @auth/core
```

### Option B: Make Auth Optional
Update the code to work without authentication by checking if auth is available.

## 4. Redeploy

After setting environment variables:
1. Go to Vercel dashboard
2. Click "Redeploy" on your latest deployment
3. Or push a new commit to trigger automatic deployment

## 5. Test the Deployment

1. Visit your Vercel URL
2. Try signing in with Google
3. Create and save countdowns
4. Verify everything works

## Troubleshooting

### Error: "client_id is required"
- ✅ Check that `GOOGLE_CLIENT_ID` is set in Vercel
- ✅ Check that `GOOGLE_CLIENT_SECRET` is set in Vercel
- ✅ Verify the redirect URI in Google Cloud Console matches your Vercel domain

### Error: "NEXTAUTH_URL not set"
- ✅ Set `NEXTAUTH_URL` to your Vercel domain
- ✅ Include `https://` in the URL

### Error: "NEXTAUTH_SECRET not set"
- ✅ Use the generated secret: `HCA1G3CgrfWwFi1a4s7/srtCOMN34dzTGqgE4e1oRbA=`

## Local Development

For local development, create `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=HCA1G3CgrfWwFi1a4s7/srtCOMN34dzTGqgE4e1oRbA=
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
``` 