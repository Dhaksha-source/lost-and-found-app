const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const PotentialMatch = require('../models/PotentialMatch');
const multimodalMatchEngine = require('../services/multimodalMatchEngine');
const groqService = require('../services/groqService');

// POST /api/matches/analyze - Run multimodal AI matching engine
router.post('/analyze', async (req, res) => {
  try {
    const { lostItemId, foundItemId } = req.body;

    if (!lostItemId) {
      return res.status(400).json({ success: false, message: 'lostItemId is required for match analysis' });
    }

    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    let foundItems = [];
    if (foundItemId) {
      const single = await FoundItem.findById(foundItemId);
      if (single) foundItems.push(single);
    } else {
      // Find all reported/matched found items
      foundItems = await FoundItem.find({ status: { $ne: 'handed_over' } });
    }

    const results = [];

    for (const fItem of foundItems) {
      const matchResult = multimodalMatchEngine.evaluateMatch(lostItem, fItem);

      // Generate live Groq AI explanation using user API key
      let liveExplanation = matchResult.explanation;
      try {
        const groqSummary = await groqService.generateMatchExplanation({
          lostItem,
          foundItem: fItem,
          matchScore: matchResult.overallScore,
          breakdown: matchResult.breakdown,
          spatialDistanceMeters: matchResult.spatialDistanceMeters,
          timeDifferenceHours: matchResult.timeDifferenceHours
        });
        if (groqSummary) {
          liveExplanation = groqSummary;
        }
      } catch (err) {
        console.warn('[Matches Groq AI fallback]:', err.message);
      }

      // Save or update PotentialMatch record
      let potentialMatch = await PotentialMatch.findOne({
        lostItemId: lostItem._id,
        foundItemId: fItem._id
      });

      if (potentialMatch) {
        potentialMatch.overallScore = matchResult.overallScore;
        potentialMatch.breakdown = matchResult.breakdown;
        potentialMatch.spatialDistanceMeters = matchResult.spatialDistanceMeters;
        potentialMatch.timeDifferenceHours = matchResult.timeDifferenceHours;
        potentialMatch.explanation = liveExplanation;
        await potentialMatch.save();
      } else {
        potentialMatch = await PotentialMatch.create({
          lostItemId: lostItem._id,
          foundItemId: fItem._id,
          overallScore: matchResult.overallScore,
          breakdown: matchResult.breakdown,
          spatialDistanceMeters: matchResult.spatialDistanceMeters,
          timeDifferenceHours: matchResult.timeDifferenceHours,
          explanation: liveExplanation,
          status: 'pending_review'
        });
      }

      results.push({
        matchId: potentialMatch._id,
        foundItem: fItem,
        overallScore: matchResult.overallScore,
        breakdown: matchResult.breakdown,
        spatialDistanceMeters: matchResult.spatialDistanceMeters,
        timeDifferenceHours: matchResult.timeDifferenceHours,
        explanation: liveExplanation
      });
    }

    // Sort by overall score descending
    results.sort((a, b) => b.overallScore - a.overallScore);

    res.json({
      success: true,
      lostItem,
      analyzedCandidatesCount: foundItems.length,
      matches: results
    });
  } catch (error) {
    console.error('[Match Analyze Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/matches/:lostItemId - Get potential matches for a lost item
router.get('/:lostItemId', async (req, res) => {
  try {
    const matches = await PotentialMatch.find({ lostItemId: req.params.lostItemId })
      .populate('foundItemId')
      .populate('lostItemId')
      .sort({ overallScore: -1 });

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
