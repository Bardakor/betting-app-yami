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
      // Check for Google OAuth authorization code
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      
      // Handle OAuth errors
      if (error) {
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
        try {
          // Verify state for CSRF protection
          const savedState = sessionStorage.getItem('oauth_state');
          sessionStorage.removeItem('oauth_state'); // Clean up
          
          if (state !== savedState) {
            toast.error('Security verification failed. Please try again.');
            router.push('/login');
            return;
          }
          
          // Exchange code for token with backend
          const response = await fetch('http://localhost:3001/auth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state }),
          });

          const data = await response.json();

          if (data.success && data.token) {
            await setTokenAndRefresh(data.token);
            toast.success('Successfully logged in with Google!');
            router.push('/');
          } else {
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