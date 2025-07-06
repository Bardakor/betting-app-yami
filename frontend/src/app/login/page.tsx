'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Chrome, Shield, Zap, TrendingUp } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { login, register, isLoading: authLoading, setTokenAndRefresh } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Handle OAuth errors and token from URL
  useEffect(() => {
    const handleOAuth = async () => {
      const error = searchParams.get('error');
      const token = searchParams.get('token');
      
      if (error) {
        if (error === 'oauth_failed') {
          toast.error('Google authentication failed. Please try again.');
        } else if (error === 'oauth_error') {
          toast.error('Authentication error occurred. Please try again.');
        }
      }
      
      if (token) {
        // Handle OAuth success
        try {
          await setTokenAndRefresh(token);
          toast.success('Successfully logged in with Google!');
          router.push('/');
        } catch (error) {
          toast.error('Failed to process Google authentication.');
          router.push('/login');
        }
      }
    };

    handleOAuth();
  }, [searchParams, router, setTokenAndRefresh]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginData.email, loginData.password);
      
      if (success) {
        toast.success('Login successful!');
        router.push('/');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(registerData);
      
      if (success) {
        toast.success('Registration successful!');
        router.push('/');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Build Google OAuth URL for client-side flow
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!googleClientId || googleClientId === 'your-actual-google-client-id-from-google-cloud-console') {
      toast.error('Google OAuth is not configured. Please contact administrator.');
      return;
    }
    
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(7); // Simple state for CSRF protection
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('oauth_state', state);
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };

  const handleQuickLogin = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      // If admin login, try to create admin user first
      if (email === 'admin@admin.com') {
        await authService.createAdminUser();
      }
      
      const success = await login(email, password);
      
      if (success) {
        toast.success(`Logged in as ${role}!`);
        router.push('/');
      } else {
        toast.error('Quick login failed');
      }
    } catch (error) {
      toast.error('Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left space-y-6"
        >
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Yami Betting
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Professional sports betting platform with real-time odds, live match data, and advanced analytics.
            </p>
          </div>

          <div className="grid gap-4 mt-8">
            <div className="flex items-center space-x-3 text-gray-300">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Real-time live match data</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Statistical odds calculation</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Secure JWT authentication</span>
            </div>
          </div>

          <div className="text-sm text-gray-400 mt-8">
            <p>✅ 6 Microservices Architecture</p>
            <p>✅ Google OAuth Integration</p>
            <p>✅ Real-time Data Updates</p>
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-400">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Google OAuth Button */}
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800 flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-white">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white focus:border-yellow-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-white">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white focus:border-yellow-500"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>

                  {/* Quick Login Options */}
                  <div className="space-y-3">
                    <div className="text-center text-sm text-gray-400">Quick Demo Access</div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => handleQuickLogin('admin@admin.com', 'admin123', 'Admin')}
                        className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                        disabled={isLoading}
                      >
                        🔑 Admin Demo ($100,000 balance)
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName" className="text-white">First Name</Label>
                        <Input
                          id="register-firstName"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="bg-gray-800 border-gray-600 text-white focus:border-yellow-500"
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName" className="text-white">Last Name</Label>
                        <Input
                          id="register-lastName"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="bg-gray-800 border-gray-600 text-white focus:border-yellow-500"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-white">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white focus:border-yellow-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white focus:border-yellow-500"
                        placeholder="Create a password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
