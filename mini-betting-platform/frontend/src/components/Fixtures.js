import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Fixtures = () => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, live, finished

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      const response = await api.fixtures.getAll();
      setFixtures(response || []);
    } catch (error) {
      console.error('Failed to load fixtures:', error);
      setError('Failed to load fixtures');
    } finally {
      setLoading(false);
    }
  };

  const refreshFixtures = async () => {
    try {
      setError('');
      const response = await api.fixtures.refresh();
      if (response.message) {
        // Show success message and reload
        setTimeout(() => {
          loadFixtures();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to refresh fixtures:', error);
      setError('Failed to refresh fixtures from external API');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#3498db';
      case 'live': return '#e74c3c';
      case 'finished': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'live': return 'Live';
      case 'finished': return 'Finished';
      default: return 'Unknown';
    }
  };

  const filteredFixtures = fixtures.filter(fixture => {
    if (filter === 'all') return true;
    return fixture.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading fixtures...</p>
      </div>
    );
  }

  return (
    <div className="fixtures">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="card-title">Football Fixtures</h1>
            <button 
              onClick={refreshFixtures} 
              className="btn btn-primary"
              style={{ fontSize: '0.9rem' }}
            >
              🔄 Refresh from API
            </button>
          </div>
          <p>Browse and bet on upcoming football matches</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'upcoming', 'live', 'finished'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`btn ${filter === filterOption ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {filterOption === 'all' ? 'All Fixtures' : getStatusText(filterOption)}
              </button>
            ))}
          </div>
        </div>

        {/* Fixtures List */}
        {filteredFixtures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              {filter === 'all' ? 'No fixtures available' : `No ${filter} fixtures`}
            </p>
            <button onClick={refreshFixtures} className="btn btn-primary">
              Load Fixtures from API
            </button>
          </div>
        ) : (
          <div className="grid grid-1" style={{ gap: '1rem' }}>
            {filteredFixtures.map((fixture) => (
              <div 
                key={fixture._id} 
                className="card"
                style={{ 
                  margin: 0,
                  borderLeft: `4px solid ${getStatusColor(fixture.status)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    {/* Match Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{fixture.homeTeam}</h3>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>Home</p>
                      </div>
                      
                      <div style={{ 
                        padding: '1rem', 
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        textAlign: 'center',
                        minWidth: '100px'
                      }}>
                        {fixture.status === 'finished' && fixture.homeScore !== undefined && fixture.awayScore !== undefined ? (
                          <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                              {fixture.homeScore} - {fixture.awayScore}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Final</div>
                          </div>
                        ) : fixture.status === 'live' ? (
                          <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                              LIVE
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              {fixture.homeScore || 0} - {fixture.awayScore || 0}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>VS</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              {formatDate(fixture.date)}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{fixture.awayTeam}</h3>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>Away</p>
                      </div>
                    </div>

                    {/* Match Details */}
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#666' }}>
                      <span><strong>League:</strong> {fixture.league}</span>
                      <span><strong>Round:</strong> {fixture.round || 'N/A'}</span>
                      <span>
                        <strong>Status:</strong> 
                        <span 
                          style={{ 
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            background: getStatusColor(fixture.status),
                            color: 'white'
                          }}
                        >
                          {getStatusText(fixture.status)}
                        </span>
                      </span>
                    </div>

                    {/* Odds Display */}
                    {fixture.odds && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                          <span><strong>Home Win:</strong> {fixture.odds.home}</span>
                          <span><strong>Draw:</strong> {fixture.odds.draw}</span>
                          <span><strong>Away Win:</strong> {fixture.odds.away}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div style={{ marginLeft: '2rem' }}>
                    {fixture.status === 'upcoming' ? (
                      <Link 
                        to={`/place-bet/${fixture._id}`} 
                        className="btn btn-success"
                        style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
                      >
                        Place Bet
                      </Link>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        disabled
                        style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
                      >
                        {fixture.status === 'live' ? 'Live' : 'Finished'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {fixtures.length > 0 && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: 0, color: '#666', textAlign: 'center' }}>
              Showing {filteredFixtures.length} of {fixtures.length} fixtures
              {filter !== 'all' && ` (${filter} only)`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fixtures;
