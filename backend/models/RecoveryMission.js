const mongoose = require('mongoose');

const recoveryMissionSchema = new mongoose.Schema(
  {
    missionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['initialized', 'satellite_scanning', 'zones_generated', 'ground_search', 'verified', 'completed', 'aborted'],
      default: 'initialized'
    },
    stageStep: {
      type: Number,
      default: 1, // 1 through 7
      min: 1,
      max: 7
    },
    searchMode: {
      type: String,
      enum: ['AUTONOMOUS', 'HYBRID', 'DIRECT'],
      default: 'AUTONOMOUS'
    },
    centerLocation: {
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
    searchRadius: {
      type: Number,
      default: 500 // meters
    },
    boundingBox: {
      type: [Number], // [minLng, minLat, maxLng, maxLat]
      default: []
    },
    satelliteData: {
      isLive: { type: Boolean, default: false },
      provider: { type: String, default: 'Copernicus Sentinel-2' },
      acquisitionDate: { type: Date, default: Date.now },
      imageryTimestamp: { type: String, default: '2026-09-28T10:15:22Z' },
      cloudCoverage: { type: Number, default: 4.2 }, // percentage
      resolutionMeters: { type: Number, default: 10.0 }, // 10m for Sentinel-2
      boundingBox: [Number],
      searchCoordinates: [Number],
      tileUrl: { type: String, default: '' },
      previewImageUrl: { type: String, default: '' },
      dataLimitations: {
        type: String,
        default: 'Optical satellite sensor resolution is 10m/pixel (Macro layer). Narrow area identified for Meso/Micro ground sweep.'
      },
      searchStatus: { type: String, default: 'Imagery retrieved & georeferenced' },
      rawMetadata: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    macroAnalysis: {
      terrainClassification: { type: String, default: 'Urban / Institutional Campus Corridor' },
      pedestrianCorridorsDetected: { type: Number, default: 3 },
      searchAreaSqMeters: { type: Number, default: 785400 },
      corridorDensity: { type: String, default: 'Moderate - High' },
      summary: { type: String, default: 'Primary transit axis detected between cafeteria, faculty block, and sports turf.' }
    },
    mesoAnalysis: {
      candidateSubzones: { type: Number, default: 3 },
      aerialVisibilityIndex: { type: Number, default: 82 }, // percentage
      highPriorityBBox: [Number]
    },
    microDetections: [
      {
        detectionId: { type: String },
        timestamp: { type: Date, default: Date.now },
        capturedImageUrl: { type: String },
        detectedCategory: { type: String },
        visualSimilarity: { type: Number }, // 0 to 100
        detectionConfidence: { type: Number }, // 0 to 100
        distanceFromZoneMeters: { type: Number },
        zoneIdRef: { type: String },
        coordinates: [Number],
        notes: { type: String }
      }
    ],
    verifiedAt: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

recoveryMissionSchema.index({ centerLocation: '2dsphere' });

module.exports = mongoose.model('RecoveryMission', recoveryMissionSchema);
