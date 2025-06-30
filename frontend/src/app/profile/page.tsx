'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Trophy, 
  TrendingUp, 
  Target,
  Star,
  Calendar,
  DollarSign,
  Percent,
  Shield,
  Bell,
  Camera,
  Edit2,
  LogOut,
  History,
  Award,
  Flame,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Default user profile structure - will be populated from API
const defaultUserProfile = {
  name: 'Guest User',
  username: '@guest',
  email: '',
  joinDate: new Date().toISOString().split('T')[0],
  avatar: '',
  badge: 'Bronze',
  rank: 0,
  totalProfit: 0,
  totalBets: 0,
  winRate: 0,
  currentStreak: 0,
  longestStreak: 0,
  balance: 0,
  verified: false
};

export default function Profile() {
  const [showBalance, setShowBalance] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(defaultUserProfile);
  const [recentBets, setRecentBets] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // TODO: Implement API calls to fetch real user data
        // const profileResponse = await fetch('http://localhost:3001/api/user/profile');
        // const betsResponse = await fetch('http://localhost:3001/api/user/bets');
        // const achievementsResponse = await fetch('http://localhost:3001/api/user/achievements');
        // const statsResponse = await fetch('http://localhost:3001/api/user/stats');
        
        // For now, set empty data since we removed mock data
        setRecentBets([]);
        setAchievements([]);
        setMonthlyStats([]);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setRecentBets([]);
        setAchievements([]);
        setMonthlyStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your account and track your betting journey
          </p>
        </div>
        
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="w-24 h-24 mx-auto border-4 border-yellow-400/20">
                  <AvatarFallback className="bg-gray-700 text-white text-2xl">
                    {profileData.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {isEditing ? (
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="text-center bg-gray-800 border-gray-700"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white">{profileData.name}</h2>
                )}
                
                <p className="text-gray-400">{profileData.username}</p>
                
                <div className="flex items-center justify-center space-x-2">
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    {profileData.badge}
                  </Badge>
                  {profileData.verified && (
                    <Shield className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">#{profileData.rank}</div>
                    <div className="text-xs text-gray-400">Global Rank</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      ${profileData.totalProfit.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total Profit</div>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="font-semibold text-white">{profileData.winRate}%</span>
                  </div>
                  <Progress value={profileData.winRate} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Bets</span>
                    <span className="font-semibold text-white">{profileData.totalBets}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Streak</span>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="font-semibold text-orange-400">{profileData.currentStreak}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Balance</span>
                    <div className="flex items-center space-x-2">
                      {showBalance ? (
                        <span className="font-semibold text-green-400">
                          ${profileData.balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="font-semibold text-gray-400">••••••</span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowBalance(!showBalance)}
                        className="w-6 h-6 p-0"
                      >
                        {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    Member since {new Date(profileData.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="bg-gray-900/50 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700">
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700">
                <History className="w-4 h-4 mr-2" />
                Transaction History
              </Button>
              <Button variant="outline" className="w-full justify-start bg-gray-800 border-gray-700 text-red-400 hover:text-red-300">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="stats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-800">
              <TabsTrigger value="stats" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                <TrendingUp className="w-4 h-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                <History className="w-4 h-4 mr-2" />
                Recent Bets
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                <Award className="w-4 h-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gray-500/20 data-[state=active]:text-gray-400">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
              {/* Performance Overview */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Your betting performance over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                                          <div className="text-2xl font-bold text-green-400">
                      ${monthlyStats.reduce((sum: number, month: any) => sum + (month.profit || 0), 0).toLocaleString()}
                    </div>
                      <div className="text-sm text-gray-400">Total Profit (6m)</div>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                                          <div className="text-2xl font-bold text-blue-400">
                      {monthlyStats.reduce((sum: number, month: any) => sum + (month.bets || 0), 0)}
                    </div>
                      <div className="text-sm text-gray-400">Total Bets (6m)</div>
                    </div>
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {((monthlyStats.reduce((sum: number, month: any) => sum + (month.profit || 0), 0) / 6) / 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Avg Monthly ROI</div>
                    </div>
                  </div>
                  
                  {/* Monthly Chart Placeholder */}
                  <div className="h-64 bg-gray-800/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Monthly Performance Chart</p>
                      <p className="text-sm text-gray-500">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <History className="w-5 h-5 mr-2 text-green-400" />
                    Recent Betting History
                  </CardTitle>
                  <CardDescription>
                    Your latest betting activity and results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBets.map((bet, index) => (
                      <motion.div
                        key={bet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-white">{bet.match}</div>
                          <div className="text-sm text-gray-400">{bet.market} • @{bet.odds}</div>
                          <div className="text-xs text-gray-500">{bet.date}</div>
                        </div>
                        
                        <div className="text-center mx-4">
                          <div className="text-sm text-gray-400">Stake</div>
                          <div className="font-semibold text-white">${bet.stake}</div>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={
                            bet.result === 'won' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : bet.result === 'lost'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }>
                            {bet.result.toUpperCase()}
                          </Badge>
                          <div className={`font-bold text-lg ${
                            bet.profit > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {bet.profit > 0 ? '+' : ''}${bet.profit.toFixed(2)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center mt-6">
                    <Button variant="outline" className="bg-gray-800 border-gray-700">
                      View All History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Award className="w-5 h-5 mr-2 text-purple-400" />
                    Achievements & Milestones
                  </CardTitle>
                  <CardDescription>
                    Track your progress and unlock new badges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => {
                      const IconComponent = achievement.icon;
                      return (
                        <motion.div
                          key={achievement.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border ${
                            achievement.unlocked 
                              ? 'bg-green-500/10 border-green-500/20'
                              : 'bg-gray-800/30 border-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              achievement.unlocked ? 'bg-green-500/20' : 'bg-gray-700/50'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                achievement.unlocked ? 'text-green-400' : 'text-gray-500'
                              }`} />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className={`font-semibold ${
                                achievement.unlocked ? 'text-white' : 'text-gray-400'
                              }`}>
                                {achievement.name}
                              </h4>
                              <p className="text-sm text-gray-400">{achievement.description}</p>
                            </div>
                            
                            {achievement.unlocked && (
                              <Trophy className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          
                          {achievement.unlocked ? (
                            <div className="text-xs text-green-400">
                              Unlocked on {achievement.date}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-gray-300">{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-2" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-gray-400" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account preferences and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Display Name</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="bg-gray-800 border-gray-700 mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-300">Email Address</Label>
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="bg-gray-800 border-gray-700 mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-300">Username</Label>
                      <Input
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="bg-gray-800 border-gray-700 mt-1"
                      />
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-800" />
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Notification Preferences</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white">Email Notifications</div>
                          <div className="text-sm text-gray-400">Receive updates via email</div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700">
                          Enable
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white">Push Notifications</div>
                          <div className="text-sm text-gray-400">Get notified on bet results</div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700">
                          Enable
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-800" />
                  
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" className="bg-gray-800 border-gray-700">
                      Cancel
                    </Button>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
} 