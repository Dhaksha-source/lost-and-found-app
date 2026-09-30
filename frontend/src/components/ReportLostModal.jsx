import React, { useState } from 'react';
import { api } from '../services/api';

export default function ReportLostModal({ show, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bag & Backpack');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('Red');
  const [brand, setBrand] = useState('Wildcraft');
  const [modelName, setModelName] = useState('Trailblazer');
  const [referenceImage, setReferenceImage] = useState('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80');
  const [latitude, setLatitude] = useState(11.6643);
  const [longitude, setLongitude] = useState(78.1182);
  const [addressText, setAddressText] = useState('KIOT Campus — Cafeteria Courtyard & Mechanical Quadrangle');
  const [lostDateTime, setLostDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [approximateTimeText, setApproximateTimeText] = useState('14:30');
  const [searchRadius, setSearchRadius] = useState(500);

  // Private Ownership Clues
  const [privateClues, setPrivateClues] = useState([
    { clueType: 'unique_mark', detail: 'Metallic carabiner keychain engraved with initials "DK" on inner zipper' },
    { clueType: 'hidden_scratch', detail: 'Small diagonal 2cm abrasion on the bottom right ballistic nylon panel' },
    { clueType: 'internal_arrangement', detail: 'Contains a blue stainless steel water bottle and thermodynamics notebook' }
  ]);

  const [loading, setLoading] = useState(false);
  const [autoLaunchMission, setAutoLaunchMission] = useState(true);

  if (!show) return null;

  const handleAddClue = () => {
    setPrivateClues([...privateClues, { clueType: 'unique_mark', detail: '' }]);
  };

  const handleClueChange = (index, field, value) => {
    const updated = [...privateClues];
    updated[index][field] = value;
    setPrivateClues(updated);
  };

  const handleRemoveClue = (index) => {
    setPrivateClues(privateClues.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createLostItem({
        title,
        category,
        description,
        color,
        brand,
        modelName,
        referenceImage,
        latitude,
        longitude,
        addressText,
        lostDateTime,
        approximateTimeText,
        searchRadius,
        privateClues: privateClues.filter(c => c.detail.trim().length > 0)
      });

      if (res.success && res.data) {
        if (autoLaunchMission) {
          // Trigger SARA mission creation immediately
          const missionRes = await api.startRecoveryMission({
            lostItemId: res.data._id,
            searchRadius,
            searchMode: 'AUTONOMOUS'
          });
          if (missionRes.success) {
            if (onCreated) onCreated(missionRes.data.mission);
          } else {
            if (onCreated) onCreated(null, res.data);
          }
        } else {
          if (onCreated) onCreated(null, res.data);
        }
        onClose();
      }
    } catch (err) {
      console.error('Failed to report lost item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div className="modal-content text-light border-secondary">
          <div className="modal-header border-secondary border-opacity-30">
            <div>
              <span className="telemetry-pill mb-1">
                <span className="telemetry-dot live"></span>
                <span>ASSET REGISTRATION</span>
              </span>
              <h5 className="modal-title fw-bold brand-heading">Report Lost Item & Setup Recovery</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 font-mono" style={{ fontSize: '0.82rem' }}>
              {/* Row 1: Title, Category, Color */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-dim">ITEM TITLE / ASSET NAME *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Red Backpack"
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
                  <label className="form-label text-dim">PRIMARY COLOR *</label>
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

              {/* Row 2: Brand, Model, Image URL */}
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label text-dim">BRAND / MAKER</label>
                  <input
                    type="text"
                    className="form-control"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Wildcraft"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-dim">MODEL NAME</label>
                  <input
                    type="text"
                    className="form-control"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. Trailblazer 30L"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-dim">REFERENCE IMAGE URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={referenceImage}
                    onChange={(e) => setReferenceImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label text-dim">PUBLIC PHYSICAL DESCRIPTION *</label>
                <textarea
                  rows="2"
                  className="form-control"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe visible features, exterior logos, zippers, stickers..."
                ></textarea>
              </div>

              {/* Geospatial Location */}
              <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-30 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-info fw-bold">LAST KNOWN GEOSPATIAL LOCATION</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-info font-mono py-0 px-2"
                    style={{ fontSize: '0.72rem' }}
                    onClick={() => {
                      setLatitude(11.6643);
                      setLongitude(78.1182);
                      setAddressText('KIOT Campus — Cafeteria Courtyard & Mechanical Quadrangle');
                    }}
                  >
                    📍 Use KIOT Campus Coordinates
                  </button>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label text-dim" style={{ fontSize: '0.72rem' }}>LOCATION / LANDMARK DESCRIPTION</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addressText}
                      onChange={(e) => setAddressText(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-dim" style={{ fontSize: '0.72rem' }}>LATITUDE</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-control"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-dim" style={{ fontSize: '0.72rem' }}>LONGITUDE</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-control"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                {/* Search Radius Slider */}
                <div>
                  <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: '0.74rem' }}>
                    <span>SARA SATELLITE SEARCH RADIUS:</span>
                    <span className="text-info fw-bold">{searchRadius} meters</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="100"
                    max="1500"
                    step="50"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Private Ownership Clues (CRITICAL REQUIREMENT) */}
              <div className="p-3 rounded bg-black bg-opacity-50 border border-warning border-opacity-40 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <span className="text-warning fw-bold">PRIVATE OWNERSHIP CLUES (CONFIDENTIAL)</span>
                    <small className="d-block text-dim" style={{ fontSize: '0.7rem' }}>
                      Never shown publicly. Used solely to generate verification questions for prospective claimants.
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-warning font-mono py-0 px-2"
                    style={{ fontSize: '0.72rem' }}
                    onClick={handleAddClue}
                  >
                    + Add Clue
                  </button>
                </div>

                {privateClues.map((clue, idx) => (
                  <div key={idx} className="row g-2 mb-2 align-items-center">
                    <div className="col-md-4">
                      <select
                        className="form-select form-select-sm"
                        value={clue.clueType}
                        onChange={(e) => handleClueChange(idx, 'clueType', e.target.value)}
                      >
                        <option value="unique_mark">Unique Mark / Initials</option>
                        <option value="hidden_scratch">Hidden Scratch / Tear</option>
                        <option value="sticker_location">Sticker / Badge Location</option>
                        <option value="internal_arrangement">Internal Bag Contents</option>
                        <option value="identifier_digits">Last 4 Digits of ID / Serial</option>
                      </select>
                    </div>
                    <div className="col-md-7">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Secret verification detail..."
                        value={clue.detail}
                        onChange={(e) => handleClueChange(idx, 'detail', e.target.value)}
                      />
                    </div>
                    <div className="col-md-1 text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={() => handleRemoveClue(idx)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto Launch SARA Mission Checkbox */}
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="saraSwitch"
                  checked={autoLaunchMission}
                  onChange={(e) => setAutoLaunchMission(e.target.checked)}
                />
                <label className="form-check-label text-light" htmlFor="saraSwitch">
                  Immediately initialize SARA Autonomous Satellite Recovery Mission
                </label>
              </div>
            </div>

            <div className="modal-footer border-secondary border-opacity-30">
              <button type="button" className="btn btn-outline-secondary font-mono" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-command font-mono px-4">
                {loading ? 'Registering Asset...' : autoLaunchMission ? 'Start Satellite Recovery →' : 'Save Lost Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
