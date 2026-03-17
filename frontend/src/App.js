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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));

  // Check auth state on mount and when storage changes
  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(!!localStorage.getItem('access_token'));
    updateAuth();
    window.addEventListener('storage', updateAuth);
    return () => window.removeEventListener('storage', updateAuth);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/vendors" element={isAuthenticated ? <VendorList /> : <Navigate to="/login" replace />} />
            <Route path="/vendors/:id" element={isAuthenticated ? <VendorDetail /> : <Navigate to="/login" replace />} />
            <Route path="/add" element={isAuthenticated ? <AddVendor /> : <Navigate to="/login" replace />} />
            <Route path="/scan" element={isAuthenticated ? <Scanner /> : <Navigate to="/login" replace />} />
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
        <Link to="/" className="navbar-brand">🔐 VendorVerify</Link>
        {isAuthenticated && (
          <ul className="navbar-nav">
            <li><Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Dashboard</Link></li>
            <li><Link to="/vendors" className={location.pathname === '/vendors' ? 'nav-link active' : 'nav-link'}>Vendors</Link></li>
            <li><Link to="/add" className={location.pathname === '/add' ? 'nav-link active' : 'nav-link'}>Add Vendor</Link></li>
            <li><Link to="/scan" className={location.pathname === '/scan' ? 'nav-link active' : 'nav-link'}>Scan QR</Link></li>
            <li><button onClick={handleLogout} className="nav-link btn-logout">Logout</button></li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default App;
