import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

export default function AIRecoveryCameraView({
  targetZoneId = 'Z001',
  missionId = null,
  targetItem = null,
  onNavigate
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [pipelineLabel, setPipelineLabel] = useState('PROTOTYPE DEMO VISION ANALYZER (Color/Geometry Feature Matcher)');
  const [capturedFrameUrl, setCapturedFrameUrl] = useState(null);

  // Target item details
  const activeTarget = targetItem || {
    title: 'Red Backpack',
    category: 'Bag & Backpack',
    color: 'Red',
    brand: 'Wildcraft',
    referenceImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
  };

  // Start webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API (getUserMedia) not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      console.warn('Webcam stream unavailable:', err.message);
      setCameraError(err.message || 'Camera permission denied or camera device not found.');
      setStreamActive(false);
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Handle frame capture and analysis
  const captureAndAnalyze = async (manualImage = null) => {
    setIsScanning(true);
    try {
      let frameBase64 = manualImage;

      if (!frameBase64 && videoRef.current && streamActive) {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        frameBase64 = canvas.toDataURL('image/jpeg', 0.85);
      }

      // If neither video nor manual image, use preset frame
      if (!frameBase64) {
        frameBase64 = activeTarget.referenceImage;
      }

      setCapturedFrameUrl(frameBase64);

      const res = await api.analyzeCameraFrame({
        imageBase64: frameBase64,
        targetItemId: activeTarget._id || null,
        missionId: missionId,
        zoneId: targetZoneId || 'Z001'
      });

      if (res.success && res.data) {
        setDetectionResult(res.data.detectionResult);
        setPipelineLabel(res.data.pipelineLabel);
      }
    } catch (err) {
      console.error('Frame analysis failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      captureAndAnalyze(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 text-light">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <div className="telemetry-pill mb-1">
            <span className="telemetry-dot live"></span>
            <span>LEVEL 3 MICRO INSPECTION</span>
          </div>
          <h2 className="fw-bold mb-0 brand-heading">AI Ground Recovery Camera</h2>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-secondary font-mono" style={{ fontSize: '0.78rem' }}>
            SCANNING ZONE: <strong className="text-warning">{targetZoneId}</strong>
          </span>
          <button
            className="btn btn-sm btn-outline-info font-mono"
            onClick={() => onNavigate && onNavigate('mission')}
          >
            <i className="bi bi-arrow-left me-1"></i> Return to Mission
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Camera Viewport */}
        <div className="col-lg-7">
          <div className="card-mission p-3 position-relative">
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25 font-mono" style={{ fontSize: '0.75rem' }}>
              <div className="d-flex align-items-center gap-2">
                <span className={`telemetry-dot ${streamActive ? 'live' : 'warning'}`}></span>
                <span>{streamActive ? 'HARDWARE OPTICAL STREAM: LIVE' : 'HARDWARE SENSOR INACTIVE / DEMO MODE'}</span>
              </div>
              <span className="text-dim">FOV: 78° • 1080P</span>
            </div>

            {/* Video Viewport with Scanner Overlay */}
            <div
              className="position-relative rounded overflow-hidden bg-black d-flex align-items-center justify-content-center"
              style={{ minHeight: '380px', maxHeight: '460px', border: '1px solid #1e293b' }}
            >
              {/* Hidden canvas for snapshot rasterization */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {streamActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-100 h-100 object-fit-cover"
                  style={{ minHeight: '380px' }}
                />
              ) : (
                <div className="text-center p-4">
                  <div className="fs-1 mb-2">📷</div>
                  <h6 className="fw-bold text-light mb-1">Browser Camera Stream Unavailable</h6>
                  <p className="text-secondary font-mono mb-3" style={{ fontSize: '0.75rem', maxWidth: '380px' }}>
                    {cameraError || 'Allow camera permission or use the frame upload / sample detector below.'}
                  </p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <button
                      className="btn btn-sm btn-outline-info font-mono"
                      onClick={startCamera}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i> Retry Camera
                    </button>
                    <label className="btn btn-sm btn-command font-mono mb-0" style={{ cursor: 'pointer' }}>
                      <i className="bi bi-upload me-1"></i> Upload Image Frame
                      <input type="file" accept="image/*" className="d-none" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              )}

              {/* Crosshair Overlay */}
              <div className="camera-crosshair"></div>

              {/* Scan Bar Animation when scanning */}
              {isScanning && (
                <div
                  className="position-absolute top-0 start-0 end-0 bg-info opacity-75"
                  style={{
                    height: '3px',
                    boxShadow: '0 0 15px #06b6d4',
                    animation: 'scan-vertical 1.5s infinite ease-in-out'
                  }}
                ></div>
              )}

              {/* Telemetry overlay pill on top */}
              <div className="position-absolute top-0 start-0 m-3 p-2 rounded bg-black bg-opacity-75 font-mono border border-secondary border-opacity-30" style={{ fontSize: '0.7rem' }}>
                <span className="text-dim">TARGET SIGNATURE: </span>
                <span className="text-light fw-bold">{activeTarget.color} {activeTarget.category}</span>
              </div>
            </div>

            {/* Viewport Control Bar */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mt-3 gap-2">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-radar font-mono px-4 d-flex align-items-center gap-2"
                  disabled={isScanning}
                  onClick={() => captureAndAnalyze()}
                >
                  <i className="bi bi-camera-fill"></i>
                  <span>{isScanning ? 'Analyzing Features...' : 'Capture & Analyze Frame'}</span>
                </button>

                <label className="btn btn-outline-secondary font-mono d-flex align-items-center gap-1 mb-0" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                  <i className="bi bi-image"></i>
                  <span>Select Test Photo</span>
                  <input type="file" accept="image/*" className="d-none" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>
                Zone: <strong className="text-warning">{targetZoneId}</strong> • Centroid ±18m
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reference Comparison & Object Detection Result */}
        <div className="col-lg-5">
          {/* Target Item Reference Profile */}
          <div className="card-mission p-3 mb-3">
            <h6 className="fw-bold text-light mb-2 font-mono" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-bullseye text-info me-1"></i> TARGET ITEM VISUAL PROFILE
            </h6>

            <div className="d-flex gap-3 align-items-center p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
              <img
                src={activeTarget.referenceImage}
                alt={activeTarget.title}
                className="rounded object-fit-cover"
                style={{ width: '74px', height: '74px', border: '1px solid #334155' }}
              />
              <div className="flex-grow-1 font-mono" style={{ fontSize: '0.76rem' }}>
                <div className="fw-bold text-light mb-1">{activeTarget.title}</div>
                <div className="text-secondary">Category: <span className="text-light">{activeTarget.category}</span></div>
                <div className="text-secondary">Color Profile: <span className="text-light">{activeTarget.color}</span></div>
                <div className="text-secondary">Brand/Model: <span className="text-light">{activeTarget.brand || 'Unbranded'}</span></div>
              </div>
            </div>
          </div>

          {/* AI Object Detection Results Card */}
          {detectionResult ? (
            <div className="card-mission p-3 border-emerald border-opacity-60 shadow-lg">
              <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                <span className="badge bg-success text-uppercase font-mono fw-bold" style={{ fontSize: '0.75rem' }}>
                  ● POTENTIAL OBJECT DETECTED
                </span>
                <span className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>
                  Ref #{targetZoneId}
                </span>
              </div>

              <h4 className="fw-bold text-light mb-3">
                {detectionResult.object}
              </h4>

              {/* Similarity & Confidence Meters */}
              <div className="mb-3 font-mono">
                <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: '0.78rem' }}>
                  <span>Visual Similarity:</span>
                  <span className="text-emerald fw-bold">{detectionResult.visualSimilarity}%</span>
                </div>
                <div className="progress mb-2" style={{ height: '6px', background: '#1e293b' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${detectionResult.visualSimilarity}%` }}
                  ></div>
                </div>

                <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: '0.78rem' }}>
                  <span>Detection Confidence:</span>
                  <span className="text-info fw-bold">{detectionResult.detectionConfidence}%</span>
                </div>
                <div className="progress mb-2" style={{ height: '6px', background: '#1e293b' }}>
                  <div
                    className="progress-bar bg-info"
                    style={{ width: `${detectionResult.detectionConfidence}%` }}
                  ></div>
                </div>

                <div className="d-flex justify-content-between text-secondary" style={{ fontSize: '0.78rem' }}>
                  <span>Distance from recovery zone:</span>
                  <span className="text-warning fw-bold">{detectionResult.distanceFromRecoveryZoneMeters} m</span>
                </div>
              </div>

              {/* Extracted Features List */}
              <div className="p-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 mb-3 font-mono">
                <div className="text-dim text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Extracted Vision Features:</div>
                <ul className="mb-0 ps-3 text-secondary" style={{ fontSize: '0.72rem', lineHeight: '1.4' }}>
                  {detectionResult.extractedFeatures?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Honest Pipeline Labeling */}
              <div className="alert alert-dark border-secondary border-opacity-50 py-2 px-3 mb-3 font-mono" style={{ fontSize: '0.7rem' }}>
                <i className="bi bi-shield-check text-info me-1"></i>
                <span className="text-dim">{pipelineLabel}</span>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-command font-mono py-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => onNavigate && onNavigate('claims')}
                >
                  <i className="bi bi-shield-lock-fill"></i>
                  <span>PROCEED TO OWNERSHIP VERIFICATION</span>
                </button>

                <button
                  className="btn btn-outline-secondary font-mono py-1"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => onNavigate && onNavigate('mission')}
                >
                  <i className="bi bi-geo-alt me-1 text-info"></i> View Location on Satellite Map
                </button>
              </div>
            </div>
          ) : (
            <div className="card-mission p-4 text-center">
              <div className="fs-2 mb-2 text-secondary">🎯</div>
              <h6 className="fw-bold text-light mb-1">Awaiting Ground Camera Capture</h6>
              <p className="text-secondary font-mono mb-0" style={{ fontSize: '0.78rem' }}>
                Point camera towards the candidate obstacle / bench in Zone {targetZoneId} and click "Capture & Analyze Frame".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
