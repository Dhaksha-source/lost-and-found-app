import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function HackathonDemoBar({ onSelectMission, onNavigate }) {
  const { user, role, switchRole, demoMode, setDemoMode } = useAuth();

  return (
    <div className="demo-banner text-light d-flex flex-wrap align-items-center justify-content-between px-3 py-2 border-bottom border-secondary border-opacity-25">
      <div className="d-flex align-items-center gap-2 mb-1 mb-md-0">
        <span className="badge bg-primary text-uppercase font-mono px-2 py-1">
          <i className="bi bi-cpu-fill me-1"></i> Hackathon Judge Panel
        </span>
        <span className="text-secondary d-none d-lg-inline">|</span>
        <button
          className="btn btn-sm btn-outline-info font-mono py-0 px-2 d-flex align-items-center gap-1"
          style={{ fontSize: '0.78rem' }}
          onClick={() => {
            if (onSelectMission) onSelectMission('SR-2026-001');
            if (onNavigate) onNavigate('mission');
          }}
          title="Instantly opens the benchmark scenario: Red Backpack at KIOT Campus"
        >
          <i className="bi bi-play-circle-fill text-warning"></i>
          <span>Launch Benchmark: Red Backpack (#SR-2026-001)</span>
        </button>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Role Switcher */}
        <div className="d-flex align-items-center gap-1 font-mono" style={{ fontSize: '0.76rem' }}>
          <span className="text-secondary d-none d-sm-inline">Role:</span>
          <button
            className={`btn btn-sm py-0 px-2 ${role === 'user' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary'}`}
            style={{ fontSize: '0.74rem' }}
            onClick={() => switchRole('user')}
          >
            <i className="bi bi-person me-1"></i>User
          </button>
          <button
            className={`btn btn-sm py-0 px-2 ${role === 'moderator' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'}`}
            style={{ fontSize: '0.74rem' }}
            onClick={() => switchRole('moderator')}
          >
            <i className="bi bi-shield-check me-1"></i>Moderator
          </button>
          <button
            className={`btn btn-sm py-0 px-2 ${role === 'admin' ? 'btn-danger text-light fw-bold' : 'btn-outline-secondary'}`}
            style={{ fontSize: '0.74rem' }}
            onClick={() => switchRole('admin')}
          >
            <i className="bi bi-gear-fill me-1"></i>Admin
          </button>
        </div>

        {/* Live Satellite status indicator */}
        <div className="telemetry-pill d-none d-md-flex align-items-center">
          <span className="telemetry-dot live"></span>
          <span className="text-light" style={{ fontSize: '0.75rem' }}>Copernicus Sentinel-2 MSI</span>
        </div>
      </div>
    </div>
  );
}
