import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackItemsAPI } from '../api';

function TrackItemsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    item_type: '',
    status: ''
  });

  const itemTypes = {
    elastic_rail_clip: 'Elastic Rail Clip',
    rail_pad: 'Rail Pad',
    liner: 'Liner',
    sleeper: 'Sleeper'
  };

  const itemIcons = {
    elastic_rail_clip: '🔩',
    rail_pad: '📏',
    liner: '⭕',
    sleeper: '🛤️'
  };

  const statusTypes = {
    in_stock: 'In Stock',
    installed: 'Installed',
    in_service: 'In Service',
    defective: 'Defective',
    replaced: 'Replaced'
  };

  const statusIcons = {
    in_stock: '📦',
    installed: '🔧',
    in_service: '✅',
    defective: '⚠️',
    replaced: '🔄'
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await trackItemsAPI.getAll(page, 10, filters);
      setItems(response.data.track_items || []);
      setTotalPages(response.data.pages || 1);
      setError(null);
    } catch (err) {
      setError('Failed to load track items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(1);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'in_service': return 'badge-success';
      case 'in_stock': return 'badge-info';
      case 'installed': return 'badge-primary';
      case 'defective': return 'badge-danger';
      case 'replaced': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="text-center" style={{ padding: '4rem 2rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--slate-600)', marginTop: '1rem' }}>Loading track items...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between align-center mb-3">
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '800',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🛤️ Track Fittings & Components
        </h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/track-items/add')}
        >
          <span>➕</span> Add Track Item
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-header" style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
          <span>🔍</span> Filters
        </div>
        <div className="grid grid-3 gap-2">
          <div className="form-group">
            <label className="form-label">Item Type</label>
            <select
              name="item_type"
              className="form-control"
              value={filters.item_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {Object.keys(itemTypes).map(key => (
                <option key={key} value={key}>{itemIcons[key]} {itemTypes[key]}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              {Object.keys(statusTypes).map(key => (
                <option key={key} value={key}>{statusIcons[key]} {statusTypes[key]}</option>
              ))}
            </select>
          </div>

          <div className="form-group flex align-end">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFilters({ item_type: '', status: '' });
                setPage(1);
              }}
            >
              <span>🧹</span> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Track Items Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Lot Number</th>
                <th>Item Type</th>
                <th>Vendor</th>
                <th>Quantity</th>
                <th>Manufacture Date</th>
                <th>Status</th>
                <th>Location</th>
                <th>Warranty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
                    <p style={{ color: 'var(--slate-500)', fontSize: '1.1rem' }}>No track items found</p>
                    <button 
                      className="btn btn-primary" 
                      style={{ marginTop: '1rem' }}
                      onClick={() => navigate('/track-items/add')}
                    >
                      <span>➕</span> Add Your First Track Item
                    </button>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🏷️</span>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--slate-800)' }}>{item.lot_number}</div>
                          <small style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>{item.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{itemIcons[item.item_type] || '📦'}</span>
                        <span>{itemTypes[item.item_type] || item.item_type}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--slate-700)' }}>
                          {item.vendor_name || item.vendor_id}
                        </div>
                        <small style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>{item.vendor_id}</small>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📊</span>
                        <span style={{ fontWeight: '600' }}>{item.quantity?.toLocaleString()}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--slate-600)' }}>
                      {item.manufacture_date ? new Date(item.manufacture_date).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                        <span style={{ marginRight: '0.25rem' }}>{statusIcons[item.status] || '📌'}</span>
                        {statusTypes[item.status] || item.status}
                      </span>
                    </td>
                    <td>
                      {item.section_name ? (
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--slate-700)' }}>{item.section_name}</div>
                          {item.division && <small style={{ color: 'var(--slate-400)' }}>{item.division}</small>}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--slate-400)' }}>-</span>
                      )}
                    </td>
                    <td>
                      {item.warranty_expiry_date ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>
                            {new Date(item.warranty_expiry_date).toLocaleDateString()}
                          </span>
                          {new Date(item.warranty_expiry_date) < new Date() && (
                            <span className="badge badge-danger">
                              <span>⚠️</span> Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--slate-400)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/track-items/${item.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <span>👁️</span> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1
              }}
            >
              <span>←</span> Previous
            </button>
            <span style={{ 
              padding: '0.5rem 1.5rem', 
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 'var(--radius-xl)',
              color: 'var(--slate-600)',
              fontWeight: '600',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center'
            }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              style={{
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.5 : 1
              }}
            >
              Next <span>→</span>
            </button>
          </div>
        )}
      </div>

      <div className="alert alert-info mt-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>📊</span> 
        <strong>Total Items:</strong> {items.length} track fitting items displayed
      </div>
    </div>
  );
}

export default TrackItemsList;
