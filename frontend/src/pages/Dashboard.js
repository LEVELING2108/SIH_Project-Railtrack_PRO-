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
      console.error('Analytics error:', err);
      setError('Failed to load analytics. Ensure backend is running and you are logged in.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '4rem 2rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--slate-900)', marginTop: '1rem', fontSize: '1.2rem', fontWeight: '700' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <span>⚠️</span> {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--slate-700)', fontSize: '1.15rem', fontWeight: '600' }}>
          Welcome back! Here's your vendor verification overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.total_vendors || 0}</div>
          <div className="stat-label" style={{ color: 'var(--slate-800)', fontWeight: '700', fontSize: '0.95rem' }}>🏢 Total Vendors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'var(--gradient-success)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {stats?.risk_distribution?.low || 0}
          </div>
          <div className="stat-label" style={{ color: 'var(--slate-800)', fontWeight: '700', fontSize: '0.95rem' }}>✅ Low Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'var(--gradient-warning)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {stats?.risk_distribution?.medium || 0}
          </div>
          <div className="stat-label" style={{ color: 'var(--slate-800)', fontWeight: '700', fontSize: '0.95rem' }}>⚠️ Medium Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'var(--gradient-danger)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {stats?.risk_distribution?.high || 0}
          </div>
          <div className="stat-label" style={{ color: 'var(--slate-800)', fontWeight: '700', fontSize: '0.95rem' }}>🚨 High Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '2rem' }}>
            {stats?.average_risk_score || 0}
          </div>
          <div className="stat-label" style={{ color: 'var(--slate-800)', fontWeight: '700', fontSize: '0.95rem' }}>📊 Avg Risk Score</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <span>⚡</span> Quick Actions
        </div>
        <div className="grid grid-3">
          <Link to="/add" className="btn btn-primary">
            <span>➕</span> Add New Vendor
          </Link>
          <Link to="/scan" className="btn btn-success">
            <span>📷</span> Scan QR Code
          </Link>
          <Link to="/vendors" className="btn btn-secondary">
            <span>📋</span> View All Vendors
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="card">
        <div className="card-header">
          <span>📌</span> Welcome to RailTrack Pro
        </div>
        <div className="alert alert-info" style={{ background: 'linear-gradient(135deg, #e8f4fc 0%, #d4ebf9 100%)', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
          <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '1.1rem', color: 'var(--info-dark)' }}>🔐 How it works:</strong>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: 'var(--slate-800)', fontWeight: '500' }}>
            <li>Add vendor details with complete information</li>
            <li>Generate unique QR codes for each vendor</li>
            <li>Scan QR codes to verify vendors and get AI-powered risk insights</li>
            <li>Review risk scores, flags, and recommendations for each vendor</li>
          </ul>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-3">
        <div className="card" style={{ transition: 'all 0.3s ease' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', color: 'var(--slate-900)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.01em' }}>
            <span style={{ fontSize: '1.6rem' }}>🔐</span> Secure Verification
          </h3>
          <p style={{ color: 'var(--slate-700)', lineHeight: '1.7', fontWeight: '500', fontSize: '1rem' }}>
            Each vendor gets a unique QR code linked to their database record for instant verification.
          </p>
        </div>
        <div className="card" style={{ transition: 'all 0.3s ease' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', color: 'var(--slate-900)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.01em' }}>
            <span style={{ fontSize: '1.6rem' }}>🤖</span> AI Risk Assessment
          </h3>
          <p style={{ color: 'var(--slate-700)', lineHeight: '1.7', fontWeight: '500', fontSize: '1rem' }}>
            Advanced algorithms analyze vendor data to detect potential risks and flag suspicious patterns.
          </p>
        </div>
        <div className="card" style={{ transition: 'all 0.3s ease' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', color: 'var(--slate-900)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.01em' }}>
            <span style={{ fontSize: '1.6rem' }}>📊</span> Real-time Analytics
          </h3>
          <p style={{ color: 'var(--slate-700)', lineHeight: '1.7', fontWeight: '500', fontSize: '1rem' }}>
            Monitor vendor risk distribution and get insights into your vendor ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
