import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackItemsAPI } from '../api';

function TrackItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  const itemTypeNames = {
    elastic_rail_clip: 'Elastic Rail Clip',
    rail_pad: 'Rail Pad',
    liner: 'Liner',
    sleeper: 'Sleeper'
  };

  const fetchItemDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await trackItemsAPI.getById(id);
      setItem(response.data);
      setAnalysis(response.data.ai_analysis);
      setInspections(response.data.inspections || []);
      setError(null);
    } catch (err) {
      setError('Failed to load track item details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchQRCode = useCallback(async () => {
    try {
      const response = await trackItemsAPI.getQR(id);
      setQrCode(response.data);
    } catch (err) {
      console.error('Failed to load QR code', err);
    }
  }, [id]);

  useEffect(() => {
    fetchItemDetails();
    fetchQRCode();
  }, [fetchItemDetails, fetchQRCode]);

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      case 'low': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const getHealthGradeClass = (grade) => {
    if (grade === 'A' || grade === 'B') return 'badge-success';
    if (grade === 'C') return 'badge-info';
    if (grade === 'D') return 'badge-warning';
    return 'badge-danger';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !item) {
    return (
      <div>
        <div className="alert alert-danger">{error || 'Item not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/track-items')}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between align-center mb-3">
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>
            {itemTypeNames[item.item_type] || item.item_type}
          </h1>
          <p style={{ color: '#888', margin: 0 }}>Lot: {item.lot_number}</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/track-items')}
        >
          ← Back to List
        </button>
      </div>

      {/* AI Analysis Alert */}
      {analysis && analysis.requires_action && (
        <div className={`alert ${analysis.risk_level === 'critical' || analysis.risk_level === 'high' ? 'alert-danger' : 'alert-warning'}`}>
          <strong>⚠️ Action Required:</strong> This item has {analysis.exceptions_count} exception(s) that need attention.
          <div className="mt-2">
            {analysis.recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx}>• {rec}</div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs mb-3">
        <button
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Item Details
        </button>
        <button
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          AI Analysis
        </button>
        <button
          className={`tab ${activeTab === 'inspections' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspections')}
        >
          Inspections ({inspections.length})
        </button>
        <button
          className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
          onClick={() => setActiveTab('qr')}
        >
          QR Code
        </button>
      </div>

      {/* Details Tab - TABULAR FORMAT */}
      {activeTab === 'details' && (
        <div className="grid grid-2 gap-3">
          {/* Basic Information Table */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Basic Information</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <th>Item ID</th>
                  <td>{item.id}</td>
                </tr>
                <tr>
                  <th>Item Type</th>
                  <td>{itemTypeNames[item.item_type] || item.item_type}</td>
                </tr>
                <tr>
                  <th>Lot Number</th>
                  <td><strong>{item.lot_number}</strong></td>
                </tr>
                <tr>
                  <th>Quantity</th>
                  <td>{item.quantity?.toLocaleString()} units</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    <span className={`badge ${item.status === 'in_service' ? 'badge-success' : 'badge-info'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Performance Status</th>
                  <td>
                    <span className={`badge ${item.performance_status === 'good' ? 'badge-success' : item.performance_status === 'poor' ? 'badge-warning' : 'badge-danger'}`}>
                      {item.performance_status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Defect Count</th>
                  <td>{item.defect_count || 0}</td>
                </tr>
                <tr>
                  <th>Replacement Count</th>
                  <td>{item.replacement_count || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vendor Information Table */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Vendor Information</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <th>Vendor ID</th>
                  <td>{item.vendor_id}</td>
                </tr>
                <tr>
                  <th>Vendor Name</th>
                  <td><strong>{item.vendor_name || 'N/A'}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dates Table */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Important Dates</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <th>Manufacture Date</th>
                  <td>{item.manufacture_date ? new Date(item.manufacture_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Supply Date</th>
                  <td>{item.supply_date ? new Date(item.supply_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Installation Date</th>
                  <td>{item.installation_date ? new Date(item.installation_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Warranty Period</th>
                  <td>{item.warranty_period_years} years</td>
                </tr>
                <tr>
                  <th>Warranty Start</th>
                  <td>{item.warranty_start_date ? new Date(item.warranty_start_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Warranty Expiry</th>
                  <td>
                    {item.warranty_expiry_date ? (
                      <>
                        {new Date(item.warranty_expiry_date).toLocaleDateString()}
                        {new Date(item.warranty_expiry_date) < new Date() && (
                          <span className="badge badge-danger ml-1">Expired</span>
                        )}
                      </>
                    ) : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Location Information Table */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Location Information</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <th>Installation Location</th>
                  <td>{item.installation_location || 'Not installed yet'}</td>
                </tr>
                <tr>
                  <th>Section Name</th>
                  <td>{item.section_name || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Division</th>
                  <td>{item.division || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Zone</th>
                  <td>{item.zone || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Kilometer Range</th>
                  <td>
                    {item.kilometer_from && item.kilometer_to
                      ? `${item.kilometer_from} km - ${item.kilometer_to} km`
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Additional Information */}
          {(item.specifications || item.details || item.notes) && (
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <h3 style={{ marginTop: 0 }}>Additional Information</h3>
              <table className="details-table">
                <tbody>
                  {item.specifications && (
                    <tr>
                      <th style={{ width: '200px' }}>Specifications</th>
                      <td><pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{item.specifications}</pre></td>
                    </tr>
                  )}
                  {item.details && (
                    <tr>
                      <th>Details</th>
                      <td>{item.details}</td>
                    </tr>
                  )}
                  {item.notes && (
                    <tr>
                      <th>Notes</th>
                      <td>{item.notes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Tab */}
      {activeTab === 'analysis' && analysis && (
        <div className="grid grid-2 gap-3">
          {/* Risk Assessment Card */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Risk Assessment</h3>
            <div className="flex justify-between align-center mb-3">
              <div>
                <h2 style={{ margin: 0 }}>{analysis.risk_score}/100</h2>
                <span className={`badge ${getRiskBadgeClass(analysis.risk_level)}`}>
                  {analysis.risk_level.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <strong>Exceptions Found:</strong> {analysis.exceptions_count}
            </div>
          </div>

          {/* Health Analysis Card */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Health Score</h3>
            <div className="flex justify-between align-center mb-3">
              <div>
                <h2 style={{ margin: 0 }}>{analysis.health_analysis?.health_score}/100</h2>
                <span className={`badge ${getHealthGradeClass(analysis.health_analysis?.health_grade)}`}>
                  Grade {analysis.health_analysis?.health_grade}
                </span>
              </div>
            </div>
            <div>
              <strong>Recommendation:</strong><br />
              {analysis.health_analysis?.recommendation}
            </div>
          </div>

          {/* Warranty Status */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Warranty Status</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <th>Status</th>
                  <td>
                    <span className={`badge ${getRiskBadgeClass(analysis.warranty_status?.alert_level)}`}>
                      {analysis.warranty_status?.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Days Remaining</th>
                  <td>{analysis.warranty_status?.days_remaining !== null ? analysis.warranty_status?.days_remaining : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Message</th>
                  <td>{analysis.warranty_status?.message}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inspection Compliance */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Inspection Compliance</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <th>Compliance Score</th>
                  <td>{analysis.inspection_compliance?.compliance_score}/100</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    <span className={`badge ${analysis.inspection_compliance?.is_compliant ? 'badge-success' : 'badge-danger'}`}>
                      {analysis.inspection_compliance?.is_compliant ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Missing Inspections</th>
                  <td>{analysis.inspection_compliance?.missing_inspections?.join(', ') || 'None'}</td>
                </tr>
                <tr>
                  <th>Failed Inspections</th>
                  <td>{analysis.inspection_compliance?.failed_inspections || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Exceptions List */}
          {analysis.exceptions && analysis.exceptions.length > 0 && (
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <h3 style={{ marginTop: 0 }}>Exceptions Detected</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.exceptions.map((exc, idx) => (
                    <tr key={idx}>
                      <td>{exc.type}</td>
                      <td>
                        <span className={`badge ${getRiskBadgeClass(exc.severity)}`}>
                          {exc.severity}
                        </span>
                      </td>
                      <td>{exc.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <h3 style={{ marginTop: 0 }}>AI Recommendations</h3>
              <ul>
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <div>
          <div className="flex justify-between align-center mb-3">
            <h3>Inspection History</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/track-items/${id}/inspections/add`)}
            >
              + Record Inspection
            </button>
          </div>

          {inspections.length === 0 ? (
            <div className="card">
              <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                No inspections recorded yet. Record the first inspection to track quality.
              </p>
            </div>
          ) : (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Inspector</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((insp) => (
                    <tr key={insp.id}>
                      <td>{new Date(insp.inspection_date).toLocaleDateString()}</td>
                      <td>{insp.inspection_type}</td>
                      <td>
                        <span className={`badge ${insp.inspection_status === 'passed' ? 'badge-success' : insp.inspection_status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                          {insp.inspection_status}
                        </span>
                      </td>
                      <td>
                        {insp.quality_grade ? (
                          <span className={`badge ${getHealthGradeClass(insp.quality_grade)}`}>
                            {insp.quality_grade}
                          </span>
                        ) : '-'}
                      </td>
                      <td>{insp.inspector_name || 'N/A'}</td>
                      <td>{insp.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QR Code Tab */}
      {activeTab === 'qr' && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>QR Code</h3>
          {qrCode ? (
            <div>
              {qrCode.qr_code && (
                <div style={{ margin: '2rem auto', maxWidth: '300px' }}>
                  <img src={qrCode.qr_code} alt="QR Code" style={{ width: '100%' }} />
                </div>
              )}
              <p style={{ color: '#888' }}>
                Scan this QR code to access item details and AI analysis on mobile devices.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrCode.qr_code;
                  link.download = `qr-${item.lot_number}.png`;
                  link.click();
                }}>
                  Download QR Code
                </button>
              </div>
            </div>
          ) : (
            <p>Loading QR code...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TrackItemDetail;
