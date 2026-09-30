const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Bag & Backpack', 'Electronics', 'Wallets & Purses', 'IDs & Cards', 'Keys', 'Jewellery', 'Documents', 'Clothing', 'Accessories', 'Other'],
      default: 'Bag & Backpack'
    },
    description: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      default: 'Unbranded / Unknown'
    },
    modelName: {
      type: String,
      default: ''
    },
    referenceImage: {
      type: String,
      default: ''
    },
    lastKnownLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    addressText: {
      type: String,
      required: true,
      default: 'Unknown location'
    },
    lostDateTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    approximateTimeText: {
      type: String,
      default: '14:30'
    },
    searchRadius: {
      type: Number,
      default: 500, // in meters
      min: 50,
      max: 5000
    },
    // PRIVATE OWNERSHIP CLUES - NEVER EXPOSED PUBLICLY
    privateClues: [
      {
        clueType: {
          type: String,
          enum: ['hidden_scratch', 'sticker_location', 'unique_mark', 'internal_arrangement', 'identifier_digits', 'other'],
          default: 'unique_mark'
        },
        detail: {
          type: String,
          required: true
        }
      }
    ],
    status: {
      type: String,
      enum: ['lost', 'mission_active', 'found', 'recovered'],
      default: 'lost'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    activeMissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecoveryMission',
      default: null
    },
    tags: [String]
  },
  { timestamps: true }
);

// MongoDB Geospatial Index for 2dsphere location searches
lostItemSchema.index({ lastKnownLocation: '2dsphere' });

module.exports = mongoose.model('LostItem', lostItemSchema);
