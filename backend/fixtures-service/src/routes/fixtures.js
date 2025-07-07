const express = require('express');
const axios = require('axios');
const { apiLimiter, cache, logApi } = require('../middleware/logger');

const router = express.Router();

// Configuration
const BASE_URL = 'https://v3.football.api-sports.io';
const FBREF_BASE_URL = 'https://fbref.com';
const API_KEY = process.env.API_FOOTBALL_KEY;

// Build headers that work for BOTH the direct API-Football endpoint and RapidAPI proxy
const apiHeaders = {
  'X-RapidAPI-Key': API_KEY,           // <— used when hitting RapidAPI host
  'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'v3.football.api-sports.io',
  // Direct (non-RapidAPI) header expected by api-sports.io
  'x-apisports-key': API_KEY
};

// Cache for 5 minutes for live matches, 30 minutes for others
const LIVE_CACHE_DURATION = 5 * 60 * 1000;
const REGULAR_CACHE_DURATION = 30 * 60 * 1000;

// Competition priorities (higher number = higher priority)
const COMPETITION_PRIORITIES = {
  // Top European Leagues
  'Premier League': 10,
  'La Liga': 9,
  'Bundesliga': 8,
  'Serie A': 7,
  'Ligue 1': 6,
  'Eredivisie': 5,
  'Primeira Liga': 4,
  
  // European Competitions
  'UEFA Champions League': 15,
  'UEFA Europa League': 12,
  'UEFA Europa Conference League': 8,
  'FIFA Club World Cup': 20,
  'Club World Cup': 20,
  
  // Major International
  'World Cup': 25,
  'European Championship': 20,
  'Copa America': 18,
  'AFC Asian Cup': 15,
  'Africa Cup of Nations': 15,
  
  // Other Major Leagues
  'MLS': 3,
  'Championship': 4,
  'Serie B': 3,
  'La Liga 2': 3,
  'Brasileirão': 6,
  'J1 League': 4,
  'A-League': 2,
  'Liga MX': 5
};

// Helper function to calculate team statistics and odds using FBRef data
async function calculateStatisticalOdds(homeTeam, awayTeam, league) {
  try {
    logApi(`📊 Calculating statistical odds for ${homeTeam} vs ${awayTeam}`);
    
    // Simulate FBRef statistics (in real implementation, you'd scrape FBRef)
    const stats = await getTeamStatistics(homeTeam, awayTeam, league);
    
    // Calculate odds based on various statistical factors
    const homeWinProbability = calculateWinProbability(stats.home, stats.away, true);
    const awayWinProbability = calculateWinProbability(stats.away, stats.home, false);
    const drawProbability = 1 - homeWinProbability - awayWinProbability;
    
    // Convert probabilities to odds (with bookmaker margin)
    const margin = 0.05; // 5% bookmaker margin
    const adjustedHome = homeWinProbability * (1 - margin);
    const adjustedAway = awayWinProbability * (1 - margin);
    const adjustedDraw = drawProbability * (1 - margin);
    
    return {
      homeWin: parseFloat((1 / adjustedHome).toFixed(2)),
      draw: parseFloat((1 / adjustedDraw).toFixed(2)),
      awayWin: parseFloat((1 / adjustedAway).toFixed(2)),
      confidence: calculateConfidence(stats),
      stats: {
        home: stats.home,
        away: stats.away,
        factors: stats.factors
      }
    };
  } catch (error) {
    logApi(`❌ Error calculating statistical odds: ${error.message}`);
    // Return default odds if calculation fails
    return {
      homeWin: 2.10,
      draw: 3.20,
      awayWin: 3.40,
      confidence: 'low',
      stats: null
    };
  }
}

// Simulate getting team statistics (replace with actual FBRef scraping)
async function getTeamStatistics(homeTeam, awayTeam, league) {
  // This would normally scrape FBRef for real statistics
  // For now, we'll simulate realistic data based on team quality
  
  const teamRatings = getTeamRating(homeTeam, awayTeam, league);
  
  return {
    home: {
      name: homeTeam,
      rating: teamRatings.home,
      goalsPerGame: Math.max(0.5, teamRatings.home * 0.03 + Math.random() * 0.5),
      goalsAgainstPerGame: Math.max(0.3, (10 - teamRatings.home) * 0.02 + Math.random() * 0.3),
      form: generateFormRating(teamRatings.home),
      homeAdvantage: 0.15, // 15% home advantage
      injuries: Math.floor(Math.random() * 3),
      recentForm: generateRecentResults(teamRatings.home)
    },
    away: {
      name: awayTeam,
      rating: teamRatings.away,
      goalsPerGame: Math.max(0.5, teamRatings.away * 0.03 + Math.random() * 0.5),
      goalsAgainstPerGame: Math.max(0.3, (10 - teamRatings.away) * 0.02 + Math.random() * 0.3),
      form: generateFormRating(teamRatings.away),
      homeAdvantage: -0.05, // Slight away disadvantage
      injuries: Math.floor(Math.random() * 3),
      recentForm: generateRecentResults(teamRatings.away)
    },
    factors: {
      headToHead: generateHeadToHead(),
      leaguePosition: getLeaguePosition(homeTeam, awayTeam, league),
      motivation: calculateMotivation(league)
    }
  };
}

