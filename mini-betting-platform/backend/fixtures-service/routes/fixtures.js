const express = require('express');
const axios = require('axios');
const Fixture = require('../models/Fixture');
const router = express.Router();

// Get all fixtures
router.get('/', async (req, res) => {
  try {
    const { status, league, limit = 50, page = 1, sort = 'date' } = req.query;

    console.log('Getting fixtures with filters:', { status, league, limit, page });

    // Build query
    const query = {};
    if (status && ['upcoming', 'live', 'finished', 'postponed', 'cancelled'].includes(status)) {
      query.status = status;
    }
    if (league) {
      query.league = new RegExp(league, 'i');
    }

    // Build sort object
    let sortObject = {};
    switch (sort) {
      case 'date':
        sortObject = { date: 1 };
        break;
      case '-date':
        sortObject = { date: -1 };
        break;
      case 'league':
        sortObject = { league: 1, date: 1 };
        break;
      default:
        sortObject = { date: 1 };
    }

    // Get fixtures with pagination
    const fixtures = await Fixture.find(query)
      .sort(sortObject)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalFixtures = await Fixture.countDocuments(query);

    console.log(`Found ${fixtures.length} fixtures`);

    res.json({
      success: true,
      fixtures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFixtures,
        pages: Math.ceil(totalFixtures / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get fixtures error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fixtures',
      error: error.message
    });
  }
});

// Get specific fixture by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Getting fixture:', id);

    const fixture = await Fixture.findById(id);

    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }

    res.json({
      success: true,
      fixture
    });

  } catch (error) {
    console.error('Get fixture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fixture',
      error: error.message
    });
  }
});

// Refresh fixtures from external API
router.get('/refresh', async (req, res) => {
  try {
    console.log('Refreshing fixtures from external API');

    // This is a demo of external API integration
    // In production, you would call a real football API
    let newFixtures = [];
    
    if (process.env.FOOTBALL_API_KEY && process.env.FOOTBALL_API_URL) {
      try {
        // Example: Fetch from Football API
        const response = await axios.get(`${process.env.FOOTBALL_API_URL}/matches`, {
          headers: {
            'X-Auth-Token': process.env.FOOTBALL_API_KEY
          }
        });
        
        // Process API response (this would depend on the API format)
        const apiFixtures = response.data.matches || [];
        newFixtures = apiFixtures.slice(0, 10).map(match => ({
          externalId: match.id.toString(),
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          league: match.competition.name,
          date: new Date(match.utcDate),
          status: mapApiStatusToLocal(match.status),
          homeScore: match.score.fullTime.homeTeam,
          awayScore: match.score.fullTime.awayTeam,
          dataSource: 'external-api'
        }));
      } catch (apiError) {
        console.log('External API call failed, using demo data:', apiError.message);
        newFixtures = generateDemoFixtures();
      }
    } else {
      console.log('No external API configured, using demo data');
      newFixtures = generateDemoFixtures();
    }

    // Save new fixtures to database
    let savedCount = 0;
    for (const fixtureData of newFixtures) {
      try {
        await Fixture.findOneAndUpdate(
          { externalId: fixtureData.externalId },
          fixtureData,
          { upsert: true, new: true }
        );
        savedCount++;
      } catch (saveError) {
        console.error('Failed to save fixture:', saveError.message);
      }
    }

    console.log(`Refreshed ${savedCount} fixtures`);

    res.json({
      success: true,
      message: `Successfully refreshed ${savedCount} fixtures`,
      count: savedCount
    });

  } catch (error) {
    console.error('Refresh fixtures error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh fixtures',
      error: error.message
    });
  }
});

// Get leagues
router.get('/leagues', async (req, res) => {
  try {
    console.log('Getting available leagues');

    const leagues = await Fixture.distinct('league');

    res.json({
      success: true,
      leagues: leagues.sort()
    });

  } catch (error) {
    console.error('Get leagues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leagues',
      error: error.message
    });
  }
});

// Helper function to map external API status to local status
function mapApiStatusToLocal(apiStatus) {
  const statusMap = {
    'SCHEDULED': 'upcoming',
    'LIVE': 'live',
    'IN_PLAY': 'live',
    'FINISHED': 'finished',
    'POSTPONED': 'postponed',
    'CANCELLED': 'cancelled'
  };
  
  return statusMap[apiStatus] || 'upcoming';
}

// Generate demo fixtures for testing
function generateDemoFixtures() {
  const teams = [
    'Arsenal', 'Chelsea', 'Liverpool', 'Manchester United', 'Manchester City',
    'Tottenham', 'Newcastle', 'Brighton', 'West Ham', 'Everton',
    'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia',
    'Bayern Munich', 'Dortmund', 'Leipzig', 'Frankfurt', 'Bayer Leverkusen'
  ];
  
  const leagues = [
    'Premier League',
    'La Liga',
    'Bundesliga',
    'Champions League',
    'Europa League'
  ];

  const fixtures = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const homeTeam = teams[Math.floor(Math.random() * teams.length)];
    let awayTeam = teams[Math.floor(Math.random() * teams.length)];
    
    // Ensure home and away teams are different
    while (awayTeam === homeTeam) {
      awayTeam = teams[Math.floor(Math.random() * teams.length)];
    }

    const league = leagues[Math.floor(Math.random() * leagues.length)];
    const daysOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
    const matchDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);

    let status = 'upcoming';
    if (daysOffset < -1) {
      status = 'finished';
    } else if (daysOffset === 0 && Math.random() < 0.2) {
      status = 'live';
    }

    const fixture = {
      externalId: `demo-${i}-${Date.now()}`,
      homeTeam,
      awayTeam,
      league,
      date: matchDate,
      status,
      homeScore: status === 'finished' ? Math.floor(Math.random() * 4) : null,
      awayScore: status === 'finished' ? Math.floor(Math.random() * 4) : null,
      odds: {
        home: +(1.5 + Math.random() * 3).toFixed(2),
        draw: +(2.5 + Math.random() * 2).toFixed(2),
        away: +(1.5 + Math.random() * 3).toFixed(2)
      },
      venue: {
        name: `${homeTeam} Stadium`,
        city: 'London'
      },
      dataSource: 'demo'
    };

    fixtures.push(fixture);
  }

  return fixtures;
}

module.exports = router;
