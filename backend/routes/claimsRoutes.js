const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const RecoveryMission = require('../models/RecoveryMission');
const ownershipVerificationService = require('../services/ownershipVerificationService');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/claims - Submit an Ownership Claim with Verification Answers
router.post('/', protect, async (req, res) => {
  try {
    const { lostItemId, foundItemId, missionId, claimReason, answers } = req.body;

    if (!lostItemId) {
      return res.status(400).json({ success: false, message: 'lostItemId is required to submit a claim' });
    }

    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem) {
      return res.status(404).json({ success: false, message: 'Target lost item not found' });
    }

    // Evaluate answers against private ownership clues & calculate security risk
    const evaluation = await ownershipVerificationService.evaluateAnswersAndRisk({
      lostItem,
      claimantId: req.user._id,
      answers: Array.isArray(answers) ? answers : []
    });

    const claim = await Claim.create({
      lostItemId,
      foundItemId: foundItemId || null,
      missionId: missionId || null,
      claimantId: req.user._id,
      claimReason: claimReason || 'Autonomous match / Direct ownership assertion',
      answers: evaluation.evaluatedAnswers,
      verificationScore: evaluation.verificationScore,
      riskLevel: evaluation.riskLevel,
      riskFactors: evaluation.riskFactors,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Claim filed and evaluated through Claim Security Engine. Queued for human moderator verification.',
      data: claim
    });
  } catch (error) {
    console.error('[Claim Create Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/claims/:id/verify - Re-run or test verification scoring
router.post('/:id/verify', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('lostItemId');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const evaluation = await ownershipVerificationService.evaluateAnswersAndRisk({
      lostItem: claim.lostItemId,
      claimantId: claim.claimantId,
      answers: req.body.answers || claim.answers
    });

    claim.verificationScore = evaluation.verificationScore;
    claim.riskLevel = evaluation.riskLevel;
    claim.riskFactors = evaluation.riskFactors;
    claim.answers = evaluation.evaluatedAnswers;
    await claim.save();

    res.json({
      success: true,
      message: 'Claim verification and risk assessment refreshed.',
      data: claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/claims - List claims (for users to see their claims, or moderators to review all)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    // If regular user, only view own claims
    if (req.user.role === 'user') {
      filter.claimantId = req.user._id;
    }

    const { status, riskLevel } = req.query;
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;

    const claims = await Claim.find(filter)
      .populate('lostItemId', 'title category color referenceImage addressText status')
      .populate('foundItemId', 'title category color referenceImage storageLocation')
      .populate('claimantId', 'name email organization phone')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error('[Claims List Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/claims/:id/status - Moderator or Admin reviews and approves/rejects claim
router.put('/:id/status', protect, authorize('moderator', 'admin'), async (req, res) => {
  try {
    const { status, moderatorNotes } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved, rejected, or pending.' });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('lostItemId')
      .populate('foundItemId');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = status;
    claim.moderatorNotes = moderatorNotes || claim.moderatorNotes;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    // If approved, update status of linked lost item and found item
    if (status === 'approved') {
      if (claim.lostItemId) {
        await LostItem.findByIdAndUpdate(claim.lostItemId._id, { status: 'recovered' });
      }
      if (claim.foundItemId) {
        await FoundItem.findByIdAndUpdate(claim.foundItemId._id, { status: 'handed_over' });
      }
      if (claim.missionId) {
        await RecoveryMission.findByIdAndUpdate(claim.missionId, {
          status: 'completed',
          completedAt: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: `Claim status updated to ${status}. Item recovery lifecycle updated.`,
      data: claim
    });
  } catch (error) {
    console.error('[Claim Status Update Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
