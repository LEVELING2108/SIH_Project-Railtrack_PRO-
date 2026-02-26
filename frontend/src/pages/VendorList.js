import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI } from '../api';

function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendors(currentPage);
  }, [currentPage]);

  const fetchVendors = async (page) => {
    try {
      const response = await vendorAPI.getAll(page, 10);
      setVendors(response.data.vendors);
      setTotalPages(response.data.pages);
      setCurrentPage(response.data.current_page);
      setLoading(false);
    } catch (err) {
      setError('Failed to load vendors');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorAPI.delete(id);
        fetchVendors(currentPage);
      } catch (err) {
        alert('Failed to delete vendor');
      }
    }
  };

  const getRiskClass = (score) => {
    if (score >= 70) return 'risk-high';
    if (score >= 40) return 'risk-medium';
    return 'risk-low';
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner"></div>
        <p>Loading vendors...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="flex flex-between flex-center mb-3">
        <h1>Vendors</h1>
        <Link to="/add" className="btn btn-primary">+ Add Vendor</Link>
      </div>

      {vendors.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted mb-2">No vendors found</p>
          <Link to="/add" className="btn btn-primary">Add Your First Vendor</Link>
        </div>
      ) : (
        <div className="vendor-list">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="vendor-item">
              <div className="vendor-info">
                <h3>{vendor.vendor_name}</h3>
                <p>ID: {vendor.id}</p>
                {vendor.contact_email && <p>📧 {vendor.contact_email}</p>}
                {vendor.contact_phone && <p>📱 {vendor.contact_phone}</p>}
                {vendor.city && <p>📍 {vendor.city}, {vendor.state}</p>}
              </div>
              <div className="flex gap-2">
                <span className={`risk-badge ${getRiskClass(vendor.risk_score)}`}>
                  {getRiskLabel(vendor.risk_score)} ({vendor.risk_score})
                </span>
                <Link to={`/vendors/${vendor.id}`} className="btn btn-secondary">
                  View
                </Link>
                <button
                  onClick={() => handleDelete(vendor.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-center gap-2 mt-3">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span className="text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default VendorList;
