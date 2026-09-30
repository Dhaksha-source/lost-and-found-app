const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
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
    referenceImage: {
      type: String,
      default: ''
    },
    foundLocation: {
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
    foundDateTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['reported', 'matched', 'claimed', 'handed_over'],
      default: 'reported'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    storageLocation: {
      type: String,
      default: 'Central Security Desk'
    },
    contactInfo: {
      type: String,
      default: 'Campus Lost & Found Desk (+91-98765-43210)'
    },
    publicNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// MongoDB Geospatial Index for 2dsphere searches
foundItemSchema.index({ foundLocation: '2dsphere' });

module.exports = mongoose.model('FoundItem', foundItemSchema);
