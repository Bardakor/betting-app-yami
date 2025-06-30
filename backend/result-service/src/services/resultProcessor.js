const axios = require('axios');
const ProcessedResult = require('../models/ProcessedResult');

// Function to process all finished matches
const processFinishedMatches = async () => {
  try {
    console.log('🔍 Checking for finished matches...');
    
    // Get recently finished fixtures from fixtures service
    const response = await axios.get(`${process.env.FIXTURES_SERVICE_URL}/api/fixtures/finished`);
    
    if (!response.data.success || !response.data.fixtures) {
      console.log('📋 No finished matches found');
      return;
    }

    const finishedMatches = response.data.fixtures;
    console.log(`🏁 Found ${finishedMatches.length} finished matches`);

    let processedCount = 0;
    let totalBetsSettled = 0;

    for (const match of finishedMatches) {
      try {
        const result = await processMatchResult(match);
        if (result.processed) {
          processedCount++;
          totalBetsSettled += result.betsSettled;
        }
      } catch (error) {
        console.error(`❌ Failed to process match ${match.fixture.id}:`, error.message);
      }
    }

    if (processedCount > 0) {
      console.log(`✅ Processed ${processedCount} matches, settled ${totalBetsSettled} bets`);
    } else {
      console.log('🔄 All matches already processed');
    }

  } catch (error) {
    console.error('💥 Error in processFinishedMatches:', error.message);
  }
};

// Function to process a single match result
const processMatchResult = async (match) => {
  try {
    const fixtureId = match.fixture.id;
    
    // Check if already processed
    const existingResult = await ProcessedResult.findOne({ fixtureId });
    if (existingResult) {
      return { processed: false, reason: 'Already processed' };
    }

    // Validate match data
    if (!match.goals || match.goals.home === null || match.goals.away === null) {
      console.log(`⏭️ Skipping match ${fixtureId} - incomplete score data`);
      return { processed: false, reason: 'Incomplete score data' };
    }

    // Only process matches that are truly finished
    const validFinishedStatuses = ['FT', 'AET', 'PEN', 'CANC', 'PST', 'SUSP'];
    if (!validFinishedStatuses.includes(match.fixture.status.short)) {
      return { processed: false, reason: 'Match not finished' };
    }

    console.log(`🎯 Processing match: ${match.teams.home.name} ${match.goals.home}-${match.goals.away} ${match.teams.away.name}`);

    // Prepare match result data
    const matchResult = {
      score: {
        home: match.goals.home,
        away: match.goals.away
      },
      status: match.fixture.status.short,
      fixtureId: fixtureId
    };

    // Call bet service to settle all bets for this fixture
    let betsSettled = 0;
    let totalWinnings = 0;

    try {
      const betResponse = await axios.post(`${process.env.BET_SERVICE_URL}/api/bets/settle/${fixtureId}`, {
        matchResult
      });

      if (betResponse.data.success) {
        betsSettled = betResponse.data.settledBets;
        totalWinnings = betResponse.data.details?.reduce((sum, bet) => sum + bet.winAmount, 0) || 0;
        console.log(`💰 Settled ${betsSettled} bets, total winnings: $${totalWinnings}`);
      }
    } catch (betError) {
      console.error(`⚠️ Error settling bets for fixture ${fixtureId}:`, betError.message);
      // Continue processing even if bet settlement fails
    }

    // Record that this result has been processed
    const processedResult = new ProcessedResult({
      fixtureId,
      matchInfo: {
        homeTeam: {
          id: match.teams.home.id,
          name: match.teams.home.name
        },
        awayTeam: {
          id: match.teams.away.id,
          name: match.teams.away.name
        },
        league: {
          id: match.league.id,
          name: match.league.name,
          country: match.league.country
        }
      },
      finalScore: {
        home: match.goals.home,
        away: match.goals.away
      },
      matchStatus: match.fixture.status.short,
      betsSettled,
      totalWinnings,
      metadata: {
        kickoffTime: new Date(match.fixture.date),
        endTime: new Date(),
        duration: match.fixture.status.elapsed || 90
      }
    });

    await processedResult.save();

    return {
      processed: true,
      betsSettled,
      totalWinnings
    };

  } catch (error) {
    console.error(`💥 Error processing match result:`, error);
    throw error;
  }
};

// Function to manually process a specific fixture
const processSpecificFixture = async (fixtureId) => {
  try {
    // Get fixture details
    const fixtureResponse = await axios.get(`${process.env.FIXTURES_SERVICE_URL}/api/fixtures/${fixtureId}`);
    
    if (!fixtureResponse.data.success) {
      throw new Error('Fixture not found');
    }

    const match = fixtureResponse.data.fixture;
    
    // Check if match is finished
    const validFinishedStatuses = ['FT', 'AET', 'PEN', 'CANC', 'PST', 'SUSP'];
    if (!validFinishedStatuses.includes(match.fixture.status.short)) {
      throw new Error('Match is not finished yet');
    }

    const result = await processMatchResult(match);
    return result;

  } catch (error) {
    console.error(`Error processing specific fixture ${fixtureId}:`, error);
    throw error;
  }
};

// Function to get processing statistics
const getProcessingStats = async (days = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const stats = await ProcessedResult.aggregate([
      {
        $match: {
          processedAt: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          totalBetsSettled: { $sum: '$betsSettled' },
          totalWinningsPaid: { $sum: '$totalWinnings' },
          avgBetsPerMatch: { $avg: '$betsSettled' }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalMatches: 0,
        totalBetsSettled: 0,
        totalWinningsPaid: 0,
        avgBetsPerMatch: 0
      };
    }

    return stats[0];
  } catch (error) {
    console.error('Error getting processing stats:', error);
    throw error;
  }
};

module.exports = {
  processFinishedMatches,
  processMatchResult,
  processSpecificFixture,
  getProcessingStats
}; 