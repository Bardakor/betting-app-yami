// MongoDB Initialization Script with Mock Data
// This script creates the betting_platform database and populates it with realistic mock data

// Switch to the betting_platform database
db = db.getSiblingDB('betting_platform');

// Create admin user for the database
db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [
    { role: 'readWrite', db: 'betting_platform' },
    { role: 'dbAdmin', db: 'betting_platform' }
  ]
});

print('🎯 Creating Yami Betting Platform Database with Mock Data...');

// ============================================================
// USERS COLLECTION
// ============================================================
print('👥 Creating users collection...');

const users = [
  {
    _id: ObjectId(),
    id: 'user_1234567890_abc123def',
    email: 'admin@admin.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hashed 'admin123'
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    balance: 100000,
    isVerified: true,
    preferences: {
      currency: 'EUR',
      timezone: 'Europe/Paris',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    },
    stats: {
      totalBets: 15,
      wonBets: 8,
      lostBets: 7,
      totalWinnings: 2450.50,
      totalLosses: 890.00,
      winRate: 53.3,
      favoriteLeague: 'Premier League',
      largestWin: 500.00
    },
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-12-20T15:45:00Z'),
    lastLoginAt: new Date('2024-12-20T15:45:00Z')
  },
  {
    _id: ObjectId(),
    id: 'user_2345678901_def456ghi',
    email: 'john.doe@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    balance: 1250.75,
    isVerified: true,
    preferences: {
      currency: 'EUR',
      timezone: 'Europe/London',
      notifications: {
        email: true,
        push: false,
        sms: true
      }
    },
    stats: {
      totalBets: 42,
      wonBets: 18,
      lostBets: 24,
      totalWinnings: 1650.25,
      totalLosses: 2100.50,
      winRate: 42.9,
      favoriteLeague: 'Champions League',
      largestWin: 350.00
    },
    createdAt: new Date('2024-03-10T14:20:00Z'),
    updatedAt: new Date('2024-12-19T09:30:00Z'),
    lastLoginAt: new Date('2024-12-19T09:30:00Z')
  },
  {
    _id: ObjectId(),
    id: 'user_3456789012_ghi789jkl',
    email: 'marie.martin@example.fr',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'user',
    balance: 450.30,
    isVerified: true,
    preferences: {
      currency: 'EUR',
      timezone: 'Europe/Paris',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    },
    stats: {
      totalBets: 28,
      wonBets: 16,
      lostBets: 12,
      totalWinnings: 980.75,
      totalLosses: 560.25,
      winRate: 57.1,
      favoriteLeague: 'Ligue 1',
      largestWin: 200.00
    },
    createdAt: new Date('2024-05-22T11:15:00Z'),
    updatedAt: new Date('2024-12-18T16:20:00Z'),
    lastLoginAt: new Date('2024-12-18T16:20:00Z')
  },
  {
    _id: ObjectId(),
    id: 'user_4567890123_jkl012mno',
    email: 'carlos.rodriguez@example.es',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    role: 'user',
    balance: 2750.00,
    isVerified: true,
    preferences: {
      currency: 'EUR',
      timezone: 'Europe/Madrid',
      notifications: {
        email: false,
        push: true,
        sms: true
      }
    },
    stats: {
      totalBets: 67,
      wonBets: 35,
      lostBets: 32,
      totalWinnings: 4200.50,
      totalLosses: 3150.75,
      winRate: 52.2,
      favoriteLeague: 'La Liga',
      largestWin: 750.00
    },
    createdAt: new Date('2024-02-08T09:45:00Z'),
    updatedAt: new Date('2024-12-20T12:10:00Z'),
    lastLoginAt: new Date('2024-12-20T12:10:00Z')
  },
  {
    _id: ObjectId(),
    id: 'user_5678901234_mno345pqr',
    email: 'emma.wilson@example.co.uk',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'Emma',
    lastName: 'Wilson',
    role: 'user',
    balance: 175.50,
    isVerified: false,
    preferences: {
      currency: 'GBP',
      timezone: 'Europe/London',
      notifications: {
        email: true,
        push: false,
        sms: false
      }
    },
    stats: {
      totalBets: 12,
      wonBets: 4,
      lostBets: 8,
      totalWinnings: 220.00,
      totalLosses: 380.50,
      winRate: 33.3,
      favoriteLeague: 'Premier League',
      largestWin: 85.00
    },
    createdAt: new Date('2024-11-15T13:30:00Z'),
    updatedAt: new Date('2024-12-17T10:45:00Z'),
    lastLoginAt: new Date('2024-12-17T10:45:00Z')
  }
];

