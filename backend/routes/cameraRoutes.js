const express = require('express');
const router = express.Router();
const aiRecoveryVisionService = require('../services/aiRecoveryVisionService');
const LostItem = require('../models/LostItem');
const RecoveryMission = require('../models/RecoveryMission');

// POST /api/camera/analyze - Level 3 Micro Ground AI Camera Vision Analysis
router.post('/analyze', async (req, res) => {
  try {
    const { imageBase64, targetItemId, missionId, zoneId, currentCoordinates } = req.body;

    let targetItem = null;
    if (targetItemId) {
      targetItem = await LostItem.findById(targetItemId);
    }

    let mission = null;
    let zoneCentroid = currentCoordinates || [78.1185, 11.6645];
    if (missionId) {
      mission = await RecoveryMission.findById(missionId);
      if (mission && mission.centerLocation?.coordinates) {
        zoneCentroid = mission.centerLocation.coordinates;
      }
    }

    const analysis = await aiRecoveryVisionService.analyzeFrame({
      imageBase64,
      targetItem,
      zoneCentroid,
      zoneId: zoneId || 'Z001'
    });

    // If mission exists, record this micro detection
    if (mission && analysis.detectionResult) {
      mission.microDetections.push({
        detectionId: `DET-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(),
        capturedImageUrl: imageBase64 ? imageBase64.slice(0, 100) + '...' : '',
        detectedCategory: analysis.detectionResult.object,
        visualSimilarity: analysis.detectionResult.visualSimilarity,
        detectionConfidence: analysis.detectionResult.detectionConfidence,
        distanceFromZoneMeters: analysis.detectionResult.distanceFromRecoveryZoneMeters,
        zoneIdRef: zoneId || 'Z001',
        coordinates: zoneCentroid,
        notes: analysis.detectionResult.notes
      });
      mission.status = 'ground_search';
      mission.stageStep = 7;
      await mission.save();
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('[Camera Analyze Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