// Get team rating based on known team quality
function getTeamRating(homeTeam, awayTeam, league) {
  const premierLeagueRatings = {
    'Manchester City': 9.5, 'Arsenal': 8.8, 'Liverpool': 8.7, 'Chelsea': 8.2,
    'Manchester United': 7.8, 'Tottenham': 7.5, 'Newcastle': 7.2, 'Brighton': 6.8,
    'Aston Villa': 6.5, 'West Ham': 6.2, 'Crystal Palace': 5.8, 'Fulham': 5.5,
    'Wolves': 5.2, 'Everton': 4.8, 'Brentford': 5.0, 'Nottingham Forest': 4.5,
    'Sheffield United': 3.8, 'Burnley': 3.5, 'Luton': 3.2, 'Bournemouth': 5.3
  };
  
  const laLigaRatings = {
    'Real Madrid': 9.8, 'Barcelona': 9.2, 'Atletico Madrid': 8.5, 'Sevilla': 7.8,
    'Real Sociedad': 7.2, 'Villarreal': 7.0, 'Real Betis': 6.8, 'Valencia': 6.5,
    'Athletic Club': 6.2, 'Osasuna': 5.5, 'Getafe': 5.2, 'Las Palmas': 4.8
  };
  
  const otherLeagueDefault = 6.0;
  
  let homeRating, awayRating;
  
  if (league?.includes('Premier')) {
    homeRating = premierLeagueRatings[homeTeam] || otherLeagueDefault;
    awayRating = premierLeagueRatings[awayTeam] || otherLeagueDefault;
  } else if (league?.includes('La Liga')) {
    homeRating = laLigaRatings[homeTeam] || otherLeagueDefault;
    awayRating = laLigaRatings[awayTeam] || otherLeagueDefault;
  } else {
    // For other leagues, generate based on team name patterns
    homeRating = generateRatingFromName(homeTeam);
    awayRating = generateRatingFromName(awayTeam);
  }
  
  return { home: homeRating, away: awayRating };
}

function generateRatingFromName(teamName) {
  // Generate pseudo-random but consistent ratings based on team name
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = ((hash << 5) - hash + teamName.charCodeAt(i)) & 0xffffffff;
  }
  // Convert to rating between 3.0 and 8.0
  return 3.0 + (Math.abs(hash) % 500) / 100;
}

function generateFormRating(teamRating) {
  // Form slightly influenced by team rating with random variation
  return Math.max(1, Math.min(10, teamRating + (Math.random() - 0.5) * 2));
}

function generateRecentResults(teamRating) {
  const results = [];
  for (let i = 0; i < 5; i++) {
    const random = Math.random();
    const winChance = teamRating / 12; // Higher rated teams win more
    if (random < winChance) {
      results.push('W');
    } else if (random < winChance + 0.25) {
      results.push('D');
    } else {
      results.push('L');
    }
  }
  return results;
}

function generateHeadToHead() {
  return {
    wins: Math.floor(Math.random() * 5),
    draws: Math.floor(Math.random() * 3),
    losses: Math.floor(Math.random() * 5)
  };
}

function getLeaguePosition(homeTeam, awayTeam, league) {
  return {
    home: Math.floor(Math.random() * 20) + 1,
    away: Math.floor(Math.random() * 20) + 1
  };
}

function calculateMotivation(league) {
  const highMotivation = ['Champions League', 'World Cup', 'European Championship'];
  if (highMotivation.some(comp => league?.includes(comp))) {
    return 'high';
  }
  return 'medium';
}

function calculateWinProbability(teamStats, opponentStats, isHome) {
  let probability = 0.3; // Base probability
  
  // Rating difference impact
  const ratingDiff = teamStats.rating - opponentStats.rating;
  probability += ratingDiff * 0.05;
  
  // Form impact
  probability += (teamStats.form - 5) * 0.02;
  
  // Home advantage
  if (isHome) {
    probability += teamStats.homeAdvantage;
  }
  
  // Goals impact
  const goalDiff = teamStats.goalsPerGame - opponentStats.goalsAgainstPerGame;
  probability += goalDiff * 0.1;
  
  // Recent form
  const wins = teamStats.recentForm.filter(r => r === 'W').length;
  probability += (wins - 2.5) * 0.02;
  
  return Math.max(0.05, Math.min(0.85, probability));
}

