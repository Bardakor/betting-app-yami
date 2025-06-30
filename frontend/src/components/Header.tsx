'use client';

import { useState } from 'react';
import { Search, Bell, User, LogOut, Settings, CreditCard, TrendingUp } from 'lucide-react';
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

interface Notification {
  id: number;
  message: string;
  time: string;
  type: 'odds' | 'win' | 'info';
}

export function Header() {
  const [notifications] = useState<Notification[]>([]);

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

        {/* Balance */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <CreditCard className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">$0.00</span>
        </div>

        {/* Profit/Loss */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gray-500/10 border border-gray-500/20 rounded-lg">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-400">$0.00</span>
        </div>

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-800">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
            <DropdownMenuLabel className="text-white">
              <div>
                <p className="font-medium">Guest User</p>
                <p className="text-sm text-gray-400">Member</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-gray-700" />
            
            <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 