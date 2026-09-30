const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
// Increased body limit to support base64 frame captures from AI Recovery Camera
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger for hackathon telemetry
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lost', require('./routes/lostRoutes'));
app.use('/api/found', require('./routes/foundRoutes'));
app.use('/api/matches', require('./routes/matchesRoutes'));
app.use('/api/recovery', require('./routes/recoveryRoutes'));
app.use('/api/satellite', require('./routes/satelliteRoutes'));
app.use('/api/claims', require('./routes/claimsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/camera', require('./routes/cameraRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health & Status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'LOSTFOUND+ Autonomous Recovery Engine API',
    version: '1.0.0',
    satelliteProvider: process.env.COPERNICUS_CLIENT_ID ? 'Copernicus Sentinel Hub (Live)' : 'Copernicus Sentinel MSI (EO Layer Fallback)',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend production build in integrated fullstack mode
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Client-side SPA routing fallback for any non-API request
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.send('LOSTFOUND+ API is running. Frontend build not found.');
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 LOSTFOUND+ BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📡 Earth Observation / SARA Satellite Pipeline Active`);
  console.log(`====================================================`);
});
