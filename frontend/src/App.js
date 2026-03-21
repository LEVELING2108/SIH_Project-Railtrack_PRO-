import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import VendorList from './pages/VendorList';
import AddVendor from './pages/AddVendor';
import Scanner from './pages/Scanner';
import VendorDetail from './pages/VendorDetail';
import Login from './pages/Login';
import TrackItemsList from './pages/TrackItemsList';
import AddTrackItem from './pages/AddTrackItem';
import TrackItemDetail from './pages/TrackItemDetail';
import VendorPerformance from './pages/VendorPerformance';
import AddInspection from './pages/AddInspection';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  // Check auth state on mount and when storage changes
  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(!!localStorage.getItem('access_token'));
    updateAuth();
    window.addEventListener('storage', updateAuth);
    return () => window.removeEventListener('storage', updateAuth);
  }, []);

  const handleLogin = ({ access_token, refresh_token, role }) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    if (role) localStorage.setItem('role', role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
        <main className={isAuthenticated ? "main-content" : "main-content-full"}>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />

            {/* Track Items Routes (Railway) */}
            <Route path="/track-items" element={isAuthenticated ? <TrackItemsList /> : <Navigate to="/login" replace />} />
            <Route path="/track-items/add" element={isAuthenticated ? <AddTrackItem /> : <Navigate to="/login" replace />} />
            <Route path="/track-items/:id" element={isAuthenticated ? <TrackItemDetail /> : <Navigate to="/login" replace />} />

            {/* Vendor Routes (Legacy) */}
            <Route path="/vendors" element={isAuthenticated ? <VendorList /> : <Navigate to="/login" replace />} />
            <Route path="/vendors/:id" element={isAuthenticated ? <VendorDetail /> : <Navigate to="/login" replace />} />
            <Route path="/add" element={isAuthenticated ? <AddVendor /> : <Navigate to="/login" replace />} />
            <Route path="/vendors/add" element={isAuthenticated ? <AddVendor /> : <Navigate to="/login" replace />} />

            {/* Scanner */}
            <Route path="/scan" element={isAuthenticated ? <Scanner /> : <Navigate to="/login" replace />} />
            
            {/* Analytics */}
            <Route path="/performance" element={isAuthenticated ? <VendorPerformance /> : <Navigate to="/login" replace />} />
            
            {/* Inspection Routes */}
            <Route path="/track-items/:id/inspections/add" element={isAuthenticated ? <AddInspection /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Navbar({ isAuthenticated, onLogout }) {
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span>🚂</span> Railway Track QR System
        </Link>
        {isAuthenticated && (
          <>
            <ul className="navbar-nav">
              <li><Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Dashboard</Link></li>
              <li><Link to="/track-items" className={location.pathname.startsWith('/track-items') ? 'nav-link active' : 'nav-link'}>Track Items</Link></li>
              <li><Link to="/vendors" className={location.pathname.startsWith('/vendors') ? 'nav-link active' : 'nav-link'}>Vendors</Link></li>
              <li><Link to="/scan" className={location.pathname === '/scan' ? 'nav-link active' : 'nav-link'}>Scan QR</Link></li>
              <li><Link to="/performance" className={location.pathname === '/performance' ? 'nav-link active' : 'nav-link'}>Performance</Link></li>
            </ul>
            <div style={{ padding: '1rem', borderTop: '1px solid #e1e8ed' }}>
              <button onClick={handleLogout} className="btn btn-logout" style={{ width: '100%' }}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default App;
