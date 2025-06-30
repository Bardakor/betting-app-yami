const express = require('express');
const axios = require('axios');
const Bet = require('../models/Bet');

const router = express.Router();

// Middleware to verify JWT token with main service
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token with main service
    const response = await axios.get(`${process.env.MAIN_SERVICE_URL}/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = response.data.user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Place a new bet
router.post('/place', verifyToken, async (req, res) => {
  try {
    const {
      fixtureId,
      betType,
      selection,
      stake,
      odds
    } = req.body;

    // Validation
    if (!fixtureId || !betType || !selection || !stake || !odds) {
      return res.status(400).json({
        success: false,
        message: 'All bet fields are required'
      });
    }

    if (stake < 1 || stake > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Stake must be between $1 and $10,000'
      });
    }

    if (odds < 1.01) {
      return res.status(400).json({
        success: false,
        message: 'Invalid odds'
      });
    }

    // Get fixture details
    const fixtureResponse = await axios.get(`${process.env.FIXTURES_SERVICE_URL}/api/fixtures/${fixtureId}`);
    
    if (!fixtureResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fixture'
      });
    }

    const fixture = fixtureResponse.data.fixture;

    // Check if match has already started
    const kickoffTime = new Date(fixture.fixture.date);
    if (kickoffTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bet on matches that have already started'
      });
    }

    // Verify odds with odds service
    const oddsResponse = await axios.get(`${process.env.ODDS_SERVICE_URL}/api/odds/${fixtureId}`);
    
    if (!oddsResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Unable to verify current odds'
      });
    }

    // Check for significant odds changes (more than 5% difference)
    const currentOdds = oddsResponse.data.odds;
    let relevantOdds;
    
    switch (betType) {
      case 'match_winner':
        if (selection === 'home') relevantOdds = currentOdds.homeWin;
        else if (selection === 'away') relevantOdds = currentOdds.awayWin;
        else if (selection === 'draw') relevantOdds = currentOdds.draw;
        break;
      default:
        relevantOdds = odds; // Accept provided odds for other bet types
    }

    if (relevantOdds && Math.abs(relevantOdds - odds) / odds > 0.05) {
      return res.status(400).json({
        success: false,
        message: 'Odds have changed significantly. Please refresh and try again.',
        newOdds: relevantOdds
      });
    }

    const potentialWin = stake * odds;

    // Process payment with wallet service
    const walletResponse = await axios.post(`${process.env.WALLET_SERVICE_URL}/api/wallet/process-bet`, {
      userId: req.user.id,
      amount: stake,
      type: 'bet_placed',
      betId: null, // Will be updated after bet creation
      fixtureId,
      description: `Bet placed: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`
    });

    if (!walletResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: walletResponse.data.message || 'Insufficient balance'
      });
    }

    // Create bet record
    const bet = new Bet({
      userId: req.user.id,
      fixtureId,
      betType,
      selection,
      stake,
      odds,
      potentialWin,
      matchInfo: {
        homeTeam: {
          id: fixture.teams.home.id,
          name: fixture.teams.home.name
        },
        awayTeam: {
          id: fixture.teams.away.id,
          name: fixture.teams.away.name
        },
        league: {
          id: fixture.league.id,
          name: fixture.league.name,
          country: fixture.league.country
        },
        kickoffTime: new Date(fixture.fixture.date)
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await bet.save();

    // Update wallet transaction with bet ID
    await axios.put(`${process.env.WALLET_SERVICE_URL}/api/wallet/transaction/${walletResponse.data.transactionId}`, {
      betId: bet._id
    }).catch(err => console.log('Failed to update transaction with bet ID:', err.message));

    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      bet: {
        id: bet._id,
        fixtureId: bet.fixtureId,
        betType: bet.betType,
        selection: bet.selection,
        stake: bet.stake,
        odds: bet.odds,
        potentialWin: bet.potentialWin,
        matchInfo: bet.matchInfo,
        status: bet.status,
        placedAt: bet.placedAt
      },
      newBalance: walletResponse.data.newBalance
    });
  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error placing bet'
    });
  }
});

// Get user's bets
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, fixtureId } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (fixtureId) filter.fixtureId = parseInt(fixtureId);

    // Get bets
    const bets = await Bet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Bet.countDocuments(filter);

    // Format response
    const formattedBets = bets.map(bet => ({
      id: bet._id,
      fixtureId: bet.fixtureId,
      betType: bet.betType,
      selection: bet.selection,
      stake: bet.stake,
      odds: bet.odds,
      potentialWin: bet.potentialWin,
      matchInfo: bet.matchInfo,
      status: bet.status,
      result: bet.result,
      placedAt: bet.placedAt,
      profitLoss: bet.status === 'won' ? bet.result.winAmount - bet.stake : 
                 bet.status === 'lost' ? -bet.stake : 0
    }));

    res.json({
      success: true,
      bets: formattedBets,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user bets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bets'
    });
  }
});

// Get bet by ID
router.get('/:betId', verifyToken, async (req, res) => {
  try {
    const bet = await Bet.findOne({
      _id: req.params.betId,
      userId: req.user.id
    });

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Bet not found'
      });
    }

    res.json({
      success: true,
      bet: {
        id: bet._id,
        fixtureId: bet.fixtureId,
        betType: bet.betType,
        selection: bet.selection,
        stake: bet.stake,
        odds: bet.odds,
        potentialWin: bet.potentialWin,
        matchInfo: bet.matchInfo,
        status: bet.status,
        result: bet.result,
        placedAt: bet.placedAt,
        profitLoss: bet.status === 'won' ? bet.result.winAmount - bet.stake : 
                   bet.status === 'lost' ? -bet.stake : 0
      }
    });
  } catch (error) {
    console.error('Get bet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bet'
    });
  }
});

// Cancel bet (only before match starts)
router.delete('/:betId', verifyToken, async (req, res) => {
  try {
    const bet = await Bet.findOne({
      _id: req.params.betId,
      userId: req.user.id,
      status: 'active'
    });

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Active bet not found'
      });
    }

    // Check if match has started
    if (bet.matchInfo.kickoffTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel bet after match has started'
      });
    }

    // Refund to wallet
    const walletResponse = await axios.post(`${process.env.WALLET_SERVICE_URL}/api/wallet/process-bet`, {
      userId: req.user.id,
      amount: bet.stake,
      type: 'bet_refund',
      betId: bet._id,
      fixtureId: bet.fixtureId,
      description: `Bet cancelled: ${bet.matchInfo.homeTeam.name} vs ${bet.matchInfo.awayTeam.name}`
    });

    if (!walletResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process refund'
      });
    }

    // Update bet status
    bet.status = 'cancelled';
    await bet.save();

    res.json({
      success: true,
      message: 'Bet cancelled and refunded successfully',
      refundAmount: bet.stake,
      newBalance: walletResponse.data.newBalance
    });
  } catch (error) {
    console.error('Cancel bet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling bet'
    });
  }
});

// Get user betting statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const stats = await Bet.getUserStats(req.user.id);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get bet stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching betting statistics'
    });
  }
});

// Admin: Get all bets
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { page = 1, limit = 50, status, userId } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    // Get bets
    const bets = await Bet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'email firstName lastName')
      .lean();

    // Get total count
    const total = await Bet.countDocuments(filter);

    res.json({
      success: true,
      bets,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin get all bets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bets'
    });
  }
});

// Settle bets for a fixture (called by result evaluation service)
router.post('/settle/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { matchResult } = req.body;

    if (!matchResult || !matchResult.score) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match result data'
      });
    }

    // Find all active bets for this fixture
    const bets = await Bet.find({
      fixtureId: parseInt(fixtureId),
      status: 'active'
    });

    if (bets.length === 0) {
      return res.json({
        success: true,
        message: 'No active bets found for this fixture',
        settledBets: 0
      });
    }

    const settledBets = [];
    
    // Process each bet
    for (const bet of bets) {
      try {
        await bet.settle(matchResult);
        
        // If bet won, credit winnings to wallet
        if (bet.status === 'won') {
          await axios.post(`${process.env.WALLET_SERVICE_URL}/api/wallet/process-bet`, {
            userId: bet.userId,
            amount: bet.result.winAmount,
            type: 'bet_won',
            betId: bet._id,
            fixtureId: bet.fixtureId,
            description: `Bet won: ${bet.matchInfo.homeTeam.name} vs ${bet.matchInfo.awayTeam.name}`
          });
        }
        
        settledBets.push({
          betId: bet._id,
          userId: bet.userId,
          status: bet.status,
          stake: bet.stake,
          winAmount: bet.result.winAmount
        });
      } catch (error) {
        console.error(`Failed to settle bet ${bet._id}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Settled ${settledBets.length} bets for fixture ${fixtureId}`,
      settledBets: settledBets.length,
      details: settledBets
    });
  } catch (error) {
    console.error('Settle bets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error settling bets'
    });
  }
});

module.exports = router; 