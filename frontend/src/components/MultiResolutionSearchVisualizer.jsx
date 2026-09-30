import React from 'react';

export default function MultiResolutionSearchVisualizer({ activeLevel = 'MICRO', onSelectLevel }) {
  const levels = [
    {
      id: 'MACRO',
      number: 'LEVEL 1',
      title: 'MACRO SEARCH',
      icon: '🛰️',
      sensor: 'Copernicus Sentinel-2 MSI (Optical)',
      scale: '500 m → 100 m',
      resolution: '10.0 m / pixel',
      purpose: 'Geospatial terrain analysis, corridor identification, and search perimeter constraint.',
      capabilities: [
        'Multi-spectral surface reflectance',
        'Pedestrian thoroughfare extraction',
        'Vegetation and canopy masking',
        'Boundary definition across 500m buffer'
      ],
      physicsNote: 'Physical constraint: Optical orbital satellite sensors cannot resolve objects smaller than 10m. Used strictly to narrow search corridors.'
    },
    {
      id: 'MESO',
      number: 'LEVEL 2',
      title: 'MESO AERIAL',
      icon: '📷',
      sensor: 'High-Resolution Aerial / Drone Recon',
      scale: '100 m → 20 m',
      resolution: '0.15 m / pixel (15 cm)',
      purpose: 'Intermediate candidate zone sweeps and large obstacle line-of-sight screening.',
      capabilities: [
        'Candidate zone sub-clustering',
        'Bicycle rack & seating cluster isolation',
        'Canopy shadow penetration',
        'High-density corridor prioritization'
      ],
      physicsNote: 'Sub-meter aerial layer prioritizes high-confidence recovery polygons for targeted ground inspection.'
    },
    {
      id: 'MICRO',
      number: 'LEVEL 3',
      title: 'MICRO VISION',
      icon: '📱',
      sensor: 'Ground-Level AI Smartphone Camera',
      scale: '20 m → Target Object',
      resolution: 'Sub-millimeter Visual Feature Match',
      purpose: 'Pinpoint small object detection, colorimetry spectra matching, and bounding-box isolation.',
      capabilities: [
        'Real-time chromatic & texture matching',
        'Centroid distance triangulation',
        'Bounding box candidate confirmation',
        'Direct trigger to Ownership Verification'
      ],
      physicsNote: 'Ground vision camera performs final object-level verification for items such as backpacks, wallets, keys, and devices.'
    }
  ];

  return (
    <div className="card-mission p-3 p-lg-4 mb-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2">
        <div>
          <div className="telemetry-pill mb-1">
            <span className="telemetry-dot live"></span>
            <span>CORE INNOVATION ARCHITECTURE</span>
          </div>
          <h4 className="fw-bold mb-0 text-light">Multi-Resolution Progressive Search Hierarchy</h4>
        </div>
        <div className="text-secondary font-mono" style={{ fontSize: '0.78rem' }}>
          <span>Sensor Physics Grounding: Macro ➔ Meso ➔ Micro</span>
        </div>
      </div>

      <div className="row g-3 align-items-stretch">
        {levels.map((lvl, index) => {
          const isActive = activeLevel === lvl.id;
          return (
            <React.Fragment key={lvl.id}>
              <div className="col-lg-4 col-md-12 d-flex">
                <div
                  className={`resolution-layer-card w-100 ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectLevel && onSelectLevel(lvl.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-secondary bg-opacity-50 font-mono text-cyan" style={{ fontSize: '0.7rem' }}>
                      {lvl.number}
                    </span>
                    <span className="font-mono text-info fw-bold" style={{ fontSize: '0.82rem' }}>
                      {lvl.scale}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span style={{ fontSize: '1.75rem' }}>{lvl.icon}</span>
                    <div>
                      <h6 className="fw-bold mb-0 text-light">{lvl.title}</h6>
                      <small className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>
                        {lvl.sensor}
                      </small>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="d-flex justify-content-between font-mono text-dim mb-1" style={{ fontSize: '0.72rem' }}>
                      <span>Ground Sample Distance:</span>
                      <span className="text-light">{lvl.resolution}</span>
                    </div>
                    <p className="text-secondary mb-2" style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                      {lvl.purpose}
                    </p>
                  </div>

                  <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25 mb-2">
                    <div className="font-mono text-dim text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>
                      Active Capabilities:
                    </div>
                    <ul className="mb-0 ps-3 text-secondary" style={{ fontSize: '0.76rem', lineHeight: '1.35' }}>
                      {lvl.capabilities.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-dim font-mono fst-italic" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-shield-exclamation text-warning me-1"></i>
                    {lvl.physicsNote}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