function calculateConfidence(stats) {
  const homeDiff = Math.abs(stats.home.rating - stats.away.rating);
  if (homeDiff > 2.0) return 'high';
  if (homeDiff > 1.0) return 'medium';
  return 'low';
}

// Helper function to sort competitions by importance
function sortByCompetition(fixtures) {
  return fixtures.sort((a, b) => {
    const aPriority = COMPETITION_PRIORITIES[a.league?.name] || 0;
    const bPriority = COMPETITION_PRIORITIES[b.league?.name] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // If same priority, sort by status (live first, then by date)
    if (a.fixture?.status?.short === 'LIVE' && b.fixture?.status?.short !== 'LIVE') {
      return -1;
    }
    if (b.fixture?.status?.short === 'LIVE' && a.fixture?.status?.short !== 'LIVE') {
      return 1;
    }
    
    // Sort by date
    return new Date(a.fixture?.date) - new Date(b.fixture?.date);
  });
}

// Group fixtures by competition
function groupByCompetition(fixtures) {
  const grouped = {};
  
  fixtures.forEach(fixture => {
    const leagueName = fixture.league?.name || 'Other';
    if (!grouped[leagueName]) {
      grouped[leagueName] = {
        league: fixture.league,
        priority: COMPETITION_PRIORITIES[leagueName] || 0,
        fixtures: []
      };
    }
    grouped[leagueName].fixtures.push(fixture);
  });
  
  // Sort groups by priority
  const sortedGroups = Object.entries(grouped)
    .sort(([, a], [, b]) => b.priority - a.priority)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  return sortedGroups;
}

