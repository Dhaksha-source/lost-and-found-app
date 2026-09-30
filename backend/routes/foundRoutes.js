const express = require('express');
const router = express.Router();
const FoundItem = require('../models/FoundItem');
const { protect } = require('../middleware/authMiddleware');

// POST /api/found - Report Found Item
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      color,
      brand,
      referenceImage,
      latitude,
      longitude,
      addressText,
      foundDateTime,
      storageLocation,
      contactInfo,
      publicNotes
    } = req.body;

    if (!title || !category || !description || !color) {
      return res.status(400).json({ success: false, message: 'Title, category, description, and color are required' });
    }

    const lat = parseFloat(latitude || 11.6648);
    const lng = parseFloat(longitude || 78.1189);

    const foundItem = await FoundItem.create({
      title,
      category,
      description,
      color,
      brand: brand || 'Unbranded / Unknown',
      referenceImage: referenceImage || '',
      foundLocation: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      addressText: addressText || 'Found Location',
      foundDateTime: foundDateTime ? new Date(foundDateTime) : new Date(),
      status: 'reported',
      reportedBy: req.user._id,
      storageLocation: storageLocation || 'Campus Central Security Lost & Found Desk',
      contactInfo: contactInfo || 'Campus Security (+91-98765-43210)',
      publicNotes: publicNotes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Found item reported successfully.',
      data: foundItem
    });
  } catch (error) {
    console.error('[FoundItem Create Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/found - List found items
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

    const items = await FoundItem.find(filter)
      .populate('reportedBy', 'name organization avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('[FoundItem List Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/found/:id - Get single found item
router.get('/:id', async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('reportedBy', 'name email organization phone avatar');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Found item not found' });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