db.users.insertMany(users);
print(`✅ Inserted ${users.length} users`);

// ============================================================
// FIXTURES COLLECTION (Cached sports data)
// ============================================================
print('⚽ Creating fixtures collection...');

const fixtures = [
  {
    _id: ObjectId(),
    id: 868549,
    date: new Date('2025-01-25T15:00:00Z'),
    status: 'scheduled',
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png'
    },
    teams: {
      home: {
        id: 42,
        name: 'Arsenal',
        logo: 'https://media.api-sports.io/football/teams/42.png'
      },
      away: {
        id: 49,
        name: 'Chelsea',
        logo: 'https://media.api-sports.io/football/teams/49.png'
      }
    },
    goals: {
      home: null,
      away: null
    },
    odds: {
      home: 2.15,
      draw: 3.40,
      away: 3.25
    },
    cachedAt: new Date('2024-12-20T10:00:00Z')
  },
  {
    _id: ObjectId(),
    id: 868550,
    date: new Date('2025-01-26T17:30:00Z'),
    status: 'scheduled',
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png'
    },
    teams: {
      home: {
        id: 47,
        name: 'Tottenham',
        logo: 'https://media.api-sports.io/football/teams/47.png'
      },
      away: {
        id: 33,
        name: 'Manchester United',
        logo: 'https://media.api-sports.io/football/teams/33.png'
      }
    },
    goals: {
      home: null,
      away: null
    },
    odds: {
      home: 2.80,
      draw: 3.20,
      away: 2.55
    },
    cachedAt: new Date('2024-12-20T10:00:00Z')
  },
  {
    _id: ObjectId(),
    id: 868551,
    date: new Date('2025-01-24T20:00:00Z'),
    status: 'finished',
    league: {
      id: 61,
      name: 'Ligue 1',
      country: 'France',
      logo: 'https://media.api-sports.io/football/leagues/61.png'
    },
    teams: {
      home: {
        id: 85,
        name: 'Paris Saint Germain',
        logo: 'https://media.api-sports.io/football/teams/85.png'
      },
      away: {
        id: 79,
        name: 'Lille',
        logo: 'https://media.api-sports.io/football/teams/79.png'
      }
    },
    goals: {
      home: 3,
      away: 1
    },
    odds: {
      home: 1.45,
      draw: 4.20,
      away: 6.50
    },
    cachedAt: new Date('2024-12-20T10:00:00Z')
  }
];

db.fixtures.insertMany(fixtures);
print(`✅ Inserted ${fixtures.length} fixtures`);

// ============================================================
// BETS COLLECTION
// ============================================================
print('🎰 Creating bets collection...');

