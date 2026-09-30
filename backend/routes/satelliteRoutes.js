const express = require('express');
const router = express.Router();
const satelliteService = require('../services/satelliteService');
const RecoveryMission = require('../models/RecoveryMission');

// POST /api/satellite/search - Direct Satellite Catalog Search
router.post('/search', async (req, res) => {
  try {
    const { latitude, longitude, radiusMeters, targetDate } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const result = await satelliteService.searchImagery({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radiusMeters: radiusMeters ? parseFloat(radiusMeters) : 500,
      targetDate
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Satellite Search Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Satellite imagery search encountered an error. Using latest calibrated fallback layer.',
      error: error.message
    });
  }
});

// GET /api/satellite/imagery/:missionId - Get imagery for mission
router.get('/imagery/:missionId', async (req, res) => {
  try {
    const mission = await RecoveryMission.findById(req.params.missionId);
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Recovery mission not found' });
    }

    res.json({
      success: true,
      missionCode: mission.missionCode,
      satelliteData: mission.satelliteData,
      boundingBox: mission.boundingBox,
      centerLocation: mission.centerLocation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
