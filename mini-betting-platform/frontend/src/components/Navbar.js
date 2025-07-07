import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        🎲 Mini Betting Platform
      </Link>
      
      <ul className="navbar-nav">
        <li>
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/fixtures" className={isActive('/fixtures')}>
            Fixtures
          </Link>
        </li>
        <li>
          <Link to="/place-bet" className={isActive('/place-bet')}>
            Place Bet
          </Link>
        </li>
        <li>
          <Link to="/profile" className={isActive('/profile')}>
            Profile
          </Link>
        </li>
      </ul>

      <div className="user-info">
        {user.picture && (
          <img 
            src={user.picture} 
            alt={user.displayName} 
            className="user-avatar"
          />
        )}
        <span>Welcome, {user.displayName || user.email}</span>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
