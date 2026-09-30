import React, { useState } from 'react';
import { api } from '../services/api';

export default function ReportFoundModal({ show, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bag & Backpack');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('Red');
  const [brand, setBrand] = useState('Wildcraft');
  const [referenceImage, setReferenceImage] = useState('https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=600&q=80');
  const [latitude, setLatitude] = useState(11.6646);
  const [longitude, setLongitude] = useState(78.1186);
  const [addressText, setAddressText] = useState('Outdoor Seating Stone Bench, North Cafeteria Courtyard');
  const [storageLocation, setStorageLocation] = useState('Campus Security Station #2 (Locker Alpha-3)');
  const [contactInfo, setContactInfo] = useState('Desk Officer (+91-98401-77777)');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createFoundItem({
        title,
        category,
        description,
        color,
        brand,
        referenceImage,
        latitude,
        longitude,
        addressText,
        storageLocation,
        contactInfo
      });

      if (res.success && res.data) {
        if (onCreated) onCreated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to report found item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content text-light border-secondary">
          <div className="modal-header border-secondary border-opacity-30">
            <div>
              <span className="telemetry-pill mb-1">
                <span className="telemetry-dot live"></span>
                <span>FOUND ASSET REPORT</span>
              </span>
              <h5 className="modal-title fw-bold brand-heading">Report Found Asset & Log Custody</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 font-mono" style={{ fontSize: '0.82rem' }}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-dim">FOUND ITEM TITLE *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Red Wildcraft Backpack"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-dim">CATEGORY *</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Bag & Backpack">Bag & Backpack</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Wallets & Purses">Wallets & Purses</option>
                    <option value="IDs & Cards">IDs & Cards</option>
                    <option value="Keys">Keys</option>
                    <option value="Jewellery">Jewellery</option>
                    <option value="Documents">Documents</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-dim">COLOR *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Red"
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-dim">BRAND / MODEL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Wildcraft"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-dim">PHOTO URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={referenceImage}
                    onChange={(e) => setReferenceImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-dim">VISUAL DESCRIPTION OF FOUND ITEM *</label>
                <textarea
                  rows="2"
                  className="form-control"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe condition, where it was spotted, notable markings..."
                ></textarea>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-dim">DISCOVERY LOCATION</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-dim">LATITUDE</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-control"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-dim">LONGITUDE</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-control"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="row g-3 mb-2">
                <div className="col-md-6">
                  <label className="form-label text-dim">PHYSICAL STORAGE / LOCKER CUSTODY *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="e.g. Central Security Office Vault"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-dim">CONTACT / CUSTODIAN PHONE</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-secondary border-opacity-30">
              <button type="button" className="btn btn-outline-secondary font-mono" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-command font-mono px-4">
                {loading ? 'Submitting...' : 'Register Found Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
