const express = require('express');
const router = express.Router();
const AdvancedOddsCalculator = require('../services/oddsCalculatorMongo');
const { dbAll, dbGet } = require('../config/database');

const calculator = new AdvancedOddsCalculator();

// Calculate odds for a specific match
router.get('/calculate', async (req, res) => {
    try {
        const { homeTeam, awayTeam, league } = req.query;
        
        if (!homeTeam || !awayTeam) {
            return res.status(400).json({
                error: 'Missing required parameters: homeTeam and awayTeam'
            });
        }

        console.log(`🎯 Calculating odds for ${homeTeam} vs ${awayTeam} in ${league || 'Premier League'}`);

        const odds = await calculator.calculateAdvancedOdds(
            homeTeam, 
            awayTeam, 
            league ? parseInt(league) : 9 // Default to Premier League
        );

        res.json({
            success: true,
            data: odds,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Odds calculation error:', error);
        res.status(500).json({
            error: 'Failed to calculate odds',
            message: error.message
        });
    }
});

// Get team statistics
router.get('/team-stats/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { league = 9, season = '2023-2024' } = req.query;

        console.log(`📊 Fetching stats for team ${teamId}`);

        const stats = await calculator.getTeamStats(teamId, parseInt(league), season);

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Team stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch team statistics',
            message: error.message
        });
    }
});

