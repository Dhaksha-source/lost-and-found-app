/**
 * api.js
 * 
 * Central API client for LOSTFOUND+ backend
 */

const API_BASE = '/api';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('lostfound_token');
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Lost Items
  getLostItems: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/lost?${query}`);
    return res.json();
  },

  getLostItem: async (id) => {
    const res = await fetch(`${API_BASE}/lost/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createLostItem: async (data) => {
    const res = await fetch(`${API_BASE}/lost`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Found Items
  getFoundItems: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/found?${query}`);
    return res.json();
  },

  getFoundItem: async (id) => {
    const res = await fetch(`${API_BASE}/found/${id}`);
    return res.json();
  },

  createFoundItem: async (data) => {
    const res = await fetch(`${API_BASE}/found`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // SARA Autonomous Recovery Mission
  startRecoveryMission: async (data) => {
    const res = await fetch(`${API_BASE}/recovery/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getMission: async (id) => {
    const res = await fetch(`${API_BASE}/recovery/${id}`);
    return res.json();
  },

  getMissionZones: async (id) => {
    const res = await fetch(`${API_BASE}/recovery/${id}/zones`);
    return res.json();
  },

  analyzeMission: async (id) => {
    const res = await fetch(`${API_BASE}/recovery/${id}/analyze`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // Satellite Catalog Search
  searchSatellite: async (searchData) => {
    const res = await fetch(`${API_BASE}/satellite/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(searchData)
    });
    return res.json();
  },

  // Multimodal AI Matches
  analyzeMatches: async (lostItemId, foundItemId = null) => {
    const res = await fetch(`${API_BASE}/matches/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ lostItemId, foundItemId })
    });
    return res.json();
  },

  getMatchesForLostItem: async (lostItemId) => {
    const res = await fetch(`${API_BASE}/matches/${lostItemId}`);
    return res.json();
  },

  // AI Recovery Camera / Ground AI Vision
  analyzeCameraFrame: async (frameData) => {
    const res = await fetch(`${API_BASE}/camera/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(frameData)
    });
    return res.json();
  },

  // Ownership Claims & Verification
  submitClaim: async (claimData) => {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(claimData)
    });
    return res.json();
  },

  getClaims: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/claims?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateClaimStatus: async (claimId, status, notes = '') => {
    const res = await fetch(`${API_BASE}/claims/${claimId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, moderatorNotes: notes })
    });
    return res.json();
  },

  // Admin & Analytics
  getAdminDashboard: async () => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getAdminAnalytics: async () => {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Groq Cloud AI Assistant
  askAIChat: async (message, history = []) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history })
    });
    return res.json();
  },

  getAIStatus: async () => {
    const res = await fetch(`${API_BASE}/ai/status`);
    return res.json();
  }
};
