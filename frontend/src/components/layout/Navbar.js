import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          🐔 Poultry Farm Management
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/flocks" className="navbar-link">Flocks</Link>
          <Link to="/production" className="navbar-link">Production</Link>
          <Link to="/feeding" className="navbar-link">Feeding</Link>
          <Link to="/health" className="navbar-link">Health</Link>
          <Link to="/inventory" className="navbar-link">Inventory</Link>
          <Link to="/sales" className="navbar-link">Sales</Link>
          <Link to="/expenses" className="navbar-link">Expenses</Link>
          <Link to="/reports" className="navbar-link">Reports</Link>
        </div>

        <div className="navbar-user">
          <NotificationBell />
          <span className="user-name">{user?.name}</span>
          <span className="user-role">({user?.role})</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

