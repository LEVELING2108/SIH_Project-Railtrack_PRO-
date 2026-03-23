import React, { useState, useEffect } from 'react';
import { performanceAPI } from '../api';

function VendorPerformance() {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'low-risk', 'medium-risk', 'high-risk'

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await performanceAPI.getVendorPerformance();
      setPerformanceData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Failed to load vendor performance data');
    } finally {
      setLoading(false);
    }
  };

  const filterByRisk = (vendors) => {
    if (viewMode === 'all') return vendors;
    if (viewMode === 'low-risk') return vendors.filter(v => v.risk_score < 40);
    if (viewMode === 'medium-risk') return vendors.filter(v => v.risk_score >= 40 && v.risk_score < 70);
    if (viewMode === 'high-risk') return vendors.filter(v => v.risk_score >= 70);
    return vendors;
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

  const getItemTypeLabel = (type) => {
    const labels = {
      'elastic_rail_clip': 'Elastic Rail Clip',
      'rail_pad': 'Rail Pad',
      'liner': 'Liner',
      'sleeper': 'Sleeper'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="spinner"></div>
        <p>Loading vendor performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button onClick={fetchPerformanceData} className="btn btn-secondary mt-2">
          Retry
        </button>
      </div>
    );
  }

  const filteredVendors = performanceData ? filterByRisk(performanceData.vendors) : [];

  return (
    <div>
      <div className="flex flex-between flex-center mb-3">
        <h1>Vendor Performance Analysis</h1>
        <button onClick={fetchPerformanceData} className="btn btn-primary">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {performanceData && (
        <div className="grid grid-4 mb-3">
          <div className="card text-center">
            <h3>{performanceData.total}</h3>
            <p className="text-muted">Total Vendors</p>
          </div>
          <div className="card text-center risk-low">
            <h3>{performanceData.vendors.filter(v => v.risk_score < 40).length}</h3>
            <p>Low Risk Vendors</p>
          </div>
          <div className="card text-center risk-medium">
            <h3>{performanceData.vendors.filter(v => v.risk_score >= 40 && v.risk_score < 70).length}</h3>
            <p>Medium Risk Vendors</p>
          </div>
          <div className="card text-center risk-high">
            <h3>{performanceData.vendors.filter(v => v.risk_score >= 70).length}</h3>
            <p>High Risk Vendors</p>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="card mb-3">
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={() => setViewMode('all')}
            className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Vendors ({performanceData?.total || 0})
          </button>
          <button
            onClick={() => setViewMode('low-risk')}
            className={`btn ${viewMode === 'low-risk' ? 'btn-success' : 'btn-outline'}`}
          >
            ✅ Low Risk ({performanceData?.vendors.filter(v => v.risk_score < 40).length || 0})
          </button>
          <button
            onClick={() => setViewMode('medium-risk')}
            className={`btn ${viewMode === 'medium-risk' ? 'btn-warning' : 'btn-outline'}`}
          >
            ⚠️ Medium Risk ({performanceData?.vendors.filter(v => v.risk_score >= 40 && v.risk_score < 70).length || 0})
          </button>
          <button
            onClick={() => setViewMode('high-risk')}
            className={`btn ${viewMode === 'high-risk' ? 'btn-danger' : 'btn-outline'}`}
          >
            ❌ High Risk ({performanceData?.vendors.filter(v => v.risk_score >= 70).length || 0})
          </button>
        </div>
      </div>

      {/* Vendor List */}
      {filteredVendors.length === 0 ? (
        <div className="card text-center">
          <p>No vendors found in this category</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {filteredVendors.map((data, idx) => (
            <div key={idx} className="card">
              <div className="flex flex-between flex-center mb-2">
                <h3>{data.vendor.vendor_name}</h3>
                <span className={`risk-badge ${getRiskClass(data.risk_score)}`}>
                  {getRiskLabel(data.risk_score)} ({data.risk_score})
                </span>
              </div>

              <div className="mb-2">
                <p><strong>ID:</strong> {data.vendor.id}</p>
                <p><strong>Code:</strong> {data.vendor.vendor_code}</p>
                <p><strong>Location:</strong> {data.vendor.city}, {data.vendor.state}</p>
                <p><strong>Rating:</strong> ⭐ {data.vendor.performance_rating}/5.0</p>
                <p><strong>Certification:</strong> {data.vendor.certification_status}</p>
              </div>

              {/* Track Items Summary */}
              <div className="mb-2">
                <strong>📦 Track Items ({data.track_items.total})</strong>
                <div className="grid grid-2 mt-1" style={{ fontSize: '0.9em' }}>
                  {Object.entries(data.track_items.by_type).map(([type, stats]) => (
                    <div key={type} className="text-muted">
                      {getItemTypeLabel(type)}: {stats.count}
                      {stats.defects > 0 && <span className="text-danger"> ({stats.defects} defects)</span>}
                    </div>
                  ))}
                </div>
                {data.track_items.total_defects > 0 && (
                  <p className="text-danger mt-1">
                    ⚠️ Total Defects: {data.track_items.total_defects} | Replacements: {data.track_items.total_replacements}
                  </p>
                )}
              </div>

              {/* Inspection Stats */}
              <div className="mb-2">
                <strong>📋 Inspections</strong>
                <div className="mt-1">
                  <span className="text-success">✓ {data.inspections.passed} Passed</span>
                  {data.inspections.conditional > 0 && (
                    <span className="text-warning ml-2">⚠ {data.inspections.conditional} Conditional</span>
                  )}
                  {data.inspections.failed > 0 && (
                    <span className="text-danger ml-2">✗ {data.inspections.failed} Failed</span>
                  )}
                </div>
                <div className="progress-bar mt-1">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${data.inspections.pass_rate}%`, backgroundColor: data.inspections.pass_rate >= 80 ? '#28a745' : data.inspections.pass_rate >= 50 ? '#ffc107' : '#dc3545' }}
                  ></div>
                </div>
                <p className="text-muted" style={{ fontSize: '0.8em' }}>Pass Rate: {data.inspections.pass_rate}%</p>
              </div>

              {/* Risk Flags */}
              {data.flags && data.flags.length > 0 && (
                <div className="alert alert-warning mt-2">
                  <strong>⚠️ Risk Flags:</strong>
                  <ul className="mt-1" style={{ paddingLeft: '1.5rem', fontSize: '0.85em' }}>
                    {data.flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expand for Details */}
              <button
                onClick={() => setSelectedVendor(selectedVendor?.vendor.id === data.vendor.id ? null : data)}
                className="btn btn-sm btn-outline mt-2"
              >
                {selectedVendor?.vendor.id === data.vendor.id ? 'Hide Details' : 'View Details'}
              </button>

              {/* Expanded Details */}
              {selectedVendor?.vendor.id === data.vendor.id && (
                <div className="mt-3 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <h4>Track Items Details</h4>
                  {data.track_items.items.map((item, i) => (
                    <div key={i} className="mb-2 p-2" style={{ backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                      <p><strong>{getItemTypeLabel(item.item_type)}</strong> - {item.lot_number}</p>
                      <p>Location: {item.installation_location} ({item.zone})</p>
                      <p>Status: <span className={`risk-badge ${item.performance_status === 'good' ? 'risk-low' : item.performance_status === 'average' ? 'risk-medium' : 'risk-high'}`}>
                        {item.performance_status}
                      </span></p>
                      <p>Defects: {item.defect_count} | Replacements: {item.replacement_count}</p>
                    </div>
                  ))}

                  {data.recommendations && data.recommendations.length > 0 && (
                    <div className="mt-3">
                      <strong>📋 Recommendations:</strong>
                      <ul className="mt-1" style={{ paddingLeft: '1.5rem' }}>
                        {data.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.summary && (
                    <div className="mt-3">
                      <strong>📝 AI Summary:</strong>
                      <p className="text-muted">{data.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VendorPerformance;
