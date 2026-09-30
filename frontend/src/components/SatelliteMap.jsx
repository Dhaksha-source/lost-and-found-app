import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export default function SatelliteMap({
  center = [11.6643, 78.1182],
  searchRadius = 500,
  boundingBox = null,
  zones = [],
  microDetections = [],
  targetItemTitle = 'Red Backpack',
  onSelectZone,
  selectedZoneId = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    satellite: null,
    tacticalDark: null,
    markersLayer: null,
    zonesLayer: null
  });

  const [activeBaseLayer, setActiveBaseLayer] = useState('satellite'); // 'satellite' | 'tactical'
  const [cursorCoords, setCursorCoords] = useState({ lat: center[0], lng: center[1] });
  const [zoomLevel, setZoomLevel] = useState(16);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // 1. High-Resolution Satellite Layer (ESRI World Imagery / Copernicus EO proxy)
    const satLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    // 2. Tactical Dark Layer (CartoDB Dark Matter)
    const darkLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19 }
    );

    if (activeBaseLayer === 'satellite') {
      satLayer.addTo(map);
    } else {
      darkLayer.addTo(map);
    }

    layersRef.current.satellite = satLayer;
    layersRef.current.tacticalDark = darkLayer;

    // Feature Layers
    const markersLayer = L.layerGroup().addTo(map);
    const zonesLayer = L.layerGroup().addTo(map);
    layersRef.current.markersLayer = markersLayer;
    layersRef.current.zonesLayer = zonesLayer;

    // Mouse movement coordinates readout
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5))
      });
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base layer toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (activeBaseLayer === 'satellite') {
      map.removeLayer(layersRef.current.tacticalDark);
      layersRef.current.satellite.addTo(map);
    } else {
      map.removeLayer(layersRef.current.satellite);
      layersRef.current.tacticalDark.addTo(map);
    }
  }, [activeBaseLayer]);

  // Update Map elements (Zones, Center, Detections, Radius)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const { markersLayer, zonesLayer } = layersRef.current;

    markersLayer.clearLayers();
    zonesLayer.clearLayers();

    // 1. Target Center Pulsing Marker
    const pulseIcon = L.divIcon({
      className: 'custom-pulse-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div class="pulse-marker-icon" style="width: 24px; height: 24px; position: absolute; top: 2px; left: 2px;"></div>
          <div style="position: absolute; top: 6px; left: 6px; width: 12px; height: 12px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const centerMarker = L.marker(center, { icon: pulseIcon }).addTo(markersLayer);
    centerMarker.bindPopup(`
      <div style="color: #0f172a; font-family: sans-serif; font-size: 13px;">
        <strong style="color: #0284c7;">📍 Last Known Position</strong><br/>
        <b>${targetItemTitle}</b><br/>
        Coordinates: ${center[0].toFixed(5)}, ${center[1].toFixed(5)}<br/>
        Search Radius: ${searchRadius}m
      </div>
    `);

    // 2. Search Radius Circle
    L.circle(center, {
      radius: searchRadius,
      color: '#06b6d4',
      weight: 1.5,
      dashArray: '4, 6',
      fillColor: '#06b6d4',
      fillOpacity: 0.05
    }).addTo(zonesLayer);

    // 3. Search Bounding Box if provided [minLng, minLat, maxLng, maxLat]
    if (boundingBox && boundingBox.length === 4) {
      const bounds = [
        [boundingBox[1], boundingBox[0]],
        [boundingBox[3], boundingBox[2]]
      ];
      L.rectangle(bounds, {
        color: '#64748b',
        weight: 1,
        dashArray: '2, 4',
        fill: false
      }).addTo(zonesLayer);
    }

    // 4. Render Recovery Zones Polygons
    zones.forEach((z) => {
      const isSelected = selectedZoneId === z.zoneId;
      let borderColor = '#06b6d4';
      let fillColor = '#06b6d4';
      let fillOpacity = 0.22;

      if (z.priority === 'HIGH') {
        borderColor = '#f59e0b';
        fillColor = '#f59e0b';
        fillOpacity = isSelected ? 0.45 : 0.28;
      } else if (z.priority === 'MEDIUM') {
        borderColor = '#06b6d4';
        fillColor = '#06b6d4';
        fillOpacity = isSelected ? 0.4 : 0.22;
      } else {
        borderColor = '#64748b';
        fillColor = '#64748b';
        fillOpacity = isSelected ? 0.35 : 0.15;
      }

      // GeoJSON Polygon coordinates are [[[lng, lat], ...]]
      if (z.polygon && z.polygon.coordinates && z.polygon.coordinates[0]) {
        const latLngs = z.polygon.coordinates[0].map(([lng, lat]) => [lat, lng]);

        const poly = L.polygon(latLngs, {
          color: borderColor,
          weight: isSelected ? 3.5 : 2,
          fillColor: fillColor,
          fillOpacity: fillOpacity
        }).addTo(zonesLayer);

        poly.on('click', () => {
          if (onSelectZone) onSelectZone(z.zoneId);
        });

        // Add Centroid Badge Marker
        if (z.centroid?.coordinates) {
          const [cLng, cLat] = z.centroid.coordinates;
          const scorePercent = Math.round(z.score * 100);

          const badgeIcon = L.divIcon({
            className: 'zone-centroid-badge',
            html: `
              <div style="background: ${borderColor}; color: #000; font-family: monospace; font-weight: bold; font-size: 11px; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.5); cursor: pointer; white-space: nowrap;">
                ${z.zoneId}: ${scorePercent}%
              </div>
            `,
            iconSize: [60, 20],
            iconAnchor: [30, 10]
          });

          const centroidMarker = L.marker([cLat, cLng], { icon: badgeIcon }).addTo(zonesLayer);
          centroidMarker.on('click', () => {
            if (onSelectZone) onSelectZone(z.zoneId);
          });

          poly.bindPopup(`
            <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 240px;">
              <strong style="color: ${borderColor};">${z.zoneId} — ${z.priority} PRIORITY (${scorePercent}%)</strong><br/>
              <b>${z.areaName}</b><br/>
              <p style="margin: 4px 0; color: #334155;">${z.reason}</p>
              <small style="color: #64748b;">Recommended: ${z.recommendedSensor}</small>
            </div>
          `);
        }
      }
    });

    // 5. Micro Detections Pins (e.g. AI Ground camera detection)
    microDetections.forEach((d) => {
      if (d.coordinates && d.coordinates.length === 2) {
        const [dLng, dLat] = d.coordinates;
        const detIcon = L.divIcon({
          className: 'micro-detection-marker',
          html: `
            <div style="background: #10b981; color: #fff; border: 2px solid #fff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 12px #10b981;">
              📷
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const mMarker = L.marker([dLat, dLng], { icon: detIcon }).addTo(markersLayer);
        mMarker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px;">
            <strong style="color: #10b981;">🎯 AI Ground Detection Candidate</strong><br/>
            <b>${d.detectedCategory || 'Target Match'}</b><br/>
            Visual Similarity: ${d.visualSimilarity}%<br/>
            Confidence: ${d.detectionConfidence}%<br/>
            Offset: ${d.distanceFromZoneMeters}m from ${d.zoneIdRef}
          </div>
        `);
      }
    });

    // Center map view
    map.setView(center, 16);
  }, [center, searchRadius, boundingBox, zones, microDetections, selectedZoneId]);

  return (
    <div className="position-relative w-100">
      {/* Map Control Bar Top Left */}
      <div
        className="position-absolute top-0 start-0 m-3 z-3 d-flex flex-wrap gap-2"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="btn-group btn-group-sm bg-dark bg-opacity-75 p-1 rounded border border-secondary border-opacity-50">
          <button
            className={`btn btn-sm ${activeBaseLayer === 'satellite' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
            style={{ fontSize: '0.74rem' }}
            onClick={() => setActiveBaseLayer('satellite')}
          >
            <i className="bi bi-globe me-1"></i> Copernicus Optical
          </button>
          <button
            className={`btn btn-sm ${activeBaseLayer === 'tactical' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
            style={{ fontSize: '0.74rem' }}
            onClick={() => setActiveBaseLayer('tactical')}
          >
            <i className="bi bi-map me-1"></i> Tactical Dark
          </button>
        </div>

        <button
          className="btn btn-sm btn-dark bg-opacity-75 border border-secondary border-opacity-50 text-light font-mono"
          style={{ fontSize: '0.74rem' }}
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(center, 16);
            }
          }}
          title="Recenter to last-known coordinates"
        >
          <i className="bi bi-crosshair me-1 text-info"></i> Recenter
        </button>
      </div>

      {/* Map View Canvas */}
      <div ref={mapContainerRef} className="map-canvas-container" style={{ minHeight: '480px' }} />

      {/* Map Telemetry Footer */}
      <div
        className="position-absolute bottom-0 start-0 end-0 px-3 py-2 bg-dark bg-opacity-85 border-top border-secondary border-opacity-25 d-flex flex-wrap align-items-center justify-content-between font-mono"
        style={{ fontSize: '0.72rem', zIndex: 1000 }}
      >
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary">
            CURSOR: <span className="text-info">{cursorCoords.lat}° N, {cursorCoords.lng}° E</span>
          </span>
          <span className="text-secondary d-none d-sm-inline">
            ZOOM: <span className="text-light">{zoomLevel}x</span>
          </span>
          <span className="text-secondary d-none d-md-inline">
            SEARCH BUFFER: <span className="text-light">{searchRadius} m</span>
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50">
            ● High Priority Zone
          </span>
          <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50">
            ● Medium Zone
          </span>
          <span className="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50">
            ● Low Zone
          </span>
        </div>
      </div>
    </div>
  );
}
