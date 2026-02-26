import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await analyticsAPI.getStats();
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load analytics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-3">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.total_vendors || 0}</div>
          <div className="stat-label">Total Vendors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#00ff88' }}>
            {stats?.risk_distribution?.low || 0}
          </div>
          <div className="stat-label">Low Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ffc107' }}>
            {stats?.risk_distribution?.medium || 0}
          </div>
          <div className="stat-label">Medium Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ff4757' }}>
            {stats?.risk_distribution?.high || 0}
          </div>
          <div className="stat-label">High Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#b8b8b8', fontSize: '1.5rem' }}>
            {stats?.average_risk_score || 0}
          </div>
          <div className="stat-label">Avg Risk Score</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">Quick Actions</div>
        <div className="grid grid-3">
          <Link to="/add" className="btn btn-primary">
            ➕ Add New Vendor
          </Link>
          <Link to="/scan" className="btn btn-success">
            📷 Scan QR Code
          </Link>
          <Link to="/vendors" className="btn btn-secondary">
            📋 View All Vendors
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="card">
        <div className="card-header">Welcome to Vendor Verification System</div>
        <div className="alert alert-info">
          <strong>📌 How it works:</strong>
          <ul className="mt-2" style={{ paddingLeft: '1.5rem' }}>
            <li>Add vendor details with complete information</li>
            <li>Generate unique QR codes for each vendor</li>
            <li>Scan QR codes to verify vendors and get AI-powered risk insights</li>
            <li>Review risk scores, flags, and recommendations for each vendor</li>
          </ul>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-3">
        <div className="card">
          <h3 className="mb-2">🔐 Secure Verification</h3>
          <p className="text-muted">
            Each vendor gets a unique QR code linked to their database record for instant verification.
          </p>
        </div>
        <div className="card">
          <h3 className="mb-2">🤖 AI Risk Assessment</h3>
          <p className="text-muted">
            Advanced algorithms analyze vendor data to detect potential risks and flag suspicious patterns.
          </p>
        </div>
        <div className="card">
          <h3 className="mb-2">📊 Real-time Analytics</h3>
          <p className="text-muted">
            Monitor vendor risk distribution and get insights into your vendor ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