// Bulk odds calculation for multiple matches
router.post('/calculate-bulk', async (req, res) => {
    try {
        const { matches } = req.body;
        
        if (!matches || !Array.isArray(matches)) {
            return res.status(400).json({
                error: 'Invalid request: matches array required'
            });
        }

        console.log(`📊 Calculating bulk odds for ${matches.length} matches`);

        const results = await Promise.all(
            matches.map(async (match) => {
                try {
                    const odds = await calculator.calculateAdvancedOdds(
                        match.homeTeam,
                        match.awayTeam,
                        match.league || 9
                    );
                    return {
                        matchId: match.id || `${match.homeTeam}_${match.awayTeam}`,
                        odds,
                        status: 'success'
                    };
                } catch (error) {
                    return {
                        matchId: match.id || `${match.homeTeam}_${match.awayTeam}`,
                        error: error.message,
                        status: 'failed'
                    };
                }
            })
        );

        const successful = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        res.json({
            success: true,
            data: results,
            summary: {
                total: matches.length,
                successful,
                failed
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Bulk calculation error:', error);
        res.status(500).json({
            error: 'Failed to calculate bulk odds',
            message: error.message
        });
    }
});

// Get market trends and analysis
router.get('/market-trends', async (req, res) => {
    try {
        console.log('📈 Fetching market trends...');

        const trends = await calculator.getMarketTrends();

        res.json({
            success: true,
            data: trends,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Market trends error:', error);
        res.status(500).json({
            error: 'Failed to fetch market trends',
            message: error.message
        });
    }
});

// Live odds comparison (simulated)
router.get('/live-comparison', async (req, res) => {
    try {
        const { homeTeam, awayTeam, league } = req.query;
        
        if (!homeTeam || !awayTeam) {
            return res.status(400).json({
                error: 'Missing required parameters: homeTeam and awayTeam'
            });
        }

        console.log(`🔄 Live odds comparison for ${homeTeam} vs ${awayTeam}`);

        // Get our calculated odds
        const ourOdds = await calculator.calculateAdvancedOdds(
            homeTeam, 
            awayTeam, 
            league ? parseInt(league) : 9
        );

        // Simulate market odds (in real app, this would come from betting APIs)
        const marketOdds = {
            bet365: {
                home: ourOdds.homeTeam.odds * (0.95 + Math.random() * 0.1),
                draw: ourOdds.draw.odds * (0.95 + Math.random() * 0.1),
                away: ourOdds.awayTeam.odds * (0.95 + Math.random() * 0.1)
            },
            ladbrokes: {
                home: ourOdds.homeTeam.odds * (0.95 + Math.random() * 0.1),
                draw: ourOdds.draw.odds * (0.95 + Math.random() * 0.1),
                away: ourOdds.awayTeam.odds * (0.95 + Math.random() * 0.1)
            },
            william_hill: {
                home: ourOdds.homeTeam.odds * (0.95 + Math.random() * 0.1),
                draw: ourOdds.draw.odds * (0.95 + Math.random() * 0.1),
                away: ourOdds.awayTeam.odds * (0.95 + Math.random() * 0.1)
            }
        };

        // Calculate value opportunities
        const valueBets = [];
        Object.entries(marketOdds).forEach(([bookmaker, odds]) => {
            if (odds.home > ourOdds.homeTeam.odds * 1.05) {
                valueBets.push({
                    bookmaker,
                    outcome: 'home',
                    marketOdds: Number(odds.home.toFixed(2)),
                    fairOdds: ourOdds.homeTeam.odds,
                    valuePercent: Math.round(((odds.home / ourOdds.homeTeam.odds) - 1) * 100)
                });
            }
            if (odds.away > ourOdds.awayTeam.odds * 1.05) {
                valueBets.push({
                    bookmaker,
                    outcome: 'away',
                    marketOdds: Number(odds.away.toFixed(2)),
                    fairOdds: ourOdds.awayTeam.odds,
                    valuePercent: Math.round(((odds.away / ourOdds.awayTeam.odds) - 1) * 100)
                });
            }
        });

        res.json({
            success: true,
            data: {
                match: {
                    homeTeam: ourOdds.homeTeam.name,
                    awayTeam: ourOdds.awayTeam.name
                },
                ourCalculation: ourOdds,
                marketOdds: Object.fromEntries(
                    Object.entries(marketOdds).map(([book, odds]) => [
                        book,
                        {
                            home: Number(odds.home.toFixed(2)),
                            draw: Number(odds.draw.toFixed(2)),
                            away: Number(odds.away.toFixed(2))
                        }
                    ])
                ),
                valueBets,
                recommendation: valueBets.length > 0 ? 
                    `Found ${valueBets.length} value betting opportunities` :
                    'No significant value opportunities detected'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Live comparison error:', error);
        res.status(500).json({
            error: 'Failed to generate live comparison',
            message: error.message
        });
    }
});

// Get odds history for a specific matchup
router.get('/history', async (req, res) => {
    try {
        const { homeTeam, awayTeam, limit = 10 } = req.query;

        if (!homeTeam || !awayTeam) {
            return res.status(400).json({
                error: 'Missing required parameters: homeTeam and awayTeam'
            });
        }

        console.log(`📜 Fetching odds history for ${homeTeam} vs ${awayTeam}`);

        // This would typically query the database for historical odds
        // For now, return a simulated history
        const history = Array.from({ length: parseInt(limit) }, (_, i) => ({
            id: i + 1,
            date: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            homeTeam,
            awayTeam,
            odds: {
                home: Number((2.0 + Math.random() * 2).toFixed(2)),
                draw: Number((3.0 + Math.random() * 1.5).toFixed(2)),
                away: Number((2.0 + Math.random() * 2).toFixed(2))
            },
            confidence: Math.round(60 + Math.random() * 30),
            algorithm: i < 5 ? 'Advanced Statistical Model v2.0' : 'Basic Model v1.0'
        }));

        res.json({
            success: true,
            data: {
                matchup: `${homeTeam} vs ${awayTeam}`,
                history,
                trends: {
                    avgHomeOdds: Number((history.reduce((sum, h) => sum + h.odds.home, 0) / history.length).toFixed(2)),
                    avgDrawOdds: Number((history.reduce((sum, h) => sum + h.odds.draw, 0) / history.length).toFixed(2)),
                    avgAwayOdds: Number((history.reduce((sum, h) => sum + h.odds.away, 0) / history.length).toFixed(2)),
                    avgConfidence: Math.round(history.reduce((sum, h) => sum + h.confidence, 0) / history.length)
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Odds history error:', error);
        res.status(500).json({
            error: 'Failed to fetch odds history',
            message: error.message
        });
    }
});

// Get odds for specific fixtures
router.get('/fixtures/:fixtureId', async (req, res) => {
    try {
        const { fixtureId } = req.params;
        const cache = req.app.locals.cache;
        const cacheKey = `fixture_odds_${fixtureId}`;
        
        // Check cache first
        const cachedOdds = cache.get(cacheKey);
        if (cachedOdds) {
            return res.json({
                success: true,
                data: cachedOdds,
                cached: true,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`🎯 Fetching odds for fixture ${fixtureId}`);

        // Try to fetch real odds using the odds calculator
        try {
            const calculateOdds = require('../services/oddsCalculator');
            const oddsResult = await calculateOdds.calculateMatchOdds(fixtureId);
            
            if (oddsResult && oddsResult.success) {
                // Cache for 5 minutes
                cache.set(cacheKey, oddsResult.data, 300);
                
                return res.json({
                    success: true,
                    data: oddsResult.data,
                    cached: false,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error fetching calculated odds:', error.message);
        }

        // If odds calculation fails, return error instead of mock data
        return res.status(503).json({
            success: false,
            error: 'Odds calculation service unavailable',
            message: 'Unable to calculate real-time odds for this fixture',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Fixture odds error:', error);
        res.status(500).json({
            error: 'Failed to fetch fixture odds',
            message: error.message
        });
    }
});

// Get live odds for multiple fixtures
router.post('/live-odds', async (req, res) => {
    try {
        const { fixtureIds } = req.body;
        
        if (!fixtureIds || !Array.isArray(fixtureIds)) {
            return res.status(400).json({
                error: 'Invalid request: fixtureIds array required'
            });
        }

        console.log(`🔄 Fetching live odds for ${fixtureIds.length} fixtures`);

        const results = await Promise.all(
            fixtureIds.map(async (fixtureId) => {
                try {
                    const calculateOdds = require('../services/oddsCalculator');
                    const oddsResult = await calculateOdds.calculateMatchOdds(fixtureId);
                    
                    if (oddsResult && oddsResult.success) {
                        return {
                            fixtureId: parseInt(fixtureId),
                            odds: oddsResult.data,
                            status: 'success'
                        };
                    } else {
                        throw new Error('Failed to calculate odds');
                    }
                } catch (error) {
                    return {
                        fixtureId: parseInt(fixtureId),
                        error: error.message,
                        status: 'failed'
                    };
                }
            })
        );

        const successful = results.filter(r => r.status === 'success').length;
        const failed = results.filter(r => r.status === 'failed').length;

        res.json({
            success: true,
            data: results,
            summary: {
                total: fixtureIds.length,
                successful,
                failed
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Live odds error:', error);
        res.status(500).json({
            error: 'Failed to fetch live odds',
            message: error.message
        });
    }
});

// Health check with database status
router.get('/status', async (req, res) => {
  try {
    const cache = req.app.locals.cache;
    
    // Test database connection
    const dbTest = await dbGet('SELECT COUNT(*) as count FROM odds_history');
    
    res.json({
      status: 'healthy',
      service: 'odds-service',
      database: {
        connected: true,
        total_calculations: dbTest.count
      },
      cache: {
        keys: cache.keys().length,
        stats: cache.getStats()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'odds-service',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 