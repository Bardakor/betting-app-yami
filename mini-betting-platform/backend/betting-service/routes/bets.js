const express = require('express');
const axios = require('axios');
const Bet = require('../models/Bet');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Place a new bet
router.post('/', verifyToken, async (req, res) => {
  try {
    const { fixtureId, betType, amount } = req.body;
    const userId = req.user.userId;

    console.log('Placing bet:', { userId, fixtureId, betType, amount });

    // Validation
    if (!fixtureId || !betType || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fixtureId, betType, amount'
      });
    }

    if (!['home', 'away', 'draw'].includes(betType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bet type. Must be: home, away, or draw'
      });
    }

    if (amount < 1 || amount > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Bet amount must be between $1 and $1000'
      });
    }

    // Get fixture details from fixtures service
    let fixture = null;
    let odds = 1.5; // Default odds
    
    try {
      const fixtureResponse = await axios.get(
        `${process.env.FIXTURES_SERVICE_URL || 'http://localhost:3003'}/api/fixtures/${fixtureId}`
      );
      fixture = fixtureResponse.data;
      
      // Use odds from fixture if available
      if (fixture.odds && fixture.odds[betType]) {
        odds = fixture.odds[betType];
      }
      
      console.log('Fixture found:', fixture.homeTeam, 'vs', fixture.awayTeam);
    } catch (error) {
      console.error('Failed to fetch fixture:', error.message);
      // Continue with default odds if fixture service is unavailable
    }

    // Check if fixture allows betting (should be upcoming)
    if (fixture && fixture.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: 'Betting is only allowed on upcoming fixtures'
      });
    }

    // Create bet
    const bet = new Bet({
      userId,
      fixtureId,
      betType,
      amount: parseFloat(amount),
      odds,
      potentialWinning: parseFloat(amount) * odds,
      fixture: fixture ? {
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        league: fixture.league,
        date: fixture.date
      } : null
    });

    const savedBet = await bet.save();
    
    console.log('Bet placed successfully:', savedBet._id);

    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      bet: savedBet
    });

  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place bet',
      error: error.message
    });
  }
});

// Get user's bets
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 50, page = 1 } = req.query;

    console.log('Getting bets for user:', req.user.email);

    // Build query
    const query = { userId };
    if (status && ['pending', 'won', 'lost', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Get bets with pagination
    const bets = await Bet.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalBets = await Bet.countDocuments(query);

    console.log(`Found ${bets.length} bets for user`);

    res.json({
      success: true,
      bets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBets,
        pages: Math.ceil(totalBets / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user bets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user bets',
      error: error.message
    });
  }
});

// Get specific bet by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log('Getting bet:', id, 'for user:', req.user.email);

    const bet = await Bet.findOne({ _id: id, userId });

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Bet not found or access denied'
      });
    }

    res.json({
      success: true,
      bet
    });

  } catch (error) {
    console.error('Get bet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bet',
      error: error.message
    });
  }
});

// Update bet status (admin function - for demo purposes)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    console.log('Updating bet status:', id, 'to', status);

    if (!['pending', 'won', 'lost', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const bet = await Bet.findOne({ _id: id, userId });

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Bet not found or access denied'
      });
    }

    bet.status = status;
    if (status !== 'pending') {
      bet.resultProcessedAt = new Date();
    }

    const updatedBet = await bet.save();

    console.log('Bet status updated successfully');

    res.json({
      success: true,
      message: 'Bet status updated',
      bet: updatedBet
    });

  } catch (error) {
    console.error('Update bet status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bet status',
      error: error.message
    });
  }
});

// Get betting statistics for user
router.get('/user/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('Getting betting stats for user:', req.user.email);

    const stats = await Bet.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalPotentialWinnings: { $sum: '$potentialWinning' },
          wonBets: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
          },
          lostBets: {
            $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] }
          },
          pendingBets: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          actualWinnings: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'won'] },
                '$potentialWinning',
                0
              ]
            }
          }
        }
      }
    ]);

    const userStats = stats[0] || {
      totalBets: 0,
      totalAmount: 0,
      totalPotentialWinnings: 0,
      wonBets: 0,
      lostBets: 0,
      pendingBets: 0,
      actualWinnings: 0
    };

    // Calculate win rate
    const completedBets = userStats.wonBets + userStats.lostBets;
    userStats.winRate = completedBets > 0 ? (userStats.wonBets / completedBets) * 100 : 0;
    userStats.netProfit = userStats.actualWinnings - userStats.totalAmount;

    res.json({
      success: true,
      stats: userStats
    });

  } catch (error) {
    console.error('Get betting stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get betting statistics',
      error: error.message
    });
  }
});

module.exports = router;
