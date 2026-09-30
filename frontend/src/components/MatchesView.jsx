import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MatchesView({ onNavigate, onClaimItem }) {
  const [loading, setLoading] = useState(true);
  const [lostItems, setLostItems] = useState([]);
  const [selectedLostId, setSelectedLostId] = useState('');
  const [matches, setMatches] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch lost items
  useEffect(() => {
    const fetchLost = async () => {
      try {
        setLoading(true);
        const res = await api.getLostItems();
        if (res.success && res.data?.length > 0) {
          setLostItems(res.data);
          // Prefer Red Backpack benchmark if available
          const redB = res.data.find(i => i.title.toLowerCase().includes('red backpack')) || res.data[0];
          setSelectedLostId(redB._id);
          loadMatches(redB._id);
        }
      } catch (err) {
        console.error('Failed to fetch lost items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLost();
  }, []);

  const loadMatches = async (lostId) => {
    try {
      setIsAnalyzing(true);
      const res = await api.analyzeMatches(lostId);
      if (res.success) {
        setMatches(res.matches || []);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeLost = lostItems.find(i => i._id === selectedLostId);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 text-light">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <div className="telemetry-pill mb-1">
            <span className="telemetry-dot live"></span>
            <span>PATH A: COMMUNITY-AIDED RECOVERY</span>
          </div>
          <h2 className="fw-bold mb-0 brand-heading">AI Multimodal Match Engine</h2>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Item Selector */}
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary font-mono"
            style={{ width: 'auto', minWidth: '220px' }}
            value={selectedLostId}
            onChange={(e) => {
              setSelectedLostId(e.target.value);
              loadMatches(e.target.value);
            }}
          >
            {lostItems.map(item => (
              <option key={item._id} value={item._id}>
                {item.title} ({item.category})
              </option>
            ))}
          </select>

          <button
            className="btn btn-sm btn-outline-info font-mono d-flex align-items-center gap-1"
            disabled={isAnalyzing}
            onClick={() => loadMatches(selectedLostId)}
          >
            <i className={`bi bi-arrow-repeat ${isAnalyzing ? 'spin' : ''}`}></i>
            <span>{isAnalyzing ? 'Analyzing...' : 'Re-Run Matcher'}</span>
          </button>
        </div>
      </div>

      {activeLost && (
        <div className="row g-4">
          {/* Target Lost Item Summary Card */}
          <div className="col-lg-4">
            <div className="card-mission p-3 position-sticky" style={{ top: '80px' }}>
              <span className="badge bg-secondary font-mono text-cyan mb-2" style={{ fontSize: '0.72rem' }}>
                TARGET LOST ASSET
              </span>

              <div className="rounded overflow-hidden mb-3 border border-secondary border-opacity-25" style={{ height: '180px' }}>
                <img
                  src={activeLost.referenceImage || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'}
                  alt={activeLost.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              <h5 className="fw-bold text-light mb-1">{activeLost.title}</h5>
              <p className="text-secondary font-mono mb-2" style={{ fontSize: '0.8rem' }}>
                {activeLost.category} • {activeLost.color} • {activeLost.brand}
              </p>

              <div className="p-2 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25 mb-3 font-mono" style={{ fontSize: '0.75rem' }}>
                <div className="text-dim">Reported Location:</div>
                <div className="text-light fw-semibold text-truncate">{activeLost.addressText}</div>
                <div className="text-dim mt-1">Reported Time:</div>
                <div className="text-light">{new Date(activeLost.lostDateTime).toLocaleString()} ({activeLost.approximateTimeText})</div>
              </div>

              <p className="text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                {activeLost.description}
              </p>

              <div className="pt-3 border-top border-secondary border-opacity-25">
                <div className="text-secondary font-mono mb-2" style={{ fontSize: '0.74rem' }}>
                  No satisfactory community match?
                </div>
                <button
                  className="btn btn-radar w-100 font-mono py-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => onNavigate && onNavigate('mission')}
                >
                  <i className="bi bi-radar"></i>
                  <span>Launch SARA Autonomous Recovery</span>
                </button>
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="font-mono text-light fw-bold" style={{ fontSize: '0.85rem' }}>
                EVALUATED FOUND ITEM CANDIDATES ({matches.length})
              </span>
              <span className="text-dim font-mono" style={{ fontSize: '0.74rem' }}>
                Ranked by multimodal weighted score
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="card-mission p-5 text-center">
                <div className="fs-2 mb-2 text-secondary">🔍</div>
                <h6 className="fw-bold text-light">No direct community matches found in database.</h6>
                <p className="text-secondary font-mono mb-3" style={{ fontSize: '0.8rem' }}>
                  Switch to Path B: SARA Autonomous Satellite Recovery to search the area proactively.
                </p>
                <button
                  className="btn btn-command font-mono px-4"
                  onClick={() => onNavigate && onNavigate('mission')}
                >
                  Start SARA Satellite Mission →
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {matches.map((m, idx) => {
                  const fItem = m.foundItem || {};
                  const isTopMatch = m.overallScore >= 80;

                  return (
                    <div
                      key={m.matchId || idx}
                      className={`card-mission p-3 ${isTopMatch ? 'border-info border-opacity-60' : ''}`}
                    >
                      <div className="d-flex flex-wrap justify-content-between align-items-start mb-3 gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${m.overallScore >= 85 ? 'bg-success' : m.overallScore >= 70 ? 'bg-info text-dark' : 'bg-secondary'} font-mono fw-bold px-2 py-1`} style={{ fontSize: '0.82rem' }}>
                            OVERALL MATCH: {m.overallScore}%
                          </span>
                          <span className="badge bg-dark border border-secondary font-mono" style={{ fontSize: '0.7rem' }}>
                            Rank #{idx + 1}
                          </span>
                        </div>

                        <div className="font-mono text-secondary" style={{ fontSize: '0.74rem' }}>
                          Status: <span className="text-info">{fItem.status || 'Reported'}</span>
                        </div>
                      </div>

                      {/* Item Comparison Block */}
                      <div className="row g-3 mb-3">
                        {/* Found item details */}
                        <div className="col-sm-4">
                          <div className="rounded overflow-hidden border border-secondary border-opacity-25" style={{ height: '140px' }}>
                            <img
                              src={fItem.referenceImage || 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=600&q=80'}
                              alt={fItem.title}
                              className="w-100 h-100 object-fit-cover"
                            />
                          </div>
                        </div>

                        <div className="col-sm-8 font-mono" style={{ fontSize: '0.78rem' }}>
                          <h6 className="fw-bold text-light mb-1">{fItem.title}</h6>
                          <div className="text-secondary mb-1">
                            Found at: <span className="text-light">{fItem.addressText}</span>
                          </div>
                          <div className="text-secondary mb-1">
                            Current Custody: <span className="text-info">{fItem.storageLocation}</span>
                          </div>
                          <div className="text-dim mb-2 text-truncate" style={{ maxWidth: '420px' }}>
                            "{fItem.description}"
                          </div>

                          {/* 4-Factor Breakdown Bars */}
                          <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                            <div className="row g-2">
                              <div className="col-6">
                                <div className="d-flex justify-content-between text-dim" style={{ fontSize: '0.68rem' }}>
                                  <span>Visual Similarity:</span>
                                  <span className="text-emerald fw-bold">{m.breakdown?.visualSimilarity || 85}%</span>
                                </div>
                                <div className="progress" style={{ height: '4px', background: '#1e293b' }}>
                                  <div className="progress-bar bg-success" style={{ width: `${m.breakdown?.visualSimilarity || 85}%` }}></div>
                                </div>
                              </div>

                              <div className="col-6">
                                <div className="d-flex justify-content-between text-dim" style={{ fontSize: '0.68rem' }}>
                                  <span>Description Match:</span>
                                  <span className="text-info fw-bold">{m.breakdown?.descriptionSimilarity || 88}%</span>
                                </div>
                                <div className="progress" style={{ height: '4px', background: '#1e293b' }}>
                                  <div className="progress-bar bg-info" style={{ width: `${m.breakdown?.descriptionSimilarity || 88}%` }}></div>
                                </div>
                              </div>

                              <div className="col-6">
                                <div className="d-flex justify-content-between text-dim" style={{ fontSize: '0.68rem' }}>
                                  <span>Spatial Proximity:</span>
                                  <span className="text-warning fw-bold">{m.breakdown?.locationProximity || 92}% ({m.spatialDistanceMeters}m)</span>
                                </div>
                                <div className="progress" style={{ height: '4px', background: '#1e293b' }}>
                                  <div className="progress-bar bg-warning" style={{ width: `${m.breakdown?.locationProximity || 92}%` }}></div>
                                </div>
                              </div>

                              <div className="col-6">
                                <div className="d-flex justify-content-between text-dim" style={{ fontSize: '0.68rem' }}>
                                  <span>Time Proximity:</span>
                                  <span className="text-light fw-bold">{m.breakdown?.timeProximity || 80}%</span>
                                </div>
                                <div className="progress" style={{ height: '4px', background: '#1e293b' }}>
                                  <div className="progress-bar bg-light" style={{ width: `${m.breakdown?.timeProximity || 80}%` }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Natural Language Explanation Box */}
                      <div className="p-2.5 px-3 rounded bg-black bg-opacity-70 border border-info border-opacity-30 mb-3 font-mono" style={{ fontSize: '0.76rem' }}>
                        <div className="d-flex align-items-center gap-2 mb-1.5">
                          <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-30 px-2 py-0.5 rounded-pill" style={{ fontSize: '0.68rem' }}>
                            <i className="bi bi-cpu-fill me-1"></i>Groq AI Forensic Intelligence (qwen/qwen3.8-27b)
                          </span>
                        </div>
                        <div className="text-light lh-base">
                          {m.explanation}
                        </div>
                      </div>

                      {/* Claim Action */}
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-command font-mono px-3 py-1"
                          onClick={() => {
                            if (onClaimItem) onClaimItem(activeLost, fItem);
                            if (onNavigate) onNavigate('claims');
                          }}
                        >
                          <i className="bi bi-shield-check me-1"></i> Initiate Ownership Verification →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
