"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BookOpen, 
  Zap, 
  Shield, 
  Activity, 
  Database, 
  Globe, 
  Code, 
  Play,
  CheckCircle,
  AlertCircle,
  Server,
  Smartphone,
  Monitor,
  Cloud
} from 'lucide-react'

export default function DocumentationPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)

  const services = [
    {
      name: "API Gateway",
      port: 8000,
      status: "healthy",
      description: "Central routing and coordination",
      endpoints: [
        { method: "GET", path: "/health", description: "Gateway health check" },
        { method: "GET", path: "/health/services", description: "All services status" },
        { method: "GET", path: "/docs", description: "Swagger documentation" },
        { method: "GET", path: "/test", description: "Test endpoint" }
      ]
    },
    {
      name: "Main Service",
      port: 3001,
      status: "healthy",
      description: "Authentication and user management",
      endpoints: [
        { method: "POST", path: "/api/auth/login", description: "User login" },
        { method: "POST", path: "/api/auth/register", description: "User registration" },
        { method: "GET", path: "/api/users/profile", description: "Get user profile" },
        { method: "PUT", path: "/api/users/profile", description: "Update profile" }
      ]
    },
    {
      name: "Fixtures Service",
      port: 3002,
      status: "healthy",
      description: "Live match data and fixtures",
      endpoints: [
        { method: "GET", path: "/api/fixtures", description: "Get all fixtures" },
        { method: "GET", path: "/api/fixtures/live", description: "Live matches" },
        { method: "GET", path: "/api/fixtures/:id", description: "Get specific fixture" }
      ]
    },
    {
      name: "Odds Service",
      port: 3003,
      status: "healthy",
      description: "Betting odds calculation",
      endpoints: [
        { method: "GET", path: "/api/odds", description: "Get all odds" },
        { method: "GET", path: "/api/odds/:fixtureId", description: "Odds for specific match" },
        { method: "POST", path: "/api/odds/calculate", description: "Calculate new odds" }
      ]
    },
    {
      name: "Wallet Service",
      port: 3004,
      status: "healthy",
      description: "Balance and transactions",
      endpoints: [
        { method: "GET", path: "/api/wallet/balance", description: "Get user balance" },
        { method: "POST", path: "/api/wallet/deposit", description: "Deposit funds" },
        { method: "POST", path: "/api/wallet/withdraw", description: "Withdraw funds" },
        { method: "GET", path: "/api/wallet/transactions", description: "Transaction history" }
      ]
    },
    {
      name: "Bet Service",
      port: 3005,
      status: "healthy",
      description: "Bet placement and management",
      endpoints: [
        { method: "POST", path: "/api/bets/place", description: "Place a bet" },
        { method: "GET", path: "/api/bets/user", description: "User's bets" },
        { method: "GET", path: "/api/bets/:id", description: "Get specific bet" }
      ]
    },
    {
      name: "Result Service",
      port: 3006,
      status: "healthy",
      description: "Match results and settlement",
      endpoints: [
        { method: "GET", path: "/api/results", description: "All results" },
        { method: "POST", path: "/api/results/process", description: "Process match result" },
        { method: "GET", path: "/api/results/:fixtureId", description: "Result for specific match" }
      ]
    }
  ]

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">API Documentation</h1>
              <p className="text-muted-foreground">Elite Betting Platform - Comprehensive API Reference</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              8 Services Running
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              JWT Protected
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              Real-time Updates
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="authentication">Auth</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Including API Gateway</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">25+</div>
                  <p className="text-xs text-muted-foreground">RESTful endpoints</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gateway Port</CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8000</div>
                  <p className="text-xs text-muted-foreground">Central API access</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Start
                </CardTitle>
                <CardDescription>
                  Get started with the Elite Betting Platform API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Start the Platform</h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    ./start_all.sh
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">2. Access Points</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>API Gateway:</span>
                      <code>http://localhost:8000</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Documentation:</span>
                      <code>http://localhost:8000/docs</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Health Check:</span>
                      <code>http://localhost:8000/health</code>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">3. Authentication</h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    {`curl -X POST http://localhost:8000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@admin.com", "password": "admin123"}'`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid gap-6">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Server className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Port {service.port}</Badge>
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Endpoints</h4>
                      <div className="grid gap-2">
                        {service.endpoints.map((endpoint, endpointIndex) => (
                          <div key={endpointIndex} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={getMethodColor(endpoint.method)}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm">{endpoint.path}</code>
                            </div>
                            <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  JWT Authentication Flow
                </CardTitle>
                <CardDescription>
                  Learn how to authenticate with the Elite Betting Platform API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">Step 1: Login</h4>
                    <p className="text-sm text-muted-foreground mb-2">Obtain your JWT token</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      POST /api/auth/login<br />
                      Content-Type: application/json<br /><br />
                      {`{
  "email": "admin@admin.com",
  "password": "admin123"
}`}
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">Step 2: Use Token</h4>
                    <p className="text-sm text-muted-foreground mb-2">Include the token in your requests</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      GET /api/users/profile<br />
                      Authorization: Bearer YOUR_JWT_TOKEN
                    </div>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold">Demo Credentials</h4>
                    <div className="grid gap-2 text-sm mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Admin:</span>
                        <code>admin@admin.com / admin123</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">User:</span>
                        <code>user@test.com / password123</code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Interactive Testing
                  </CardTitle>
                  <CardDescription>
                    Test the API directly in your browser
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={() => window.open('/api-test-interface.html', '_blank')}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Open API Test Interface
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Swagger Documentation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Development Tools
                  </CardTitle>
                  <CardDescription>
                    Tools for API development and testing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Health Checks</h4>
                    <div className="text-sm space-y-1">
                      <div>Gateway: <code>GET /health</code></div>
                      <div>Services: <code>GET /health/services</code></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Logs</h4>
                    <div className="bg-muted p-2 rounded text-sm font-mono">
                      tail -f logs/*.log
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Example API Calls</CardTitle>
                <CardDescription>
                  Common API usage patterns with curl examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="health" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="health">Health</TabsTrigger>
                    <TabsTrigger value="auth">Auth</TabsTrigger>
                    <TabsTrigger value="betting">Betting</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="health" className="mt-4">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      {`# Check gateway health
curl http://localhost:8000/health

# Check all services
curl http://localhost:8000/health/services`}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="auth" className="mt-4">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      {`# Login and get token
curl -X POST http://localhost:8000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@admin.com","password":"admin123"}'

# Access protected endpoint
curl -H "Authorization: Bearer TOKEN" \\
  http://localhost:8000/api/users/profile`}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="betting" className="mt-4">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      {`# Get fixtures
curl http://localhost:8000/api/fixtures

# Get odds
curl http://localhost:8000/api/odds

# Place bet (requires auth)
curl -X POST http://localhost:8000/api/bets/place \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"fixtureId":"123","amount":10,"type":"home"}'`}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="wallet" className="mt-4">
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      {`# Get balance (requires auth)
curl -H "Authorization: Bearer TOKEN" \\
  http://localhost:8000/api/wallet/balance

# Get transactions
curl -H "Authorization: Bearer TOKEN" \\
  http://localhost:8000/api/wallet/transactions`}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Architecture
                </CardTitle>
                <CardDescription>
                  Microservices architecture with API Gateway coordination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-primary/10 rounded-lg mb-4">
                      <Smartphone className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold">Frontend (Port 3000)</h3>
                    <p className="text-sm text-muted-foreground">Next.js React Application</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-border"></div>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                      <Cloud className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">API Gateway (Port 8000)</h3>
                    <p className="text-sm text-muted-foreground">Request routing, health monitoring, documentation</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-px h-8 bg-border"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {services.slice(1).map((service, index) => (
                      <div key={index} className="text-center">
                        <div className="inline-block p-3 bg-green-100 dark:bg-green-900 rounded-lg mb-2">
                          <Server className="h-6 w-6 text-green-600" />
                        </div>
                        <h4 className="font-medium text-sm">{service.name}</h4>
                        <p className="text-xs text-muted-foreground">Port {service.port}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Centralized API Gateway
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      JWT Authentication
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Real-time Health Monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Rate Limiting & Security
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Interactive Documentation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      MongoDB & SQLite Databases
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Frontend:</span>
                      <span className="text-muted-foreground">Next.js 15, React 19</span>
                    </li>
                    <li className="flex justify-between">
                      <span>UI Library:</span>
                      <span className="text-muted-foreground">shadcn/ui, Tailwind</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Backend:</span>
                      <span className="text-muted-foreground">Node.js, Express</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Database:</span>
                      <span className="text-muted-foreground">MongoDB, SQLite</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Auth:</span>
                      <span className="text-muted-foreground">JWT, Google OAuth</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Documentation:</span>
                      <span className="text-muted-foreground">Swagger/OpenAPI</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
