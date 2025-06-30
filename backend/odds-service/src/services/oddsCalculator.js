const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');

class AdvancedOddsCalculator {
    constructor() {
        this.fbrApiKey = process.env.FBR_API_KEY;
        this.fbrBaseUrl = process.env.FBR_API_BASE_URL || 'https://fbrapi.com';
        
        // Initialize SQLite database
        const dbPath = path.join(__dirname, '../../data/odds.db');
        this.db = new Database(dbPath);
        this.initializeDatabase();
        
        // Advanced calculation weights
        this.weights = {
            recentForm: 0.35,        // Last 5 matches
            headToHead: 0.25,        // Historical matchups
            teamStrength: 0.20,      // Overall team statistics
            homeAdvantage: 0.10,     // Home field advantage
            injuriesForm: 0.05,      // Player availability
            marketTrends: 0.05       // Betting market analysis
        };
    }

    initializeDatabase() {
        // Create tables for advanced odds calculation
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS team_stats (
                team_id TEXT PRIMARY KEY,
                team_name TEXT,
                league_id INTEGER,
                season TEXT,
                matches_played INTEGER,
                wins INTEGER,
                draws INTEGER,
                losses INTEGER,
                goals_for INTEGER,
                goals_against INTEGER,
                xg REAL,
                xga REAL,
                avg_possession REAL,
                pass_accuracy REAL,
                shots_per_game REAL,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS head_to_head (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team_a TEXT,
                team_b TEXT,
                matches_played INTEGER,
                team_a_wins INTEGER,
                team_b_wins INTEGER,
                draws INTEGER,
                avg_goals_team_a REAL,
                avg_goals_team_b REAL,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS recent_form (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team_id TEXT,
                match_date DATE,
                opponent TEXT,
                result TEXT,
                goals_for INTEGER,
                goals_against INTEGER,
                xg REAL,
                xga REAL,
                home_away TEXT,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS odds_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fixture_id TEXT,
                home_team TEXT,
                away_team TEXT,
                calculated_odds TEXT,
                confidence_score REAL,
                market_trends TEXT,
                calculation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async getTeamStats(teamId, leagueId, season = '2023-2024') {
        try {
            console.log(`🔍 Fetching team stats for ${teamId} in league ${leagueId}...`);
            
            const response = await axios.get(`${this.fbrBaseUrl}/team-season-stats`, {
                params: { team_id: teamId, league_id: leagueId, season_id: season },
                headers: { 'X-API-Key': this.fbrApiKey },
                timeout: 10000
            });

            if (response.data && response.data.data) {
                const teamData = response.data.data[0];
                if (teamData) {
                    this.saveTeamStats(teamData, leagueId, season);
                    return this.processTeamStats(teamData);
                }
            }
            
            // Fallback to cached data
            return this.getCachedTeamStats(teamId);
        } catch (error) {
            console.error(`❌ Error fetching team stats: ${error.message}`);
            return this.getCachedTeamStats(teamId);
        }
    }

    saveTeamStats(teamData, leagueId, season) {
        const stats = teamData.stats.stats;
        const insert = this.db.prepare(`
            INSERT OR REPLACE INTO team_stats 
            (team_id, team_name, league_id, season, matches_played, wins, draws, losses, 
             goals_for, goals_against, xg, xga, avg_possession, pass_accuracy, shots_per_game)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insert.run(
            teamData.meta_data.team_id,
            teamData.meta_data.team_name,
            leagueId,
            season,
            stats.matches_played || 0,
            this.calculateWins(stats),
            this.calculateDraws(stats),
            this.calculateLosses(stats),
            stats.ttl_gls || 0,
            stats.ttl_gls_ag || 0,
            stats.ttl_xg || 0,
            stats.ttl_xga || 0,
            teamData.stats.possession?.avg_poss || 50,
            teamData.stats.passing?.pct_pass_cmp || 75,
            stats.ttl_sh / Math.max(stats.matches_played, 1) || 10
        );
    }

    processTeamStats(teamData) {
        const stats = teamData.stats.stats;
        const possession = teamData.stats.possession || {};
        const passing = teamData.stats.passing || {};
        const shooting = teamData.stats.shooting || {};

        return {
            teamId: teamData.meta_data.team_id,
            teamName: teamData.meta_data.team_name,
            matchesPlayed: stats.matches_played || 0,
            wins: this.calculateWins(stats),
            draws: this.calculateDraws(stats),
            losses: this.calculateLosses(stats),
            goalsFor: stats.ttl_gls || 0,
            goalsAgainst: stats.ttl_gls_ag || 0,
            xg: stats.ttl_xg || 0,
            xga: stats.ttl_xga || 0,
            avgPossession: parseFloat(possession.avg_poss) || 50,
            passAccuracy: passing.pct_pass_cmp || 75,
            shotsPerGame: (stats.ttl_sh || 0) / Math.max(stats.matches_played, 1),
            attackingStrength: this.calculateAttackingStrength(stats, shooting),
            defensiveStrength: this.calculateDefensiveStrength(stats, teamData.stats.defense),
            formRating: this.calculateFormRating(stats)
        };
    }

    calculateAttackingStrength(stats, shooting) {
        const goalsPerGame = (stats.ttl_gls || 0) / Math.max(stats.matches_played, 1);
        const xgPerGame = (stats.ttl_xg || 0) / Math.max(stats.matches_played, 1);
        const shotAccuracy = shooting?.pct_sot || 30;
        
        return (goalsPerGame * 0.4 + xgPerGame * 0.4 + shotAccuracy * 0.2) * 10;
    }

    calculateDefensiveStrength(stats, defense) {
        const goalsAgainstPerGame = (stats.ttl_gls_ag || 0) / Math.max(stats.matches_played, 1);
        const xgaPerGame = (stats.ttl_xga || 0) / Math.max(stats.matches_played, 1);
        const tackles = defense?.ttl_tkl || 100;
        
        return Math.max(0, 100 - (goalsAgainstPerGame * 15 + xgaPerGame * 10 - tackles * 0.1));
    }

    calculateFormRating(stats) {
        const winRate = this.calculateWins(stats) / Math.max(stats.matches_played, 1);
        const goalDiff = (stats.ttl_gls || 0) - (stats.ttl_gls_ag || 0);
        const xgDiff = (stats.ttl_xg || 0) - (stats.ttl_xga || 0);
        
        return (winRate * 50 + Math.min(goalDiff, 20) * 2 + Math.min(xgDiff, 15) * 1.5);
    }

    calculateWins(stats) {
        // Since FBR doesn't always provide direct wins, calculate from available data
        return Math.floor((stats.matches_played || 0) * 0.4); // Estimate
    }

    calculateDraws(stats) {
        return Math.floor((stats.matches_played || 0) * 0.25); // Estimate
    }

    calculateLosses(stats) {
        const matches = stats.matches_played || 0;
        return matches - this.calculateWins(stats) - this.calculateDraws(stats);
    }

    getCachedTeamStats(teamId) {
        const cached = this.db.prepare('SELECT * FROM team_stats WHERE team_id = ?').get(teamId);
        if (cached) {
            return {
                teamId: cached.team_id,
                teamName: cached.team_name,
                matchesPlayed: cached.matches_played,
                wins: cached.wins,
                draws: cached.draws,
                losses: cached.losses,
                goalsFor: cached.goals_for,
                goalsAgainst: cached.goals_against,
                xg: cached.xg,
                xga: cached.xga,
                avgPossession: cached.avg_possession,
                passAccuracy: cached.pass_accuracy,
                shotsPerGame: cached.shots_per_game,
                attackingStrength: 65,
                defensiveStrength: 65,
                formRating: 50
            };
        }
        
        // Return default stats if no data available
        return this.getDefaultTeamStats(teamId);
    }

    getDefaultTeamStats(teamId) {
        return {
            teamId,
            teamName: 'Unknown Team',
            matchesPlayed: 20,
            wins: 8,
            draws: 6,
            losses: 6,
            goalsFor: 25,
            goalsAgainst: 23,
            xg: 24.5,
            xga: 22.8,
            avgPossession: 50,
            passAccuracy: 75,
            shotsPerGame: 12,
            attackingStrength: 65,
            defensiveStrength: 65,
            formRating: 50
        };
    }

    async calculateAdvancedOdds(homeTeamId, awayTeamId, leagueId) {
        try {
            console.log(`🎯 Calculating advanced odds for ${homeTeamId} vs ${awayTeamId}...`);

            // Get comprehensive team data
            const [homeStats, awayStats] = await Promise.all([
                this.getTeamStats(homeTeamId, leagueId),
                this.getTeamStats(awayTeamId, leagueId)
            ]);

            // Calculate various probability components
            const homeAdvantageBoost = 0.15; // 15% boost for home team
            
            // Team strength comparison
            const homeStrength = this.calculateOverallStrength(homeStats);
            const awayStrength = this.calculateOverallStrength(awayStats);
            
            // Apply home advantage
            const adjustedHomeStrength = homeStrength * (1 + homeAdvantageBoost);
            
            // Calculate win probabilities using advanced algorithm
            const totalStrength = adjustedHomeStrength + awayStrength;
            let homeProbability = adjustedHomeStrength / totalStrength;
            let awayProbability = awayStrength / totalStrength;
            
            // Adjust for realistic draw probability
            const drawProbability = this.calculateDrawProbability(homeStats, awayStats);
            
            // Normalize probabilities
            const totalProb = homeProbability + awayProbability + drawProbability;
            homeProbability = homeProbability / totalProb;
            awayProbability = awayProbability / totalProb;
            const normalizedDrawProb = drawProbability / totalProb;

            // Convert probabilities to odds
            const homeOdds = this.probabilityToOdds(homeProbability);
            const drawOdds = this.probabilityToOdds(normalizedDrawProb);
            const awayOdds = this.probabilityToOdds(awayProbability);

            // Calculate confidence score
            const confidenceScore = this.calculateConfidenceScore(homeStats, awayStats);

            // Generate detailed analysis
            const analysis = this.generateMatchAnalysis(homeStats, awayStats, homeOdds, drawOdds, awayOdds);

            const result = {
                homeTeam: {
                    id: homeTeamId,
                    name: homeStats.teamName,
                    odds: homeOdds,
                    probability: Math.round(homeProbability * 100),
                    strength: Math.round(adjustedHomeStrength)
                },
                draw: {
                    odds: drawOdds,
                    probability: Math.round(normalizedDrawProb * 100)
                },
                awayTeam: {
                    id: awayTeamId,
                    name: awayStats.teamName,
                    odds: awayOdds,
                    probability: Math.round(awayProbability * 100),
                    strength: Math.round(awayStrength)
                },
                confidence: Math.round(confidenceScore),
                analysis,
                calculatedAt: new Date().toISOString(),
                algorithm: 'Advanced Statistical Model v2.0'
            };

            // Cache the calculation
            this.saveOddsCalculation(homeTeamId, awayTeamId, result);

            return result;
        } catch (error) {
            console.error(`❌ Error calculating odds: ${error.message}`);
            return this.getFallbackOdds(homeTeamId, awayTeamId);
        }
    }

    calculateOverallStrength(teamStats) {
        const attackWeight = 0.4;
        const defenseWeight = 0.3;
        const formWeight = 0.2;
        const efficiencyWeight = 0.1;

        const efficiency = (teamStats.xg / Math.max(teamStats.goalsFor, 1)) * 
                          (teamStats.goalsAgainst / Math.max(teamStats.xga, 1));

        return (
            teamStats.attackingStrength * attackWeight +
            teamStats.defensiveStrength * defenseWeight +
            teamStats.formRating * formWeight +
            efficiency * 20 * efficiencyWeight
        );
    }

    calculateDrawProbability(homeStats, awayStats) {
        const homeStrength = this.calculateOverallStrength(homeStats);
        const awayStrength = this.calculateOverallStrength(awayStats);
        const strengthDifference = Math.abs(homeStrength - awayStrength);
        
        // Higher strength difference = lower draw probability
        const baseDraw = 0.25;
        const adjustment = strengthDifference / 1000;
        
        return Math.max(0.15, baseDraw - adjustment);
    }

    probabilityToOdds(probability) {
        const margin = 0.05; // 5% bookmaker margin
        const adjustedProb = probability * (1 + margin);
        return Math.max(1.01, Number((1 / adjustedProb).toFixed(2)));
    }

    calculateConfidenceScore(homeStats, awayStats) {
        const dataQuality = Math.min(homeStats.matchesPlayed, awayStats.matchesPlayed) / 20;
        const strengthDifference = Math.abs(
            this.calculateOverallStrength(homeStats) - 
            this.calculateOverallStrength(awayStats)
        ) / 100;
        
        return Math.min(95, 50 + dataQuality * 30 + strengthDifference * 20);
    }

    generateMatchAnalysis(homeStats, awayStats, homeOdds, drawOdds, awayOdds) {
        const homeStrength = this.calculateOverallStrength(homeStats);
        const awayStrength = this.calculateOverallStrength(awayStats);
        
        let prediction = 'Even match';
        let reasoning = [];

        if (homeStrength > awayStrength * 1.2) {
            prediction = `${homeStats.teamName} favored`;
            reasoning.push(`${homeStats.teamName} has superior overall strength (${Math.round(homeStrength)} vs ${Math.round(awayStrength)})`);
        } else if (awayStrength > homeStrength * 1.2) {
            prediction = `${awayStats.teamName} favored`;
            reasoning.push(`${awayStats.teamName} has superior overall strength (${Math.round(awayStrength)} vs ${Math.round(homeStrength)})`);
        }

        if (homeStats.attackingStrength > 75) {
            reasoning.push(`${homeStats.teamName} has strong attacking form`);
        }
        if (awayStats.defensiveStrength > 75) {
            reasoning.push(`${awayStats.teamName} has solid defensive record`);
        }

        const expectedGoals = {
            home: Number(((homeStats.goalsFor / homeStats.matchesPlayed) * 
                         (awayStats.goalsAgainst / awayStats.matchesPlayed) * 1.1).toFixed(1)),
            away: Number(((awayStats.goalsFor / awayStats.matchesPlayed) * 
                         (homeStats.goalsAgainst / homeStats.matchesPlayed)).toFixed(1))
        };

        return {
            prediction,
            reasoning,
            expectedGoals,
            keyStats: {
                homeForm: `${homeStats.wins}W-${homeStats.draws}D-${homeStats.losses}L`,
                awayForm: `${awayStats.wins}W-${awayStats.draws}D-${awayStats.losses}L`,
                homeAttack: Math.round(homeStats.attackingStrength),
                awayDefense: Math.round(awayStats.defensiveStrength)
            },
            recommendation: this.getValueBetRecommendation(homeOdds, drawOdds, awayOdds)
        };
    }

    getValueBetRecommendation(homeOdds, drawOdds, awayOdds) {
        const homeImpliedProb = 1 / homeOdds;
        const drawImpliedProb = 1 / drawOdds;
        const awayImpliedProb = 1 / awayOdds;
        
        if (homeOdds > 2.5 && homeImpliedProb < 0.35) {
            return { type: 'value', outcome: 'home', reason: 'Home win offers good value' };
        }
        if (awayOdds > 3.0 && awayImpliedProb < 0.30) {
            return { type: 'value', outcome: 'away', reason: 'Away win offers excellent value' };
        }
        if (drawOdds > 3.5) {
            return { type: 'value', outcome: 'draw', reason: 'Draw offers potential value' };
        }
        
        return { type: 'standard', reason: 'No exceptional value detected' };
    }

    saveOddsCalculation(homeTeamId, awayTeamId, odds) {
        const insert = this.db.prepare(`
            INSERT INTO odds_history (fixture_id, home_team, away_team, calculated_odds, confidence_score)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        insert.run(
            `${homeTeamId}_${awayTeamId}_${Date.now()}`,
            homeTeamId,
            awayTeamId,
            JSON.stringify(odds),
            odds.confidence
        );
    }

    getFallbackOdds(homeTeamId, awayTeamId) {
        return {
            homeTeam: { id: homeTeamId, name: 'Home Team', odds: 2.10, probability: 45, strength: 65 },
            draw: { odds: 3.20, probability: 28 },
            awayTeam: { id: awayTeamId, name: 'Away Team', odds: 3.40, probability: 27, strength: 60 },
            confidence: 60,
            analysis: {
                prediction: 'Insufficient data for detailed analysis',
                reasoning: ['Using fallback calculation due to data limitations'],
                expectedGoals: { home: 1.5, away: 1.2 },
                keyStats: { homeForm: 'N/A', awayForm: 'N/A' },
                recommendation: { type: 'standard', reason: 'Limited data available' }
            },
            calculatedAt: new Date().toISOString(),
            algorithm: 'Fallback Model'
        };
    }

    async getMarketTrends() {
        // Get recent odds calculations for market analysis
        const recent = this.db.prepare(`
            SELECT * FROM odds_history 
            WHERE calculation_timestamp > datetime('now', '-24 hours')
            ORDER BY calculation_timestamp DESC
            LIMIT 50
        `).all();

        return {
            totalCalculations: recent.length,
            avgConfidence: recent.length > 0 ? 
                Math.round(recent.reduce((sum, calc) => sum + calc.confidence_score, 0) / recent.length) : 0,
            recentActivity: recent.slice(0, 10).map(calc => ({
                match: `${calc.home_team} vs ${calc.away_team}`,
                confidence: calc.confidence_score,
                timestamp: calc.calculation_timestamp
            }))
        };
    }
}

module.exports = AdvancedOddsCalculator;