'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Target, 
  Activity,
  Users,
  BarChart3,
  Zap,
  Star,
  AlertCircle,
  MapPin,
  Trophy,
  Timer,
  Award,
  Info,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Remove static data - will be fetched from API

// NO MOCK DATA - FETCH DIRECTLY FROM API

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

interface TeamStats {
  name: string;
  rating: number;
  goalsPerGame: number;
  goalsAgainstPerGame: number;
  form: number;
  homeAdvantage: number;
  injuries: number;
  recentForm: string[];
}

interface CalculatedOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  confidence: 'low' | 'medium' | 'high';
  stats: {
    home: TeamStats;
    away: TeamStats;
    factors: {
      headToHead: { wins: number; draws: number; losses: number };
      leaguePosition: { home: number; away: number };
      motivation: string;
    };
  } | null;
}

interface Match {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
      elapsed?: number;
    };
    venue?: {
      id?: number;
      name?: string;
      city?: string;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    round?: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner?: boolean };
    away: { id: number; name: string; logo: string; winner?: boolean };
  };
  goals: {
    home: number;
    away: number;
  };
  events?: unknown[];
  calculatedOdds?: CalculatedOdds;
}

interface Competition {
  league: any;
  priority: number;
  fixtures: Match[];
}

export default function LiveMatches() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [groupedMatches, setGroupedMatches] = useState<Record<string, Competition>>({});
  const [selectedTab, setSelectedTab] = useState('live');

  // Fetch live and upcoming matches
  useEffect(() => {
    fetchMatches();
    
    // Set up auto-refresh every 30 seconds for live data
    const interval = setInterval(() => {
      fetchMatches();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    console.log('🚀 Fetching REAL live matches from API...');
    setLoading(true);
    setError(null);
    
    try {
      // Fetch live matches through our Next.js API proxy
      console.log('📡 Fetching from /api/fixtures/live');
      const liveResponse = await fetch('/api/fixtures/live');
      const liveData = await liveResponse.json();
      
      console.log('📊 Live matches response:', liveData);
      
      if (liveData.success && liveData.fixtures) {
        setLiveMatches(liveData.fixtures);
        setMatches(liveData.fixtures);
        setGroupedMatches(liveData.groupedByCompetition || {});
        setLastUpdated(new Date());
        
        console.log(`✅ Loaded ${liveData.count} live matches successfully!`);
      } else {
        throw new Error('No live matches data received');
      }

      // Also fetch today's matches
      console.log('📅 Fetching today\'s matches...');
      const todayResponse = await fetch('/api/fixtures/today');
      const todayData = await todayResponse.json();
      
      if (todayData.success && todayData.fixtures) {
        setTodayMatches(todayData.fixtures);
        console.log(`✅ Loaded ${todayData.count} today's matches!`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      setError(`Failed to load matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to empty arrays
      setLiveMatches([]);
      setTodayMatches([]);
      setGroupedMatches({});
    } finally {
      console.log('✅ fetchMatches completed');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
      case '1H':
      case '2H':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'halftime':
      case 'HT':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'finished':
      case 'FT':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
  };

  const formatTime = (kickoff: string) => {
    return new Date(kickoff).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const extractOddsFromResponse = (oddsData: unknown) => {
    const data = oddsData as { success?: boolean; data?: { bookmakers?: { bets?: { name: string; values: { value: string; odd: number }[] }[] }[] } };
    if (!data?.success || !data?.data?.bookmakers?.[0]?.bets) {
      return getDefaultOdds();
    }

    const bets = data.data.bookmakers[0].bets;
    const matchWinner = bets.find((bet) => bet.name === 'Match Winner');
    const goalsOU = bets.find((bet) => bet.name === 'Goals Over/Under');
    const btts = bets.find((bet) => bet.name === 'Both Teams Score');

    return {
      homeWin: matchWinner?.values.find((v) => v.value === 'Home')?.odd || 2.00,
      draw: matchWinner?.values.find((v) => v.value === 'Draw')?.odd || 3.20,
      awayWin: matchWinner?.values.find((v) => v.value === 'Away')?.odd || 3.50,
      over25: goalsOU?.values.find((v) => v.value === 'Over 2.5')?.odd || 1.80,
      under25: goalsOU?.values.find((v) => v.value === 'Under 2.5')?.odd || 2.00,
      bttsYes: btts?.values.find((v) => v.value === 'Yes')?.odd || 1.90,
      bttsNo: btts?.values.find((v) => v.value === 'No')?.odd || 1.90
    };
  };

  const getDefaultOdds = () => ({
    homeWin: 2.10,
    draw: 3.20,
    awayWin: 3.40,
    over25: 1.80,
    under25: 2.00,
    bttsYes: 1.85,
    bttsNo: 1.95
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatMatchTime = (dateString: string, status: any) => {
    if (status.short === 'LIVE' || status.short === '1H' || status.short === '2H') {
      return `${status.elapsed || 0}'`;
    }
    
    if (status.short === 'HT') {
      return 'HT';
    }
    
    if (status.short === 'FT') {
      return 'FT';
    }
    
    // For scheduled matches, show the time
    const matchDate = new Date(dateString);
    return matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: any) => {
    switch (status.short) {
      case 'LIVE':
      case '1H':
      case '2H':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            LIVE
          </Badge>
        );
      case 'HT':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Timer className="w-3 h-3 mr-1" />
            HT
          </Badge>
        );
      case 'FT':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            FT
          </Badge>
        );
      case 'NS':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            {status.long || status.short}
          </Badge>
        );
    }
  };

  const renderMatch = (match: Match, index: number) => (
    <motion.div
      key={match.fixture?.id || index}
      variants={itemVariants}
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800/70 transition-all duration-300"
    >
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusBadge(match.fixture?.status)}
          <span className="text-sm text-gray-400">
            {match.league?.name || 'League Unknown'}
          </span>
          {match.league?.country && (
            <span className="text-xs text-gray-500">
              • {match.league.country}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-yellow-400">
            {formatMatchTime(match.fixture?.date, match.fixture?.status)}
          </span>
          <Button variant="ghost" size="sm" className="p-1">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        {/* Home Team */}
        <div className="text-center flex-1">
          <div className="flex items-center justify-end space-x-3">
            <div>
              <div className="font-semibold text-white text-right">
                {match.teams?.home?.name || 'Home Team'}
              </div>
              <div className="text-xs text-gray-400 text-right">
                {match.teams?.home?.winner === true && '👑'}
              </div>
            </div>
            {match.teams?.home?.logo && (
              <img 
                src={match.teams.home.logo} 
                alt={match.teams.home.name}
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
        </div>
        
        {/* Score */}
        <div className="bg-gray-700 rounded-lg px-4 py-3 min-w-[80px]">
          {match.goals?.home !== null && match.goals?.away !== null ? (
            <div className="text-xl font-bold text-white text-center">
              {match.goals.home} - {match.goals.away}
            </div>
          ) : (
            <div className="text-gray-400 text-center text-sm">VS</div>
          )}
        </div>
        
        {/* Away Team */}
        <div className="text-center flex-1">
          <div className="flex items-center justify-start space-x-3">
            {match.teams?.away?.logo && (
              <img 
                src={match.teams.away.logo} 
                alt={match.teams.away.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <div>
              <div className="font-semibold text-white text-left">
                {match.teams?.away?.name || 'Away Team'}
              </div>
              <div className="text-xs text-gray-400 text-left">
                {match.teams?.away?.winner === true && '👑'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Details */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          {match.fixture?.venue?.name && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{match.fixture.venue.name}</span>
            </div>
          )}
          {match.league?.round && (
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3" />
              <span>{match.league.round}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gray-700">
            <Timer className="w-3 h-3 mr-1" />
            Watch
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gray-700">
            <Activity className="w-3 h-3 mr-1" />
            Stats
          </Button>
        </div>
      </div>

      {/* Live Events (if any) */}
      {match.events && match.events.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <div className="text-xs text-gray-400 mb-2">Recent Events:</div>
          <div className="space-y-1">
            {match.events.slice(-3).map((event: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">
                  {event.time?.elapsed}' - {event.type}
                </span>
                <span className="text-gray-400">
                  {event.player?.name || 'Player'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    
    return (
      <Badge className={`${colors[confidence as keyof typeof colors]} text-xs`}>
        {confidence.toUpperCase()} CONFIDENCE
      </Badge>
    );
  };

  const getCompetitionIcon = (leagueName: string) => {
    if (leagueName?.includes('Champions League')) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (leagueName?.includes('Premier League')) return <Crown className="w-4 h-4 text-purple-400" />;
    if (leagueName?.includes('World Cup')) return <Award className="w-4 h-4 text-gold-400" />;
    return <Users className="w-4 h-4 text-blue-400" />;
  };

  const Crown = ({ className }: { className: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 6L10 2H14L12 6ZM17 12L21 8H17V12ZM7 12V8H3L7 12ZM12 18C8 14 8 10 12 10S16 14 12 18Z"/>
    </svg>
  );

  const renderMatchCard = (match: Match, index: number) => (
    <motion.div
      key={match.fixture?.id || index}
      variants={itemVariants}
      className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800/70 transition-all duration-300 hover:border-gray-600"
    >
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
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
        </div>
        {match.calculatedOdds && getConfidenceBadge(match.calculatedOdds.confidence)}
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <div className="text-center flex-1">
          <div className="font-semibold text-white text-lg mb-1">
            {match.teams?.home?.name || 'Home Team'}
          </div>
          {match.calculatedOdds?.stats && (
            <div className="text-xs text-gray-400">
              Rating: {match.calculatedOdds.stats.home.rating.toFixed(1)} • 
              Form: {match.calculatedOdds.stats.home.recentForm.join('')}
            </div>
          )}
        </div>
        
        <div className="bg-gray-700 rounded-lg px-6 py-3 min-w-[80px]">
          {match.fixture?.status?.short === 'LIVE' || match.goals ? (
            <div className="text-2xl font-bold text-white text-center">
              {match.goals?.home || 0} - {match.goals?.away || 0}
            </div>
          ) : (
            <div className="text-gray-400 text-center">vs</div>
          )}
        </div>
        
        <div className="text-center flex-1">
          <div className="font-semibold text-white text-lg mb-1">
            {match.teams?.away?.name || 'Away Team'}
          </div>
          {match.calculatedOdds?.stats && (
            <div className="text-xs text-gray-400">
              Rating: {match.calculatedOdds.stats.away.rating.toFixed(1)} • 
              Form: {match.calculatedOdds.stats.away.recentForm.join('')}
            </div>
          )}
        </div>
      </div>

      {/* Statistical Odds */}
      {match.calculatedOdds && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistical Odds
            </span>
            <span className="text-xs text-gray-500">FBRef-based</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700/50 hover:bg-green-500/20 border-gray-600 flex flex-col p-3 h-auto"
            >
              <div className="text-xs text-gray-400 mb-1">HOME WIN</div>
              <div className="font-bold text-white text-lg">{match.calculatedOdds.homeWin}</div>
              <div className="text-xs text-green-400">
                {((1/match.calculatedOdds.homeWin) * 100).toFixed(1)}%
              </div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700/50 hover:bg-yellow-500/20 border-gray-600 flex flex-col p-3 h-auto"
            >
              <div className="text-xs text-gray-400 mb-1">DRAW</div>
              <div className="font-bold text-white text-lg">{match.calculatedOdds.draw}</div>
              <div className="text-xs text-yellow-400">
                {((1/match.calculatedOdds.draw) * 100).toFixed(1)}%
              </div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700/50 hover:bg-red-500/20 border-gray-600 flex flex-col p-3 h-auto"
            >
              <div className="text-xs text-gray-400 mb-1">AWAY WIN</div>
              <div className="font-bold text-white text-lg">{match.calculatedOdds.awayWin}</div>
              <div className="text-xs text-red-400">
                {((1/match.calculatedOdds.awayWin) * 100).toFixed(1)}%
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Statistics */}
      {match.calculatedOdds?.stats && (
        <div className="bg-gray-900/50 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Match Insights
            </span>
            <Button variant="ghost" size="sm" className="text-xs">
              <Info className="w-3 h-3 mr-1" />
              Details
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-400 mb-1">Goals per Game</div>
              <div className="text-white">
                {match.calculatedOdds.stats.home.goalsPerGame.toFixed(2)} vs {match.calculatedOdds.stats.away.goalsPerGame.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">League Position</div>
              <div className="text-white">
                {match.calculatedOdds.stats.factors.leaguePosition.home} vs {match.calculatedOdds.stats.factors.leaguePosition.away}
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Head to Head</div>
              <div className="text-white">
                {match.calculatedOdds.stats.factors.headToHead.wins}W-{match.calculatedOdds.stats.factors.headToHead.draws}D-{match.calculatedOdds.stats.factors.headToHead.losses}L
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Motivation</div>
              <div className="text-white capitalize">
                {match.calculatedOdds.stats.factors.motivation}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderCompetitionSection = (competitionName: string, competition: Competition) => (
    <motion.div key={competitionName} variants={itemVariants} className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getCompetitionIcon(competitionName)}
          <h3 className="text-xl font-bold text-white">{competitionName}</h3>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Priority: {competition.priority}
          </Badge>
        </div>
        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
          {competition.fixtures.length} matches
        </Badge>
      </div>
      
      <div className="space-y-4">
        {competition.fixtures.map((match, index) => renderMatchCard(match, index))}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading matches with statistical analysis...</p>
          <p className="text-xs text-gray-500 mt-2">Debug: loading={String(loading)}</p>
        </div>
      </div>
    );
  }

  console.log('🔍 Debug - Render state:', {
    loading,
    error,
    liveMatchesCount: liveMatches.length,
    groupedMatchesKeys: Object.keys(groupedMatches),
    todayMatchesCount: todayMatches.length
  });

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
            Live Matches
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time matches with FBRef statistical analysis and competition rankings
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
            <Activity className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <BarChart3 className="w-3 h-3 mr-1" />
            Statistical Odds
          </Badge>
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            <Trophy className="w-3 h-3 mr-1" />
            Competition Sorted
          </Badge>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="live" className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Live Now
            </TabsTrigger>
            <TabsTrigger value="today" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Today's Matches
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="live" className="mt-6">
            {error ? (
              <motion.div variants={itemVariants} className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 text-lg font-semibold mb-2">Error Loading Matches</p>
                <p className="text-gray-400">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-red-500 hover:bg-red-600"
                >
                  Retry
                </Button>
              </motion.div>
            ) : Object.keys(groupedMatches).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedMatches).map(([competitionName, competition]) =>
                  renderCompetitionSection(competitionName, competition)
                )}
              </div>
            ) : (
              <motion.div variants={itemVariants} className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No live matches available</p>
                <p className="text-sm text-gray-500">Check back later for live betting opportunities</p>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="today" className="mt-6">
            {error ? (
              <motion.div variants={itemVariants} className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 text-lg font-semibold mb-2">Error Loading Matches</p>
                <p className="text-gray-400">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-red-500 hover:bg-red-600"
                >
                  Retry
                </Button>
              </motion.div>
            ) : todayMatches.length > 0 ? (
              <div className="space-y-4">
                {todayMatches.map((match, index) => renderMatch(match, index))}
              </div>
            ) : (
              <motion.div variants={itemVariants} className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No matches today</p>
                <p className="text-sm text-gray-500">Check back tomorrow for more matches</p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Statistics Summary */}
      {matches.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-400" />
                FBRef Statistical Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{matches.length}</div>
                  <div className="text-sm text-gray-400">Total Matches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {matches.filter(m => m.calculatedOdds?.confidence === 'high').length}
                  </div>
                  <div className="text-sm text-gray-400">High Confidence</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {Object.keys(groupedMatches).length}
                  </div>
                  <div className="text-sm text-gray-400">Competitions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {matches.filter(m => m.fixture?.status?.short === 'LIVE').length}
                  </div>
                  <div className="text-sm text-gray-400">Live Now</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
} 