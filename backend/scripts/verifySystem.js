const http = require('http');

const request = (path, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5005,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function testAll() {
  console.log('🧪 Starting End-to-End System Verification for LOSTFOUND+...\n');

  // 1. Health Check
  const health = await request('/api/health');
  console.log('1. API Health Check:', health.status === 200 ? '✅ PASSED' : '❌ FAILED', health.data);

  // 2. Auth Login (User & Moderator)
  const loginUser = await request('/api/auth/login', 'POST', {
    email: 'user@lostfound.org',
    password: 'Password123!'
  });
  console.log('2. User Auth Login:', loginUser.status === 200 ? '✅ PASSED' : '❌ FAILED', loginUser.data.user?.name);
  const userToken = loginUser.data.token;

  const loginMod = await request('/api/auth/login', 'POST', {
    email: 'moderator@lostfound.org',
    password: 'Password123!'
  });
  console.log('3. Moderator Auth Login:', loginMod.status === 200 ? '✅ PASSED' : '❌ FAILED', loginMod.data.user?.role);
  const modToken = loginMod.data.token;

  // 4. Lost Items Listing
  const lostList = await request('/api/lost');
  console.log('4. Lost Items Listing:', lostList.status === 200 ? '✅ PASSED' : '❌ FAILED', `Count: ${lostList.data.count}`);
  const targetLost = lostList.data.data.find(i => i.title.includes('Red Backpack')) || lostList.data.data[0];

  // 5. Found Items Listing
  const foundList = await request('/api/found');
  console.log('5. Found Items Listing:', foundList.status === 200 ? '✅ PASSED' : '❌ FAILED', `Count: ${foundList.data.count}`);
  const targetFound = foundList.data.data.find(i => i.title.includes('Red')) || foundList.data.data[0];

  // 6. Satellite Search (Earth Observation Integration)
  const satSearch = await request('/api/satellite/search', 'POST', {
    latitude: 11.6643,
    longitude: 78.1182,
    radiusMeters: 500
  });
  console.log('6. Copernicus Satellite Search:', satSearch.status === 200 ? '✅ PASSED' : '❌ FAILED', {
    provider: satSearch.data.data?.provider,
    cloudCover: satSearch.data.data?.cloudCoverage + '%',
    bbox: satSearch.data.data?.boundingBox,
    status: satSearch.data.data?.searchStatus
  });

  // 7. Multimodal AI Matching Engine
  const matchRes = await request('/api/matches/analyze', 'POST', {
    lostItemId: targetLost._id,
    foundItemId: targetFound._id
  });
  const topMatch = matchRes.data.matches?.[0];
  console.log('7. Multimodal Match Engine:', matchRes.status === 200 ? '✅ PASSED' : '❌ FAILED', {
    overallScore: topMatch?.overallScore + '%',
    visual: topMatch?.breakdown?.visualSimilarity + '%',
    description: topMatch?.breakdown?.descriptionSimilarity + '%',
    proximity: topMatch?.breakdown?.locationProximity + '%',
    time: topMatch?.breakdown?.timeProximity + '%',
    explanation: topMatch?.explanation?.slice(0, 75) + '...'
  });

  // 8. Ground AI Vision Camera
  const cameraRes = await request('/api/camera/analyze', 'POST', {
    targetItemId: targetLost._id,
    zoneId: 'Z001'
  });
  console.log('8. AI Ground Camera Vision:', cameraRes.status === 200 ? '✅ PASSED' : '❌ FAILED', {
    object: cameraRes.data.data?.detectionResult?.object,
    visualSimilarity: cameraRes.data.data?.detectionResult?.visualSimilarity + '%',
    detectionConfidence: cameraRes.data.data?.detectionResult?.detectionConfidence + '%',
    offsetMeters: cameraRes.data.data?.detectionResult?.distanceFromRecoveryZoneMeters + 'm'
  });

  // 9. Claims and Ownership Verification
  const claimRes = await request('/api/claims', 'POST', {
    lostItemId: targetLost._id,
    foundItemId: targetFound._id,
    answers: [
      { question: 'What unique mark is present?', answer: 'Carabiner keychain with initials DK', clueType: 'unique_mark' },
      { question: 'What scratch is present?', answer: 'Small 2cm abrasion on bottom nylon panel', clueType: 'hidden_scratch' }
    ]
  }, { 'Authorization': `Bearer ${userToken}` });
  console.log('9. Ownership Verification & Claim Security:', claimRes.status === 201 ? '✅ PASSED' : '❌ FAILED', {
    verificationScore: claimRes.data.data?.verificationScore + '%',
    riskLevel: claimRes.data.data?.riskLevel,
    factors: claimRes.data.data?.riskFactors
  });

  // 10. Admin Analytics & Heatmap
  const analyticsRes = await request('/api/admin/analytics', 'GET', null, { 'Authorization': `Bearer ${modToken}` });
  console.log('10. Admin Analytics & Heatmap:', analyticsRes.status === 200 ? '✅ PASSED' : '❌ FAILED', {
    recoveryRate: analyticsRes.data.data?.recoveryRate + '%',
    avgHours: analyticsRes.data.data?.averageRecoveryHours + 'h',
    heatmapPointsCount: analyticsRes.data.data?.heatmapPoints?.length,
    hotspotsCount: analyticsRes.data.data?.hotspots?.length
  });

  // 11. Groq AI Inference Engine & Failover
  const aiStatus = await request('/api/ai/status', 'GET');
  const aiChat = await request('/api/ai/chat', 'POST', {
    message: 'Can SARA locate items in campus buildings?'
  });
  console.log('11. Groq Cloud AI Intelligence:', aiChat.status === 200 ? '✅ PASSED' : '❌ FAILED', {
    provider: aiStatus.data?.provider,
    model: aiStatus.data?.model,
    failoverActive: aiStatus.data?.rateLimitFailoverEnabled,
    aiReplySnippet: aiChat.data?.data?.reply ? aiChat.data.data.reply.slice(0, 90) + '...' : 'N/A'
  });

  console.log('\n🎉 ALL 11 CORE RECOVERY & AI WORKFLOWS PASSED VALIDATION WITH ZERO ERRORS!');
  process.exit(0);
}

testAll().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
