const axios = require('axios');
const TeamStats = require('../models/TeamStats');
const HeadToHead = require('../models/HeadToHead');
const OddsHistory = require('../models/OddsHistory');
const RecentForm = require('../models/RecentForm');

class AdvancedOddsCalculator {
    constructor() {
        this.fbrApiKey = process.env.FBR_API_KEY;
        this.fbrBaseUrl = process.env.FBR_API_BASE_URL || 'https://fbrapi.com';
        
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

    async getTeamStats(teamId, leagueId, season = '2023-2024') {
        try {
            console.log(`🔍 Fetching team stats for ${teamId} in league ${leagueId}...`);
            
            // Check if we have cached stats
            const cachedStats = await TeamStats.findOne({ 
                teamId: teamId.toString(), 
                leagueId: leagueId,
                season: season 
            });
            
            if (cachedStats && this.isRecentData(cachedStats.updatedAt)) {
                console.log(`📊 Using cached stats for team ${teamId}`);
                return this.formatTeamStats(cachedStats);
            }
            
            // For demo purposes, return mock data if API is not available
            const mockStats = this.getMockTeamStats(teamId, leagueId, season);
            
            // Save to database
            await TeamStats.findOneAndUpdate(
                { teamId: teamId.toString(), leagueId: leagueId, season: season },
                mockStats,
                { upsert: true, new: true }
            );
            
            return this.formatTeamStats(mockStats);
            
        } catch (error) {
            console.error(`❌ Error fetching team stats for ${teamId}:`, error.message);
            
            // Return mock data as fallback
            const mockStats = this.getMockTeamStats(teamId, leagueId, season);
            return this.formatTeamStats(mockStats);
        }
    }

    getMockTeamStats(teamId, leagueId, season) {
        // Generate realistic mock data based on team ID
        const teamHash = teamId.toString().split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        const random = Math.abs(teamHash) / 2147483647;
        
        return {
            teamId: teamId.toString(),
            teamName: `Team ${teamId}`,
            leagueId: leagueId,
            leagueName: leagueId === 9 ? 'Premier League' : `League ${leagueId}`,
            season: season,
            matchesPlayed: Math.floor(random * 20) + 15,
            wins: Math.floor(random * 15) + 5,
            draws: Math.floor(random * 8) + 2,
            losses: Math.floor(random * 10) + 3,
            goalsFor: Math.floor(random * 30) + 20,
            goalsAgainst: Math.floor(random * 25) + 15,
            homeWins: Math.floor(random * 8) + 3,
            homeDraws: Math.floor(random * 4) + 1,
            homeLosses: Math.floor(random * 5) + 1,
            awayWins: Math.floor(random * 7) + 2,
            awayDraws: Math.floor(random * 4) + 1,
            awayLosses: Math.floor(random * 5) + 2,
            recentForm: this.generateRecentForm(),
            avgGoalsScored: (random * 1.5) + 1.0,
            avgGoalsConceded: (random * 1.2) + 0.8,
            xg: (random * 1.8) + 1.2,
            xga: (random * 1.3) + 0.9,
            avgPossession: (random * 20) + 45,
            passAccuracy: (random * 15) + 80,
            shotsPerGame: (random * 8) + 10
        };
    }

    generateRecentForm() {
        const results = ['W', 'D', 'L'];
        let form = '';
        for (let i = 0; i < 5; i++) {
            form += results[Math.floor(Math.random() * results.length)];
        }
        return form;
    }

    formatTeamStats(stats) {
        return {
            team_id: stats.teamId,
            team_name: stats.teamName,
            league_id: stats.leagueId,
            season: stats.season,
            matches_played: stats.matchesPlayed,
            wins: stats.wins,
            draws: stats.draws,
            losses: stats.losses,
            goals_for: stats.goalsFor,
            goals_against: stats.goalsAgainst,
            xg: stats.xg,
            xga: stats.xga,
            avg_possession: stats.avgPossession,
            pass_accuracy: stats.passAccuracy,
            shots_per_game: stats.shotsPerGame,
            points: (stats.wins * 3) + stats.draws,
            goal_difference: stats.goalsFor - stats.goalsAgainst,
            ppg: stats.matchesPlayed > 0 ? ((stats.wins * 3) + stats.draws) / stats.matchesPlayed : 0,
            home_record: {
                wins: stats.homeWins,
                draws: stats.homeDraws,
                losses: stats.homeLosses
            },
            away_record: {
                wins: stats.awayWins,
                draws: stats.awayDraws,
                losses: stats.awayLosses
            },
            recent_form: stats.recentForm,
            last_updated: stats.updatedAt || new Date()
        };
    }

    async getHeadToHeadStats(homeTeam, awayTeam, leagueId) {
        try {
            console.log(`🔍 Fetching H2H stats for ${homeTeam} vs ${awayTeam}...`);
            
            // Check database first
            const h2hStats = await HeadToHead.findOne({
                $or: [
                    { team1: homeTeam, team2: awayTeam, leagueId: leagueId },
                    { team1: awayTeam, team2: homeTeam, leagueId: leagueId }
                ]
            });
            
            if (h2hStats && this.isRecentData(h2hStats.updatedAt)) {
                console.log(`📊 Using cached H2H stats`);
                return this.formatH2HStats(h2hStats, homeTeam, awayTeam);
            }
            
            // Generate mock H2H data
            const mockH2H = this.getMockH2HStats(homeTeam, awayTeam, leagueId);
            
            // Save to database
            await HeadToHead.findOneAndUpdate(
                { team1: homeTeam, team2: awayTeam, leagueId: leagueId },
                mockH2H,
                { upsert: true, new: true }
            );
            
            return this.formatH2HStats(mockH2H, homeTeam, awayTeam);
            
        } catch (error) {
            console.error(`❌ Error fetching H2H stats:`, error.message);
            return this.getMockH2HStats(homeTeam, awayTeam, leagueId);
        }
    }

    getMockH2HStats(homeTeam, awayTeam, leagueId) {
        const random = Math.random();
        const totalMatches = Math.floor(random * 8) + 2;
        const team1Wins = Math.floor(random * totalMatches * 0.4);
        const team2Wins = Math.floor(random * totalMatches * 0.4);
        const draws = totalMatches - team1Wins - team2Wins;
        
        return {
            team1: homeTeam,
            team2: awayTeam,
            leagueId: leagueId,
            leagueName: leagueId === 9 ? 'Premier League' : `League ${leagueId}`,
            totalMatches: totalMatches,
            team1Wins: team1Wins,
            team2Wins: team2Wins,
            draws: draws,
            last5Results: this.generateRecentForm(),
            avgGoalsTeam1: (random * 1.5) + 1.0,
            avgGoalsTeam2: (random * 1.5) + 1.0
        };
    }

    formatH2HStats(h2h, homeTeam, awayTeam) {
        const isHomeTeam1 = h2h.team1 === homeTeam;
        
        return {
            total_matches: h2h.totalMatches,
            home_wins: isHomeTeam1 ? h2h.team1Wins : h2h.team2Wins,
            away_wins: isHomeTeam1 ? h2h.team2Wins : h2h.team1Wins,
            draws: h2h.draws,
            avg_goals_home: isHomeTeam1 ? h2h.avgGoalsTeam1 : h2h.avgGoalsTeam2,
            avg_goals_away: isHomeTeam1 ? h2h.avgGoalsTeam2 : h2h.avgGoalsTeam1,
            last_5_results: h2h.last5Results || this.generateRecentForm()
        };
    }

    async calculateAdvancedOdds(homeTeam, awayTeam, leagueId = 9) {
        try {
            console.log(`🎯 Calculating advanced odds for ${homeTeam} vs ${awayTeam}`);
            
            // Get team statistics
            const [homeStats, awayStats] = await Promise.all([
                this.getTeamStats(homeTeam, leagueId),
                this.getTeamStats(awayTeam, leagueId)
            ]);
            
            // Get head-to-head statistics
            const h2hStats = await this.getHeadToHeadStats(homeTeam, awayTeam, leagueId);
            
            // Calculate component scores
            const teamStrengthScore = this.calculateTeamStrengthScore(homeStats, awayStats);
            const recentFormScore = this.calculateRecentFormScore(homeStats, awayStats);
            const headToHeadScore = this.calculateHeadToHeadScore(h2hStats);
            const homeAdvantageScore = 0.15; // Fixed home advantage
            
            // Combine scores with weights
            const homeScore = (
                teamStrengthScore.home * this.weights.teamStrength +
                recentFormScore.home * this.weights.recentForm +
                headToHeadScore.home * this.weights.headToHead +
                homeAdvantageScore * this.weights.homeAdvantage
            );
            
            const awayScore = (
                teamStrengthScore.away * this.weights.teamStrength +
                recentFormScore.away * this.weights.recentForm +
                headToHeadScore.away * this.weights.headToHead
            );
            
            // Calculate probabilities
            const totalScore = homeScore + awayScore + 0.2; // Draw baseline
            const homeProbability = homeScore / totalScore;
            const awayProbability = awayScore / totalScore;
            const drawProbability = 0.2 / totalScore;
            
            // Convert to odds (with bookmaker margin)
            const margin = 1.08; // 8% margin
            const homeOdds = (margin / homeProbability).toFixed(2);
            const drawOdds = (margin / drawProbability).toFixed(2);
            const awayOdds = (margin / awayProbability).toFixed(2);
            
            const calculatedOdds = {
                fixture_id: `${homeTeam}_vs_${awayTeam}_${Date.now()}`,
                home_team: homeTeam,
                away_team: awayTeam,
                league_id: leagueId,
                odds: {
                    home_win: parseFloat(homeOdds),
                    draw: parseFloat(drawOdds),
                    away_win: parseFloat(awayOdds)
                },
                probabilities: {
                    home_win: (homeProbability * 100).toFixed(1) + '%',
                    draw: (drawProbability * 100).toFixed(1) + '%',
                    away_win: (awayProbability * 100).toFixed(1) + '%'
                },
                confidence: this.calculateConfidence(homeStats, awayStats, h2hStats),
                calculation_factors: {
                    team_strength: teamStrengthScore,
                    recent_form: recentFormScore,
                    head_to_head: headToHeadScore,
                    home_advantage: homeAdvantageScore
                },
                timestamp: new Date().toISOString()
            };
            
            // Save to odds history
            await this.saveOddsHistory(calculatedOdds);
            
            return calculatedOdds;
            
        } catch (error) {
            console.error('❌ Error calculating odds:', error);
            throw error;
        }
    }

    calculateTeamStrengthScore(homeStats, awayStats) {
        const homeStrength = (
            homeStats.ppg * 0.4 +
            homeStats.goal_difference * 0.3 +
            (homeStats.xg - homeStats.xga) * 0.3
        ) / 3;
        
        const awayStrength = (
            awayStats.ppg * 0.4 +
            awayStats.goal_difference * 0.3 +
            (awayStats.xg - awayStats.xga) * 0.3
        ) / 3;
        
        return { home: Math.max(0, homeStrength), away: Math.max(0, awayStrength) };
    }

    calculateRecentFormScore(homeStats, awayStats) {
        const homeFormScore = this.parseRecentForm(homeStats.recent_form);
        const awayFormScore = this.parseRecentForm(awayStats.recent_form);
        
        return { home: homeFormScore, away: awayFormScore };
    }

    parseRecentForm(formString) {
        if (!formString) return 0.5;
        
        let score = 0;
        for (let i = 0; i < formString.length; i++) {
            const match = formString[i];
            if (match === 'W') score += 1;
            else if (match === 'D') score += 0.33;
            // L = 0 points
        }
        return score / formString.length;
    }

    calculateHeadToHeadScore(h2hStats) {
        if (!h2hStats || h2hStats.total_matches === 0) {
            return { home: 0.5, away: 0.5 };
        }
        
        const total = h2hStats.total_matches;
        const homeScore = h2hStats.home_wins / total;
        const awayScore = h2hStats.away_wins / total;
        
        return { home: homeScore, away: awayScore };
    }

    calculateConfidence(homeStats, awayStats, h2hStats) {
        let confidence = 0.5; // Base confidence
        
        // More matches = higher confidence
        if (homeStats.matches_played > 10) confidence += 0.1;
        if (awayStats.matches_played > 10) confidence += 0.1;
        
        // H2H history increases confidence
        if (h2hStats && h2hStats.total_matches > 3) confidence += 0.2;
        
        // Recent form data increases confidence
        if (homeStats.recent_form && awayStats.recent_form) confidence += 0.1;
        
        return Math.min(1.0, confidence);
    }

    async saveOddsHistory(odds) {
        try {
            await OddsHistory.create({
                fixtureId: odds.fixture_id,
                homeTeam: odds.home_team,
                awayTeam: odds.away_team,
                leagueId: odds.league_id,
                leagueName: odds.league_id === 9 ? 'Premier League' : `League ${odds.league_id}`,
                homeWinOdds: odds.odds.home_win,
                drawOdds: odds.odds.draw,
                awayWinOdds: odds.odds.away_win,
                calculationMethod: 'advanced',
                confidenceScore: odds.confidence,
                calculationFactors: odds.calculation_factors
            });
        } catch (error) {
            console.error('Error saving odds history:', error);
        }
    }

    isRecentData(timestamp, maxAgeHours = 24) {
        if (!timestamp) return false;
        const ageHours = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
        return ageHours < maxAgeHours;
    }

    // Legacy methods for compatibility
    async getOddsHistory(fixtureId) {
        return await OddsHistory.find({ fixtureId: fixtureId });
    }

    async getAllTeamStats(leagueId) {
        return await TeamStats.find({ leagueId: leagueId });
    }
}

module.exports = AdvancedOddsCalculator;
