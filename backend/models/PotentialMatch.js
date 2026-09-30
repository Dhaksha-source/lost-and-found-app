const mongoose = require('mongoose');

const potentialMatchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: true
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true
    },
    overallScore: {
      type: Number, // 0 - 100
      required: true
    },
    breakdown: {
      visualSimilarity: {
        type: Number,
        required: true,
        default: 85
      },
      descriptionSimilarity: {
        type: Number,
        required: true,
        default: 88
      },
      locationProximity: {
        type: Number,
        required: true,
        default: 92
      },
      timeProximity: {
        type: Number,
        required: true,
        default: 80
      }
    },
    spatialDistanceMeters: {
      type: Number,
      default: 0
    },
    timeDifferenceHours: {
      type: Number,
      default: 0
    },
    explanation: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending_review', 'verified', 'dismissed'],
      default: 'pending_review'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PotentialMatch', potentialMatchSchema);
