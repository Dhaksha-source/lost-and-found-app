const express = require('express');
const router = express.Router();
const groqService = require('../services/groqService');

// POST /api/ai/chat - SARA Recovery AI Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const reply = await groqService.askAssistant({ message, history });

    res.json({
      success: true,
      data: {
        reply,
        model: groqService.model,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AI Chat Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ai/status - Check AI status & key configuration
router.get('/status', (req, res) => {
  const keys = groqService.getKeys();
  res.json({
    success: true,
    status: 'ONLINE',
    provider: 'Groq Cloud High-Speed Inference Engine',
    model: groqService.model,
    configuredKeysCount: keys.length,
    activeKeyIndex: groqService.activeKeyIndex % keys.length,
    rateLimitFailoverEnabled: true
  });
});

// POST /api/ai/backup-key - Configure backup API key on the fly
router.post('/backup-key', (req, res) => {
  const { backupKey } = req.body;
  if (!backupKey) {
    return res.status(400).json({ success: false, message: 'backupKey is required' });
  }

  groqService.setBackupKey(backupKey);
  res.json({
    success: true,
    message: 'Backup API key registered. Automatic failover active upon rate limit (HTTP 429).'
  });
});

module.exports = router;
