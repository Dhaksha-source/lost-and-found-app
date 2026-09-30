const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const { protect } = require('../middleware/authMiddleware');
const ownershipVerificationService = require('../services/ownershipVerificationService');

// POST /api/lost - Report Lost Item
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      color,
      brand,
      modelName,
      referenceImage,
      latitude,
      longitude,
      addressText,
      lostDateTime,
      approximateTimeText,
      searchRadius,
      privateClues,
      tags
    } = req.body;

    if (!title || !category || !description || !color) {
      return res.status(400).json({ success: false, message: 'Title, category, description, and color are required' });
    }

    const lat = parseFloat(latitude || 11.6643);
    const lng = parseFloat(longitude || 78.1182);

    const lostItem = await LostItem.create({
      title,
      category,
      description,
      color,
      brand: brand || 'Unbranded / Unknown',
      modelName: modelName || '',
      referenceImage: referenceImage || '',
      lastKnownLocation: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      addressText: addressText || 'Reported Location',
      lostDateTime: lostDateTime ? new Date(lostDateTime) : new Date(),
      approximateTimeText: approximateTimeText || '14:30',
      searchRadius: searchRadius ? Number(searchRadius) : 500,
      privateClues: Array.isArray(privateClues) ? privateClues : [],
      status: 'lost',
      createdBy: req.user._id,
      tags: Array.isArray(tags) ? tags : []
    });

    res.status(201).json({
      success: true,
      message: 'Lost item reported successfully. AI matching and SARA recovery ready.',
      data: lostItem
    });
  } catch (error) {
    console.error('[LostItem Create Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/lost - List lost items
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { addressText: { $regex: search, $options: 'i' } }
      ];
    }

    // Never expose privateClues in public listings
    const items = await LostItem.find(filter)
      .select('-privateClues')
      .populate('createdBy', 'name organization avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('[LostItem List Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/lost/:id - Get single lost item
router.get('/:id', async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id)
      .populate('createdBy', 'name email organization phone avatar')
      .populate('activeMissionId');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    // Generate safe verification questions based on private clues
    const verificationQuestions = ownershipVerificationService.generateQuestionsFromClues(item.privateClues);

    // Clone item object and sanitize privateClues unless authorized
    const itemObj = item.toObject();
    const isOwner = req.user && req.user._id.toString() === item.createdBy._id.toString();
    const isStaff = req.user && (req.user.role === 'moderator' || req.user.role === 'admin');

    if (!isOwner && !isStaff) {
      delete itemObj.privateClues;
    }

    res.json({
      success: true,
      data: itemObj,
      verificationQuestions
    });
  } catch (error) {
    console.error('[LostItem Get Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/lost/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    // Check ownership or staff privileges
    if (item.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    const updated = await LostItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/lost/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Lost item not found' });
    }

    if (item.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Lost item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