// Generate fake live matches for demo purposes when no real matches are available
function generateFakeLiveMatches() {
  const now = Date.now();
  
  return [
    {
      fixture: {
        id: 9001,
        referee: "Anthony Taylor",
        timezone: "UTC",
        date: new Date(now - 2700000).toISOString(), // Started 45 mins ago
        timestamp: now - 2700000,
        periods: { first: now - 2700000, second: now - 900000 },
        venue: { id: 494, name: "Emirates Stadium", city: "London" },
        status: { long: "Second Half", short: "2H", elapsed: 72 }
      },
      league: {
        id: 39,
        name: "Premier League",
        country: "England",
        logo: "https://media.api-sports.io/football/leagues/39.png",
        flag: "https://media.api-sports.io/flags/gb.svg",
        season: 2024,
        round: "Regular Season - 22"
      },
      teams: {
        home: {
          id: 42,
          name: "Arsenal",
          logo: "https://media.api-sports.io/football/teams/42.png",
          winner: true
        },
        away: {
          id: 47,
          name: "Tottenham",
          logo: "https://media.api-sports.io/football/teams/47.png",
          winner: false
        }
      },
      goals: { home: 3, away: 1 },
      score: {
        halftime: { home: 2, away: 0 },
        fulltime: { home: null, away: null },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      },
      events: [
        {
          time: { elapsed: 12, extra: null },
          team: { id: 42, name: "Arsenal" },
          player: { id: 1460, name: "B. Saka" },
          assist: { id: 1461, name: "M. Ødegaard" },
          type: "Goal",
          detail: "Normal Goal"
        },
        {
          time: { elapsed: 28, extra: null },
          team: { id: 42, name: "Arsenal" },
          player: { id: 1463, name: "G. Jesus" },
          assist: { id: 1464, name: "K. Havertz" },
          type: "Goal",
          detail: "Normal Goal"
        },
        {
          time: { elapsed: 51, extra: null },
          team: { id: 47, name: "Tottenham" },
          player: { id: 1465, name: "H. Kane" },
          assist: { id: null, name: null },
          type: "Goal",
          detail: "Penalty"
        },
        {
          time: { elapsed: 68, extra: null },
          team: { id: 42, name: "Arsenal" },
          player: { id: 1461, name: "M. Ødegaard" },
          assist: { id: 1460, name: "B. Saka" },
          type: "Goal",
          detail: "Normal Goal"
        }
      ],
      isFakeMatch: true
    },
    {
      fixture: {
        id: 9002,
        referee: "Daniele Orsato",
        timezone: "UTC",
        date: new Date(now - 1800000).toISOString(), // Started 30 mins ago
        timestamp: now - 1800000,
        periods: { first: now - 1800000, second: null },
        venue: { id: 909, name: "Stadio Giuseppe Meazza", city: "Milano" },
        status: { long: "First Half", short: "1H", elapsed: 33 }
      },
      league: {
        id: 135,
        name: "Serie A",
        country: "Italy",
        logo: "https://media.api-sports.io/football/leagues/135.png",
        flag: "https://media.api-sports.io/flags/it.svg",
        season: 2024,
        round: "Regular Season - 18"
      },
      teams: {
        home: {
          id: 505,
          name: "Inter",
          logo: "https://media.api-sports.io/football/teams/505.png",
          winner: null
        },
        away: {
          id: 489,
          name: "AC Milan",
          logo: "https://media.api-sports.io/football/teams/489.png",
          winner: null
        }
      },
      goals: { home: 1, away: 0 },
      score: {
        halftime: { home: null, away: null },
        fulltime: { home: null, away: null },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      },
      events: [
        {
          time: { elapsed: 18, extra: null },
          team: { id: 505, name: "Inter" },
          player: { id: 1470, name: "L. Martínez" },
          assist: { id: 1471, name: "N. Barella" },
          type: "Goal",
          detail: "Normal Goal"
        }
      ],
      isFakeMatch: true
    },
    {
      fixture: {
        id: 9003,
        referee: "Clément Turpin",
        timezone: "UTC",
        date: new Date(now - 600000).toISOString(), // Started 10 mins ago
        timestamp: now - 600000,
        periods: { first: now - 600000, second: null },
        venue: { id: 671, name: "Parc des Princes", city: "Paris" },
        status: { long: "First Half", short: "1H", elapsed: 12 }
      },
      league: {
        id: 61,
        name: "Ligue 1",
        country: "France",
        logo: "https://media.api-sports.io/football/leagues/61.png",
        flag: "https://media.api-sports.io/flags/fr.svg",
        season: 2024,
        round: "Regular Season - 20"
      },
      teams: {
        home: {
          id: 85,
          name: "Paris Saint Germain",
          logo: "https://media.api-sports.io/football/teams/85.png",
          winner: null
        },
        away: {
          id: 80,
          name: "Lyon",
          logo: "https://media.api-sports.io/football/teams/80.png",
          winner: null
        }
      },
      goals: { home: 0, away: 0 },
      score: {
        halftime: { home: null, away: null },
        fulltime: { home: null, away: null },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      },
      events: [],
      isFakeMatch: true
    },
    {
      fixture: {
        id: 9004,
        referee: "Slavko Vincic",
        timezone: "UTC",
        date: new Date(now - 3300000).toISOString(), // Started 55 mins ago
        timestamp: now - 3300000,
        periods: { first: now - 3300000, second: now - 900000 },
        venue: { id: 1456, name: "Santiago Bernabéu", city: "Madrid" },
        status: { long: "Second Half", short: "2H", elapsed: 82 }
      },
      league: {
        id: 2,
        name: "UEFA Champions League",
        country: "World",
        logo: "https://media.api-sports.io/football/leagues/2.png",
        flag: null,
        season: 2024,
        round: "Quarter-finals"
      },
      teams: {
        home: {
          id: 541,
          name: "Real Madrid",
          logo: "https://media.api-sports.io/football/teams/541.png",
          winner: true
        },
        away: {
          id: 50,
          name: "Manchester City",
          logo: "https://media.api-sports.io/football/teams/50.png",
          winner: false
        }
      },
      goals: { home: 2, away: 1 },
      score: {
        halftime: { home: 0, away: 1 },
        fulltime: { home: null, away: null },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      },
      events: [
        {
          time: { elapsed: 23, extra: null },
          team: { id: 50, name: "Manchester City" },
          player: { id: 1480, name: "E. Haaland" },
          assist: { id: 1481, name: "K. De Bruyne" },
          type: "Goal",
          detail: "Normal Goal"
        },
        {
          time: { elapsed: 64, extra: null },
          team: { id: 541, name: "Real Madrid" },
          player: { id: 1482, name: "Vinícius Jr." },
          assist: { id: 1483, name: "L. Modrić" },
          type: "Goal",
          detail: "Normal Goal"
        },
        {
          time: { elapsed: 79, extra: null },
          team: { id: 541, name: "Real Madrid" },
          player: { id: 1484, name: "K. Benzema" },
          assist: { id: 1485, name: "T. Kroos" },
          type: "Goal",
          detail: "Normal Goal"
        }
      ],
      isFakeMatch: true
    }
  ];
}

// Helper function to make API calls
async function makeApiCall(endpoint, params = {}) {
  try {
    logApi(`🌐 API call to: ${endpoint}`);
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: apiHeaders,
      params: params,
      timeout: 10000
    });

    // API-Football returns { errors: { requests: "..." } } when quota reached.
    if (response.data?.errors && Object.keys(response.data.errors).length > 0) {
      const firstError = Object.values(response.data.errors)[0];
      return {
        success: false,
        error: firstError,
        status: 429
      };
    }

    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.message,
      status: error.response?.status || 500
    };
  }
}

