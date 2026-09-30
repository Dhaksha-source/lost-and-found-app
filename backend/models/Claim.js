const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: true
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem'
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecoveryMission'
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    claimReason: {
      type: String,
      default: 'Direct item ownership claim'
    },
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        clueType: { type: String, default: 'unique_mark' },
        matchScore: { type: Number, default: 90 }
      }
    ],
    verificationScore: {
      type: Number,
      required: true,
      default: 0 // 0 to 100
    },
    riskLevel: {
      type: String,
      enum: ['LOW RISK', 'REVIEW REQUIRED', 'HIGH RISK'],
      default: 'LOW RISK'
    },
    riskFactors: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    moderatorNotes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
