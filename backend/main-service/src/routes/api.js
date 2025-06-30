const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult, query } = require('express-validator');

const User = require('../models/User');
const Bet = require('../models/Bet');
const { auth, optionalAuth, checkBalance, bettingRateLimit, validateBetLimits } = require('../middleware/auth');

const router = express.Router();

// API configuration
const API_FOOTBALL_BASE_URL = `https://${process.env.API_FOOTBALL_HOST}`;
const FBR_API_BASE_URL = 'https://fbrapi.com';

// Helper function to make API-Football requests
const makeAPIFootballRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${API_FOOTBALL_BASE_URL}${endpoint}`, {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY
      },
      params,
      timeout: 10000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`API-Football request failed for ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Helper function to make FBR API requests
const makeFBRRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${FBR_API_BASE_URL}${endpoint}`, {
      headers: {
        'X-API-Key': process.env.FBR_API_KEY
      },
      params,
      timeout: 15000 // FBR API has rate limits, might be slower
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`FBR API request failed for ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// @route   GET /api/fixtures/live
// @desc    Get live fixtures
// @access  Public
router.get('/fixtures/live', optionalAuth, async (req, res) => {
  try {
    const result = await makeAPIFootballRequest('/fixtures', { live: 'all' });
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch live fixtures',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data.response || [],
      count: result.data.response?.length || 0
    });
  } catch (error) {
    console.error('Live fixtures error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching live fixtures'
    });
  }
});

// @route   GET /api/fixtures
// @desc    Get fixtures with various filters
// @access  Public
router.get('/fixtures', optionalAuth, [
  query('league').optional().isNumeric(),
  query('season').optional().isNumeric(),
  query('team').optional().isNumeric(),
  query('date').optional().isDate(),
  query('last').optional().isNumeric(),
  query('next').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const { league, season, team, date, last, next, timezone = 'UTC' } = req.query;
    
    const params = { timezone };
    if (league) params.league = league;
    if (season) params.season = season;
    if (team) params.team = team;
    if (date) params.date = date;
    if (last) params.last = last;
    if (next) params.next = next;

    const result = await makeAPIFootballRequest('/fixtures', params);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fixtures',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data.response || [],
      count: result.data.response?.length || 0,
      filters: params
    });
  } catch (error) {
    console.error('Fixtures error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching fixtures'
    });
  }
});

// @route   GET /api/leagues
// @desc    Get available leagues
// @access  Public
router.get('/leagues', optionalAuth, [
  query('country').optional().isString(),
  query('season').optional().isNumeric(),
  query('current').optional().isBoolean()
], async (req, res) => {
  try {
    const { country, season, current } = req.query;
    
    const params = {};
    if (country) params.country = country;
    if (season) params.season = season;
    if (current) params.current = current;

    const result = await makeAPIFootballRequest('/leagues', params);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leagues',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data.response || [],
      count: result.data.response?.length || 0
    });
  } catch (error) {
    console.error('Leagues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leagues'
    });
  }
});

// @route   GET /api/teams
// @desc    Get teams
// @access  Public
router.get('/teams', optionalAuth, [
  query('league').optional().isNumeric(),
  query('season').optional().isNumeric(),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const { league, season, search } = req.query;
    
    const params = {};
    if (league) params.league = league;
    if (season) params.season = season;
    if (search) params.search = search;

    const result = await makeAPIFootballRequest('/teams', params);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teams',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data.response || [],
      count: result.data.response?.length || 0
    });
  } catch (error) {
    console.error('Teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching teams'
    });
  }
});

// @route   GET /api/odds/pre-match
// @desc    Get pre-match odds
// @access  Public
router.get('/odds/pre-match', optionalAuth, [
  query('fixture').optional().isNumeric(),
  query('league').optional().isNumeric(),
  query('season').optional().isNumeric(),
  query('bet').optional().isNumeric(),
  query('bookmaker').optional().isNumeric()
], async (req, res) => {
  try {
    const { fixture, league, season, bet, bookmaker } = req.query;
    
    const params = {};
    if (fixture) params.fixture = fixture;
    if (league) params.league = league;
    if (season) params.season = season;
    if (bet) params.bet = bet;
    if (bookmaker) params.bookmaker = bookmaker;

    const result = await makeAPIFootballRequest('/odds', params);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch odds',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data.response || [],
      count: result.data.response?.length || 0
    });
  } catch (error) {
    console.error('Odds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching odds'
    });
  }
});

