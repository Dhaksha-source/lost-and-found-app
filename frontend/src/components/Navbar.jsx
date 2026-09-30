import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, onNavigate, onOpenReportLost, onOpenReportFound }) {
  const { user, role, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-command sticky-top py-2 px-3">
      <div className="container-fluid">
        {/* Brand */}
        <button
          className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0 text-light me-4"
          onClick={() => onNavigate('landing')}
        >
          <div className="rounded-3 p-1 d-flex align-items-center justify-content-center" style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
            <span style={{ fontSize: '1.25rem' }}>🛰️</span>
          </div>
          <div className="text-start">
            <span className="brand-heading fw-bold fs-5 tracking-tight text-light">LOSTFOUND<span className="text-info">+</span></span>
            <span className="d-block font-mono text-dim" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>SARA AUTONOMOUS ENGINE</span>
          </div>
        </button>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-secondary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMain"
          aria-controls="navMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 font-mono" style={{ fontSize: '0.84rem' }}>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start px-3 rounded-2 ${currentView === 'landing' ? 'active text-info bg-secondary bg-opacity-25' : 'text-secondary'}`}
                onClick={() => onNavigate('landing')}
              >
                <i className="bi bi-grid-1x2 me-1"></i> Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start px-3 rounded-2 ${currentView === 'mission' ? 'active text-info bg-secondary bg-opacity-25' : 'text-secondary'}`}
                onClick={() => onNavigate('mission')}
              >
                <i className="bi bi-radar me-1"></i> SARA Mission Control
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start px-3 rounded-2 ${currentView === 'matches' ? 'active text-info bg-secondary bg-opacity-25' : 'text-secondary'}`}
                onClick={() => onNavigate('matches')}
              >
                <i className="bi bi-intersect me-1"></i> AI Matches
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start px-3 rounded-2 ${currentView === 'camera' ? 'active text-info bg-secondary bg-opacity-25' : 'text-secondary'}`}
                onClick={() => onNavigate('camera')}
              >
                <i className="bi bi-camera me-1"></i> AI Ground Camera
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start px-3 rounded-2 ${currentView === 'claims' ? 'active text-info bg-secondary bg-opacity-25' : 'text-secondary'}`}
                onClick={() => onNavigate('claims')}
              >
                <i className="bi bi-shield-lock me-1"></i> Ownership & Claims
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start px-3 rounded-2 ${currentView === 'heatmap' ? 'active text-info bg-secondary bg-opacity-25' : 'text-secondary'}`}
                onClick={() => onNavigate('heatmap')}
              >
                <i className="bi bi-geo-alt-fill me-1"></i> Heatmap & Analytics
              </button>
            </li>
          </ul>

          {/* Quick Action Buttons & Groq Status */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="d-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill bg-dark bg-opacity-75 border border-info border-opacity-30 font-mono" style={{ fontSize: '0.72rem' }}>
              <span className="spinner-grow spinner-grow-sm text-info" role="status" style={{ width: '0.45rem', height: '0.45rem' }}></span>
              <span className="text-secondary">Groq AI:</span>
              <span className="text-info fw-bold">Connected</span>
            </div>
            <button
              className="btn btn-sm btn-outline-info font-mono py-1 px-3 d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem' }}
              onClick={onOpenReportLost}
            >
              <i className="bi bi-plus-circle"></i>
              <span>Report Lost</span>
            </button>
            <button
              className="btn btn-sm btn-outline-light font-mono py-1 px-3 d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem' }}
              onClick={onOpenReportFound}
            >
              <i className="bi bi-box-seam"></i>
              <span>Report Found</span>
            </button>

            {/* User Indicator */}
            {user && (
              <div className="d-none d-xl-flex align-items-center gap-2 ms-2 ps-2 border-start border-secondary border-opacity-50">
                <div className="text-end" style={{ lineHeight: '1.2' }}>
                  <div className="fw-semibold text-light text-truncate" style={{ maxWidth: '120px', fontSize: '0.78rem' }}>{user.name}</div>
                  <span className={`badge ${role === 'admin' ? 'bg-danger' : role === 'moderator' ? 'bg-warning text-dark' : 'bg-info text-dark'} text-uppercase`} style={{ fontSize: '0.62rem' }}>
                    {role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
