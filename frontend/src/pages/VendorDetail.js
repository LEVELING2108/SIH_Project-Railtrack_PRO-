import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vendorAPI } from '../api';

function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await vendorAPI.getById(id);
        setVendor(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vendor details');
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);


  const fetchQR = async () => {
    try {
      const response = await vendorAPI.getQR(id);
      setQrCode(response.data.qr_code);
      setShowQR(true);
    } catch (err) {
      alert('Failed to generate QR code');
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await vendorAPI.downloadQR(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr_vendor_${id}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download QR code');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorAPI.delete(id);
        navigate('/vendors');
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

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner"></div>
        <p>Loading vendor details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button onClick={() => navigate('/vendors')} className="btn btn-secondary mt-2">
          Back to Vendors
        </button>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="alert alert-warning">
        Vendor not found
        <button onClick={() => navigate('/vendors')} className="btn btn-secondary mt-2">
          Back to Vendors
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-between flex-center mb-3">
        <h1>Vendor Details</h1>
        <div className="flex gap-2">
          <Link to="/vendors" className="btn btn-secondary">
            ← Back
          </Link>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      {/* Risk Score Banner */}
      <div className={`card ${getRiskClass(vendor.risk_score)}`} style={{
        background: vendor.risk_score >= 70 ? 'rgba(255, 71, 87, 0.2)' :
                    vendor.risk_score >= 40 ? 'rgba(255, 193, 7, 0.2)' :
                    'rgba(0, 255, 136, 0.2)',
        border: `2px solid ${vendor.risk_score >= 70 ? '#ff4757' :
                              vendor.risk_score >= 40 ? '#ffc107' :
                              '#00ff88'}`
      }}>
        <div className="flex flex-between flex-center">
          <div>
            <h2 className="mb-1">Risk Assessment</h2>
            <p className="text-muted">AI-powered risk analysis based on vendor data</p>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: vendor.risk_score >= 70 ? '#ff4757' :
                              vendor.risk_score >= 40 ? '#ffc107' : '#00ff88' }}>
              {vendor.risk_score}
            </div>
            <div className="text-muted">Risk Score</div>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="card">
        <div className="card-header">📱 QR Code</div>
        <div className="text-center">
          {showQR && qrCode ? (
            <div className="qr-display">
              <img src={qrCode} alt="Vendor QR Code" className="mb-3" />
              <div className="flex gap-2" style={{ justifyContent: 'center' }}>
                <button onClick={handleDownloadQR} className="btn btn-primary">
                  ⬇️ Download QR
                </button>
                <button onClick={() => setShowQR(false)} className="btn btn-secondary">
                  Hide QR
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-3">Generate QR code for this vendor</p>
              <button onClick={fetchQR} className="btn btn-success">
                🔐 Generate QR Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Information */}
      <div className="card">
        <div className="card-header">📋 Vendor Information</div>
        <div className="grid grid-2">
          <div>
            <p><strong>ID:</strong> {vendor.id}</p>
            <p><strong>Name:</strong> {vendor.vendor_name}</p>
            {vendor.manufacture_date && (
              <p><strong>Manufacture Date:</strong> {vendor.manufacture_date}</p>
            )}
            {vendor.contact_person && (
              <p><strong>Contact Person:</strong> {vendor.contact_person}</p>
            )}
            {vendor.contact_email && (
              <p><strong>Email:</strong> {vendor.contact_email}</p>
            )}
            {vendor.contact_phone && (
              <p><strong>Phone:</strong> {vendor.contact_phone}</p>
            )}
          </div>
          <div>
            {vendor.address_line1 && (
              <p><strong>Address:</strong> {vendor.address_line1}</p>
            )}
            {vendor.city && (
              <p><strong>City:</strong> {vendor.city}</p>
            )}
            {vendor.state && (
              <p><strong>State:</strong> {vendor.state}</p>
            )}
            {vendor.postal_code && (
              <p><strong>Postal Code:</strong> {vendor.postal_code}</p>
            )}
            {vendor.country && (
              <p><strong>Country:</strong> {vendor.country}</p>
            )}
            {vendor.tax_id && (
              <p><strong>Tax ID:</strong> {vendor.tax_id}</p>
            )}
            {vendor.bank_account && (
              <p><strong>Bank Account:</strong> {vendor.bank_account}</p>
            )}
          </div>
        </div>
        {vendor.details && (
          <div className="mt-3">
            <strong>Details:</strong>
            <p className="text-muted">{vendor.details}</p>
          </div>
        )}
        <p className="text-muted mt-3">
          <small>Created: {vendor.created_at ? new Date(vendor.created_at).toLocaleString() : 'N/A'}</small>
        </p>
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="card-header">🤖 AI Insights</div>
        
        {vendor.flags && vendor.flags.length > 0 ? (
          <div className="alert alert-warning">
            <strong>⚠️ Risk Flags ({vendor.flags.length}):</strong>
            <ul className="mt-2" style={{ paddingLeft: '1.5rem' }}>
              {vendor.flags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="alert alert-success">
            ✅ No risk flags detected
          </div>
        )}

        {vendor.recommendations && (
          <div className="mt-3">
            <strong>📋 Recommendations:</strong>
            <ul className="mt-2" style={{ paddingLeft: '1.5rem' }}>
              {vendor.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {vendor.summary && (
          <div className="mt-3">
            <strong>📝 Summary:</strong>
            <p className="text-muted">{vendor.summary}</p>
          </div>
        )}

        {vendor.keywords && vendor.keywords.length > 0 && (
          <div className="mt-3">
            <strong>🏷️ Keywords:</strong>
            <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
              {vendor.keywords.map((keyword, idx) => (
                <span key={idx} className="risk-badge risk-low">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorDetail;
