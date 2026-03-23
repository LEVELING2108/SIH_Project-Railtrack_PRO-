import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackItemsAPI, inspectionsAPI } from '../api';

function AddInspection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    inspection_type: 'periodic',
    inspection_date: new Date().toISOString().split('T')[0],
    inspector_name: '',
    inspector_designation: '',
    inspection_status: 'passed',
    quality_grade: 'B',
    remarks: '',
    action_taken: 'Approved for continued use',
    next_inspection_due: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await inspectionsAPI.create(id, formData);
      navigate(`/track-items/${id}`, { 
        state: { message: 'Inspection recorded successfully!' } 
      });
    } catch (err) {
      console.error('Error recording inspection:', err);
      setError('Failed to record inspection. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-3">
        <h1>Record Inspection</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/track-items/${id}`)}
        >
          ← Back to Details
        </button>
      </div>

      <div className="card">
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2 gap-3">
            {/* Inspection Type */}
            <div>
              <label className="form-label">Inspection Type *</label>
              <select
                name="inspection_type"
                value={formData.inspection_type}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="manufacturing">Manufacturing</option>
                <option value="supply">Supply</option>
                <option value="installation">Installation</option>
                <option value="periodic">Periodic</option>
                <option value="defect">Defect</option>
              </select>
            </div>

            {/* Inspection Date */}
            <div>
              <label className="form-label">Inspection Date *</label>
              <input
                type="date"
                name="inspection_date"
                value={formData.inspection_date}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Inspector Name */}
            <div>
              <label className="form-label">Inspector Name *</label>
              <input
                type="text"
                name="inspector_name"
                value={formData.inspector_name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter inspector name"
                required
              />
            </div>

            {/* Inspector Designation */}
            <div>
              <label className="form-label">Inspector Designation</label>
              <input
                type="text"
                name="inspector_designation"
                value={formData.inspector_designation}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Senior Quality Inspector"
              />
            </div>

            {/* Inspection Status */}
            <div>
              <label className="form-label">Inspection Status *</label>
              <select
                name="inspection_status"
                value={formData.inspection_status}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="conditional">Conditional</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="form-label">Quality Grade *</label>
              <select
                name="quality_grade"
                value={formData.quality_grade}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="A">A - Excellent</option>
                <option value="B">B - Good</option>
                <option value="C">C - Average</option>
                <option value="D">D - Poor</option>
                <option value="F">F - Failed</option>
              </select>
            </div>

            {/* Next Inspection Due */}
            <div>
              <label className="form-label">Next Inspection Due</label>
              <input
                type="date"
                name="next_inspection_due"
                value={formData.next_inspection_due}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Action Taken */}
            <div>
              <label className="form-label">Action Taken</label>
              <input
                type="text"
                name="action_taken"
                value={formData.action_taken}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Approved for continued use"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-3">
            <label className="form-label">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Enter inspection remarks or observations"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Recording...' : 'Record Inspection'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/track-items/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInspection;
