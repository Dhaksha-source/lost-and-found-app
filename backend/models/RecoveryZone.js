const mongoose = require('mongoose');

const recoveryZoneSchema = new mongoose.Schema(
  {
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecoveryMission',
      required: true
    },
    zoneId: {
      type: String,
      required: true // e.g. "Z001", "Z002"
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      required: true,
      default: 'MEDIUM'
    },
    score: {
      type: Number, // e.g. 0.87
      required: true,
      min: 0,
      max: 1
    },
    areaName: {
      type: String,
      default: 'Search Zone'
    },
    reason: {
      type: String,
      required: true
    },
    factorBreakdown: [
      {
        type: String
      }
    ],
    polygon: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon',
        required: true
      },
      coordinates: {
        type: [[[Number]]], // array of rings of coordinates [lng, lat]
        required: true
      }
    },
    centroid: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    distanceFromOriginMeters: {
      type: Number,
      default: 0
    },
    recommendedSensor: {
      type: String,
      enum: ['SATELLITE', 'MESO_AERIAL', 'GROUND_AI_VISION'],
      default: 'GROUND_AI_VISION'
    }
  },
  { timestamps: true }
);

recoveryZoneSchema.index({ centroid: '2dsphere' });

module.exports = mongoose.model('RecoveryZone', recoveryZoneSchema);
