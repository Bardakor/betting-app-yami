'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Target,
  Star,
  Flame,
  DollarSign,
  Award,
  Zap,
  Filter,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// These would be fetched from API in a real implementation

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Trophy className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank}</span>;
  }
};

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case 'Diamond':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'Platinum':
      return 'bg-gray-300/10 text-gray-300 border-gray-300/20';
    case 'Gold':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'Silver':
      return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    default:
      return 'bg-gray-600/10 text-gray-600 border-gray-600/20';
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Common':
      return 'text-gray-400';
    case 'Rare':
      return 'text-blue-400';
    case 'Epic':
      return 'text-purple-400';
    case 'Legendary':
      return 'text-orange-400';
    default:
      return 'text-gray-400';
  }
};

export default function Leaderboards() {
  const [timeFrame, setTimeFrame] = useState('month');
  const [topProfitLeaders, setTopProfitLeaders] = useState<any[]>([]);
  const [topWinRateLeaders, setTopWinRateLeaders] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // TODO: Implement API calls to fetch real leaderboard data
        // const profitLeadersResponse = await fetch(`http://localhost:3001/api/leaderboards/profit?timeframe=${timeFrame}`);
        // const winRateLeadersResponse = await fetch(`http://localhost:3001/api/leaderboards/winrate?timeframe=${timeFrame}`);
        // const achievementsResponse = await fetch('http://localhost:3001/api/achievements');
        
        // For now, set empty data since we removed mock data
        setTopProfitLeaders([]);
        setTopWinRateLeaders([]);
        setAchievements([]);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setTopProfitLeaders([]);
        setTopWinRateLeaders([]);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [timeFrame]);

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
            Leaderboards
          </h1>
          <p className="text-gray-400 mt-1">
            Compete with the best bettors and track your ranking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={timeFrame === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFrame('week')}
            className="bg-gray-800 border-gray-700"
          >
            This Week
          </Button>
          <Button
            variant={timeFrame === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFrame('month')}
            className="bg-gray-800 border-gray-700"
          >
            This Month
          </Button>
          <Button
            variant={timeFrame === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFrame('all')}
            className="bg-gray-800 border-gray-700"
          >
            All Time
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="profit" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
            <DollarSign className="w-4 h-4 mr-2" />
            Profit Leaders
          </TabsTrigger>
          <TabsTrigger value="winrate" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Target className="w-4 h-4 mr-2" />
            Win Rate
          </TabsTrigger>
          <TabsTrigger value="volume" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <TrendingUp className="w-4 h-4 mr-2" />
            Volume
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profit" className="space-y-6">
          {/* Top 3 Podium */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                Top Profit Leaders
              </CardTitle>
              <CardDescription>
                The most profitable bettors this {timeFrame}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {topProfitLeaders.slice(0, 3).map((leader, index) => (
                  <motion.div
                    key={leader.rank}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-lg border text-center ${
                      index === 0 
                        ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20' 
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300/10 to-gray-400/10 border-gray-300/20'
                        : 'bg-gradient-to-br from-amber-600/10 to-amber-700/10 border-amber-600/20'
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      {getRankIcon(leader.rank)}
                    </div>
                    
                    <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-white/20">
                      <AvatarFallback className="bg-gray-700 text-white">
                        {leader.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="font-bold text-white mb-1">{leader.name}</h3>
                    <Badge className={`mb-3 ${getBadgeColor(leader.badge)}`}>
                      {leader.badge}
                    </Badge>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-400">
                        ${leader.profit.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {leader.winRate}% Win Rate • {leader.totalBets} Bets
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 text-sm">{leader.streak} streak</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Full Rankings */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white mb-4">Full Rankings</h4>
                {topProfitLeaders.map((leader, index) => (
                  <motion.div
                    key={leader.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(leader.rank)}
                      </div>
                      
                      <Avatar className="w-10 h-10 border border-white/20">
                        <AvatarFallback className="bg-gray-700 text-white">
                          {leader.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-semibold text-white">{leader.name}</div>
                        <div className="text-sm text-gray-400">{leader.totalBets} total bets</div>
                      </div>
                      
                      <Badge className={getBadgeColor(leader.badge)}>
                        {leader.badge}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-green-400">
                        ${leader.profit.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {leader.winRate}% win rate
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winrate" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Highest Win Rates
              </CardTitle>
              <CardDescription>
                The most accurate bettors (minimum 50 bets)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topWinRateLeaders.map((leader, index) => (
                  <motion.div
                    key={leader.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(leader.rank)}
                      </div>
                      
                      <Avatar className="w-10 h-10 border border-white/20">
                        <AvatarFallback className="bg-gray-700 text-white">
                          {leader.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-semibold text-white">{leader.name}</div>
                        <div className="text-sm text-gray-400">{leader.totalBets} bets • ${leader.profit.toLocaleString()} profit</div>
                      </div>
                      
                      <Badge className={getBadgeColor(leader.badge)}>
                        {leader.badge}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-green-400 text-xl">
                        {leader.winRate}%
                      </div>
                      <div className="text-sm text-gray-400">
                        {leader.accuracy}% accuracy
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Volume Leaders
              </CardTitle>
              <CardDescription>
                The most active bettors by number of bets placed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Volume Rankings</h3>
                <p className="text-gray-400">Track the most active bettors by volume and frequency</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-400" />
                Achievements & Badges
              </CardTitle>
              <CardDescription>
                Unlock special achievements and show off your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 text-center"
                    >
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <IconComponent className={`w-6 h-6 ${getRarityColor(achievement.rarity)}`} />
                      </div>
                      
                      <h4 className="font-semibold text-white mb-1">{achievement.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getRarityColor(achievement.rarity)} bg-transparent border-current`}>
                          {achievement.rarity}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {achievement.holders.toLocaleString()} holders
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Your Rank Section */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Your Current Standing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">#127</div>
              <div className="text-sm text-gray-400">Overall Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">$8,420</div>
              <div className="text-sm text-gray-400">Total Profit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">73.2%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">Silver</div>
              <div className="text-sm text-gray-400">Current Badge</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 