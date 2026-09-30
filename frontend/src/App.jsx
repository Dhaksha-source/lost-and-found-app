import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HackathonDemoBar from './components/HackathonDemoBar';
import LandingPage from './components/LandingPage';
import MissionControlView from './components/MissionControlView';
import MatchesView from './components/MatchesView';
import AIRecoveryCameraView from './components/AIRecoveryCameraView';
import OwnershipVerificationView from './components/OwnershipVerificationView';
import HeatmapAnalyticsView from './components/HeatmapAnalyticsView';
import ReportLostModal from './components/ReportLostModal';
import ReportFoundModal from './components/ReportFoundModal';
import SARAAssistantWidget from './components/SARAAssistantWidget';

function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeMissionCode, setActiveMissionCode] = useState('SR-2026-001');
  const [showReportLost, setShowReportLost] = useState(false);
  const [showReportFound, setShowReportFound] = useState(false);

  // States passed between views
  const [cameraTargetZone, setCameraTargetZone] = useState('Z001');
  const [cameraMissionId, setCameraMissionId] = useState(null);
  const [claimLostItem, setClaimLostItem] = useState(null);
  const [claimFoundItem, setClaimFoundItem] = useState(null);

  const handleLaunchCameraWithZone = (zoneId, missionId) => {
    setCameraTargetZone(zoneId);
    setCameraMissionId(missionId);
    setCurrentView('camera');
  };

  const handleClaimItem = (lostItem, foundItem) => {
    setClaimLostItem(lostItem);
    setClaimFoundItem(foundItem);
    setCurrentView('claims');
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: '#070a12' }}>
      {/* Hackathon Persistent Judge Panel */}
      <HackathonDemoBar
        onSelectMission={(code) => {
          setActiveMissionCode(code);
          setCurrentView('mission');
        }}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenReportLost={() => setShowReportLost(true)}
        onOpenReportFound={() => setShowReportFound(true)}
      />

      {/* View Router */}
      <main className="flex-grow-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={(view) => setCurrentView(view)}
            onOpenReportLost={() => setShowReportLost(true)}
            onStartMission={() => setCurrentView('mission')}
          />
        )}

        {currentView === 'mission' && (
          <MissionControlView
            missionCode={activeMissionCode}
            onNavigate={(view) => setCurrentView(view)}
            onLaunchCameraWithZone={handleLaunchCameraWithZone}
          />
        )}

        {currentView === 'matches' && (
          <MatchesView
            onNavigate={(view) => setCurrentView(view)}
            onClaimItem={handleClaimItem}
          />
        )}

        {currentView === 'camera' && (
          <AIRecoveryCameraView
            targetZoneId={cameraTargetZone}
            missionId={cameraMissionId}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'claims' && (
          <OwnershipVerificationView
            initialLostItem={claimLostItem}
            initialFoundItem={claimFoundItem}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'heatmap' && (
          <HeatmapAnalyticsView />
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 border-top border-secondary border-opacity-25 bg-black bg-opacity-60 text-secondary font-mono" style={{ fontSize: '0.75rem' }}>
        <div className="container-fluid d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="text-light fw-bold">LOSTFOUND<span className="text-info">+</span></span>
            <span className="text-dim">|</span>
            <span>National Hackathon Autonomous Recovery Architecture</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span>Copernicus Sentinel-2 EO Integration</span>
            <span className="text-dim">•</span>
            <span>GeoJSON Probability Zones</span>
            <span className="text-dim">•</span>
            <span>Zero-Knowledge Clues</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportLostModal
        show={showReportLost}
        onClose={() => setShowReportLost(false)}
        onCreated={(createdMission, createdItem) => {
          if (createdMission) {
            setActiveMissionCode(createdMission.missionCode);
            setCurrentView('mission');
          } else {
            setCurrentView('matches');
          }
        }}
      />

      <ReportFoundModal
        show={showReportFound}
        onClose={() => setShowReportFound(false)}
        onCreated={() => {
          setCurrentView('matches');
        }}
      />

      {/* Floating Groq-Powered AI Assistant Widget */}
      <SARAAssistantWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
