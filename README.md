# LOSTFOUND+
### AI-Powered Autonomous Lost Item Recovery & Verification Platform
*National-Level Hackathon Prototype*

---

## 🎯 Central Innovation

> *"LostFound+ does not simply wait for someone to report a found item. It creates an AI-assisted recovery mission that uses real satellite/geospatial Earth observation data to narrow the search area and then progressively moves toward high-resolution and ground-level object detection."*

---

## 🏗️ Architecture & Primary Technology Stack

* **Frontend**: React.js (JavaScript), Bootstrap 5, Leaflet.js
* **Backend**: Node.js, Express.js REST API
* **Database**: MongoDB & Mongoose with GeoJSON `2dsphere` spatial indexing
* **Earth Observation**: Copernicus Data Space Ecosystem / Sentinel Hub APIs
* **Computer Vision & AI**: Multi-factor Multimodal Match Engine, Ground AI Camera Feature Analyzer, and Claim Security Engine

```
React.js Frontend (Vite)
       ↓  (REST API / JWT)
Express.js Backend (Port 5005)
       ↓
Mongoose ODM & MongoDB (Port 27017)
       ↓
Services:
 ├── satelliteService.js (Copernicus CDSE Sentinel-2 MSI)
 ├── recoveryZoneEngine.js (Spatial GeoJSON Probability Polygons)
 ├── multimodalMatchEngine.js (4-Dimension Similarity Matcher)
 ├── aiRecoveryVisionService.js (Level 3 Micro Ground Vision)
 └── ownershipVerificationService.js (Zero-Knowledge Clues & Claim Risk)
```

---

## 🔄 Dual Recovery Pathways

### PATH A — Community-Aided Recovery
- Compares lost item profiles against existing reported found items.
- Evaluates across 4 distinct dimensions:
  1. **Visual Similarity** (Color spectrum, category geometry, reference image)
  2. **Description & Semantic Similarity** (Token matching, brand alignment)
  3. **Location Proximity** (Haversine distance calculation)
  4. **Time Proximity** (Temporal decay delta)
- Produces a transparent score breakdown and natural language explanation.

### PATH B — SARA (Satellite-Assisted Recovery & Analysis)
- Autonomous search mission triggered when no existing found items match.
- Progresses through 7 verified stages:
  1. `Location identified ✓`
  2. `Search boundary generated ✓`
  3. `Satellite imagery requested ✓`
  4. `Satellite imagery received ✓`
  5. `Geographic analysis ✓`
  6. `Recovery zones generated ✓`
  7. `Ground search preparation ✓`

---

## 🛰️ Multi-Resolution Search Architecture

LostFound+ adheres strictly to sensor physics and **never falsely claims** that orbital satellites can detect tiny objects like keys or wallets:

```
LEVEL 1 — MACRO (🛰️ Copernicus Sentinel-2 MSI)
Scale: 500 m → 100 m | Resolution: 10.0 m / pixel
Purpose: Narrow search perimeter, map terrain, extract pedestrian transit corridors.
    ↓
LEVEL 2 — MESO (📷 High-Resolution Aerial / Drone Recon)
Scale: 100 m → 20 m | Resolution: 15 cm / pixel
Purpose: Screen obstacle line-of-sight, seating benches, and candidate polygons.
    ↓
LEVEL 3 — MICRO (📱 Ground-Level AI Camera Vision)
Scale: 20 m → Target Object | Resolution: Sub-millimeter
Purpose: Colorimetry spectra matching, bounding-box detection, and distance offset.
```

---

## 🔒 Ownership Verification & Claim Security

1. **Private Ownership Clues**: During reporting, owners register confidential clues (hidden scratches, specific stickers, internal bag contents, last 4 digits of serial/ID). These details are **never displayed publicly**.
2. **Dynamic Verification Quiz**: When a prospective claimant appears, targeted questions are generated without revealing the answers.
3. **Claim Security Risk Engine**:
   - Analyzes claimant responses and flags duplicate claims, contradictory answers, and multiple claimants.
   - Categorizes claims into:
     - `LOW RISK` (Verification score ≥ 85%, consistent answers)
     - `REVIEW REQUIRED` (Minor ambiguities or multiple claimants)
     - `HIGH RISK` (Low score or suspicious repeated claims)
4. **Human-in-the-Loop Handover**: Final handover requires physical authorization by an authenticated campus safety moderator or admin.

---

## ⚡ Hackathon Quickstart & Benchmark Evaluation

### Pre-Seeded Benchmark Scenario
- **Target Item**: Red Backpack (`Wildcraft Trailblazer 30L`)
- **Location**: KIOT Campus (11.6643° N, 78.1182° E)
- **Mission Code**: `#SR-2026-001`
- **Matched Found Item**: Red Wildcraft Backpack on Stone Bench (55m from lost point, 91% match)
- **Evaluated Claim**: 94% Verified Score, `LOW RISK` rating

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| **User (Student)** | `user@lostfound.org` | `Password123!` |
| **Moderator (Safety Desk)** | `moderator@lostfound.org` | `Password123!` |
| **Admin (Operations)** | `admin@lostfound.org` | `Password123!` |

*(Judges can also use the persistent **Hackathon Judge Panel** at the top of the interface for 1-click role switching and scenario loading.)*

---

## 🚀 Running the Prototype

### Option A — Unified Fullstack App (Single Port)
Runs both frontend & backend together on a single URL:
```bash
npm run fullstack    # Builds frontend and starts backend on http://localhost:5005
```
Or start directly:
```bash
npm start            # Runs integrated server on http://localhost:5005
```

### Option B — Separate Dev Servers
```bash
# 1. Backend API (Port 5005)
cd backend && npm start

# 2. Frontend Hot-Reload (Port 3000)
cd frontend && npm run dev
```

### 3. Automated System Verification
```bash
cd backend
node scripts/verifySystem.js
```
*(Runs an automated test suite verifying all 10 core API workflows.)*