// LIVE GAMES ROUTE WITH COMPETITION SORTING AND STATISTICAL ODDS
router.get('/live-now', apiLimiter, async (req, res) => {
  logApi('🔴 [FIXTURES] GET /live-now - FETCHING LIVE GAMES WITH STATISTICAL ODDS!');
  
  try {
    const cacheKey = 'live-now-with-odds';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      logApi('📦 Returning cached live games with odds');
      return res.json(cachedData);
    }

    // Get all live matches happening RIGHT NOW
    const result = await makeApiCall('/fixtures', { live: 'all' });
    
    if (!result.success) {
      // Return placeholder live data when API is unavailable
      logApi('⚠️  API unavailable, returning placeholder live fixtures');
      
      const placeholderLiveFixtures = [
        {
          fixture: {
            id: 2001,
            referee: "Anthony Taylor",
            timezone: "UTC",
            date: new Date(Date.now() - 3000000).toISOString(), // Started 50 mins ago
            timestamp: Date.now() - 3000000,
            periods: { first: 1630000000, second: null },
            venue: { id: 494, name: "Emirates Stadium", city: "London" },
            status: { long: "Second Half", short: "2H", elapsed: 65 }
          },
          league: {
            id: 39,
            name: "Premier League",
            country: "England",
            logo: "https://media.api-sports.io/football/leagues/39.png",
            flag: "https://media.api-sports.io/flags/gb.svg",
            season: 2023,
            round: "Regular Season - 20"
          },
          teams: {
            home: {
              id: 42,
              name: "Arsenal",
              logo: "https://media.api-sports.io/football/teams/42.png",
              winner: true
            },
            away: {
              id: 49,
              name: "Chelsea",
              logo: "https://media.api-sports.io/football/teams/49.png",
              winner: false
            }
          },
          goals: { home: 2, away: 1 },
          score: {
            halftime: { home: 1, away: 0 },
            fulltime: { home: null, away: null },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null }
          },
          events: [
            {
              time: { elapsed: 15, extra: null },
              team: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
              player: { id: 1460, name: "B. Saka" },
              assist: { id: 1461, name: "M. Odegaard" },
              type: "Goal",
              detail: "Normal Goal",
              comments: null
            },
            {
              time: { elapsed: 38, extra: null },
              team: { id: 49, name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
              player: { id: 1462, name: "C. Palmer" },
              assist: { id: null, name: null },
              type: "Goal",
              detail: "Penalty",
              comments: null
            },
            {
              time: { elapsed: 52, extra: null },
              team: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
              player: { id: 1463, name: "G. Jesus" },
              assist: { id: 1464, name: "K. Havertz" },
              type: "Goal",
              detail: "Normal Goal",
              comments: null
            }
          ]
        },
        {
          fixture: {
            id: 2002,
            referee: "Daniele Orsato",
            timezone: "UTC",
            date: new Date(Date.now() - 1200000).toISOString(), // Started 20 mins ago
            timestamp: Date.now() - 1200000,
            periods: { first: null, second: null },
            venue: { id: 909, name: "Stadio Giuseppe Meazza", city: "Milano" },
            status: { long: "First Half", short: "1H", elapsed: 20 }
          },
          league: {
            id: 135,
            name: "Serie A",
            country: "Italy",
            logo: "https://media.api-sports.io/football/leagues/135.png",
            flag: "https://media.api-sports.io/flags/it.svg",
            season: 2023,
            round: "Regular Season - 16"
          },
          teams: {
            home: {
              id: 505,
              name: "Inter",
              logo: "https://media.api-sports.io/football/teams/505.png",
              winner: null
            },
            away: {
              id: 489,
              name: "AC Milan",
              logo: "https://media.api-sports.io/football/teams/489.png",
              winner: null
            }
          },
          goals: { home: 0, away: 0 },
          score: {
            halftime: { home: null, away: null },
            fulltime: { home: null, away: null },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null }
          },
          events: []
        }
      ];
      
      // Add statistical odds to placeholder fixtures
      const fixturesWithOdds = await Promise.all(
        placeholderLiveFixtures.map(async (fixture) => {
          const homeTeam = fixture.teams?.home?.name;
          const awayTeam = fixture.teams?.away?.name;
          const league = fixture.league?.name;
          
          if (homeTeam && awayTeam) {
            const odds = await calculateStatisticalOdds(homeTeam, awayTeam, league);
            return {
              ...fixture,
              calculatedOdds: odds
            };
          }
          
          return fixture;
        })
      );
      
      const groupedFixtures = groupByCompetition(fixturesWithOdds);
      
      const placeholderData = {
        success: true,
        count: fixturesWithOdds.length,
        fixtures: fixturesWithOdds,
        groupedByCompetition: groupedFixtures,
        sortedByImportance: true,
        oddsCalculation: 'statistical',
        timestamp: new Date().toISOString(),
        isPlaceholder: true,
        message: 'Using placeholder live data due to API rate limit'
      };
      
      // Cache placeholder data for very short duration
      cache.set(cacheKey, placeholderData, 2 * 60); // 2 minutes for live data
      
      return res.json(placeholderData);
    }

    let fixtures = result.data.response || [];
    
    // If no live matches found, add fake matches for demo purposes
    if (fixtures.length === 0) {
      logApi('🎭 No live matches found, generating fake matches for demo');
      fixtures = generateFakeLiveMatches();
    }
    
    // Sort by competition importance
    fixtures = sortByCompetition(fixtures);
    
    // Add statistical odds to each fixture
    const fixturesWithOdds = await Promise.all(
      fixtures.map(async (fixture) => {
        const homeTeam = fixture.teams?.home?.name;
        const awayTeam = fixture.teams?.away?.name;
        const league = fixture.league?.name;
        
        if (homeTeam && awayTeam) {
          const odds = await calculateStatisticalOdds(homeTeam, awayTeam, league);
          return {
            ...fixture,
            calculatedOdds: odds
          };
        }
        
        return fixture;
      })
    );
    
    // Group by competition
    const groupedFixtures = groupByCompetition(fixturesWithOdds);

    const liveData = {
      success: true,
      count: fixtures.length,
      fixtures: fixturesWithOdds,
      groupedByCompetition: groupedFixtures,
      sortedByImportance: true,
      oddsCalculation: 'statistical',
      timestamp: new Date().toISOString(),
      isFakeData: fixtures.length > 0 && fixtures[0].isFakeMatch
    };

    // Cache for only 5 minutes since these are live games
    cache.set(cacheKey, liveData, LIVE_CACHE_DURATION);
    
    logApi(`✅ [FIXTURES] Found ${fixtures.length} LIVE games with statistical odds!`);
    res.json(liveData);
    
  } catch (error) {
    console.error('Live games fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching live games'
    });
  }
});

