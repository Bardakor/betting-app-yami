"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Server,
  Globe,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface ServiceStatus {
  name: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'checking';
  url?: string;
  response?: any;
  error?: string;
}

interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  requiresAuth: boolean;
  example?: any;
}

export default function ApiTestPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Gateway', port: 8000, status: 'checking' },
    { name: 'Main Service', port: 3001, status: 'checking' },
    { name: 'Fixtures', port: 3002, status: 'checking' },
    { name: 'Odds', port: 3003, status: 'checking' },
    { name: 'Wallet', port: 3004, status: 'checking' },
    { name: 'Bets', port: 3005, status: 'checking' },
    { name: 'Results', port: 3006, status: 'checking' },
  ])

  const [authToken, setAuthToken] = useState('')
  const [testResults, setTestResults] = useState<{[key: string]: any}>({})
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({})

  const endpoints: ApiEndpoint[] = [
    {
      name: 'Gateway Health',
      method: 'GET',
      path: '/health',
      description: 'Check API Gateway health',
      requiresAuth: false
    },
    {
      name: 'Services Health',
      method: 'GET', 
      path: '/health/services',
      description: 'Check all services health',
      requiresAuth: false
    },
    {
      name: 'Login',
      method: 'POST',
      path: '/api/auth/login',
      description: 'User authentication',
      requiresAuth: false,
      example: { email: 'admin@admin.com', password: 'admin123' }
    },
    {
      name: 'User Profile',
      method: 'GET',
      path: '/api/users/profile',
      description: 'Get user profile',
      requiresAuth: true
    },
    {
      name: 'Fixtures',
      method: 'GET',
      path: '/api/fixtures',
      description: 'Get all fixtures',
      requiresAuth: false
    },
    {
      name: 'Odds',
      method: 'GET',
      path: '/api/odds',
      description: 'Get betting odds',
      requiresAuth: false
    },
    {
      name: 'Wallet Balance',
      method: 'GET',
      path: '/api/wallet/balance',
      description: 'Get user balance',
      requiresAuth: true
    },
    {
      name: 'User Bets',
      method: 'GET',
      path: '/api/bets/user',
      description: 'Get user bets',
      requiresAuth: true
    }
  ]

  useEffect(() => {
    checkAllServices()
    const interval = setInterval(checkAllServices, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkAllServices = async () => {
    try {
      // Check gateway health
      const gatewayResponse = await fetch('http://localhost:8000/health')
      const gatewayHealthy = gatewayResponse.ok

      // Check services health
      let servicesData: any = { services: [] }
      try {
        const servicesResponse = await fetch('http://localhost:8000/health/services')
        if (servicesResponse.ok) {
          servicesData = await servicesResponse.json()
        }
      } catch (error) {
        console.log('Services health check failed')
      }

      setServices(prevServices => {
        const updatedServices = [...prevServices]
        
        // Update gateway
        updatedServices[0] = {
          ...updatedServices[0],
          status: gatewayHealthy ? 'healthy' : 'unhealthy'
        }

        // Update other services
        if (servicesData.services && Array.isArray(servicesData.services)) {
          servicesData.services.forEach((service: any) => {
            const index = updatedServices.findIndex(s => s.name.toLowerCase().includes(service.name.toLowerCase()))
            if (index > 0) {
              updatedServices[index] = {
                ...updatedServices[index],
                status: service.status === 'healthy' ? 'healthy' : 'unhealthy',
                response: service.response,
                error: service.error
              }
            }
          })
        }

        return updatedServices
      })
    } catch (error) {
      setServices(prevServices =>
        prevServices.map(service => ({ ...service, status: 'unhealthy' as const }))
      )
    }
  }

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    const key = `${endpoint.method}-${endpoint.path}`
    setIsLoading(prev => ({ ...prev, [key]: true }))

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (endpoint.requiresAuth && authToken) {
        headers.Authorization = `Bearer ${authToken}`
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers,
      }

      if (endpoint.method === 'POST' && endpoint.example) {
        options.body = JSON.stringify(endpoint.example)
      }

      const response = await fetch(`http://localhost:8000${endpoint.path}`, options)
      const data = await response.json()

      const result = {
        status: response.status,
        statusText: response.statusText,
        data,
        timestamp: new Date().toISOString(),
        success: response.ok
      }

      setTestResults(prev => ({ ...prev, [key]: result }))

      if (endpoint.path === '/api/auth/login' && response.ok && data.token) {
        setAuthToken(data.token)
        toast.success('Authentication successful! Token saved.')
      }

      if (response.ok) {
        toast.success(`${endpoint.name} test successful`)
      } else {
        toast.error(`${endpoint.name} test failed: ${response.status}`)
      }
    } catch (error) {
      const result = {
        status: 0,
        statusText: 'Network Error',
        data: { error: (error as Error).message },
        timestamp: new Date().toISOString(),
        success: false
      }

      setTestResults(prev => ({ ...prev, [key]: result }))
      toast.error(`${endpoint.name} test failed: Network error`)
    } finally {
      setIsLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">API Testing Interface</h1>
              <p className="text-muted-foreground">Test Yami Betting Platform APIs in real-time</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Service Status</TabsTrigger>
            <TabsTrigger value="endpoints">Test Endpoints</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Service Health Monitor</h2>
              <Button onClick={checkAllServices} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    <CardDescription>Port {service.port}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                          {service.status}
                        </Badge>
                      </div>
                      {service.response && (
                        <div className="text-xs text-muted-foreground">
                          Last checked: {new Date().toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => {
                const key = `${endpoint.method}-${endpoint.path}`
                const result = testResults[key]
                const loading = isLoading[key]

                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <div>
                            <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                            <CardDescription>{endpoint.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {endpoint.requiresAuth && (
                            <Badge variant="secondary">Auth Required</Badge>
                          )}
                          <Button 
                            onClick={() => testEndpoint(endpoint)}
                            disabled={loading || (endpoint.requiresAuth && !authToken)}
                            size="sm"
                          >
                            {loading ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {endpoint.method} {endpoint.path}
                        </div>
                        
                        {endpoint.example && (
                          <div>
                            <Label className="text-sm font-medium">Request Body:</Label>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(endpoint.example, null, 2)}
                            </pre>
                          </div>
                        )}

                        {result && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium">Response:</Label>
                              <Badge variant={result.success ? 'default' : 'destructive'}>
                                {result.status} {result.statusText}
                              </Badge>
                            </div>
                            <ScrollArea className="h-32 w-full">
                              <pre className="text-xs bg-muted p-2 rounded">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </ScrollArea>
                            <div className="text-xs text-muted-foreground">
                              Tested at: {new Date(result.timestamp).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Management</CardTitle>
                <CardDescription>
                  Manage your JWT token for authenticated API calls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">JWT Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="Enter your JWT token or login to get one"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                  />
                  {authToken && (
                    <div className="text-sm text-green-600">
                      ✓ Token is set and will be used for authenticated requests
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Demo Credentials</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-medium">Admin:</span>
                      <code>admin@admin.com / admin123</code>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-medium">User:</span>
                      <code>user@test.com / password123</code>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use the Login endpoint above to authenticate and automatically set the token.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
