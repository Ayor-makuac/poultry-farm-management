import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import './TopHeader.css';

const TopHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="header-title">Poultry Farm Management</h1>
      </div>
      
      <div className="header-right">
        <NotificationBell />
        
        <div className="user-profile-menu" ref={profileMenuRef}>
          <button 
            className="profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User profile"
          >
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.name}</span>
              <span className="profile-role">{user?.role}</span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <button 
                className="dropdown-item"
                onClick={handleProfileClick}
              >
                <span className="dropdown-icon">👤</span>
                <span>My Profile</span>
              </button>
              {user?.role === 'Admin' && (
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/users');
                    setShowProfileMenu(false);
                  }}
                >
                  <span className="dropdown-icon">👥</span>
                  <span>Manage Users</span>
                </button>
              )}
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <span className="dropdown-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;

