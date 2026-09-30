import React from 'react';

export default function LandingPage({ onNavigate, onOpenReportLost, onStartMission }) {
  return (
    <div className="landing-container text-light">
      {/* Hero Section */}
      <section className="py-5 px-3 px-md-5 position-relative overflow-hidden border-bottom border-secondary border-opacity-25" style={{ background: 'linear-gradient(180deg, #070a12 0%, #0e1524 100%)' }}>
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="telemetry-pill mb-3">
                <span className="telemetry-dot live"></span>
                <span>NATIONAL HACKATHON INNOVATION • AI & SATELLITE EO</span>
              </div>

              <h1 className="display-4 fw-extrabold brand-heading tracking-tight mb-3">
                LOSTFOUND<span className="text-info">+</span>
              </h1>

              <h3 className="fw-semibold text-light mb-3" style={{ fontSize: '1.45rem', lineHeight: '1.3' }}>
                "Don't just report what's lost. <br />
                <span className="text-info">Recover it intelligently."</span>
              </h3>

              <p className="text-secondary fs-6 mb-4 lead" style={{ lineHeight: '1.6' }}>
                An AI-powered recovery platform combining geospatial intelligence, real Copernicus Earth observation imagery, multi-resolution visual search, and cryptographically segregated ownership verification.
              </p>

              {/* Central CTA Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <button
                  className="btn btn-command font-mono px-4 py-2 d-flex align-items-center gap-2"
                  onClick={onOpenReportLost}
                >
                  <i className="bi bi-plus-circle-fill"></i>
                  <span>REPORT LOST ITEM</span>
                </button>

                <button
                  className="btn btn-radar font-mono px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => onNavigate('mission')}
                >
                  <i className="bi bi-radar"></i>
                  <span>START SARA RECOVERY</span>
                </button>

                <button
                  className="btn btn-command-outline font-mono px-3 py-2"
                  onClick={() => onNavigate('matches')}
                >
                  <i className="bi bi-intersect me-1"></i> Community Matches
                </button>
              </div>

              {/* Two Pathways Notice */}
              <div className="row g-2 font-mono" style={{ fontSize: '0.78rem' }}>
                <div className="col-sm-6">
                  <div className="p-2 rounded bg-dark bg-opacity-75 border border-secondary border-opacity-30">
                    <span className="text-cyan fw-bold d-block">PATH A: Community-Aided</span>
                    <span className="text-dim">Multimodal matching vs reported found items</span>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-2 rounded bg-dark bg-opacity-75 border border-secondary border-opacity-30">
                    <span className="text-warning fw-bold d-block">PATH B: Autonomous SARA</span>
                    <span className="text-dim">Satellite → Meso → Ground AI vision sweep</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual: Professional Command Dashboard Mockup */}
            <div className="col-lg-6">
              <div className="card-mission p-3 position-relative shadow-lg border-info border-opacity-40" style={{ background: '#0b111e' }}>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25 font-mono" style={{ fontSize: '0.75rem' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="telemetry-dot live"></span>
                    <span className="text-light fw-bold">SARA ORBITAL COMMAND CENTER</span>
                  </div>
                  <span className="text-info">#SR-2026-001 • LIVE</span>
                </div>

                {/* Simulated Visual Screen */}
                <div className="position-relative rounded overflow-hidden mb-3 border border-secondary border-opacity-25" style={{ height: '240px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80"
                    alt="Satellite Search Mission"
                    className="w-100 h-100 object-fit-cover"
                    style={{ filter: 'brightness(0.7) contrast(1.1)' }}
                  />
                  <div className="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 font-mono border border-secondary" style={{ fontSize: '0.68rem' }}>
                    COPERNICUS SENTINEL-2 • 10m/px
                  </div>

                  {/* Simulated Radar Ring */}
                  <div className="position-absolute top-50 start-50 translate-middle" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px dashed #06b6d4', opacity: 0.8 }}></div>
                  <div className="position-absolute top-50 start-50 translate-middle pulse-marker-icon" style={{ width: '18px', height: '18px' }}></div>

                  {/* High priority zone callout */}
                  <div className="position-absolute bottom-0 start-0 m-2 p-2 rounded bg-black bg-opacity-80 font-mono border border-warning border-opacity-50" style={{ fontSize: '0.72rem' }}>
                    <span className="text-warning fw-bold">ZONE Z001 IDENTIFIED (89%)</span>
                    <div className="text-secondary">Campus Cafeteria Axis • 55m from Origin</div>
                  </div>
                </div>

                {/* Quick Telemetry metrics */}
                <div className="row g-2 font-mono text-center" style={{ fontSize: '0.74rem' }}>
                  <div className="col-4">
                    <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                      <div className="text-dim" style={{ fontSize: '0.64rem' }}>TARGET</div>
                      <div className="text-light fw-bold">Red Backpack</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                      <div className="text-dim" style={{ fontSize: '0.64rem' }}>BUFFER</div>
                      <div className="text-info fw-bold">500 m Radius</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                      <div className="text-dim" style={{ fontSize: '0.64rem' }}>CLOUDS</div>
                      <div className="text-emerald fw-bold">3.4% Optimal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Step Recovery Workflow */}
      <section className="py-5 px-3 px-md-5 container">
        <div className="text-center mb-5">
          <div className="telemetry-pill mb-2">
            <span>OPERATIONAL PIPELINE</span>
          </div>
          <h2 className="fw-bold brand-heading text-light">How LOSTFOUND+ Works</h2>
          <p className="text-secondary font-mono" style={{ fontSize: '0.85rem' }}>
            Six rigorous stages from report to verified handover
          </p>
        </div>

        <div className="row g-3">
          {[
            {
              step: '01',
              title: 'Report',
              desc: 'User reports lost item with spatial coordinates, visual photos, and confidential private clues known only to the owner.',
              icon: 'bi-pencil-square'
            },
            {
              step: '02',
              title: 'Locate',
              desc: 'System establishes exact geospatial coordinates and calculates search bounding radius buffer across the environment.',
              icon: 'bi-geo-alt'
            },
            {
              step: '03',
              title: 'Analyze',
              desc: 'Queries Copernicus Sentinel-2 catalog for optical surface reflectance and runs multimodal matching vs reported found items.',
              icon: 'bi-cpu'
            },
            {
              step: '04',
              title: 'Search',
              desc: 'Generates AI Recovery Probability Zones (High, Med, Low) with explainable factors for progressive ground visual sweeps.',
              icon: 'bi-radar'
            },
            {
              step: '05',
              title: 'Verify',
              desc: 'Claimant answers dynamic verification quiz based on private clues. Claim Security Engine assigns LOW/REVIEW/HIGH risk.',
              icon: 'bi-shield-check'
            },
            {
              step: '06',
              title: 'Recover',
              desc: 'Campus security or authorized human moderator confirms identity and marks item recovered with full audit trail.',
              icon: 'bi-check2-circle'
            }
          ].map((item) => (
            <div key={item.step} className="col-md-4 col-sm-6">
              <div className="card-mission p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-secondary bg-opacity-25 text-info font-mono fw-bold" style={{ fontSize: '0.85rem' }}>
                      STAGE {item.step}
                    </span>
                    <i className={`bi ${item.icon} text-info fs-5`}></i>
                  </div>
                  <h5 className="fw-bold text-light mb-2">{item.title}</h5>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.82rem', lineHeight: '1.45' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Technology Pillars */}
      <section className="py-5 px-3 px-md-5 border-top border-secondary border-opacity-25" style={{ background: '#080c16' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h3 className="fw-bold brand-heading text-light">Built on 4 Scientific Pillars</h3>
            <p className="text-secondary font-mono" style={{ fontSize: '0.82rem' }}>
              Designed specifically to avoid false claims and deliver demonstrable recovery capabilities
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 h-100">
                <div className="fs-3 mb-2">🛰️</div>
                <h6 className="fw-bold text-light">Satellite Intelligence</h6>
                <p className="text-secondary" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                  Real connection to Copernicus Sentinel-2 MSI data. Orthorectified optical surface analysis used to define macro corridors.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 h-100">
                <div className="fs-3 mb-2">🗺️</div>
                <h6 className="fw-bold text-light">Geospatial Recovery Engine</h6>
                <p className="text-secondary" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                  GeoJSON probability polygon generator calculating temporal decay, pedestrian transit vectors, and obstacle retention.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 h-100">
                <div className="fs-3 mb-2">📱</div>
                <h6 className="fw-bold text-light">AI Ground Vision</h6>
                <p className="text-secondary" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                  Micro-level camera feature extraction. Searches for chromatic signatures, contour geometry, and zone distance offsets.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 h-100">
                <div className="fs-3 mb-2">🛡️</div>
                <h6 className="fw-bold text-light">Claim Security & Clues</h6>
                <p className="text-secondary" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                  Zero-knowledge private ownership clues. Protects against fraudulent claimants through multi-risk scoring and moderator gating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