const bets = [
  {
    _id: ObjectId(),
    id: 'bet_1735635600_abc123',
    userId: 'user_2345678901_def456ghi',
    fixtureId: '868549',
    betType: 'match_winner',
    selection: 'home',
    stake: 50.00,
    odds: 2.15,
    potentialWin: 107.50,
    status: 'pending',
    placedAt: new Date('2024-12-20T14:30:00Z'),
    settledAt: null,
    result: null,
    fixture: {
      date: new Date('2025-01-25T15:00:00Z'),
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      league: 'Premier League'
    }
  },
  {
    _id: ObjectId(),
    id: 'bet_1735549200_def456',
    userId: 'user_3456789012_ghi789jkl',
    fixtureId: '868551',
    betType: 'match_winner',
    selection: 'home',
    stake: 25.00,
    odds: 1.45,
    potentialWin: 36.25,
    status: 'won',
    placedAt: new Date('2024-12-19T18:45:00Z'),
    settledAt: new Date('2024-12-24T22:00:00Z'),
    result: 'won',
    payout: 36.25,
    fixture: {
      date: new Date('2025-01-24T20:00:00Z'),
      homeTeam: 'Paris Saint Germain',
      awayTeam: 'Lille',
      league: 'Ligue 1'
    }
  },
  {
    _id: ObjectId(),
    id: 'bet_1735462800_ghi789',
    userId: 'user_4567890123_jkl012mno',
    fixtureId: '868550',
    betType: 'over_under',
    selection: 'over_2.5',
    stake: 75.00,
    odds: 1.85,
    potentialWin: 138.75,
    status: 'pending',
    placedAt: new Date('2024-12-18T20:15:00Z'),
    settledAt: null,
    result: null,
    fixture: {
      date: new Date('2025-01-26T17:30:00Z'),
      homeTeam: 'Tottenham',
      awayTeam: 'Manchester United',
      league: 'Premier League'
    }
  },
  {
    _id: ObjectId(),
    id: 'bet_1735376400_jkl012',
    userId: 'user_2345678901_def456ghi',
    fixtureId: '868551',
    betType: 'both_teams_score',
    selection: 'yes',
    stake: 30.00,
    odds: 1.75,
    potentialWin: 52.50,
    status: 'lost',
    placedAt: new Date('2024-12-17T16:30:00Z'),
    settledAt: new Date('2024-12-24T22:00:00Z'),
    result: 'lost',
    payout: 0,
    fixture: {
      date: new Date('2025-01-24T20:00:00Z'),
      homeTeam: 'Paris Saint Germain',
      awayTeam: 'Lille',
      league: 'Ligue 1'
    }
  },
  {
    _id: ObjectId(),
    id: 'bet_1735290000_mno345',
    userId: 'user_1234567890_abc123def',
    fixtureId: '868549',
    betType: 'correct_score',
    selection: '2-1',
    stake: 20.00,
    odds: 8.50,
    potentialWin: 170.00,
    status: 'pending',
    placedAt: new Date('2024-12-16T12:00:00Z'),
    settledAt: null,
    result: null,
    fixture: {
      date: new Date('2025-01-25T15:00:00Z'),
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      league: 'Premier League'
    }
  },
  {
    _id: ObjectId(),
    id: 'bet_1735203600_pqr678',
    userId: 'user_5678901234_mno345pqr',
    fixtureId: '868550',
    betType: 'match_winner',
    selection: 'away',
    stake: 15.00,
    odds: 2.55,
    potentialWin: 38.25,
    status: 'pending',
    placedAt: new Date('2024-12-15T08:45:00Z'),
    settledAt: null,
    result: null,
    fixture: {
      date: new Date('2025-01-26T17:30:00Z'),
      homeTeam: 'Tottenham',
      awayTeam: 'Manchester United',
      league: 'Premier League'
    }
  }
];

db.bets.insertMany(bets);
print(`✅ Inserted ${bets.length} bets`);

// ============================================================
// TRANSACTIONS COLLECTION
// ============================================================
print('💰 Creating transactions collection...');

