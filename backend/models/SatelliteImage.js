const mongoose = require('mongoose');

const satelliteImageSchema = new mongoose.Schema(
  {
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecoveryMission'
    },
    provider: {
      type: String,
      default: 'Copernicus Sentinel-2'
    },
    acquisitionDate: {
      type: Date,
      default: Date.now
    },
    cloudCoverage: {
      type: Number,
      default: 3.5
    },
    boundingBox: {
      type: [Number], // [minLng, minLat, maxLng, maxLat]
      required: true
    },
    rawUrl: {
      type: String,
      default: ''
    },
    processedUrl: {
      type: String,
      default: ''
    },
    tileTemplate: {
      type: String,
      default: ''
    },
    resolutionMeters: {
      type: Number,
      default: 10
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SatelliteImage', satelliteImageSchema);
