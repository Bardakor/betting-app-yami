'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLogin() {
  const router = useRouter();
  
  useEffect(() => {
    // Simulate a successful OAuth callback with a valid token
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZiMTgxOWNiNGZiN2MyNTg3MjkyNTgiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTE4NDg5ODUsImV4cCI6MTc1MjQ1Mzc4NX0.Dv5A_KG110p0ac470OZDXOw-sQmS981jZ6X4awS0dq4';
    
    // Redirect to callback page with token
    router.push(`/auth/callback?token=${testToken}`);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p className="text-white text-lg">Simulating login...</p>
      </div>
    </div>
  );
}