// @route   GET /api/odds/live
// @desc    Get live odds
// @access  Public
router.get('/odds/live', optionalAuth, [
  query('fixture').optional().isNumeric(),
  query('league').optional().isNumeric(),
  query('bet').optional().isNumeric()
], async (req, res) => {
  try {
    const { fixture, league, bet } = req.query;
    
    const params = {};
    if (fixture) params.fixture = fixture;
    if (league) params.league = league;
    if (bet) params.bet = bet;

    const result = await makeAPIFootballRequest('/odds/live', params);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch live odds',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data.response || [],
      count: result.data.response?.length || 0
    });
  } catch (error) {
    console.error('Live odds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching live odds'
    });
  }
});

// @route   POST /api/bets
// @desc    Place a new bet
// @access  Private
router.post('/bets', auth, validateBetLimits, bettingRateLimit(5), [
  body('fixtureId').isNumeric().withMessage('Valid fixture ID is required'),
  body('betType').isIn([
    'match_winner', 'both_teams_score', 'over_under', 'double_chance',
    'correct_score', 'first_goal_scorer', 'handicap', 'clean_sheet', 'corners', 'cards'
  ]).withMessage('Invalid bet type'),
  body('selection').notEmpty().withMessage('Bet selection is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Bet amount must be at least 0.01'),
  body('odds').isFloat({ min: 1.01 }).withMessage('Odds must be at least 1.01')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fixtureId, betType, selection, amount, odds, parameters } = req.body;

    // Get fixture details from API
    const fixtureResult = await makeAPIFootballRequest('/fixtures', { id: fixtureId });
    
    if (!fixtureResult.success || !fixtureResult.data.response.length) {
      return res.status(400).json({
        success: false,
        message: 'Fixture not found'
      });
    }

    const fixture = fixtureResult.data.response[0];
    
    // Check if fixture is still bettable (not started or in specific status)
    const now = new Date();
    const matchDate = new Date(fixture.fixture.date);
    
    if (matchDate <= now && !['NS', 'TBD', 'PST'].includes(fixture.fixture.status.short)) {
      return res.status(400).json({
        success: false,
        message: 'Betting is closed for this fixture'
      });
    }

    // Check user balance
    if (!req.user.placeBet(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
        currentBalance: req.user.balance,
        requiredAmount: amount
      });
    }

    // Create bet
    const bet = new Bet({
      betId: uuidv4(),
      userId: req.user._id,
      fixture: {
        id: fixture.fixture.id,
        date: fixture.fixture.date,
        homeTeam: {
          id: fixture.teams.home.id,
          name: fixture.teams.home.name,
          logo: fixture.teams.home.logo
        },
        awayTeam: {
          id: fixture.teams.away.id,
          name: fixture.teams.away.name,
          logo: fixture.teams.away.logo
        },
        league: {
          id: fixture.league.id,
          name: fixture.league.name,
          logo: fixture.league.logo,
          country: fixture.league.country
        },
        venue: {
          name: fixture.fixture.venue?.name,
          city: fixture.fixture.venue?.city
        }
      },
      betType,
      selection,
      parameters,
      amount,
      odds,
      isLiveBet: ['1H', '2H', 'ET', 'BT', 'P'].includes(fixture.fixture.status.short),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Save bet and update user balance
    await bet.save();
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      bet: {
        id: bet._id,
        betId: bet.betId,
        fixture: bet.fixture,
        betType: bet.betType,
        selection: bet.selection,
        amount: bet.amount,
        odds: bet.odds,
        potentialWinnings: bet.potentialWinnings,
        status: bet.status,
        placedAt: bet.placedAt
      },
      userBalance: req.user.balance
    });

  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error placing bet'
    });
  }
});

// @route   GET /api/bets
// @desc    Get user's bets
// @access  Private
router.get('/bets', auth, [
  query('status').optional().isIn(['pending', 'won', 'lost', 'cancelled', 'cashout']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const bets = await Bet.find(query)
      .sort({ placedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalBets = await Bet.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBets,
        pages: Math.ceil(totalBets / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bets'
    });
  }
});

// @route   GET /api/bets/:betId
// @desc    Get specific bet details
// @access  Private
router.get('/bets/:betId', auth, async (req, res) => {
  try {
    const bet = await Bet.findOne({ 
      betId: req.params.betId, 
      userId: req.user._id 
    });

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Bet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bet
    });
  } catch (error) {
    console.error('Get bet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bet'
    });
  }
});

