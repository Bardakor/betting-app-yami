'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokenAndRefresh } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      // Debug: Log all search params
      console.log('Auth callback - All search params:', {
        code: searchParams.get('code'),
        state: searchParams.get('state'),
        error: searchParams.get('error'),
        token: searchParams.get('token'),
        allParams: searchParams.toString()
      });

      // Check for Google OAuth authorization code
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      
      // Handle OAuth errors
      if (error) {
        console.error('OAuth error received:', error);
        let errorMessage = 'Authentication failed';
        
        switch (error) {
          case 'access_denied':
            errorMessage = 'Google authentication was cancelled.';
            break;
          case 'oauth_failed':
            errorMessage = 'Google authentication failed. Please try again.';
            break;
          case 'oauth_error':
            errorMessage = 'Google authentication error. Please try again.';
            break;
          default:
            errorMessage = 'Authentication failed. Please try again.';
        }
        
        toast.error(errorMessage);
        router.push('/login');
        return;
      }

      // Handle Google OAuth code exchange
      if (code) {
        console.log('Processing Google OAuth code:', code);
        console.log('State parameter:', state);
        
        try {
          // Verify state for CSRF protection
          const savedState = sessionStorage.getItem('oauth_state');
          console.log('Saved state from session:', savedState);
          sessionStorage.removeItem('oauth_state'); // Clean up
          
          if (state !== savedState) {
            console.error('State mismatch - CSRF protection triggered');
            toast.error('Security verification failed. Please try again.');
            router.push('/login');
            return;
          }
          
          console.log('Exchanging code for token with backend...');
          
          // Exchange code for token with backend
          const response = await fetch('http://localhost:3001/auth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state }),
          });

          console.log('Backend response status:', response.status);
          const data = await response.json();
          console.log('Backend response data:', data);

          if (data.success && data.token) {
            console.log('Token received, setting auth...');
            try {
              await setTokenAndRefresh(data.token);
              
              // Add a small delay to ensure auth state is fully updated
              await new Promise(resolve => setTimeout(resolve, 100));
              
              toast.success('Successfully logged in with Google!');
              router.push('/');
            } catch (err) {
              console.error('Failed to set token and refresh user:', err);
              toast.error('Authentication failed. Please try again.');
              router.push('/login');
            }
          } else {
            console.error('Backend auth failed:', data);
            toast.error(data.message || 'Google authentication failed');
            router.push('/login');
          }
        } catch (err) {
          console.error('Error during Google OAuth:', err);
          toast.error('Failed to complete Google authentication');
          router.push('/login');
        }
        return;
      }

      // Handle legacy passport-based redirect with token
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        console.log('Processing token from URL:', tokenParam);
        try {
          await setTokenAndRefresh(tokenParam);
          toast.success('Successfully logged in!');
          router.push('/');
        } catch (err) {
          console.error('Error handling token:', err);
          toast.error('Failed to process authentication token.');
          router.push('/login');
        }
        return;
      }

      // No code, token, or error - something went wrong
      console.error('No authentication data received in callback');
      toast.error('No authentication data received. Please try again.');
      router.push('/login');
    };

    handleCallback();
  }, [searchParams, router, setTokenAndRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p className="text-white text-lg">Processing authentication...</p>
        <p className="text-gray-400 text-sm">Please wait while we log you in</p>
      </div>
    </div>
  ); 
} 