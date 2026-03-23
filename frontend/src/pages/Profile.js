import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    checkTokenInfo();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.check ? await authAPI.get('/auth/me') : null;
      if (response) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      setError('Failed to fetch user info');
    } finally {
      setLoading(false);
    }
  };

  const checkTokenInfo = () => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const role = localStorage.getItem('role');
    
    setTokenInfo({
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      role: role || 'Not set',
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
      isLoggedIn: !!token
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '4rem 2rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--slate-600)', marginTop: '1rem' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: '800',
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '2rem'
      }}>
        👤 My Profile
      </h1>

      {/* Login Status */}
      <div className="card">
        <div className="card-header">
          <span>🔐</span> Authentication Status
        </div>
        
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <span>📊</span> <strong>Current Login Status</strong>
        </div>

        <table className="details-table">
          <tbody>
            <tr>
              <th>Logged In</th>
              <td>
                {tokenInfo?.isLoggedIn ? (
                  <span className="badge badge-success">✅ Yes</span>
                ) : (
                  <span className="badge badge-danger">❌ No</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Access Token</th>
              <td>
                {tokenInfo?.hasToken ? (
                  <span className="badge badge-success">✅ Present</span>
                ) : (
                  <span className="badge badge-danger">❌ Missing</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Refresh Token</th>
              <td>
                {tokenInfo?.hasRefreshToken ? (
                  <span className="badge badge-success">✅ Present</span>
                ) : (
                  <span className="badge badge-danger">❌ Missing</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Role</th>
              <td>
                <span className={`badge ${tokenInfo?.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                  {tokenInfo?.role}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* User Info */}
      {user && (
        <div className="card">
          <div className="card-header">
            <span>👤</span> User Information
          </div>
          
          <table className="details-table">
            <tbody>
              <tr>
                <th>User ID</th>
                <td>{user.id}</td>
              </tr>
              <tr>
                <th>Username</th>
                <td><strong>{user.username}</strong></td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{user.email}</td>
              </tr>
              <tr>
                <th>Role</th>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                    {user.role.toUpperCase()}
                  </span>
                  {user.role !== 'admin' && (
                    <span style={{ marginLeft: '0.5rem', color: 'var(--warning)', fontSize: '0.85rem' }}>
                      ⚠️ Admin privileges required for deleting vendors
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <th>Account Active</th>
                <td>
                  {user.is_active ? (
                    <span className="badge badge-success">✅ Active</span>
                  ) : (
                    <span className="badge badge-danger">❌ Disabled</span>
                  )}
                </td>
              </tr>
              <tr>
                <th>Last Login</th>
                <td>
                  {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Check */}
      <div className="card">
        <div className="card-header">
          <span>⚠️</span> Admin Access Check
        </div>
        
        {tokenInfo?.role === 'admin' ? (
          <div className="alert alert-success">
            <span>✅</span> <strong>You have admin privileges!</strong> You can delete vendors and perform admin actions.
          </div>
        ) : (
          <div>
            <div className="alert alert-warning">
              <span>⚠️</span> <strong>You are not logged in as admin.</strong> You need admin privileges to delete vendors.
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-xl)' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--slate-700)' }}>
                <strong>To delete vendors, please login with admin credentials:</strong>
              </p>
              <div style={{ display: 'inline-block', padding: '1rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-200)' }}>
                <p style={{ margin: '0.5rem 0', color: 'var(--slate-600)' }}>
                  <span>👤</span> Username: <strong style={{ color: 'var(--primary-600)' }}>admin</strong>
                </p>
                <p style={{ margin: '0.5rem 0', color: 'var(--slate-600)' }}>
                  <span>🔑</span> Password: <strong style={{ color: 'var(--primary-600)' }}>Admin@123</strong>
                </p>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary" 
                style={{ marginTop: '1rem' }}
              >
                <span>🚪</span> Logout and Login as Admin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          <span>🏠</span> Back to Dashboard
        </button>
        <button onClick={handleLogout} className="btn btn-danger">
          <span>🚪</span> Logout
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mt-3">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}

export default Profile;
