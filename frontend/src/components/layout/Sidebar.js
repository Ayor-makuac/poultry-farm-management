import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessRoute } from '../../utils/permissions';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // All menu items with their paths
  const allMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/flocks', label: 'Flocks', icon: '🐔' },
    { path: '/production', label: 'Production', icon: '🥚' },
    { path: '/feeding', label: 'Feeding', icon: '🌾' },
    { path: '/health', label: 'Health', icon: '💊' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/expenses', label: 'Expenses', icon: '📝' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/users', label: 'Users', icon: '👥' }
  ];

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (!user) return [];
    return allMenuItems.filter(item => canAccessRoute(user, item.path));
  }, [user]);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon">🐔</span>
          {!isCollapsed && <span className="brand-text">Poultry Farm</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <span className="link-icon">{item.icon}</span>
              {!isCollapsed && <span className="link-text">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-content">
          <p className="footer-text">© 2025 Poultry Farm</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

