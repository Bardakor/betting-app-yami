// Shared users store for consistency across auth systems
const users = [
  {
    id: 'admin123',
    email: 'admin@admin.com',
    password: 'admin123', // Plain text for demo simplicity
    firstName: 'Admin',
    lastName: 'User',
    balance: 100000,
    isActive: true,
    stats: {
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      pendingBets: 0,
      totalWinnings: 0,
      totalLosses: 0
    }
  }
];

module.exports = { users }; 