// @route   GET /api/user/stats
// @desc    Get user betting statistics
// @access  Private
router.get('/user/stats', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    const dateRange = {};
    if (period !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));
      dateRange.placedAt = { $gte: daysAgo };
    }

    const [betStats, betTypeDistribution] = await Promise.all([
      Bet.getUserStats(req.user._id, dateRange),
      Bet.getBetTypeDistribution(req.user._id)
    ]);

    // Calculate additional metrics
    const winRate = betStats.totalBets > 0 ? 
      ((betStats.wonBets / betStats.totalBets) * 100).toFixed(2) : 0;
    
    const profitLoss = betStats.totalWon - betStats.totalLost;
    const roi = betStats.totalStaked > 0 ? 
      ((profitLoss / betStats.totalStaked) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        period: period === 'all' ? 'All time' : `Last ${period} days`,
        summary: {
          ...betStats,
          winRate: parseFloat(winRate),
          profitLoss,
          roi: parseFloat(roi)
        },
        user: {
          balance: req.user.balance,
          totalProfit: req.user.profitLoss,
          overallWinRate: req.user.winRate
        },
        betTypeDistribution
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
});

// @route   GET /api/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/leaderboard', optionalAuth, [
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'all']),
  query('metric').optional().isIn(['profit', 'winrate', 'volume'])
], async (req, res) => {
  try {
    const { period = 'monthly', metric = 'profit', limit = 50 } = req.query;
    
    // Calculate date range based on period
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'daily':
        dateFilter = { 
          placedAt: { 
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) 
          } 
        };
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        dateFilter = { placedAt: { $gte: weekStart } };
        break;
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { placedAt: { $gte: monthStart } };
        break;
      default:
        dateFilter = {};
    }

    // Aggregate user statistics
    const pipeline = [
      { $match: dateFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          firstName: { $first: '$user.firstName' },
          lastName: { $first: '$user.lastName' },
          avatar: { $first: '$user.avatar' },
          totalBets: { $sum: 1 },
          totalStaked: { $sum: '$amount' },
          totalWon: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'won'] }, '$potentialWinnings', 0] 
            }
          },
          totalLost: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'lost'] }, '$amount', 0] 
            }
          },
          wonBets: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'won'] }, 1, 0] 
            }
          }
        }
      },
      {
        $addFields: {
          profit: { $subtract: ['$totalWon', '$totalLost'] },
          winRate: { 
            $multiply: [
              { $divide: ['$wonBets', '$totalBets'] }, 
              100
            ]
          }
        }
      }
    ];

    // Sort based on metric
    let sortField = {};
    switch (metric) {
      case 'winrate':
        sortField = { winRate: -1, totalBets: -1 };
        break;
      case 'volume':
        sortField = { totalStaked: -1 };
        break;
      default:
        sortField = { profit: -1 };
    }

    pipeline.push({ $sort: sortField });
    pipeline.push({ $limit: parseInt(limit) });

    const leaderboard = await Bet.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        user: {
          id: entry._id,
          name: `${entry.firstName} ${entry.lastName}`,
          avatar: entry.avatar
        },
        stats: {
          totalBets: entry.totalBets,
          totalStaked: entry.totalStaked,
          profit: entry.profit,
          winRate: entry.winRate ? entry.winRate.toFixed(2) : '0.00'
        }
      })),
      period,
      metric
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    });
  }
});

// Health check for external services
router.get('/health/external', async (req, res) => {
  const checks = await Promise.allSettled([
    makeAPIFootballRequest('/status'),
    axios.get(`${process.env.FIXTURES_SERVICE_URL}/health`),
    axios.get(`${process.env.ODDS_SERVICE_URL}/health`)
  ]);

  const results = {
    apiFootball: checks[0].status === 'fulfilled' && checks[0].value.success,
    fixturesService: checks[1].status === 'fulfilled' && checks[1].value.status === 200,
    oddsService: checks[2].status === 'fulfilled' && checks[2].value.status === 200
  };

  const allHealthy = Object.values(results).every(status => status);

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    services: results,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 