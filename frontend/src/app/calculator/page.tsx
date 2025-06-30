'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator as CalculatorIcon, 
  Target, 
  TrendingUp, 
  Zap,
  Search,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Calculator() {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('9');
  const [calculating, setCalculating] = useState(false);
  const [odds, setOdds] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch leagues and teams from backend
    const fetchData = async () => {
      try {
        // Fetch leagues (you can expand this to fetch from your fixtures service)
        const leaguesData = [
          { id: 9, name: 'Premier League', country: 'England' },
          { id: 11, name: 'La Liga', country: 'Spain' },
          { id: 13, name: 'Serie A', country: 'Italy' },
          { id: 78, name: 'Bundesliga', country: 'Germany' },
        ];
        setLeagues(leaguesData);

        // Fetch teams from fixtures service
        const teamsResponse = await fetch('http://localhost:3002/fixtures/teams');
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to basic leagues if fetch fails
        setLeagues([
          { id: 9, name: 'Premier League', country: 'England' },
          { id: 11, name: 'La Liga', country: 'Spain' },
          { id: 13, name: 'Serie A', country: 'Italy' },
          { id: 78, name: 'Bundesliga', country: 'Germany' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTeams = teams.filter(team => 
    team.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateOdds = async () => {
    if (!homeTeam || !awayTeam) return;
    
    setCalculating(true);
    try {
      const response = await fetch(
        `http://localhost:3003/odds/calculate?homeTeam=${encodeURIComponent(homeTeam)}&awayTeam=${encodeURIComponent(awayTeam)}&league=${selectedLeague}`
      );
      const data = await response.json();
      setOdds(data.odds || data);
    } catch (error) {
      console.error('Error calculating odds:', error);
    } finally {
      setCalculating(false);
    }
  };

  const getTeamName = (teamId: any) => {
    const team = teams.find(t => t.id === teamId || t.team_id === teamId);
    return team?.name || team?.team_name || 'Select Team';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

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
            Odds Calculator
          </h1>
          <p className="text-gray-400 mt-1">
            Advanced statistical odds calculation powered by FBR API
          </p>
        </div>
        
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
          <Zap className="w-3 h-3 mr-1" />
          Real-time Analysis
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CalculatorIcon className="w-5 h-5 mr-2 text-yellow-400" />
                Match Setup
              </CardTitle>
              <CardDescription>
                Select teams and league to calculate advanced odds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* League Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  League
                </label>
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select League" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {leagues.map((league) => (
                      <SelectItem key={league.id} value={league.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{league.name}</span>
                          <span className="text-gray-400 text-xs ml-2">{league.country}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Teams
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search for teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              {/* Team Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Home Team
                  </label>
                  <Select value={homeTeam} onValueChange={setHomeTeam}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select Home Team" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {filteredTeams.map((team) => (
                        <SelectItem key={team.id || team.team_id} value={team.id || team.team_id}>
                          {team.name || team.team_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Away Team
                  </label>
                  <Select value={awayTeam} onValueChange={setAwayTeam}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select Away Team" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {filteredTeams.filter(team => (team.id || team.team_id) !== homeTeam).map((team) => (
                        <SelectItem key={team.id || team.team_id} value={team.id || team.team_id}>
                          {team.name || team.team_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Match Preview */}
              {homeTeam && awayTeam && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white font-bold text-lg">H</span>
                      </div>
                      <div className="font-semibold text-white">{getTeamName(homeTeam)}</div>
                      <div className="text-xs text-gray-400">Home</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-2">VS</div>
                      <div className="text-xs text-gray-400">Match Preview</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-2">
                        <span className="text-white font-bold text-lg">A</span>
                      </div>
                      <div className="font-semibold text-white">{getTeamName(awayTeam)}</div>
                      <div className="text-xs text-gray-400">Away</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Calculate Button */}
              <Button
                onClick={calculateOdds}
                disabled={!homeTeam || !awayTeam || calculating}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
              >
                {calculating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Calculating Advanced Odds...
                  </>
                ) : (
                  <>
                    <CalculatorIcon className="w-4 h-4 mr-2" />
                    Calculate Odds
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Odds Results */}
          {odds && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-400" />
                    Calculated Odds
                  </CardTitle>
                  <CardDescription>
                    {getTeamName(homeTeam)} vs {getTeamName(awayTeam)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                      <div className="text-sm text-green-400 mb-1">Home Win</div>
                      <div className="text-2xl font-bold text-white">{odds.homeWin || odds.home_win || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{getTeamName(homeTeam)}</div>
                    </div>
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                      <div className="text-sm text-yellow-400 mb-1">Draw</div>
                      <div className="text-2xl font-bold text-white">{odds.draw || 'N/A'}</div>
                      <div className="text-xs text-gray-400">Match Draw</div>
                    </div>
                    
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                      <div className="text-sm text-red-400 mb-1">Away Win</div>
                      <div className="text-2xl font-bold text-white">{odds.awayWin || odds.away_win || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{getTeamName(awayTeam)}</div>
                    </div>
                  </div>

                  {odds.confidence && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Confidence Score</span>
                        <span className="text-white font-semibold">{odds.confidence}%</span>
                      </div>
                      <Progress value={odds.confidence} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Goals Market</h4>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-300">Over 2.5 Goals</span>
                        <span className="font-semibold text-white">{odds.over25 || odds.over_2_5 || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-300">Under 2.5 Goals</span>
                        <span className="font-semibold text-white">{odds.under25 || odds.under_2_5 || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Both Teams to Score</h4>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-300">BTTS Yes</span>
                        <span className="font-semibold text-white">{odds.bttsYes || odds.btts_yes || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                        <span className="text-gray-300">BTTS No</span>
                        <span className="font-semibold text-white">{odds.bttsNo || odds.btts_no || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Calculator Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Available Teams</span>
                  <span className="font-semibold text-white">{teams.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Leagues Supported</span>
                  <span className="font-semibold text-green-400">{leagues.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Data Source</span>
                  <span className="font-semibold text-yellow-400">FBR API</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Real-time team statistics',
                  'Advanced probability models',
                  'FBR API integration',
                  'Historical data analysis',
                  'Value bet detection',
                  'Confidence scoring'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-300">
                <p>• Higher confidence scores indicate more reliable odds</p>
                <p>• Compare with market odds to find value bets</p>
                <p>• Consider recent form and head-to-head records</p>
                <p>• Factor in home advantage and team motivation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
} 