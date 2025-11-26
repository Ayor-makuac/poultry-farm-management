import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import './Unauthorized.css';

const Unauthorized = () => {
  return (
    <Layout>
      <div className="unauthorized-page">
        <div className="unauthorized-content">
          <div className="unauthorized-icon">🚫</div>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <p className="unauthorized-subtitle">
            Please contact your administrator if you believe this is an error.
          </p>
          <Link to="/dashboard" className="back-button">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Unauthorized;

