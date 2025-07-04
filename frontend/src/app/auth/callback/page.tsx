'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokenAndRefresh } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

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
          default:
            errorMessage = 'Authentication failed. Please try again.';
        }
        
        toast.error(errorMessage);
        router.push('/login');
        return;
      }

      // Verify state parameter for security
      const storedState = sessionStorage.getItem('oauth_state');
      if (state && storedState && state !== storedState) {
        toast.error('Invalid authentication state. Please try again.');
        router.push('/login');
        return;
      }

      // Clear stored state
      sessionStorage.removeItem('oauth_state');

      if (code) {
        try {
          // Send code to backend for token exchange
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state }),
          });

          const data = await response.json();

          if (data.success && data.token) {
            // Set token and fetch user data
            await setTokenAndRefresh(data.token);
            
            toast.success('Successfully logged in with Google!');
            router.push('/');
          } else {
            throw new Error(data.message || 'Authentication failed');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast.error('Failed to process Google authentication. Please try again.');
          router.push('/login');
        }
      } else {
        toast.error('No authorization code received from Google.');
        router.push('/login');
      }
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