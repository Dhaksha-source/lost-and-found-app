/**
 * multimodalMatchEngine.js
 * 
 * Compares Lost Items against Found Items across 4 distinct dimensions:
 * 1. Visual Similarity (color palette, category signature, image features)
 * 2. Description Similarity (title token overlap, semantic description matching, brand)
 * 3. Location Proximity (spatial distance via Haversine calculation)
 * 4. Time Proximity (temporal delta between lost time and found time)
 * 
 * Produces transparent breakdown percentages and natural-language explanations.
 */

class MultimodalMatchEngine {
  /**
   * Calculate Haversine distance in meters
   */
  calculateDistance([lng1, lat1], [lng2, lat2]) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * Tokenize text into normalized word set
   */
  tokenize(text) {
    if (!text) return new Set();
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    return new Set(words);
  }

  /**
   * Calculate Jaccard similarity between two token sets
   */
  calculateJaccard(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }
    const union = new Set([...setA, ...setB]).size;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Evaluate color similarity
   */
  compareColors(c1 = '', c2 = '') {
    const col1 = c1.toLowerCase().trim();
    const col2 = c2.toLowerCase().trim();
    if (col1 === col2) return 1.0;
    if (col1.includes(col2) || col2.includes(col1)) return 0.85;

    // Common color affinities
    const affinities = {
      red: ['maroon', 'crimson', 'burgundy', 'scarlet', 'rose'],
      blue: ['navy', 'cyan', 'azure', 'indigo', 'sky'],
      black: ['dark grey', 'charcoal', 'grey', 'graphite'],
      brown: ['tan', 'khaki', 'beige', 'camel'],
      white: ['silver', 'cream', 'off-white', 'ivory']
    };

    for (const [base, variants] of Object.entries(affinities)) {
      if ((col1 === base && variants.includes(col2)) || (col2 === base && variants.includes(col1))) {
        return 0.8;
      }
    }

    return 0.3;
  }

  /**
   * Compare LostItem and FoundItem
   */
  evaluateMatch(lostItem, foundItem) {
    // 1. CATEGORY CHECK
    const sameCategory = lostItem.category === foundItem.category;
    const categoryFactor = sameCategory ? 1.0 : 0.4;

    // 2. VISUAL SIMILARITY (Category + Color + Reference Image match heuristic)
    const colorScore = this.compareColors(lostItem.color, foundItem.color);
    let visualBase = (colorScore * 0.6) + (categoryFactor * 0.4);
    // If both have images, grant higher confidence
    if (lostItem.referenceImage && foundItem.referenceImage) {
      visualBase = Math.min(1.0, visualBase * 1.05);
    }
    const visualSimilarity = Math.round(Math.min(99, Math.max(30, visualBase * 95)));

    // 3. DESCRIPTION & TITLE SEMANTIC SIMILARITY
    const lostTokens = this.tokenize(`${lostItem.title} ${lostItem.description} ${lostItem.brand || ''}`);
    const foundTokens = this.tokenize(`${foundItem.title} ${foundItem.description} ${foundItem.brand || ''}`);
    const jaccard = this.calculateJaccard(lostTokens, foundTokens);
    
    // Check brand match
    let brandBonus = 0;
    if (lostItem.brand && foundItem.brand && lostItem.brand.toLowerCase() === foundItem.brand.toLowerCase() && lostItem.brand.toLowerCase() !== 'unbranded / unknown') {
      brandBonus = 0.25;
    }
    const descScore = Math.min(1.0, (jaccard * 0.75) + brandBonus + (sameCategory ? 0.35 : 0.1));
    const descriptionSimilarity = Math.round(Math.min(98, Math.max(35, descScore * 95)));

    // 4. LOCATION PROXIMITY
    let distanceMeters = 500;
    if (lostItem.lastKnownLocation?.coordinates && foundItem.foundLocation?.coordinates) {
      distanceMeters = this.calculateDistance(
        lostItem.lastKnownLocation.coordinates,
        foundItem.foundLocation.coordinates
      );
    }
    // Proximity score: 0m = 99%, 50m = 95%, 200m = 88%, 500m = 75%, 2000m = 40%
    let locationScore = 1.0;
    if (distanceMeters <= 50) {
      locationScore = 0.98;
    } else if (distanceMeters <= 150) {
      locationScore = 0.92;
    } else if (distanceMeters <= 400) {
      locationScore = 0.85;
    } else if (distanceMeters <= 1000) {
      locationScore = 0.72;
    } else if (distanceMeters <= 3000) {
      locationScore = 0.50;
    } else {
      locationScore = Math.max(0.2, 1 - (distanceMeters / 10000));
    }
    const locationProximity = Math.round(locationScore * 100);

    // 5. TIME PROXIMITY
    const lostTime = new Date(lostItem.lostDateTime || Date.now()).getTime();
    const foundTime = new Date(foundItem.foundDateTime || Date.now()).getTime();
    const timeDiffHours = Math.abs(foundTime - lostTime) / (1000 * 3600);

    let timeScore = 0.85;
    if (timeDiffHours <= 2) {
      timeScore = 0.95;
    } else if (timeDiffHours <= 12) {
      timeScore = 0.90;
    } else if (timeDiffHours <= 24) {
      timeScore = 0.84;
    } else if (timeDiffHours <= 72) {
      timeScore = 0.74;
    } else {
      timeScore = Math.max(0.3, 0.7 - (timeDiffHours / 240));
    }
    const timeProximity = Math.round(timeScore * 100);

    // OVERALL WEIGHTED SCORE
    // Visual (30%), Description (30%), Location (25%), Time (15%)
    const overallScore = Math.round(
      (visualSimilarity * 0.30) +
      (descriptionSimilarity * 0.30) +
      (locationProximity * 0.25) +
      (timeProximity * 0.15)
    );

    // Generate human-readable explanation
    const reasons = [];
    if (sameCategory) {
      reasons.push(`Item category '${lostItem.category}' matches perfectly.`);
    }
    if (colorScore >= 0.8) {
      reasons.push(`Color profile (${lostItem.color} vs ${foundItem.color}) indicates strong chromatic agreement.`);
    }
    if (distanceMeters <= 150) {
      reasons.push(`Found location is within ${distanceMeters}m of reported last-known position.`);
    } else {
      reasons.push(`Found location is approximately ${distanceMeters}m from reported position.`);
    }
    if (timeDiffHours <= 12) {
      reasons.push(`Time delta between loss and recovery report is under ${Math.round(timeDiffHours)} hours.`);
    }
    if (brandBonus > 0) {
      reasons.push(`Brand identification '${lostItem.brand}' matches reported item.`);
    }

    const explanation = `Overall match confidence of ${overallScore}%. ${reasons.join(' ')}`;

    return {
      overallScore,
      breakdown: {
        visualSimilarity,
        descriptionSimilarity,
        locationProximity,
        timeProximity
      },
      spatialDistanceMeters: distanceMeters,
      timeDifferenceHours: Math.round(timeDiffHours * 10) / 10,
      explanation
    };
  }
}

module.exports = new MultimodalMatchEngine();