// TODAY'S GAMES WITH STATISTICAL ODDS AND COMPETITION SORTING
router.get('/today', apiLimiter, async (req, res) => {
  logApi('📅 [FIXTURES] GET /today - FETCHING TODAY\'S GAMES WITH STATISTICAL ODDS');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `today-odds-${today}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      logApi('📦 Returning cached today games with odds');
      return res.json(cachedData);
    }

    const result = await makeApiCall('/fixtures', { date: today });
    
    if (!result.success) {
      // Return placeholder data when API is unavailable
      logApi('⚠️  API unavailable, returning placeholder fixtures');
      
      const placeholderFixtures = [
        {
          fixture: {
            id: 1001,
            referee: "Michael Oliver",
            timezone: "UTC",
            date: new Date(Date.now() + 3600000).toISOString(),
            timestamp: Date.now() + 3600000,
            periods: { first: null, second: null },
            venue: { id: 556, name: "Old Trafford", city: "Manchester" },
            status: { long: "Not Started", short: "NS", elapsed: null }
          },
          league: {
            id: 39,
            name: "Premier League",
            country: "England",
            logo: "https://media.api-sports.io/football/leagues/39.png",
            flag: "https://media.api-sports.io/flags/gb.svg",
            season: 2023,
            round: "Regular Season - 20"
          },
          teams: {
            home: {
              id: 33,
              name: "Manchester United",
              logo: "https://media.api-sports.io/football/teams/33.png",
              winner: null
            },
            away: {
              id: 40,
              name: "Liverpool",
              logo: "https://media.api-sports.io/football/teams/40.png",
              winner: null
            }
          },
          goals: { home: null, away: null },
          score: {
            halftime: { home: null, away: null },
            fulltime: { home: null, away: null },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null }
          }
        },
        {
          fixture: {
            id: 1002,
            referee: "Antonio Mateu",
            timezone: "UTC",
            date: new Date(Date.now() + 7200000).toISOString(),
            timestamp: Date.now() + 7200000,
            periods: { first: null, second: null },
            venue: { id: 1456, name: "Santiago Bernabéu", city: "Madrid" },
            status: { long: "Not Started", short: "NS", elapsed: null }
          },
          league: {
            id: 140,
            name: "La Liga",
            country: "Spain",
            logo: "https://media.api-sports.io/football/leagues/140.png",
            flag: "https://media.api-sports.io/flags/es.svg",
            season: 2023,
            round: "Regular Season - 18"
          },
          teams: {
            home: {
              id: 541,
              name: "Real Madrid",
              logo: "https://media.api-sports.io/football/teams/541.png",
              winner: null
            },
            away: {
              id: 529,
              name: "Barcelona",
              logo: "https://media.api-sports.io/football/teams/529.png",
              winner: null
            }
          },
          goals: { home: null, away: null },
          score: {
            halftime: { home: null, away: null },
            fulltime: { home: null, away: null },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null }
          }
        },
        {
          fixture: {
            id: 1003,
            referee: "Felix Zwayer",
            timezone: "UTC",
            date: new Date(Date.now() + 10800000).toISOString(),
            timestamp: Date.now() + 10800000,
            periods: { first: null, second: null },
            venue: { id: 700, name: "Allianz Arena", city: "München" },
            status: { long: "Not Started", short: "NS", elapsed: null }
          },
          league: {
            id: 78,
            name: "Bundesliga",
            country: "Germany",
            logo: "https://media.api-sports.io/football/leagues/78.png",
            flag: "https://media.api-sports.io/flags/de.svg",
            season: 2023,
            round: "Regular Season - 15"
          },
          teams: {
            home: {
              id: 157,
              name: "Bayern Munich",
              logo: "https://media.api-sports.io/football/teams/157.png",
              winner: null
            },
            away: {
              id: 165,
              name: "Borussia Dortmund",
              logo: "https://media.api-sports.io/football/teams/165.png",
              winner: null
            }
          },
          goals: { home: null, away: null },
          score: {
            halftime: { home: null, away: null },
            fulltime: { home: null, away: null },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null }
          }
        }
      ];
      
      // Add statistical odds to placeholder fixtures
      const fixturesWithOdds = await Promise.all(
        placeholderFixtures.map(async (fixture) => {
          const homeTeam = fixture.teams?.home?.name;
          const awayTeam = fixture.teams?.away?.name;
          const league = fixture.league?.name;
          
          if (homeTeam && awayTeam) {
            const odds = await calculateStatisticalOdds(homeTeam, awayTeam, league);
            return {
              ...fixture,
              calculatedOdds: odds
            };
          }
          
          return fixture;
        })
      );
      
      const groupedFixtures = groupByCompetition(fixturesWithOdds);
      
      const placeholderData = {
        success: true,
        date: today,
        count: fixturesWithOdds.length,
        fixtures: fixturesWithOdds,
        groupedByCompetition: groupedFixtures,
        sortedByImportance: true,
        oddsCalculation: 'statistical',
        isPlaceholder: true,
        message: 'Using placeholder data due to API rate limit'
      };
      
      // Cache placeholder data for shorter duration
      cache.set(cacheKey, placeholderData, 5 * 60); // 5 minutes
      
      return res.json(placeholderData);
    }

    let fixtures = result.data.response || [];
    fixtures = sortByCompetition(fixtures);
    
    // Add statistical odds
    const fixturesWithOdds = await Promise.all(
      fixtures.map(async (fixture) => {
        const homeTeam = fixture.teams?.home?.name;
        const awayTeam = fixture.teams?.away?.name;
        const league = fixture.league?.name;
        
        if (homeTeam && awayTeam) {
          const odds = await calculateStatisticalOdds(homeTeam, awayTeam, league);
          return {
            ...fixture,
            calculatedOdds: odds
          };
        }
        
        return fixture;
      })
    );

    const groupedFixtures = groupByCompetition(fixturesWithOdds);

    const todayData = {
      success: true,
      date: today,
      count: fixtures.length,
      fixtures: fixturesWithOdds,
      groupedByCompetition: groupedFixtures,
      sortedByImportance: true,
      oddsCalculation: 'statistical'
    };

    cache.set(cacheKey, todayData, REGULAR_CACHE_DURATION);
    
    logApi(`✅ [FIXTURES] Found ${fixtures.length} games today with statistical odds!`);
    res.json(todayData);
    
  } catch (error) {
    console.error('Today games fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching today\'s games'
    });
  }
});

// MAIN FIXTURES ROUTE
router.get('/', apiLimiter, async (req, res) => {
  logApi('🏈 [FIXTURES] GET / - Main fixtures endpoint');
  
  try {
    const { limit = 20, league, team, season = 2023, status } = req.query;
    const cacheKey = `fixtures-${JSON.stringify(req.query)}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      logApi('📦 Returning cached fixtures');
      return res.json(cachedData);
    }

    const params = { season: parseInt(season) };
    if (league) params.league = league;
    if (team) params.team = team;
    if (status) params.status = status;

    if (!league && !team && !status) {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      params.from = lastWeek.toISOString().split('T')[0];
      params.to = nextWeek.toISOString().split('T')[0];
    }

    const result = await makeApiCall('/fixtures', params);
    
    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: 'Failed to fetch fixtures',
        error: result.error
      });
    }

    let fixtures = result.data.response || [];
    fixtures = sortByCompetition(fixtures);
    
    if (limit && fixtures.length > parseInt(limit)) {
      fixtures = fixtures.slice(0, parseInt(limit));
    }

    const fixturesData = {
      success: true,
      count: fixtures.length,
      total: result.data.results,
      fixtures,
      sortedByImportance: true
    };

    cache.set(cacheKey, fixturesData, REGULAR_CACHE_DURATION);
    
    logApi(`✅ [FIXTURES] Returned ${fixtures.length} fixtures`);
    res.json(fixturesData);
    
  } catch (error) {
    console.error('Fixtures fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching fixtures'
    });
  }
});

