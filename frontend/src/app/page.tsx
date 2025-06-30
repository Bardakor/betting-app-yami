'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity,
  Clock,
  Trophy,
  BarChart3,
  Zap,
  Eye,
  Star,
  AlertCircle,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function Dashboard() {
  // All hooks must be at the top level - never inside conditions
  const [isLoading, setIsLoading] = useState(true);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBets: 0,
    winRate: 0,
    profit: 0,
    profitChange: 0,
    activeBets: 0,
    portfolio: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch live matches through our Next.js API proxy
        const matchesResponse = await fetch('/api/fixtures/live');
        const matchesData = await matchesResponse.json();
        
        // Use the statistical odds already calculated by the fixtures service
        const processedMatches = (matchesData.fixtures || []).slice(0, 3).map((match: any) => {
          // Extract odds from the calculatedOdds field provided by fixtures service
          const calculatedOdds = match.calculatedOdds;
          
          return {
            ...match,
            odds: calculatedOdds ? {
              homeWin: calculatedOdds.homeWin,
              draw: calculatedOdds.draw,
              awayWin: calculatedOdds.awayWin
            } : {
              homeWin: 2.10,
              draw: 3.20,
              awayWin: 3.40
            }
          };
        });
        
        setLiveMatches(processedMatches);

        // Fetch user stats from main service (requires authentication)
        // TODO: Implement API calls to fetch real user data
        // const statsResponse = await fetch('http://localhost:3001/api/user/stats', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const statsData = await statsResponse.json();
        // setStats(statsData);
        
        // For now, use default stats since we removed mock data
        setStats({
          totalBets: 0,
          winRate: 0,
          profit: 0,
          profitChange: 0,
          activeBets: 0,
          portfolio: 0
        });

        setRecentActivity([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty arrays on error
        setLiveMatches([]);
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to extract odds from API response
    const extractOddsFromResponse = (oddsData: any) => {
      if (!oddsData?.success || !oddsData?.data?.bookmakers?.[0]?.bets) {
        return { homeWin: 2.10, draw: 3.20, awayWin: 3.40 };
      }

      const bets = oddsData.data.bookmakers[0].bets;
      const matchWinner = bets.find((bet: any) => bet.name === 'Match Winner');

      return {
        homeWin: matchWinner?.values.find((v: any) => v.value === 'Home')?.odd || 2.10,
        draw: matchWinner?.values.find((v: any) => v.value === 'Draw')?.odd || 3.20,
        awayWin: matchWinner?.values.find((v: any) => v.value === 'Away')?.odd || 3.40
      };
    };

    fetchDashboardData();
  }, []);

  // Now we can conditionally render based on state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Welcome back! Here's your betting overview
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            <Activity className="w-3 h-3 mr-1" />
            Live Markets
          </Badge>
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            <Zap className="w-3 h-3 mr-1" />
            Real-time Odds
          </Badge>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.profit.toFixed(2)}</div>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.profitChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
            <Progress value={stats.winRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Active Bets</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeBets}</div>
            <p className="text-xs text-yellow-400 mt-1">
              ${(stats.activeBets * 50).toFixed(2)} total stake
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.portfolio.toFixed(2)}</div>
            <p className="text-xs text-purple-400 mt-1">
              Available balance
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Matches */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-red-400" />
                  Live & Upcoming Matches
                </CardTitle>
                <Button variant="outline" size="sm" className="border-gray-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
              <CardDescription>
                Real-time scores and betting opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveMatches.length > 0 ? (
                  liveMatches.slice(0, 3).map((match, index) => (
                    <motion.div
                      key={match.fixture?.id || index}
                      variants={itemVariants}
                      className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {match.fixture?.status?.short === 'LIVE' ? (
                            <>
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                              <span className="text-red-400 text-sm font-medium">
                                {match.fixture?.status?.elapsed || 'LIVE'}'
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">
                                {new Date(match.fixture?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </>
                          )}
                          <span className="text-gray-400 text-sm">{match.league?.name || 'League'}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-6 mb-4">
                        <div className="text-center flex-1">
                          <div className="font-semibold text-white">
                            {match.teams?.home?.name || 'Home Team'}
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg px-4 py-2">
                          {match.fixture?.status?.short === 'LIVE' || match.goals ? (
                            <div className="text-xl font-bold text-white">
                              {match.goals?.home || 0} - {match.goals?.away || 0}
                            </div>
                          ) : (
                            <div className="text-gray-400">vs</div>
                          )}
                        </div>
                        
                        <div className="text-center flex-1">
                          <div className="font-semibold text-white">
                            {match.teams?.away?.name || 'Away Team'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-700/50 hover:bg-green-500/20 border-gray-600 text-center"
                        >
                          <div className="text-xs text-gray-400">1</div>
                          <div className="font-semibold text-white">{match.odds?.homeWin || '2.10'}</div>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-700/50 hover:bg-yellow-500/20 border-gray-600 text-center"
                        >
                          <div className="text-xs text-gray-400">X</div>
                          <div className="font-semibold text-white">{match.odds?.draw || '3.20'}</div>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-700/50 hover:bg-red-500/20 border-gray-600 text-center"
                        >
                          <div className="text-xs text-gray-400">2</div>
                          <div className="font-semibold text-white">{match.odds?.awayWin || '3.40'}</div>
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No live matches available</p>
                    <p className="text-sm text-gray-500">Check back later for live betting opportunities</p>
                  </div>
                )}
              </div>

              {liveMatches.length > 0 && (
                <div className="text-center mt-6">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                    View All Matches
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Recent Activity */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div>
                        <div className="font-semibold text-white">{activity.match}</div>
                        <div className="text-sm text-gray-400">{activity.type} • {activity.time}</div>
                      </div>
                      <div className={`font-bold ${activity.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {activity.amount > 0 ? '+' : ''}${activity.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-500">Start betting to see your activity here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                <Target className="w-4 h-4 mr-2" />
                Calculate Odds
              </Button>
              <Button variant="outline" className="w-full border-gray-700">
                <Eye className="w-4 h-4 mr-2" />
                Live Matches
              </Button>
              <Button variant="outline" className="w-full border-gray-700">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="trends" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="trends" className="space-y-3 mt-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 text-sm">Premier League Over 2.5</span>
                      <Badge className="bg-green-500/20 text-green-400">Hot</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">73% success rate this week</p>
                  </div>
                  
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 text-sm">La Liga Away Wins</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400">Trending</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Unexpected value opportunities</p>
                  </div>
                </TabsContent>
                <TabsContent value="tips" className="space-y-3 mt-4">
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>• Check team news before placing bets</p>
                    <p>• Look for value in underdog away wins</p>
                    <p>• Consider weather conditions for total goals</p>
                    <p>• Monitor live odds for better entries</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
