import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  balance: number;
  stats: {
    totalBets: number;
    wonBets: number;
    lostBets: number;
    pendingBets: number;
    totalWinnings: number;
    totalLosses: number;
  };
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      if (this.token) {
        try {
          // Verify token is still valid
          const decoded: any = jwtDecode(this.token);
          if (decoded.exp * 1000 < Date.now()) {
            this.logout();
          } else {
            // Token is valid, try to get user info
            this.refreshUserData();
          }
        } catch (error) {
          this.logout();
        }
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('auth_token', data.token);
        return data;
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('auth_token', data.token);
        return data;
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async refreshUserData(): Promise<void> {
    if (!this.token) return;

    try {
      const response = await fetch('http://localhost:3001/auth/profile', {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        this.user = data.user;
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Refresh user data error:', error);
      this.logout();
    }
  }

  async setTokenAndFetchUser(token: string): Promise<void> {
    this.token = token;
    localStorage.setItem('auth_token', token);
    
    try {
      // Decode the token to get basic user info
      const decoded: any = jwtDecode(token);
      
      // Fetch full user profile
      await this.refreshUserData();
    } catch (error) {
      console.error('Token processing error:', error);
      this.logout();
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  isAdmin(): boolean {
    return this.user?.email === 'admin@admin.com';
  }

  async apiRequest(url: string, options: RequestInit = {}): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      throw new Error('Authentication expired');
    }

    const data = await response.json();
    return data;
  }

  // Wallet operations
  async getBalance(): Promise<{ success: boolean; balance?: number; message?: string }> {
    try {
      return await this.apiRequest('http://localhost:3004/api/wallet/balance');
    } catch (error) {
      return { success: false, message: 'Failed to fetch balance' };
    }
  }

  async deposit(amount: number, paymentMethod = 'credit_card'): Promise<any> {
    try {
      return await this.apiRequest('http://localhost:3004/api/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod }),
      });
    } catch (error) {
      return { success: false, message: 'Failed to process deposit' };
    }
  }

  async withdraw(amount: number, paymentMethod = 'bank_transfer'): Promise<any> {
    try {
      return await this.apiRequest('http://localhost:3004/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod }),
      });
    } catch (error) {
      return { success: false, message: 'Failed to process withdrawal' };
    }
  }

  async getTransactions(page = 1, limit = 20): Promise<any> {
    try {
      return await this.apiRequest(`http://localhost:3004/api/wallet/transactions?page=${page}&limit=${limit}`);
    } catch (error) {
      return { success: false, message: 'Failed to fetch transactions' };
    }
  }

  // Betting operations
  async placeBet(betData: {
    fixtureId: number;
    betType: string;
    selection: string;
    stake: number;
    odds: number;
  }): Promise<any> {
    try {
      return await this.apiRequest('http://localhost:3005/api/bets/place', {
        method: 'POST',
        body: JSON.stringify(betData),
      });
    } catch (error) {
      return { success: false, message: 'Failed to place bet' };
    }
  }

  async getUserBets(page = 1, limit = 20, status?: string): Promise<any> {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (status) params.append('status', status);
      return await this.apiRequest(`http://localhost:3005/api/bets/my?${params}`);
    } catch (error) {
      return { success: false, message: 'Failed to fetch bets' };
    }
  }

  async getBettingStats(): Promise<any> {
    try {
      return await this.apiRequest('http://localhost:3005/api/bets/stats/summary');
    } catch (error) {
      return { success: false, message: 'Failed to fetch betting stats' };
    }
  }

  // Admin operations
  async addFundsToUser(userId: string, amount: number, description?: string): Promise<any> {
    try {
      return await this.apiRequest('http://localhost:3004/api/wallet/admin/add-funds', {
        method: 'POST',
        body: JSON.stringify({ userId, amount, description }),
      });
    } catch (error) {
      return { success: false, message: 'Failed to add funds' };
    }
  }

  async getAllUsers(page = 1, limit = 20, search?: string): Promise<any> {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.append('search', search);
      return await this.apiRequest(`http://localhost:3001/api/admin/users?${params}`);
    } catch (error) {
      return { success: false, message: 'Failed to fetch users' };
    }
  }

  async createAdminUser(): Promise<any> {
    try {
      const response = await fetch('http://localhost:3001/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Failed to create admin user' };
    }
  }
}

export const authService = new AuthService(); 