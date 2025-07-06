'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Filter, 
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { authService } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

export default function BetsPage() {
  const { user } = useAuth();
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchBets();
    fetchStats();
  }, [filter]);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const response = await authService.getUserBets(page, 20, status);
      
      if (response.success) {
        setBets(response.bets);
        setHasMore(response.pagination.hasNext);
      }
    } catch (error) {
      toast.error('Failed to load bets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authService.getBettingStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    const status = filter === 'all' ? undefined : filter;
    const response = await authService.getUserBets(nextPage, 20, status);
    
    if (response.success) {
      setBets([...bets, ...response.bets]);
      setPage(nextPage);
      setHasMore(response.pagination.hasNext);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'lost':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'active':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'lost':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'active':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

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
            My Bets
          </h1>
          <p className="text-gray-400 mt-1">
            Track your betting history and performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="bg-gray-800 border-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      {stats && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Total Bets</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalBets}</div>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
              <Progress value={stats.winRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-400">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(stats.totalProfit).toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {stats.totalProfit >= 0 ? 'Profit' : 'Loss'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-400">Active Bets</CardTitle>
              <Clock className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeBets}</div>
              <p className="text-xs text-gray-400 mt-1">
                ${stats.activeStake?.toFixed(2) || '0.00'} at stake
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bets List */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-400" />
                Betting History
              </CardTitle>
              
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Filter bets" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Bets</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading bets...</p>
              </div>
            ) : bets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No bets found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bets.map((bet) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white">
                            {bet.matchInfo.homeTeam.name} vs {bet.matchInfo.awayTeam.name}
                          </h4>
                          <Badge className={getStatusColor(bet.status)}>
                            {getStatusIcon(bet.status)}
                            <span className="ml-1">{bet.status.toUpperCase()}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Market</p>
                            <p className="text-white font-medium">
                              {bet.betType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Selection</p>
                            <p className="text-white font-medium">{bet.selection}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Odds</p>
                            <p className="text-yellow-400 font-medium">@{bet.odds}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Stake</p>
                            <p className="text-white font-medium">${bet.stake}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(bet.placedAt).toLocaleString()}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-400">
                              {bet.status === 'active' ? 'Potential Win' : 'Profit/Loss'}
                            </p>
                            <p className={`text-lg font-bold ${
                              bet.status === 'won' ? 'text-green-400' : 
                              bet.status === 'lost' ? 'text-red-400' : 
                              'text-yellow-400'
                            }`}>
                              {bet.status === 'active' 
                                ? `$${bet.potentialWin.toFixed(2)}`
                                : bet.profitLoss > 0 
                                  ? `+$${bet.profitLoss.toFixed(2)}`
                                  : `$${bet.profitLoss.toFixed(2)}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {hasMore && (
                  <div className="text-center mt-6">
                    <Button 
                      onClick={loadMore}
                      variant="outline" 
                      className="bg-gray-800 border-gray-700"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 