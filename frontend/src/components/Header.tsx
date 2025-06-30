'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut, Settings, CreditCard, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authService, User as AuthUser } from '@/lib/auth';
import { LoginModal } from '@/components/LoginModal';
import { toast } from 'sonner';

interface Notification {
  id: number;
  message: string;
  time: string;
  type: 'odds' | 'win' | 'info';
}

export function Header() {
  const [notifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isDepositMode, setIsDepositMode] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      setUser(authService.getUser());
      fetchBalance();
    }
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await authService.getBalance();
      if (response.success) {
        setBalance(response.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const handleLogin = () => {
    setUser(authService.getUser());
    fetchBalance();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setBalance(0);
    toast.success('Logged out successfully');
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await authService.deposit(parseFloat(depositAmount));
      if (response.success) {
        toast.success(`Successfully deposited $${depositAmount}`);
        setDepositAmount('');
        setIsDepositMode(false);
        fetchBalance(); // Refresh balance
      } else {
        toast.error(response.message || 'Deposit failed');
      }
    } catch (error) {
      toast.error('Failed to process deposit');
    }
  };

  const handleAddFunds = async () => {
    if (!authService.isAdmin() || !user) return;
    
    try {
      const response = await authService.addFundsToUser(user.id, 1000, 'Admin bonus');
      if (response.success) {
        toast.success('Added $1000 to your account');
        fetchBalance();
      } else {
        toast.error(response.message || 'Failed to add funds');
      }
    } catch (error) {
      toast.error('Failed to add funds');
    }
  };

  return (
    <header className="h-16 bg-black/50 backdrop-blur-lg border-b border-gray-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search teams, matches, or markets..."
            className="pl-10 bg-gray-900/50 border-gray-700 focus:border-yellow-500 focus:ring-yellow-500/20"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* Live Status */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-400">Live</span>
        </div>

        {user && (
          <>
            {/* Balance */}
            <div className="hidden md:flex items-center space-x-2">
              {isDepositMode ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-20 h-6 bg-transparent border-none text-green-400 text-sm p-0"
                    onKeyPress={(e) => e.key === 'Enter' && handleDeposit()}
                  />
                  <Button
                    size="sm"
                    onClick={handleDeposit}
                    className="h-6 px-2 bg-green-500 text-white text-xs"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsDepositMode(false)}
                    className="h-6 px-2 bg-gray-500 text-white text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg cursor-pointer hover:bg-yellow-500/20"
                  onClick={() => setIsDepositMode(true)}
                >
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">${balance.toFixed(2)}</span>
                  <Plus className="w-3 h-3 text-yellow-400" />
                </div>
              )}
            </div>

            {/* Admin Add Funds */}
            {authService.isAdmin() && (
              <Button
                size="sm"
                onClick={handleAddFunds}
                className="hidden lg:flex bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
              >
                💰 Add $1000
              </Button>
            )}

            {/* Profit/Loss */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gray-500/10 border border-gray-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">${(user.stats?.totalWinnings - user.stats?.totalLosses || 0).toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-800">
              <Bell className="w-5 h-5 text-gray-400" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-gray-700">
            <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex-col items-start p-3 hover:bg-gray-800">
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-white">{notification.message}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      notification.type === 'win' ? 'border-green-500 text-green-400' :
                      notification.type === 'odds' ? 'border-yellow-500 text-yellow-400' :
                      'border-blue-500 text-blue-400'
                    }`}
                  >
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="justify-center text-yellow-400 hover:bg-gray-800">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-800">
                <div className={`w-8 h-8 ${authService.isAdmin() ? 'bg-gradient-to-r from-red-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-full flex items-center justify-center`}>
                  <User className="w-4 h-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
              <DropdownMenuLabel className="text-white">
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-gray-400">{authService.isAdmin() ? 'Administrator' : 'Member'}</p>
                  <p className="text-xs text-yellow-400">${balance.toFixed(2)}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => setIsDepositMode(true)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Add Funds</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-700" />
              
              <DropdownMenuItem 
                className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => setShowLoginModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            Login
          </Button>
        )}
      </div>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLogin}
      />
    </header>
  );
} 