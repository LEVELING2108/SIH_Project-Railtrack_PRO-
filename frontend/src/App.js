import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import VendorList from './pages/VendorList';
import AddVendor from './pages/AddVendor';
import Scanner from './pages/Scanner';
import VendorDetail from './pages/VendorDetail';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🔐 VendorVerify
        </Link>
        <ul className="navbar-nav">
          <li><Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Dashboard</Link></li>
          <li><Link to="/vendors" className={location.pathname === '/vendors' ? 'nav-link active' : 'nav-link'}>Vendors</Link></li>
          <li><Link to="/add" className={location.pathname === '/add' ? 'nav-link active' : 'nav-link'}>Add Vendor</Link></li>
          <li><Link to="/scan" className={location.pathname === '/scan' ? 'nav-link active' : 'nav-link'}>Scan QR</Link></li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendors" element={<VendorList />} />
            <Route path="/vendors/:id" element={<VendorDetail />} />
            <Route path="/add" element={<AddVendor />} />
            <Route path="/scan" element={<Scanner />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
