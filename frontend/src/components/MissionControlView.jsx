import React, { useState, useEffect } from 'react';
import SatelliteMap from './SatelliteMap';
import MultiResolutionSearchVisualizer from './MultiResolutionSearchVisualizer';
import { api } from '../services/api';

export default function MissionControlView({ missionCode = 'SR-2026-001', onNavigate, onLaunchCameraWithZone }) {
  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('Z001');
  const [activeResLevel, setActiveResLevel] = useState('MICRO');
  const [allMissions, setAllMissions] = useState([]);

  const steps = [
    { num: 1, label: 'Location identified' },
    { num: 2, label: 'Search boundary generated' },
    { num: 3, label: 'Satellite imagery requested' },
    { num: 4, label: 'Satellite imagery received' },
    { num: 5, label: 'Geographic analysis' },
    { num: 6, label: 'Recovery zones generated' },
    { num: 7, label: 'Ground search preparation' }
  ];

  const fetchMissionData = async () => {
    try {
      setLoading(true);
      // Fetch admin dashboard or missions list
      const dashRes = await api.getAdminDashboard();
      if (dashRes.success && dashRes.data.recentMissions?.length > 0) {
        setAllMissions(dashRes.data.recentMissions);
        // Find mission by code or default to first
        const found = dashRes.data.recentMissions.find(m => m.missionCode === missionCode) || dashRes.data.recentMissions[0];
        
        // Fetch full mission details
        const fullRes = await api.getMission(found._id);
        if (fullRes.success) {
          setMission(fullRes.data.mission);
          setZones(fullRes.data.zones || []);
        }
      }
    } catch (err) {
      console.error('Failed to load mission:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionData();
  }, [missionCode]);

  const targetItem = mission?.lostItemId || {
    title: 'Red Backpack',
    category: 'Bag & Backpack',
    color: 'Red',
    brand: 'Wildcraft',
    addressText: 'KIOT Campus — Cafeteria Courtyard',
    referenceImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    approximateTimeText: '14:30'
  };

  const centerCoords = mission?.centerLocation?.coordinates
    ? [mission.centerLocation.coordinates[1], mission.centerLocation.coordinates[0]] // [lat, lng]
    : [11.6643, 78.1182];

  const currentStep = mission?.stageStep || 7;
  const satelliteData = mission?.satelliteData || {
    provider: 'Copernicus Sentinel-2 MSI (CDSE API)',
    acquisitionDate: '2026-09-28T10:15:22Z',
    cloudCoverage: 3.4,
    resolutionMeters: 10.0,
    searchStatus: 'Copernicus Sentinel-2 imagery retrieved & georeferenced',
    statusLabel: 'LIVE SATELLITE DATA',
    isLive: true
  };

  const selectedZone = zones.find(z => z.zoneId === selectedZoneId) || zones[0];

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Top Breadcrumb & Status Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 px-3 py-1 bg-info bg-opacity-10 border border-info border-opacity-50">
            <span className="font-mono text-info fw-bold" style={{ fontSize: '0.9rem' }}>
              MISSION #{mission?.missionCode || missionCode}
            </span>
          </div>
          <h2 className="fw-bold mb-0 text-light brand-heading">SARA Autonomous Recovery Mission Control</h2>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Mission Switcher dropdown if multiple */}
          {allMissions.length > 1 && (
            <select
              className="form-select form-select-sm bg-dark text-light border-secondary font-mono"
              style={{ width: 'auto', fontSize: '0.8rem' }}
              value={mission?.missionCode || missionCode}
              onChange={async (e) => {
                const sel = allMissions.find(m => m.missionCode === e.target.value);
                if (sel) {
                  const res = await api.getMission(sel._id);
                  if (res.success) {
                    setMission(res.data.mission);
                    setZones(res.data.zones || []);
                  }
                }
              }}
            >
              {allMissions.map(m => (
                <option key={m._id} value={m.missionCode}>
                  {m.missionCode}: {m.lostItemId?.title || 'Mission'}
                </option>
              ))}
            </select>
          )}

          <button
            className="btn btn-sm btn-radar font-mono px-3 d-flex align-items-center gap-2"
            onClick={() => onLaunchCameraWithZone && onLaunchCameraWithZone(selectedZoneId, mission?._id)}
          >
            <i className="bi bi-camera-fill"></i>
            <span>Launch AI Recovery Camera</span>
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Left Column: Mission Telemetry & Progress Stepper */}
        <div className="col-xl-4 col-lg-5">
          {/* SARA Command Badge Card */}
          <div className="card-mission p-3 mb-3">
            <div className="d-flex justify-content-between align-items-start border-bottom border-secondary border-opacity-25 pb-2 mb-3">
              <div>
                <small className="text-secondary font-mono d-block" style={{ fontSize: '0.7rem' }}>SARA RECOVERY MISSION</small>
                <span className="fw-bold text-light font-mono" style={{ fontSize: '1.1rem' }}>
                  Mission #{mission?.missionCode || missionCode}
                </span>
              </div>
              <span className={`badge ${satelliteData.isLive ? 'bg-success' : 'bg-info'} text-uppercase font-mono`} style={{ fontSize: '0.72rem' }}>
                {satelliteData.statusLabel || 'LIVE SATELLITE DATA'}
              </span>
            </div>

            {/* Target Item summary */}
            <div className="d-flex gap-3 align-items-center p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 mb-3">
              {targetItem.referenceImage ? (
                <img
                  src={targetItem.referenceImage}
                  alt={targetItem.title}
                  className="rounded object-fit-cover"
                  style={{ width: '64px', height: '64px' }}
                />
              ) : (
                <div className="rounded bg-secondary d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  🎒
                </div>
              )}
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <span className="badge bg-secondary font-mono text-cyan mb-1" style={{ fontSize: '0.68rem' }}>TARGET ASSET</span>
                <h6 className="fw-bold text-light mb-0 text-truncate">{targetItem.title}</h6>
                <div className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>
                  {targetItem.category} • {targetItem.color} • {targetItem.brand}
                </div>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div className="row g-2 mb-3 font-mono" style={{ fontSize: '0.75rem' }}>
              <div className="col-6">
                <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25">
                  <div className="text-dim text-uppercase" style={{ fontSize: '0.65rem' }}>COORDINATES</div>
                  <div className="text-info fw-semibold">{centerCoords[0].toFixed(4)}°N, {centerCoords[1].toFixed(4)}°E</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25">
                  <div className="text-dim text-uppercase" style={{ fontSize: '0.65rem' }}>SEARCH RADIUS</div>
                  <div className="text-light fw-semibold">{mission?.searchRadius || 500} METERS</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25">
                  <div className="text-dim text-uppercase" style={{ fontSize: '0.65rem' }}>SATELLITE STATUS</div>
                  <div className="text-success fw-semibold d-flex align-items-center gap-1">
                    <span className="telemetry-dot live"></span> CONNECTED
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25">
                  <div className="text-dim text-uppercase" style={{ fontSize: '0.65rem' }}>IMAGERY RESOLUTION</div>
                  <div className="text-light fw-semibold">{satelliteData.resolutionMeters || 10.0}m / PIXEL</div>
                </div>
              </div>
            </div>

            {/* Satellite Connection Details Box */}
            <div className="p-3 rounded bg-black bg-opacity-50 border border-info border-opacity-30 mb-3 font-mono" style={{ fontSize: '0.75rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-secondary border-opacity-25">
                <span className="text-info fw-bold">SATELLITE CONNECTION</span>
                <span className="text-success fw-semibold">● Connected</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-10">
                <span className="text-dim">Source:</span>
                <span className="text-light">{satelliteData.provider}</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-10">
                <span className="text-dim">Acquired:</span>
                <span className="text-light">
                  {satelliteData.acquisitionDate ? new Date(satelliteData.acquisitionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '28 Sep 2026'}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom border-secondary border-opacity-10">
                <span className="text-dim">Cloud Cover:</span>
                <span className="text-light">{satelliteData.cloudCoverage || 3.4}%</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-dim">Status:</span>
                <span className="text-emerald text-truncate" style={{ maxWidth: '190px' }}>{satelliteData.searchStatus || 'Imagery retrieved'}</span>
              </div>
              {satelliteData.dataLimitations && (
                <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 text-dim fst-italic" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-info-circle me-1 text-info"></i>
                  {satelliteData.dataLimitations}
                </div>
              )}
            </div>

            {/* 7-Step Progress Stepper */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="font-mono text-light fw-bold" style={{ fontSize: '0.8rem' }}>
                  MISSION LIFECYCLE PROGRESS
                </span>
                <span className="badge bg-secondary font-mono" style={{ fontSize: '0.68rem' }}>
                  {currentStep} of 7 Complete
                </span>
              </div>

              <div className="mission-stepper">
                {steps.map((st) => {
                  const isCompleted = st.num < currentStep || (st.num === 7 && currentStep === 7);
                  const isCurrent = st.num === currentStep && currentStep < 7;
                  return (
                    <div
                      key={st.num}
                      className={`step-row ${isCompleted ? 'completed' : isCurrent ? 'active' : ''}`}
                    >
                      <div className="step-circle">
                        {isCompleted ? '✓' : st.num}
                      </div>
                      <span className="flex-grow-1">{st.label}</span>
                      {isCompleted && <span className="text-emerald" style={{ fontSize: '0.72rem' }}>VERIFIED</span>}
                      {isCurrent && <span className="text-info" style={{ fontSize: '0.72rem' }}>ACTIVE</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Macro & Meso Analysis Report */}
          <div className="card-mission p-3">
            <h6 className="fw-bold text-light mb-2 font-mono" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-cpu text-info me-1"></i> GEOSPATIAL TERRAIN ANALYSIS
            </h6>
            <p className="text-secondary mb-2" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
              {mission?.macroAnalysis?.summary || 'Multi-spectral satellite decomposition complete. Identified 3 transit axes between campus cafeteria and academic facilities.'}
            </p>
            <div className="row g-2 font-mono" style={{ fontSize: '0.72rem' }}>
              <div className="col-6">
                <span className="text-dim">Search Area:</span>{' '}
                <span className="text-light">{mission?.macroAnalysis?.searchAreaSqMeters || '785,400'} m²</span>
              </div>
              <div className="col-6">
                <span className="text-dim">Corridors:</span>{' '}
                <span className="text-light">{mission?.macroAnalysis?.pedestrianCorridorsDetected || 3} primary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Satellite Map & AI Recovery Probability Zones */}
        <div className="col-xl-8 col-lg-7">
          {/* Interactive Satellite Map Card */}
          <div className="card-mission p-3 mb-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25 gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="text-info font-mono fw-bold" style={{ fontSize: '0.82rem' }}>
                  <i className="bi bi-radar me-1"></i> SATELLITE COMMAND RECOVERY CANVAS
                </span>
                <span className="badge bg-secondary font-mono" style={{ fontSize: '0.68rem' }}>
                  {targetItem.addressText}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary font-mono" style={{ fontSize: '0.75rem' }}>
                  Target: <strong className="text-light">{targetItem.title}</strong>
                </span>
              </div>
            </div>

            {/* Satellite Map */}
            <SatelliteMap
              center={centerCoords}
              searchRadius={mission?.searchRadius || 500}
              boundingBox={mission?.boundingBox || satelliteData.boundingBox}
              zones={zones}
              microDetections={mission?.microDetections || []}
              targetItemTitle={targetItem.title}
              onSelectZone={(zId) => setSelectedZoneId(zId)}
              selectedZoneId={selectedZoneId}
            />
          </div>

          {/* AI Recovery Probability Zones Cards */}
          <div className="card-mission p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              <div>
                <h5 className="fw-bold mb-0 text-light brand-heading">
                  AI Recovery Probability Zones
                </h5>
                <small className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>
                  recoveryZoneEngine.js • Geospatial corridor prioritization
                </small>
              </div>
              <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-50 font-mono">
                {zones.length} Zones Calculated
              </span>
            </div>

            <div className="row g-3">
              {zones.map((zone) => {
                const isSelected = selectedZoneId === zone.zoneId;
                const scorePercent = Math.round(zone.score * 100);
                const isHigh = zone.priority === 'HIGH';
                const isMed = zone.priority === 'MEDIUM';

                return (
                  <div key={zone._id || zone.zoneId} className="col-12 col-md-6 col-xl-4">
                    <div
                      className={`p-3 rounded h-100 d-flex flex-column justify-content-between transition-all ${isSelected ? 'border-info bg-info bg-opacity-10' : 'bg-black bg-opacity-40 border-secondary border-opacity-25'} border`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedZoneId(zone.zoneId)}
                    >
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className={`badge ${isHigh ? 'bg-warning text-dark' : isMed ? 'bg-info text-dark' : 'bg-secondary text-light'} font-mono fw-bold`}>
                            {zone.priority} PRIORITY — {scorePercent}%
                          </span>
                          <span className="font-mono text-light fw-bold" style={{ fontSize: '0.78rem' }}>
                            {zone.zoneId}
                          </span>
                        </div>

                        <h6 className="fw-bold text-light mb-1" style={{ fontSize: '0.85rem' }}>
                          {zone.areaName}
                        </h6>

                        <p className="text-secondary mb-2" style={{ fontSize: '0.76rem', lineHeight: '1.35' }}>
                          {zone.reason}
                        </p>

                        {/* Factor breakdown bullets */}
                        <div className="p-2 rounded bg-dark bg-opacity-75 border border-secondary border-opacity-20 mb-2">
                          <div className="font-mono text-dim text-uppercase mb-1" style={{ fontSize: '0.64rem' }}>
                            Priority Determinants:
                          </div>
                          <ul className="mb-0 ps-3 text-secondary" style={{ fontSize: '0.72rem', lineHeight: '1.35' }}>
                            {zone.factorBreakdown?.slice(0, 3).map((f, idx) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                        <small className="font-mono text-dim" style={{ fontSize: '0.68rem' }}>
                          Sensor: <span className="text-info">{zone.recommendedSensor}</span>
                        </small>
                        <button
                          className="btn btn-sm btn-outline-info font-mono py-0 px-2"
                          style={{ fontSize: '0.72rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onLaunchCameraWithZone) onLaunchCameraWithZone(zone.zoneId, mission?._id);
                          }}
                        >
                          <i className="bi bi-camera me-1"></i> Scan Zone
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Micro Ground Camera Detections Preview */}
          {mission?.microDetections?.length > 0 && (
            <div className="card-mission p-3 mb-3 border-emerald border-opacity-50">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-success bg-opacity-25 text-emerald border border-success border-opacity-50 font-mono">
                  <i className="bi bi-camera-fill me-1"></i> LEVEL 3 MICRO DETECTION RECORDED
                </span>
                <span className="text-secondary font-mono" style={{ fontSize: '0.75rem' }}>
                  Candidate verified in {mission.microDetections[0].zoneIdRef}
                </span>
              </div>

              <div className="d-flex flex-wrap gap-3 align-items-center p-2 rounded bg-black bg-opacity-40">
                <div className="position-relative">
                  <img
                    src={mission.microDetections[0].capturedImageUrl || targetItem.referenceImage}
                    alt="Detected Candidate"
                    className="rounded object-fit-cover"
                    style={{ width: '80px', height: '80px', border: '2px solid #10b981' }}
                  />
                  <span className="badge bg-success position-absolute bottom-0 start-0 m-1 font-mono" style={{ fontSize: '0.6rem' }}>
                    {mission.microDetections[0].visualSimilarity}% SIMILAR
                  </span>
                </div>

                <div className="flex-grow-1 font-mono" style={{ minWidth: '220px', fontSize: '0.78rem' }}>
                  <div className="fw-bold text-light mb-1">
                    POTENTIAL OBJECT DETECTED: {mission.microDetections[0].detectedCategory}
                  </div>
                  <div className="text-secondary mb-1">
                    {mission.microDetections[0].notes}
                  </div>
                  <div className="d-flex gap-3 text-dim" style={{ fontSize: '0.72rem' }}>
                    <span>Confidence: <strong className="text-light">{mission.microDetections[0].detectionConfidence}%</strong></span>
                    <span>Offset: <strong className="text-light">{mission.microDetections[0].distanceFromZoneMeters}m</strong></span>
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-sm btn-command font-mono px-3"
                    onClick={() => onNavigate && onNavigate('claims')}
                  >
                    Proceed to Ownership Verification →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Resolution Progressive Search Hierarchy Card */}
          <MultiResolutionSearchVisualizer
            activeLevel={activeResLevel}
            onSelectLevel={(lvl) => setActiveResLevel(lvl)}
          />
        </div>
      </div>
    </div>
  );
}