const transactions = [
  {
    _id: ObjectId(),
    id: 'txn_1735635600_deposit_001',
    userId: 'user_2345678901_def456ghi',
    type: 'deposit',
    amount: 500.00,
    currency: 'EUR',
    status: 'completed',
    method: 'credit_card',
    reference: 'CC_****1234_20241220',
    description: 'Credit card deposit',
    balanceBefore: 750.75,
    balanceAfter: 1250.75,
    processedAt: new Date('2024-12-20T14:25:00Z'),
    createdAt: new Date('2024-12-20T14:24:00Z'),
    metadata: {
      paymentGateway: 'stripe',
      transactionId: 'pi_1234567890abcdef',
      cardLast4: '1234',
      cardBrand: 'visa'
    }
  },
  {
    _id: ObjectId(),
    id: 'txn_1735549200_bet_place_001',
    userId: 'user_3456789012_ghi789jkl',
    type: 'bet_placed',
    amount: -25.00,
    currency: 'EUR',
    status: 'completed',
    method: 'internal',
    reference: 'bet_1735549200_def456',
    description: 'Bet placed on PSG vs Lille',
    balanceBefore: 475.30,
    balanceAfter: 450.30,
    processedAt: new Date('2024-12-19T18:45:00Z'),
    createdAt: new Date('2024-12-19T18:45:00Z'),
    metadata: {
      betId: 'bet_1735549200_def456',
      fixtureId: '868551',
      betType: 'match_winner'
    }
  },
  {
    _id: ObjectId(),
    id: 'txn_1735722000_bet_win_001',
    userId: 'user_3456789012_ghi789jkl',
    type: 'bet_won',
    amount: 36.25,
    currency: 'EUR',
    status: 'completed',
    method: 'internal',
    reference: 'bet_1735549200_def456',
    description: 'Bet won on PSG vs Lille',
    balanceBefore: 450.30,
    balanceAfter: 486.55,
    processedAt: new Date('2024-12-24T22:00:00Z'),
    createdAt: new Date('2024-12-24T22:00:00Z'),
    metadata: {
      betId: 'bet_1735549200_def456',
      fixtureId: '868551',
      originalStake: 25.00,
      odds: 1.45
    }
  },
  {
    _id: ObjectId(),
    id: 'txn_1735462800_withdrawal_001',
    userId: 'user_4567890123_jkl012mno',
    type: 'withdrawal',
    amount: -200.00,
    currency: 'EUR',
    status: 'pending',
    method: 'bank_transfer',
    reference: 'BT_ES1234567890_20241218',
    description: 'Bank transfer withdrawal',
    balanceBefore: 2950.00,
    balanceAfter: 2750.00,
    processedAt: null,
    createdAt: new Date('2024-12-18T20:10:00Z'),
    metadata: {
      bankAccount: 'ES12****7890',
      bankName: 'Banco Santander',
      estimatedArrival: new Date('2024-12-23T00:00:00Z')
    }
  },
  {
    _id: ObjectId(),
    id: 'txn_1735203600_admin_adj_001',
    userId: 'user_1234567890_abc123def',
    type: 'admin_adjustment',
    amount: 50000.00,
    currency: 'EUR',
    status: 'completed',
    method: 'admin',
    reference: 'ADJ_ADMIN_BALANCE_001',
    description: 'Admin balance adjustment',
    balanceBefore: 50000.00,
    balanceAfter: 100000.00,
    processedAt: new Date('2024-12-15T08:40:00Z'),
    createdAt: new Date('2024-12-15T08:40:00Z'),
    metadata: {
      adminUserId: 'user_1234567890_abc123def',
      reason: 'Initial admin balance setup'
    }
  },
  {
    _id: ObjectId(),
    id: 'txn_1735117200_bet_lost_001',
    userId: 'user_2345678901_def456ghi',
    type: 'bet_lost',
    amount: 0,
    currency: 'EUR',
    status: 'completed',
    method: 'internal',
    reference: 'bet_1735376400_jkl012',
    description: 'Bet lost on PSG vs Lille',
    balanceBefore: 1250.75,
    balanceAfter: 1250.75,
    processedAt: new Date('2024-12-24T22:00:00Z'),
    createdAt: new Date('2024-12-24T22:00:00Z'),
    metadata: {
      betId: 'bet_1735376400_jkl012',
      fixtureId: '868551',
      originalStake: 30.00,
      odds: 1.75
    }
  }
];

db.transactions.insertMany(transactions);
print(`✅ Inserted ${transactions.length} transactions`);

// ============================================================
// PROCESSED_RESULTS COLLECTION
// ============================================================
print('📊 Creating processed_results collection...');

