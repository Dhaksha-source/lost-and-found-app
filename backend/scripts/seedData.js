const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const RecoveryMission = require('../models/RecoveryMission');
const RecoveryZone = require('../models/RecoveryZone');
const PotentialMatch = require('../models/PotentialMatch');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const recoveryZoneEngine = require('../services/recoveryZoneEngine');
const satelliteService = require('../services/satelliteService');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostfound_plus');
    console.log('[Seed] Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      LostItem.deleteMany({}),
      FoundItem.deleteMany({}),
      RecoveryMission.deleteMany({}),
      RecoveryZone.deleteMany({}),
      PotentialMatch.deleteMany({}),
      Claim.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('[Seed] Collections cleared. Creating users...');

    // 1. Users (Passwords will be hashed by pre-save hook)
    const user1 = await User.create({
      name: 'Dhaksha Kumar',
      email: 'user@lostfound.org',
      password: 'Password123!',
      role: 'user',
      organization: 'KIOT Student Body',
      phone: '+91 98401 23456'
    });

    const moderatorUser = await User.create({
      name: 'Officer Raghavan',
      email: 'moderator@lostfound.org',
      password: 'Password123!',
      role: 'moderator',
      organization: 'Campus Safety & Asset Control Desk',
      phone: '+91 98401 77777'
    });

    const adminUser = await User.create({
      name: 'Director Priya Raman',
      email: 'admin@lostfound.org',
      password: 'Password123!',
      role: 'admin',
      organization: 'Autonomous Recovery Operations',
      phone: '+91 98401 99999'
    });

    console.log('[Seed] Users seeded successfully.');

    // Campus Coordinates (KIOT Campus, Salem / Tamil Nadu: 11.6643 N, 78.1182 E)
    const campusCenter = [78.1182, 11.6643]; // [lng, lat]

    // 2. Lost Items
    console.log('[Seed] Seeding Lost Items...');
    const redBackpack = await LostItem.create({
      title: 'Red Backpack',
      category: 'Bag & Backpack',
      description: 'Bright red Wildcraft backpack with two side mesh pockets, padded shoulder straps, and a reflective front zipper stripe. Left behind between Cafeteria and Mechanical Lab.',
      color: 'Red',
      brand: 'Wildcraft',
      modelName: 'Trailblazer 30L',
      referenceImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      lastKnownLocation: {
        type: 'Point',
        coordinates: campusCenter
      },
      addressText: 'KIOT Campus — Cafeteria Courtyard & Mechanical Quadrangle',
      lostDateTime: new Date(Date.now() - 3 * 3600 * 1000), // 3 hours ago
      approximateTimeText: '14:30',
      searchRadius: 500,
      privateClues: [
        {
          clueType: 'unique_mark',
          detail: 'Metallic carabiner keychain engraved with initials "DK" clipped to inner laptop sleeve zipper'
        },
        {
          clueType: 'hidden_scratch',
          detail: 'Small diagonal 2cm abrasion on the bottom right ballistic nylon panel'
        },
        {
          clueType: 'internal_arrangement',
          detail: 'Contains a blue stainless steel water bottle, a 10,000mAh black power bank, and a spiral-bound thermodynamics notebook'
        }
      ],
      status: 'mission_active',
      createdBy: user1._id,
      tags: ['backpack', 'wildcraft', 'red', 'campus', 'laptop-bag']
    });

    const blackWallet = await LostItem.create({
      title: 'Black Leather Bifold Wallet',
      category: 'Wallets & Purses',
      description: 'Matte black genuine leather wallet with RFID blocking layer. Dropped near the library turnstile.',
      color: 'Black',
      brand: 'Fossil',
      referenceImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      lastKnownLocation: {
        type: 'Point',
        coordinates: [78.1192, 11.6651]
      },
      addressText: 'Central Library Egress Corridor',
      lostDateTime: new Date(Date.now() - 6 * 3600 * 1000),
      approximateTimeText: '10:15',
      searchRadius: 250,
      privateClues: [
        {
          clueType: 'identifier_digits',
          detail: 'College ID card inside photo slot ending in digits 4022'
        },
        {
          clueType: 'internal_arrangement',
          detail: 'Folded bus pass voucher tucked behind the right credit card slot'
        }
      ],
      status: 'lost',
      createdBy: user1._id
    });

    // 3. Found Items
    console.log('[Seed] Seeding Found Items...');
    const foundBackpack = await FoundItem.create({
      title: 'Red Wildcraft Backpack with Silver Trim',
      category: 'Bag & Backpack',
      description: 'Found unattended resting on an outdoor stone bench near the cafeteria garden walkway. Intact zippers, high-visibility red color.',
      color: 'Red',
      brand: 'Wildcraft',
      referenceImage: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=600&q=80',
      foundLocation: {
        type: 'Point',
        coordinates: [78.1186, 11.6646] // ~55 meters from lost point!
      },
      addressText: 'Outdoor Seating Stone Bench, North Cafeteria Courtyard',
      foundDateTime: new Date(Date.now() - 2 * 3600 * 1000),
      status: 'reported',
      reportedBy: moderatorUser._id,
      storageLocation: 'Campus Security Station #2 (Locker Alpha-3)',
      contactInfo: 'Desk Officer (+91-98401-77777)',
      publicNotes: 'Secured by campus perimeter patrol officer at 15:45. Handed to security locker.'
    });

    const foundWallet = await FoundItem.create({
      title: 'Black Leather Men’s Wallet',
      category: 'Wallets & Purses',
      description: 'Picked up from library reception desk turnstile by student volunteer.',
      color: 'Black',
      brand: 'Fossil',
      referenceImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      foundLocation: {
        type: 'Point',
        coordinates: [78.1190, 11.6650]
      },
      addressText: 'Central Library Ground Floor Helpdesk',
      foundDateTime: new Date(Date.now() - 5 * 3600 * 1000),
      status: 'reported',
      reportedBy: user1._id,
      storageLocation: 'Library Custodian Vault',
      contactInfo: 'Library Desk (+91-98401-22222)'
    });

    // 4. SARA Autonomous Mission for Red Backpack
    console.log('[Seed] Initializing SARA Autonomous Recovery Mission...');
    const satelliteResult = await satelliteService.searchImagery({
      latitude: campusCenter[1],
      longitude: campusCenter[0],
      radiusMeters: 500
    });

    const mission = await RecoveryMission.create({
      missionCode: 'SR-2026-001',
      lostItemId: redBackpack._id,
      userId: user1._id,
      status: 'ground_search',
      stageStep: 7, // All 7 stages unlocked
      searchMode: 'AUTONOMOUS',
      centerLocation: {
        type: 'Point',
        coordinates: campusCenter
      },
      searchRadius: 500,
      boundingBox: satelliteResult.boundingBox,
      satelliteData: {
        ...satelliteResult,
        isLive: true,
        provider: 'Copernicus Sentinel-2 MSI (CDSE / Level-2A)',
        acquisitionDate: new Date('2026-09-28T10:15:22Z'),
        imageryTimestamp: '2026-09-28T10:15:22Z',
        cloudCoverage: 3.4,
        resolutionMeters: 10.0,
        searchStatus: 'Copernicus Sentinel-2 MSI imagery georeferenced and orthorectified',
        statusLabel: 'LIVE SATELLITE DATA'
      },
      macroAnalysis: {
        terrainClassification: 'Institutional Campus Corridors & Paved Arteries',
        pedestrianCorridorsDetected: 4,
        searchAreaSqMeters: 785400,
        corridorDensity: 'High Congestion Zone',
        summary: 'Macro satellite sweep completed. 500m buffer decomposed into 3 probability polygons aligned with pedestrian transit vectors.'
      },
      mesoAnalysis: {
        candidateSubzones: 3,
        aerialVisibilityIndex: 88,
        highPriorityBBox: satelliteResult.boundingBox
      },
      microDetections: [
        {
          detectionId: 'DET-982104',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          capturedImageUrl: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=600&q=80',
          detectedCategory: 'Red Backpack',
          visualSimilarity: 89,
          detectionConfidence: 94,
          distanceFromZoneMeters: 18,
          zoneIdRef: 'Z001',
          coordinates: [78.1186, 11.6646],
          notes: 'Candidate object identified on stone bench. Chromatic match 91%, strap contours consistent with Wildcraft Trailblazer.'
        }
      ]
    });

    // Link mission to red backpack
    redBackpack.activeMissionId = mission._id;
    await redBackpack.save();

    // 5. Recovery Zones
    console.log('[Seed] Generating Recovery Zones...');
    const zonesData = recoveryZoneEngine.generateRecoveryZones({
      centerCoordinates: campusCenter,
      searchRadius: 500,
      category: 'Bag & Backpack',
      lostDateTime: redBackpack.lostDateTime,
      historicalReportsCount: 4
    });

    for (const z of zonesData) {
      await RecoveryZone.create({
        missionId: mission._id,
        zoneId: z.zoneId,
        priority: z.priority,
        score: z.score,
        areaName: z.areaName,
        reason: z.reason,
        factorBreakdown: z.factorBreakdown,
        polygon: z.polygon,
        centroid: z.centroid,
        distanceFromOriginMeters: z.distanceFromOriginMeters,
        recommendedSensor: z.recommendedSensor
      });
    }

    // 6. Multimodal Match Record
    console.log('[Seed] Generating Multimodal Match Engine record...');
    await PotentialMatch.create({
      lostItemId: redBackpack._id,
      foundItemId: foundBackpack._id,
      overallScore: 91,
      breakdown: {
        visualSimilarity: 89,
        descriptionSimilarity: 93,
        locationProximity: 95,
        timeProximity: 88
      },
      spatialDistanceMeters: 55,
      timeDifferenceHours: 1.0,
      explanation: 'High confidence match (91%). Category (Bag & Backpack) and primary color (Red) match exactly. Spatial proximity is within 55 meters of reported cafeteria coordinates, and timestamp delta is under 1 hour.',
      status: 'pending_review'
    });

    // 7. Seed Claim with Ownership Verification
    console.log('[Seed] Seeding sample claim with verification answers...');
    await Claim.create({
      lostItemId: redBackpack._id,
      foundItemId: foundBackpack._id,
      missionId: mission._id,
      claimantId: user1._id,
      claimReason: 'Autonomous SARA match triggered. Owner verifying private clues.',
      answers: [
        {
          question: 'What unique mark or distinguishing mark is present on the item?',
          answer: 'Metallic carabiner keychain engraved with initials "DK" clipped to inner laptop sleeve zipper',
          clueType: 'unique_mark',
          matchScore: 96
        },
        {
          question: 'Describe any hidden scratch, tear, or mark on the item and its location.',
          answer: 'There is a small 2cm scratch on the bottom right nylon panel from scraping a desk',
          clueType: 'hidden_scratch',
          matchScore: 92
        },
        {
          question: 'What specific personal items were inside the main compartment?',
          answer: 'Blue water bottle, 10,000mAh black power bank, and spiral thermodynamics notebook',
          clueType: 'internal_arrangement',
          matchScore: 95
        }
      ],
      verificationScore: 94,
      riskLevel: 'LOW RISK',
      riskFactors: [
        'Single verified claimant with exact matching private clue parameters',
        'Physical distance to discovery zone is within 55 meters',
        'Zero duplicate claim anomalies detected in past 24 hours'
      ],
      status: 'pending',
      moderatorNotes: 'Awaiting final handover authorization by campus security officer.'
    });

    // 8. Notifications
    await Notification.create({
      userId: user1._id,
      title: 'SARA Mission SR-2026-001 Progress',
      message: 'Macro satellite boundary calibrated and 3 AI Recovery Zones generated. Ground camera detection recorded in Zone Z001.',
      type: 'mission_update',
      link: `/mission/${mission._id}`,
      read: false
    });

    await Notification.create({
      userId: moderatorUser._id,
      title: 'New Ownership Claim Pending Review',
      message: 'Claim filed for Red Wildcraft Backpack with 94% verification score and LOW RISK rating. Ready for inspection.',
      type: 'claim_alert',
      link: '/claims',
      read: false
    });

    console.log('====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Sample Credentials:');
    console.log('  User:      user@lostfound.org / Password123!');
    console.log('  Moderator: moderator@lostfound.org / Password123!');
    console.log('  Admin:     admin@lostfound.org / Password123!');
    console.log(`  Demo Mission: ${mission.missionCode} (Red Backpack at KIOT Campus)`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
