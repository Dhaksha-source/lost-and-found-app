import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import L from 'leaflet';

export default function HeatmapAnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeMissions: 0,
    potentialMatches: 0,
    recoveredItems: 0,
    pendingClaims: 0,
    highRiskClaims: 0,
    satelliteSearches: 0,
    totalUsers: 0
  });

  const [analytics, setAnalytics] = useState({
    recoveryRate: 75,
    averageRecoveryHours: 4.8,
    activeSearchesCount: 1,
    commonCategories: [],
    hotspots: [],
    heatmapPoints: []
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const fetchDashboardAndAnalytics = async () => {
      try {
        setLoading(true);
        const [dashRes, anaRes] = await Promise.all([
          api.getAdminDashboard(),
          api.getAdminAnalytics()
        ]);

        if (dashRes.success && dashRes.data?.metrics) {
          setMetrics(dashRes.data.metrics);
        }

        if (anaRes.success && anaRes.data) {
          setAnalytics(anaRes.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAndAnalytics();
  }, []);

  // Initialize Heatmap Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = [11.6643, 78.1182]; // KIOT Campus
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Dark Tactical Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add points from analytics.heatmapPoints
    const points = analytics.heatmapPoints || [];

    points.forEach((pt) => {
      if (pt.coordinates && pt.coordinates.length === 2) {
        let color = '#f59e0b'; // amber for lost report
        let label = 'Lost Item Report';
        if (pt.type === 'recovery') {
          color = '#10b981'; // emerald for recovery
          label = 'Verified Recovery';
        } else if (pt.type === 'active_mission') {
          color = '#06b6d4'; // cyan for active mission
          label = 'Active SARA Mission';
        }

        const circle = L.circleMarker(pt.coordinates, {
          radius: pt.type === 'active_mission' ? 14 : 9,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.65
        }).addTo(map);

        circle.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px;">
            <strong style="color: ${color};">${label}</strong><br/>
            <b>${pt.title}</b><br/>
            Category: ${pt.category}<br/>
            Location: ${pt.address || 'Campus Quad'}
          </div>
        `);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [analytics.heatmapPoints]);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 text-light">
      <div className="mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div className="telemetry-pill mb-1">
          <span className="telemetry-dot live"></span>
          <span>SYSTEM-WIDE RECOVERY TELEMETRY</span>
        </div>
        <h2 className="fw-bold mb-0 brand-heading">Recovery Heatmap & Operations Analytics</h2>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Active Recovery Missions', value: metrics.activeMissions, icon: 'bi-radar', color: 'text-info', border: 'border-info' },
          { label: 'Potential AI Matches', value: metrics.potentialMatches, icon: 'bi-intersect', color: 'text-cyan', border: 'border-secondary' },
          { label: 'Recovered Items', value: metrics.recoveredItems, icon: 'bi-check-circle-fill', color: 'text-success', border: 'border-success' },
          { label: 'Pending Claims', value: metrics.pendingClaims, icon: 'bi-hourglass-split', color: 'text-warning', border: 'border-warning' },
          { label: 'High-Risk Claims', value: metrics.highRiskClaims, icon: 'bi-shield-exclamation', color: 'text-danger', border: 'border-danger' },
          { label: 'Satellite Searches', value: metrics.satelliteSearches, icon: 'bi-globe-americas', color: 'text-info', border: 'border-info' }
        ].map((card, i) => (
          <div key={i} className="col-sm-6 col-lg-4 col-xl-2">
            <div className={`card-mission p-3 h-100 ${card.border} border-opacity-40`}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>{card.label}</span>
                <i className={`bi ${card.icon} ${card.color} fs-5`}></i>
              </div>
              <h3 className={`fw-bold mb-0 font-mono ${card.color}`}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Heatmap Column */}
        <div className="col-lg-7">
          <div className="card-mission p-3 h-100">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 border-bottom border-secondary border-opacity-25 pb-2 gap-2">
              <div>
                <h5 className="fw-bold text-light mb-0 brand-heading">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i> GEOSPATIAL RECOVERY HEATMAP
                </h5>
                <small className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>
                  Visualizing report densities, active missions, and verified recovery vectors
                </small>
              </div>

              {/* Heatmap Legend */}
              <div className="d-flex align-items-center gap-2 font-mono" style={{ fontSize: '0.7rem' }}>
                <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-40">
                  ● Active Missions
                </span>
                <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-40">
                  ● Lost Reports
                </span>
                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-40">
                  ● Recoveries
                </span>
              </div>
            </div>

            <div
              ref={mapContainerRef}
              className="rounded overflow-hidden border border-secondary border-opacity-30"
              style={{ minHeight: '440px', width: '100%' }}
            />
          </div>
        </div>

        {/* Analytics Deep Dive Column */}
        <div className="col-lg-5">
          <div className="d-flex flex-column gap-3">
            {/* KPI Highlights */}
            <div className="card-mission p-3">
              <h6 className="fw-bold text-light mb-3 font-mono" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-graph-up text-info me-1"></i> PERFORMANCE BENCHMARKS
              </h6>

              <div className="row g-3 text-center font-mono">
                <div className="col-6">
                  <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                    <span className="text-dim d-block" style={{ fontSize: '0.7rem' }}>RECOVERY PERCENTAGE</span>
                    <span className="fs-3 fw-bold text-emerald">{analytics.recoveryRate}%</span>
                    <small className="text-secondary d-block" style={{ fontSize: '0.65rem' }}>Resolved Handover Rate</small>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                    <span className="text-dim d-block" style={{ fontSize: '0.7rem' }}>AVG RESOLUTION TIME</span>
                    <span className="fs-3 fw-bold text-info">{analytics.averageRecoveryHours}h</span>
                    <small className="text-secondary d-block" style={{ fontSize: '0.65rem' }}>From SARA Init to Claim</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Common Categories */}
            <div className="card-mission p-3">
              <h6 className="fw-bold text-light mb-2 font-mono" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-pie-chart text-info me-1"></i> MOST COMMON ASSET CATEGORIES
              </h6>

              <div className="d-flex flex-column gap-2 font-mono">
                {analytics.commonCategories?.map((cat, i) => (
                  <div key={i}>
                    <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: '0.76rem' }}>
                      <span>{cat.category}</span>
                      <span className="text-light">{cat.count} items</span>
                    </div>
                    <div className="progress" style={{ height: '6px', background: '#1e293b' }}>
                      <div
                        className="progress-bar bg-info"
                        style={{ width: `${Math.min(100, (cat.count / 5) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Hotspots Table */}
            <div className="card-mission p-3">
              <h6 className="fw-bold text-light mb-2 font-mono" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-pin-map text-warning me-1"></i> IDENTIFIED CAMPUS HOTSPOTS
              </h6>

              <div className="table-responsive font-mono" style={{ fontSize: '0.76rem' }}>
                <table className="table table-dark table-hover table-sm mb-0">
                  <thead>
                    <tr className="text-dim border-secondary">
                      <th>Location Zone</th>
                      <th>Incidents</th>
                      <th>Risk Factor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.hotspots?.map((hs, i) => (
                      <tr key={i} className="border-secondary border-opacity-20">
                        <td className="text-light fw-semibold">{hs.name}</td>
                        <td className="text-info">{hs.count}</td>
                        <td className="text-secondary">{hs.riskCategory}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
