import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const PlaceBet = ({ user }) => {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  
  const [fixture, setFixture] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState(fixtureId || '');
  const [betType, setBetType] = useState('home');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFixtures();
  }, []);

  useEffect(() => {
    if (selectedFixture && fixtures.length > 0) {
      const selected = fixtures.find(f => f._id === selectedFixture);
      setFixture(selected);
    }
  }, [selectedFixture, fixtures]);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      const response = await api.fixtures.getAll();
      const upcomingFixtures = (response || []).filter(f => f.status === 'upcoming');
      setFixtures(upcomingFixtures);
      
      // If we have a fixtureId but no fixture is selected, set it
      if (fixtureId && !selectedFixture) {
        setSelectedFixture(fixtureId);
      }
    } catch (error) {
      console.error('Failed to load fixtures:', error);
      setError('Failed to load fixtures');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!selectedFixture) {
        throw new Error('Please select a fixture');
      }
      if (!betType) {
        throw new Error('Please select a bet type');
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid bet amount');
      }
      if (parseFloat(amount) < 1) {
        throw new Error('Minimum bet amount is $1');
      }
      if (parseFloat(amount) > 1000) {
        throw new Error('Maximum bet amount is $1000');
      }

      const betData = {
        fixtureId: selectedFixture,
        betType,
        amount: parseFloat(amount)
      };

      const response = await api.bets.placeBet(betData);
      
      setSuccess(`Bet placed successfully! Bet ID: ${response._id}`);
      
      // Clear form
      setAmount('');
      if (!fixtureId) {
        setSelectedFixture('');
        setFixture(null);
      }

      // Redirect to profile after a delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (error) {
      console.error('Failed to place bet:', error);
      setError(error.message || 'Failed to place bet');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculatePotentialWinning = () => {
    if (!fixture || !amount || !betType) return 0;
    
    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) return 0;

    let odds = 1.5; // Default odds
    if (fixture.odds) {
      switch (betType) {
        case 'home':
          odds = fixture.odds.home || 1.5;
          break;
        case 'away':
          odds = fixture.odds.away || 1.5;
          break;
        case 'draw':
          odds = fixture.odds.draw || 1.5;
          break;
      }
    }

    return betAmount * odds;
  };

  const getBetTypeLabel = (type) => {
    if (!fixture) return type;
    
    switch (type) {
      case 'home':
        return `${fixture.homeTeam} Win`;
      case 'away':
        return `${fixture.awayTeam} Win`;
      case 'draw':
        return 'Draw';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading fixtures...</p>
      </div>
    );
  }

  return (
    <div className="place-bet">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Place a Bet</h1>
          <p>Select a fixture and place your bet</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {fixtures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              No upcoming fixtures available for betting
            </p>
            <Link to="/fixtures" className="btn btn-primary">
              View All Fixtures
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Fixture Selection */}
            <div className="form-group">
              <label className="form-label">Select Fixture</label>
              <select 
                className="form-select"
                value={selectedFixture}
                onChange={(e) => setSelectedFixture(e.target.value)}
                required
              >
                <option value="">Choose a fixture...</option>
                {fixtures.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.homeTeam} vs {f.awayTeam} - {formatDate(f.date)}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Fixture Display */}
            {fixture && (
              <div className="card" style={{ margin: '1.5rem 0', background: '#f8f9fa' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>
                    {fixture.homeTeam} vs {fixture.awayTeam}
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
                    {formatDate(fixture.date)} | {fixture.league}
                  </p>
                  
                  {fixture.odds && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem' }}>
                      <span><strong>Home Win:</strong> {fixture.odds.home}</span>
                      <span><strong>Draw:</strong> {fixture.odds.draw}</span>
                      <span><strong>Away Win:</strong> {fixture.odds.away}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bet Type Selection */}
            {fixture && (
              <div className="form-group">
                <label className="form-label">Bet Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  {['home', 'draw', 'away'].map((type) => (
                    <label 
                      key={type}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem',
                        border: `2px solid ${betType === type ? '#3498db' : '#ddd'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: betType === type ? '#e3f2fd' : 'white',
                        transition: 'all 0.3s'
                      }}
                    >
                      <input
                        type="radio"
                        name="betType"
                        value={type}
                        checked={betType === type}
                        onChange={(e) => setBetType(e.target.value)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{getBetTypeLabel(type)}</div>
                        {fixture.odds && (
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Odds: {fixture.odds[type]}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Bet Amount */}
            {fixture && (
              <div className="form-group">
                <label className="form-label">Bet Amount ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter bet amount"
                  min="1"
                  max="1000"
                  step="0.01"
                  required
                />
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  Minimum: $1 | Maximum: $1000
                </div>
              </div>
            )}

            {/* Bet Summary */}
            {fixture && amount && betType && (
              <div className="card" style={{ margin: '1.5rem 0', background: '#e8f5e8' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#27ae60' }}>Bet Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <strong>Match:</strong> {fixture.homeTeam} vs {fixture.awayTeam}
                  </div>
                  <div>
                    <strong>Bet Type:</strong> {getBetTypeLabel(betType)}
                  </div>
                  <div>
                    <strong>Bet Amount:</strong> ${parseFloat(amount || 0).toFixed(2)}
                  </div>
                  <div>
                    <strong>Potential Winning:</strong> ${calculatePotentialWinning().toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={submitting || !fixture || !amount || !betType}
                style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
              >
                {submitting ? 'Placing Bet...' : 'Place Bet'}
              </button>
            </div>
          </form>
        )}

        {/* Quick Actions */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/fixtures" className="btn btn-secondary" style={{ marginRight: '1rem' }}>
            View All Fixtures
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            View My Bets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaceBet;