const processedResults = [
  {
    _id: ObjectId(),
    id: 'result_868551_20241224',
    fixtureId: 868551,
    homeTeam: 'Paris Saint Germain',
    awayTeam: 'Lille',
    league: 'Ligue 1',
    matchDate: new Date('2025-01-24T20:00:00Z'),
    finalScore: {
      home: 3,
      away: 1
    },
    result: 'home_win',
    processedAt: new Date('2024-12-24T22:00:00Z'),
    betsProcessed: 2,
    totalPayout: 36.25,
    statistics: {
      totalStake: 55.00,
      winningBets: 1,
      losingBets: 1,
      houseProfit: 18.75
    },
    details: {
      goals: [
        { minute: 23, team: 'home', player: 'Kylian Mbappé' },
        { minute: 45, team: 'home', player: 'Neymar Jr' },
        { minute: 67, team: 'away', player: 'Jonathan David' },
        { minute: 89, team: 'home', player: 'Lionel Messi' }
      ],
      cards: [
        { minute: 34, team: 'away', player: 'Benjamin André', type: 'yellow' },
        { minute: 78, team: 'home', player: 'Marco Verratti', type: 'yellow' }
      ]
    }
  }
];

db.processed_results.insertMany(processedResults);
print(`✅ Inserted ${processedResults.length} processed results`);

// ============================================================
// SYSTEM_STATS COLLECTION (Analytics & Monitoring)
// ============================================================
print('📈 Creating system_stats collection...');

const systemStats = [
  {
    _id: ObjectId(),
    date: new Date('2024-12-20T00:00:00Z'),
    metrics: {
      totalUsers: 5,
      activeUsers: 4,
      totalBets: 6,
      totalStake: 215.00,
      totalPayout: 36.25,
      houseProfit: 178.75,
      averageBetSize: 35.83,
      popularLeagues: [
        { name: 'Premier League', bets: 3 },
        { name: 'Ligue 1', bets: 2 },
        { name: 'La Liga', bets: 1 }
      ],
      popularBetTypes: [
        { type: 'match_winner', count: 4 },
        { type: 'over_under', count: 1 },
        { type: 'both_teams_score', count: 1 }
      ]
    },
    performance: {
      averageResponseTime: 85,
      errorRate: 0.02,
      uptime: 99.98,
      totalRequests: 15420
    },
    createdAt: new Date('2024-12-20T23:59:59Z')
  }
];

db.system_stats.insertMany(systemStats);
print(`✅ Inserted ${systemStats.length} system stats records`);

// ============================================================
// CREATE INDEXES FOR PERFORMANCE
// ============================================================
print('🔍 Creating database indexes...');

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Bets indexes
db.bets.createIndex({ userId: 1 });
db.bets.createIndex({ fixtureId: 1 });
db.bets.createIndex({ status: 1 });
db.bets.createIndex({ placedAt: -1 });

// Transactions indexes
db.transactions.createIndex({ userId: 1 });
db.transactions.createIndex({ type: 1 });
db.transactions.createIndex({ status: 1 });
db.transactions.createIndex({ createdAt: -1 });

// Fixtures indexes
db.fixtures.createIndex({ id: 1 }, { unique: true });
db.fixtures.createIndex({ "league.id": 1 });
db.fixtures.createIndex({ date: 1 });
db.fixtures.createIndex({ status: 1 });

// Processed results indexes
db.processed_results.createIndex({ fixtureId: 1 }, { unique: true });
db.processed_results.createIndex({ processedAt: -1 });

print('✅ Created performance indexes');

// ============================================================
// SUMMARY
// ============================================================
print('\n🎉 YAMI BETTING PLATFORM DATABASE SETUP COMPLETE!');
print('===============================================');
print('📊 Database: betting_platform');
print('👥 Users: 5 (1 admin, 4 regular users)');
print('⚽ Fixtures: 3 (mix of scheduled and finished)');
print('🎰 Bets: 6 (pending, won, lost)');
print('💰 Transactions: 6 (deposits, withdrawals, bet settlements)');
print('📈 Results: 1 processed match result');
print('🔍 Indexes: Created for optimal performance');
print('\n🔐 Admin Login:');
print('   Email: admin@admin.com');
print('   Password: admin123');
print('\n🌐 Access via Mongo Express: http://localhost:8081');
print('✅ Ready for testing and demonstration!');
