'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Play, 
  User, 
  Settings,
  BarChart3,
  Target,
  Clock,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Live Matches', href: '/live-matches', icon: Play },
  { name: 'Profile', href: '/profile', icon: User },
];

const tools = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Predictions', href: '/predictions', icon: Target },
  { name: 'History', href: '/history', icon: Clock },
  { name: 'Trends', href: '/trends', icon: TrendingUp },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bg-gray-900 border-r border-gray-800 transition-all duration-200 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-white">Yami Betting</h1>
            <p className="text-xs text-gray-400">Professional Hub</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Main
            </p>
          )}
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Tools Section */}
        <div className="mt-8 space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Tools
            </p>
          )}
          {tools.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Status */}
      <div className="p-4 border-t border-gray-800">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">User</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">U</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 