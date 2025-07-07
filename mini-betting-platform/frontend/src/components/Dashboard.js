import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWinnings: 0,
    activeBets: 0
  });
  const [recentBets, setRecentBets] = useState([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user bets
      const betsResponse = await api.bets.getUserBets();
      const userBets = betsResponse || [];
      
      // Load fixtures
      const fixturesResponse = await api.fixtures.getAll();
      const fixtures = fixturesResponse || [];
      
      // Calculate stats
      const totalBets = userBets.length;
      const activeBets = userBets.filter(bet => bet.status === 'pending').length;
      const totalWinnings = userBets
        .filter(bet => bet.status === 'won')
        .reduce((sum, bet) => sum + (bet.potentialWinning || 0), 0);
      
      setStats({ totalBets, totalWinnings, activeBets });
      setRecentBets(userBets.slice(0, 5)); // Show last 5 bets
      setUpcomingFixtures(fixtures.slice(0, 3)); // Show next 3 fixtures
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBetStatusColor = (status) => {
    switch (status) {
      case 'won': return '#27ae60';
      case 'lost': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Dashboard</h1>
          <p>Welcome back, {user.displayName || user.email}!</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center', background: '#3498db', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{stats.totalBets}</h3>
            <p style={{ margin: 0 }}>Total Bets</p>
          </div>
          <div className="card" style={{ textAlign: 'center', background: '#27ae60', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{formatCurrency(stats.totalWinnings)}</h3>
            <p style={{ margin: 0 }}>Total Winnings</p>
          </div>
          <div className="card" style={{ textAlign: 'center', background: '#f39c12', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{stats.activeBets}</h3>
            <p style={{ margin: 0 }}>Active Bets</p>
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-2">
          {/* Recent Bets */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Bets</h2>
            </div>
            {recentBets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>No bets placed yet.</p>
                <Link to="/fixtures" className="btn btn-primary">
                  View Fixtures
                </Link>
              </div>
            ) : (
              <div>
                {recentBets.map((bet) => (
                  <div 
                    key={bet._id} 
                    style={{ 
                      padding: '1rem', 
                      border: '1px solid #eee', 
                      borderRadius: '4px', 
                      marginBottom: '1rem',
                      borderLeft: `4px solid ${getBetStatusColor(bet.status)}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                          {bet.fixture?.homeTeam} vs {bet.fixture?.awayTeam}
                        </p>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                          Bet: {bet.betType} | Amount: {formatCurrency(bet.amount)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span 
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.8rem',
                            background: getBetStatusColor(bet.status),
                            color: 'white'
                          }}
                        >
                          {bet.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Link to="/profile" className="btn btn-secondary" style={{ width: '100%' }}>
                  View All Bets
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Fixtures */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Fixtures</h2>
            </div>
            {upcomingFixtures.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>No upcoming fixtures.</p>
              </div>
            ) : (
              <div>
                {upcomingFixtures.map((fixture) => (
                  <div 
                    key={fixture._id} 
                    style={{ 
                      padding: '1rem', 
                      border: '1px solid #eee', 
                      borderRadius: '4px', 
                      marginBottom: '1rem' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                          {fixture.homeTeam} vs {fixture.awayTeam}
                        </p>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                          {formatDate(fixture.date)} | {fixture.league}
                        </p>
                      </div>
                      <Link 
                        to={`/place-bet/${fixture._id}`} 
                        className="btn btn-primary"
                      >
                        Bet Now
                      </Link>
                    </div>
                  </div>
                ))}
                <Link to="/fixtures" className="btn btn-secondary" style={{ width: '100%' }}>
                  View All Fixtures
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/fixtures" className="btn btn-primary">
              View All Fixtures
            </Link>
            <Link to="/place-bet" className="btn btn-success">
              Place a Bet
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
