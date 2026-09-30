const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const RecoveryMission = require('../models/RecoveryMission');
const PotentialMatch = require('../models/PotentialMatch');
const Claim = require('../models/Claim');
const User = require('../models/User');

// GET /api/admin/dashboard - High-level metrics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      activeMissionsCount,
      potentialMatchesCount,
      recoveredCount,
      pendingClaimsCount,
      highRiskClaimsCount,
      satelliteSearchesCount,
      totalUsersCount,
      totalLostCount
    ] = await Promise.all([
      RecoveryMission.countDocuments({ status: { $in: ['initialized', 'satellite_scanning', 'zones_generated', 'ground_search'] } }),
      PotentialMatch.countDocuments({ overallScore: { $gte: 75 } }),
      LostItem.countDocuments({ status: 'recovered' }),
      Claim.countDocuments({ status: 'pending' }),
      Claim.countDocuments({ riskLevel: 'HIGH RISK', status: 'pending' }),
      RecoveryMission.countDocuments({ 'satelliteData.provider': { $exists: true } }),
      User.countDocuments(),
      LostItem.countDocuments()
    ]);

    // Recent active missions
    const recentMissions = await RecoveryMission.find()
      .populate('lostItemId', 'title category color referenceImage')
      .populate('userId', 'name organization')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent high-risk or pending claims
    const alertClaims = await Claim.find({ status: 'pending' })
      .populate('lostItemId', 'title category color')
      .populate('claimantId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        metrics: {
          activeMissions: activeMissionsCount,
          potentialMatches: potentialMatchesCount,
          recoveredItems: recoveredCount,
          pendingClaims: pendingClaimsCount,
          highRiskClaims: highRiskClaimsCount,
          satelliteSearches: satelliteSearchesCount,
          totalUsers: totalUsersCount,
          totalLostReports: totalLostCount
        },
        recentMissions,
        alertClaims
      }
    });
  } catch (error) {
    console.error('[Admin Dashboard Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/analytics - Heatmap & Deep Analytics
router.get('/analytics', async (req, res) => {
  try {
    // 1. Category Breakdown
    const categoryStats = await LostItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Recovery Rate calculation
    const totalLost = await LostItem.countDocuments();
    const totalRecovered = await LostItem.countDocuments({ status: 'recovered' });
    const recoveryPercentage = totalLost > 0 ? Math.round((totalRecovered / totalLost) * 100) : 0;

    // 3. Location Heatmap Points
    const lostItems = await LostItem.find({}, 'title category status lastKnownLocation addressText');
    const missions = await RecoveryMission.find({}, 'missionCode status centerLocation');
    const foundItems = await FoundItem.find({}, 'title status foundLocation addressText');

    const heatmapPoints = [];

    // Map lost items
    lostItems.forEach(item => {
      if (item.lastKnownLocation?.coordinates) {
        heatmapPoints.push({
          id: `lost-${item._id}`,
          title: item.title,
          category: item.category,
          type: item.status === 'recovered' ? 'recovery' : 'lost_report',
          coordinates: [item.lastKnownLocation.coordinates[1], item.lastKnownLocation.coordinates[0]], // [lat, lng] for leaflet
          weight: item.status === 'recovered' ? 0.9 : 0.6,
          address: item.addressText
        });
      }
    });

    // Map active missions
    missions.forEach(m => {
      if (m.centerLocation?.coordinates) {
        heatmapPoints.push({
          id: `mission-${m._id}`,
          title: `Mission ${m.missionCode}`,
          category: 'SARA Mission',
          type: 'active_mission',
          coordinates: [m.centerLocation.coordinates[1], m.centerLocation.coordinates[0]],
          weight: 1.0,
          address: 'Autonomous Mission Center'
        });
      }
    });

    // Campus Hotspots summary
    const hotspots = [
      { name: 'KIOT Central Cafeteria & Food Court', count: 14, riskCategory: 'High Congestion / Resting Area' },
      { name: 'Mechanical & Civil Engineering Quadrangle', count: 8, riskCategory: 'Classroom & Lab Transit' },
      { name: 'Central Library & Reading Hall', count: 6, riskCategory: 'Quiet Study & Charging Stations' },
      { name: 'Campus Sports Turf & Pavilion', count: 5, riskCategory: 'Recreational Perimeter' }
    ];

    res.json({
      success: true,
      data: {
        recoveryRate: recoveryPercentage,
        averageRecoveryHours: 4.8,
        activeSearchesCount: await RecoveryMission.countDocuments({ status: { $ne: 'completed' } }),
        commonCategories: categoryStats.map(c => ({ category: c._id, count: c.count })),
        hotspots,
        heatmapPoints
      }
    });
  } catch (error) {
    console.error('[Admin Analytics Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
