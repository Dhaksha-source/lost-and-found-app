/**
 * groqService.js
 * 
 * Integration with Groq Cloud LLM API for high-speed inference in LOSTFOUND+:
 * - Multi-key support with automatic failover on rate limits (HTTP 429)
 * - SARA Autonomous Match Intelligence Explanations
 * - Zero-Knowledge Ownership Verification Semantic Evaluation
 * - Micro Ground Vision AI Analysis Insights
 * - SARA AI Recovery Assistant Chat
 */

const axios = require('axios');

class GroqService {
  constructor() {
    this.primaryKey = process.env.GROQ_API_KEY || '';
    this.backupKey = process.env.GROQ_BACKUP_API_KEY || '';
    this.activeKeyIndex = 0;
    this.model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  /**
   * Get all registered API keys
   */
  getKeys() {
    const list = [this.primaryKey, this.backupKey].filter(k => k && k.trim().length > 0);
    return list.length > 0 ? list : [];
  }

  /**
   * Register or update a backup API key
   */
  setBackupKey(newKey) {
    if (newKey && newKey.trim()) {
      this.backupKey = newKey.trim();
      console.log('[GroqService] Backup API Key registered successfully.');
    }
  }

  /**
   * Core completion helper with automatic key rotation and rate limit (429) failover
   */
  async complete(messages, options = {}) {
    const keys = this.getKeys();
    let attempts = 0;
    const maxAttempts = keys.length;

    while (attempts < maxAttempts) {
      const currentKey = keys[this.activeKeyIndex % keys.length];

      try {
        const response = await axios.post(
          this.apiUrl,
          {
            model: options.model || this.model,
            messages,
            temperature: options.temperature !== undefined ? options.temperature : 0.3,
            max_tokens: options.max_tokens || 512,
            ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {})
          },
          {
            headers: {
              'Authorization': `Bearer ${currentKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 6000
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        return content ? content.trim() : null;
      } catch (error) {
        const isRateLimit = error.response && (error.response.status === 429 || error.response.status === 402);
        
        if (isRateLimit) {
          console.warn(`[GroqService] Rate limit or quota exceeded on key index ${this.activeKeyIndex % keys.length}. Rotating key...`);
          // Rotate to next key
          this.activeKeyIndex = (this.activeKeyIndex + 1) % keys.length;
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`[GroqService] Retrying with backup key index ${this.activeKeyIndex}...`);
            continue;
          }
        }

        console.warn('[GroqService Warning]: Groq API call error or all keys rate-limited:', error.message);
        return null;
      }
    }

    return null;
  }

  /**
   * Generate natural language AI explanation for multimodal matching
   */
  async generateMatchExplanation({ lostItem, foundItem, matchScore, breakdown, spatialDistanceMeters, timeDifferenceHours }) {
    const prompt = `You are the AI Match Intelligence Engine for LOSTFOUND+, an autonomous lost item recovery platform.
Provide a concise, professional 2-sentence forensic recovery summary comparing this lost item and found item.

Lost Item:
- Title: ${lostItem.title}
- Category: ${lostItem.category}
- Color: ${lostItem.color}
- Brand: ${lostItem.brand || 'N/A'}
- Reported Location: ${lostItem.addressText || 'Campus'}

Found Item:
- Title: ${foundItem.title}
- Category: ${foundItem.category}
- Color: ${foundItem.color}
- Brand: ${foundItem.brand || 'N/A'}
- Storage Location: ${foundItem.storageLocation || 'Campus Desk'}

Computed Metrics:
- Overall Match Confidence: ${matchScore}%
- Visual Similarity: ${breakdown.visualSimilarity}%
- Semantic Description Fit: ${breakdown.descriptionSimilarity}%
- Distance Offset: ${spatialDistanceMeters} meters
- Time Delta: ${timeDifferenceHours} hours

Return only the 2-sentence professional explanation.`;

    const aiText = await this.complete([
      { role: 'system', content: 'You are an objective AI recovery forensic analyst. Be direct, factual, and concise.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.2, max_tokens: 180 });

    return aiText;
  }

  /**
   * Evaluate a claimant answer against a confidential private clue using semantic understanding
   */
  async evaluateClaimClue({ clueType, privateClueDetail, claimantAnswer }) {
    const prompt = `You are the Claim Security Engine for LOSTFOUND+.
Evaluate if the claimant's answer genuinely demonstrates confidential knowledge of the item's private ownership clue.
Take into account natural language paraphrasing, synonyms, or minor typos, but penalize guesswork or vague statements.

Private Clue Category: ${clueType}
Ground Truth Private Clue: "${privateClueDetail}"
Claimant's Answer: "${claimantAnswer}"

Respond ONLY with valid JSON in this exact structure:
{
  "score": <number between 0 and 100>,
  "isMatch": <boolean>,
  "reasoning": "<1 sentence explanation of why this matches or fails>"
}`;

    const raw = await this.complete([
      { role: 'system', content: 'You evaluate zero-knowledge ownership claims. Always output strictly valid JSON.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.1, max_tokens: 200, jsonMode: true });

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  /**
   * Generate micro ground vision AI analysis commentary
   */
  async generateGroundVisionInsight({ targetItem, detectionResult, simulatedOffsetMeters }) {
    const prompt = `You are the Level 3 Micro Ground Vision Analyzer for LOSTFOUND+.
Target Item: ${targetItem.title} (${targetItem.color} ${targetItem.category}, ${targetItem.brand || 'N/A'})
Ground Frame Detection Result: ${detectionResult.object} detected with ${detectionResult.visualSimilarity}% visual similarity, offset ${simulatedOffsetMeters}m from search zone.

Provide a 1-sentence technical computer vision telemetry assessment for the ground search team.`;

    const insight = await this.complete([
      { role: 'system', content: 'You are a field robotics and ground AI computer vision specialist.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, max_tokens: 120 });

    return insight;
  }

  /**
   * Chat assistant for recovery questions and campus lost & found queries
   */
  async askAssistant({ message, history = [] }) {
    const systemPrompt = `You are SARA-AI, the autonomous lost item recovery assistant for LOSTFOUND+.
You assist students, campus staff, and moderators with:
1. Guidance on filing lost item reports and private ownership clues.
2. Explaining multi-resolution satellite (Copernicus Sentinel-2) and ground search operations.
3. Helping claim owners verify their property safely.
Keep your answers helpful, concise (2-4 sentences max), polite, and professional.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6),
      { role: 'user', content: message }
    ];

    const reply = await this.complete(messages, { temperature: 0.5, max_tokens: 300 });
    return reply || 'SARA AI Recovery Assistant is active. Please review your active recovery missions and matches on the dashboard.';
  }
}

module.exports = new GroqService();
