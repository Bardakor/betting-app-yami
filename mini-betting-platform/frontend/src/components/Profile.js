import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Profile = ({ user }) => {
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWinnings: 0,
    totalLosses: 0,
    activeBets: 0,
    winRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, won, lost

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await api.bets.getUserBets();
      const userBets = response || [];
      setBets(userBets);
      calculateStats(userBets);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load your betting history');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userBets) => {
    const totalBets = userBets.length;
    const wonBets = userBets.filter(bet => bet.status === 'won');
    const lostBets = userBets.filter(bet => bet.status === 'lost');
    const activeBets = userBets.filter(bet => bet.status === 'pending').length;
    
    const totalWinnings = wonBets.reduce((sum, bet) => sum + (bet.potentialWinning || 0), 0);
    const totalLosses = lostBets.reduce((sum, bet) => sum + bet.amount, 0);
    const winRate = totalBets > 0 ? (wonBets.length / totalBets) * 100 : 0;

    setStats({
      totalBets,
      totalWinnings,
      totalLosses,
      activeBets,
      winRate
    });
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

  const getBetTypeLabel = (bet) => {
    if (!bet.fixture) return bet.betType;
    
    switch (bet.betType) {
      case 'home':
        return `${bet.fixture.homeTeam} Win`;
      case 'away':
        return `${bet.fixture.awayTeam} Win`;
      case 'draw':
        return 'Draw';
      default:
        return bet.betType;
    }
  };

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true;
    return bet.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">My Profile</h1>
          <p>View your betting history and statistics</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* User Info */}
        <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ margin: 0, background: '#f8f9fa' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>User Information</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt={user.displayName} 
                  style={{ width: '64px', height: '64px', borderRadius: '50%' }}
                />
              )}
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {user.displayName || 'User'}
                </p>
                <p style={{ margin: '0', color: '#666' }}>{user.email}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                  Member since: {formatDate(user.createdAt || new Date())}
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ margin: 0, background: '#f8f9fa' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Quick Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div><strong>Total Bets:</strong> {stats.totalBets}</div>
              <div><strong>Active Bets:</strong> {stats.activeBets}</div>
              <div><strong>Win Rate:</strong> {stats.winRate.toFixed(1)}%</div>
              <div><strong>Net Profit:</strong> {formatCurrency(stats.totalWinnings - stats.totalLosses)}</div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ margin: 0, textAlign: 'center', background: '#3498db', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{stats.totalBets}</h3>
            <p style={{ margin: 0 }}>Total Bets Placed</p>
          </div>
          <div className="card" style={{ margin: 0, textAlign: 'center', background: '#27ae60', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{formatCurrency(stats.totalWinnings)}</h3>
            <p style={{ margin: 0 }}>Total Winnings</p>
          </div>
          <div className="card" style={{ margin: 0, textAlign: 'center', background: stats.totalWinnings >= stats.totalLosses ? '#27ae60' : '#e74c3c', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{formatCurrency(stats.totalWinnings - stats.totalLosses)}</h3>
            <p style={{ margin: 0 }}>Net Profit/Loss</p>
          </div>
        </div>

        {/* Betting History */}
        <div className="card" style={{ margin: '2rem 0 0 0' }}>
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title">Betting History</h2>
              <Link to="/place-bet" className="btn btn-primary">
                Place New Bet
              </Link>
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['all', 'pending', 'won', 'lost'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`btn ${filter === filterOption ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {filterOption === 'all' ? 'All Bets' : filterOption}
                </button>
              ))}
            </div>
          </div>

          {/* Bets List */}
          {filteredBets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                {filter === 'all' ? 'No bets placed yet' : `No ${filter} bets`}
              </p>
              {filter === 'all' && (
                <Link to="/fixtures" className="btn btn-primary">
                  Browse Fixtures
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredBets.map((bet) => (
                <div 
                  key={bet._id} 
                  style={{ 
                    padding: '1.5rem', 
                    border: '1px solid #eee', 
                    borderRadius: '8px',
                    borderLeft: `4px solid ${getBetStatusColor(bet.status)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      {/* Match Info */}
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>
                          {bet.fixture?.homeTeam || 'Unknown'} vs {bet.fixture?.awayTeam || 'Unknown'}
                        </h4>
                        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                          {bet.fixture?.league || 'Unknown League'} | {formatDate(bet.fixture?.date || bet.createdAt)}
                        </p>
                      </div>

                      {/* Bet Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                        <div>
                          <strong>Bet Type:</strong> {getBetTypeLabel(bet)}
                        </div>
                        <div>
                          <strong>Amount:</strong> {formatCurrency(bet.amount)}
                        </div>
                        <div>
                          <strong>Potential Winning:</strong> {formatCurrency(bet.potentialWinning)}
                        </div>
                        <div>
                          <strong>Placed:</strong> {formatDate(bet.createdAt)}
                        </div>
                      </div>

                      {/* Result Info */}
                      {bet.status === 'won' && (
                        <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#d4edda', borderRadius: '4px', color: '#155724' }}>
                          🎉 Congratulations! You won {formatCurrency(bet.potentialWinning)}
                        </div>
                      )}
                      {bet.status === 'lost' && (
                        <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f8d7da', borderRadius: '4px', color: '#721c24' }}>
                          😔 Better luck next time! You lost {formatCurrency(bet.amount)}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div style={{ marginLeft: '1rem' }}>
                      <span 
                        style={{ 
                          padding: '0.5rem 1rem', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
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
            </div>
          )}

          {/* Summary */}
          {filteredBets.length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
              <p style={{ margin: 0, color: '#666', textAlign: 'center' }}>
                Showing {filteredBets.length} of {bets.length} bets
                {filter !== 'all' && ` (${filter} only)`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
