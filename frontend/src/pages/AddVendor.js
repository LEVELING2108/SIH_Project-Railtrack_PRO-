import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../api';

function AddVendor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    vendor_name: '',
    manufacture_date: '',
    details: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    tax_id: '',
    bank_account: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vendorAPI.create(formData);
      alert('Vendor created successfully!');
      navigate('/vendors');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create vendor');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-3">Add New Vendor</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            {/* Basic Info */}
            <div className="form-group">
              <label className="form-label">Vendor ID *</label>
              <input
                type="text"
                name="id"
                className="form-control"
                value={formData.id}
                onChange={handleChange}
                placeholder="e.g., VEND001"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vendor Name *</label>
              <input
                type="text"
                name="vendor_name"
                className="form-control"
                value={formData.vendor_name}
                onChange={handleChange}
                placeholder="Company/Person name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Manufacture Date</label>
              <input
                type="date"
                name="manufacture_date"
                className="form-control"
                value={formData.manufacture_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                name="contact_person"
                className="form-control"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Contact person name"
              />
            </div>

            {/* Contact Info */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="contact_email"
                className="form-control"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="contact_phone"
                className="form-control"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+91 1234567890"
              />
            </div>

            {/* Address */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Address Line 1</label>
              <input
                type="text"
                name="address_line1"
                className="form-control"
                value={formData.address_line1}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                className="form-control"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="Postal code"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                className="form-control"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>

            {/* Additional Info */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Details</label>
              <textarea
                name="details"
                className="form-control"
                value={formData.details}
                onChange={handleChange}
                rows="4"
                placeholder="Additional vendor details, notes, etc."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax ID</label>
              <input
                type="text"
                name="tax_id"
                className="form-control"
                value={formData.tax_id}
                onChange={handleChange}
                placeholder="GSTIN / PAN / Tax ID"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Account</label>
              <input
                type="text"
                name="bank_account"
                className="form-control"
                value={formData.bank_account}
                onChange={handleChange}
                placeholder="Bank account number"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Vendor'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/vendors')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="alert alert-info mt-3">
        <strong>💡 Tip:</strong> Fill in as many fields as possible for better AI risk assessment accuracy.
      </div>
    </div>
  );
}

export default AddVendor;