// Get live fixtures (legacy route)
router.get('/live', (req, res) => {
  logApi('🔴 [FIXTURES] GET /live - Redirecting to /live-now');
  res.redirect('/fixtures/live-now');
});

// Get finished fixtures for result processing
router.get('/finished', apiLimiter, async (req, res) => {
  logApi('🏁 [FIXTURES] GET /finished');
  
  try {
    // Look for recently finished matches (within last 2 hours)
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    
    const dateFrom = twoHoursAgo.toISOString().split('T')[0];
    const dateTo = new Date().toISOString().split('T')[0];
    
    const cacheKey = `finished_fixtures_${dateFrom}_${dateTo}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      logApi('🟢 [FIXTURES] GET /finished - FROM CACHE');
      return res.json({
        success: true,
        fixtures: cached,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    const response = await axios.get(`${BASE_URL}/fixtures`, {
      headers: apiHeaders,
      params: {
        status: 'FT', // Full time
        from: dateFrom,
        to: dateTo,
        timezone: 'UTC'
      }
    });

    if (response.data.errors && response.data.errors.length > 0) {
      console.error('API Error:', response.data.errors);
      return res.status(500).json({
        success: false,
        message: 'API error occurred',
        errors: response.data.errors
      });
    }

    const fixtures = response.data.response || [];
    
    // Filter for recently finished matches only
    const recentlyFinished = fixtures.filter(fixture => {
      const fixtureDate = new Date(fixture.fixture.date);
      const timeSinceEnd = Date.now() - fixtureDate.getTime();
      // Only include matches finished within last 2 hours
      return timeSinceEnd <= 2 * 60 * 60 * 1000;
    });

    // Cache for 10 minutes
    cache.set(cacheKey, recentlyFinished, 10 * 60);

    logApi(`🟢 [FIXTURES] GET /finished - ${recentlyFinished.length} fixtures found`);
    
    res.json({
      success: true,
      fixtures: recentlyFinished,
      count: recentlyFinished.length,
      fromCache: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Finished fixtures fetch error:', error.message);
    logApi('🔴 [FIXTURES] GET /finished - ERROR');
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching finished fixtures',
      error: error.message
    });
  }
});

// Single fixture by ID with statistical odds
router.get('/:id', apiLimiter, async (req, res) => {
  logApi(`🏈 [FIXTURES] GET /${req.params.id}`);
  
  try {
    const fixtureId = req.params.id;
    const cacheKey = `fixture-odds-${fixtureId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const result = await makeApiCall('/fixtures', { id: fixtureId });
    
    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: 'Failed to fetch fixture',
        error: result.error
      });
    }

    const fixture = result.data.response?.[0];
    if (!fixture) {
      return res.status(404).json({
        success: false,
        message: 'Fixture not found'
      });
    }

    // Add statistical odds
    const homeTeam = fixture.teams?.home?.name;
    const awayTeam = fixture.teams?.away?.name;
    const league = fixture.league?.name;
    
    let fixtureWithOdds = { ...fixture };
    
    if (homeTeam && awayTeam) {
      const odds = await calculateStatisticalOdds(homeTeam, awayTeam, league);
      fixtureWithOdds.calculatedOdds = odds;
    }

    const fixtureData = {
      success: true,
      fixture: fixtureWithOdds,
      oddsCalculation: 'statistical'
    };

    cache.set(cacheKey, fixtureData, REGULAR_CACHE_DURATION);
    res.json(fixtureData);
    
  } catch (error) {
    console.error('Single fixture fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching fixture'
    });
  }
});

// Get teams
router.get('/teams/search', apiLimiter, async (req, res) => {
  logApi('🏈 [FIXTURES] GET /teams/search');
  
  try {
    const { name, league, country } = req.query;
    
    if (!name && !league && !country) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, league, or country parameter'
      });
    }

    const params = {};
    if (name) params.search = name;
    if (league) params.league = league;
    if (country) params.country = country;

    const result = await makeApiCall('/teams', params);
    
    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: 'Failed to fetch teams',
        error: result.error
      });
    }

    res.json({
      success: true,
      count: result.data.results,
      teams: result.data.response || []
    });
    
  } catch (error) {
    console.error('Teams fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teams'
    });
  }
});

module.exports = router;
