const express = require('express');
const axios = require('axios');
const ProcessedResult = require('../models/ProcessedResult');
const { 
  processFinishedMatches, 
  processSpecificFixture, 
  getProcessingStats 
} = require('../services/resultProcessor');

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

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.email !== 'admin@admin.com') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Manually trigger result processing for all finished matches
router.post('/process/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Manual trigger: Processing all finished matches...');
    
    await processFinishedMatches();
    
    res.json({
      success: true,
      message: 'Result processing triggered successfully'
    });
  } catch (error) {
    console.error('Manual processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing results'
    });
  }
});

// Process a specific fixture
router.post('/process/:fixtureId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    console.log(`🎯 Manual trigger: Processing fixture ${fixtureId}...`);
    
    const result = await processSpecificFixture(parseInt(fixtureId));
    
    if (result.processed) {
      res.json({
        success: true,
        message: `Fixture ${fixtureId} processed successfully`,
        betsSettled: result.betsSettled,
        totalWinnings: result.totalWinnings
      });
    } else {
      res.json({
        success: true,
        message: `Fixture ${fixtureId} was not processed`,
        reason: result.reason
      });
    }
  } catch (error) {
    console.error(`Error processing fixture ${req.params.fixtureId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing fixture'
    });
  }
});

// Get processing statistics
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const stats = await getProcessingStats(parseInt(days));
    
    res.json({
      success: true,
      period: `Last ${days} days`,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching processing statistics'
    });
  }
});

// Get recent processed results
router.get('/recent', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const results = await ProcessedResult.find()
      .sort({ processedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ProcessedResult.countDocuments();

    res.json({
      success: true,
      results: results.map(result => ({
        fixtureId: result.fixtureId,
        match: `${result.matchInfo.homeTeam.name} ${result.finalScore.home}-${result.finalScore.away} ${result.matchInfo.awayTeam.name}`,
        league: result.matchInfo.league.name,
        status: result.matchStatus,
        betsSettled: result.betsSettled,
        totalWinnings: result.totalWinnings,
        processedAt: result.processedAt
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get recent results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent results'
    });
  }
});

// Check if a specific fixture has been processed
router.get('/status/:fixtureId', verifyToken, async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    const processedResult = await ProcessedResult.findOne({ 
      fixtureId: parseInt(fixtureId) 
    });

    if (processedResult) {
      res.json({
        success: true,
        processed: true,
        result: {
          fixtureId: processedResult.fixtureId,
          finalScore: processedResult.finalScore,
          matchStatus: processedResult.matchStatus,
          betsSettled: processedResult.betsSettled,
          totalWinnings: processedResult.totalWinnings,
          processedAt: processedResult.processedAt
        }
      });
    } else {
      res.json({
        success: true,
        processed: false,
        message: 'Fixture has not been processed yet'
      });
    }
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking fixture status'
    });
  }
});

// Get user's results (settled bets)
router.get('/my', verifyToken, async (req, res) => {
  try {
    // This endpoint gets the user's settled bet results
    // We'll call the bet service to get user's settled bets
    const betResponse = await axios.get(`${process.env.BET_SERVICE_URL}/api/bets/my?status=won,lost`, {
      headers: { Authorization: req.header('Authorization') }
    });

    if (!betResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch bet results'
      });
    }

    const settledBets = betResponse.data.bets.filter(bet => 
      bet.status === 'won' || bet.status === 'lost'
    );

    // Group by match and calculate totals
    const resultsByMatch = {};
    let totalWinnings = 0;
    let totalLosses = 0;

    settledBets.forEach(bet => {
      const matchKey = bet.fixtureId;
      
      if (!resultsByMatch[matchKey]) {
        resultsByMatch[matchKey] = {
          fixtureId: bet.fixtureId,
          match: `${bet.matchInfo.homeTeam.name} vs ${bet.matchInfo.awayTeam.name}`,
          league: bet.matchInfo.league.name,
          bets: [],
          totalStaked: 0,
          totalWinnings: 0,
          netResult: 0
        };
      }

      resultsByMatch[matchKey].bets.push(bet);
      resultsByMatch[matchKey].totalStaked += bet.stake;
      
      if (bet.status === 'won') {
        resultsByMatch[matchKey].totalWinnings += bet.result.winAmount;
        totalWinnings += bet.result.winAmount;
      } else {
        totalLosses += bet.stake;
      }
      
      resultsByMatch[matchKey].netResult = 
        resultsByMatch[matchKey].totalWinnings - resultsByMatch[matchKey].totalStaked;
    });

    res.json({
      success: true,
      summary: {
        totalMatches: Object.keys(resultsByMatch).length,
        totalWinnings,
        totalLosses,
        netProfit: totalWinnings - totalLosses
      },
      results: Object.values(resultsByMatch).sort((a, b) => 
        new Date(b.bets[0].placedAt) - new Date(a.bets[0].placedAt)
      )
    });
  } catch (error) {
    console.error('Get user results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your results'
    });
  }
});

module.exports = router; 