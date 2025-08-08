// 시간대별 혼잡도 패턴 (0-100)
const HOURLY_PATTERNS = {
  // 평일 패턴
  weekday: {
    0: 15, 1: 10, 2: 8, 3: 5, 4: 8, 5: 12,
    6: 25, 7: 65, 8: 90, 9: 75, 10: 45, 11: 50,
    12: 60, 13: 55, 14: 50, 15: 55, 16: 65, 17: 85,
    18: 95, 19: 80, 20: 65, 21: 55, 22: 40, 23: 25
  },
  // 주말 패턴
  weekend: {
    0: 12, 1: 8, 2: 5, 3: 3, 4: 5, 5: 8,
    6: 15, 7: 20, 8: 30, 9: 40, 10: 55, 11: 65,
    12: 70, 13: 75, 14: 80, 15: 75, 16: 70, 17: 65,
    18: 60, 19: 55, 20: 50, 21: 45, 22: 35, 23: 20
  }
};

// 역별 특성 (혼잡도 가중치)
const STATION_CHARACTERISTICS = {
  '221': { name: '강남역', multiplier: 1.3, businessDistrict: true, transfer: true },
  '220': { name: '역삼역', multiplier: 1.1, businessDistrict: true },
  '219': { name: '선릉역', multiplier: 1.0, businessDistrict: true },
  '218': { name: '삼성역', multiplier: 1.05, businessDistrict: true },
  '101': { name: '서울역', multiplier: 1.25, mainStation: true, transfer: true },
  'default': { multiplier: 0.85, residential: true }
};

function generateCongestionPrediction(stationId, hours = 3) {
  const predictions = [];
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const pattern = isWeekend ? HOURLY_PATTERNS.weekend : HOURLY_PATTERNS.weekday;
  const stationChar = STATION_CHARACTERISTICS[stationId] || STATION_CHARACTERISTICS.default;
  
  for (let i = 1; i <= hours * 2; i++) { // 30분 간격
    const targetTime = new Date(now.getTime() + (i * 30 * 60 * 1000));
    const targetHour = targetTime.getHours();
    
    const baseLevel = pattern[targetHour] || 30;
    const adjustedLevel = Math.min(100, baseLevel * stationChar.multiplier);
    
    // 예측 불확실성 추가
    const uncertainty = Math.min(20, i * 2); // 시간이 멀수록 불확실
    const randomVariation = (Math.random() - 0.5) * uncertainty;
    const predictedLevel = Math.max(0, Math.min(100, adjustedLevel + randomVariation));
    
    // 신뢰도 계산 (시간이 멀수록 낮아짐)
    const confidence = Math.max(0.6, 0.95 - (i * 0.05));
    
    predictions.push({
      time: targetTime.toISOString(),
      congestion: Math.round(predictedLevel),
      confidence: Math.round(confidence * 100) / 100,
      weather_impact: getWeatherImpact(),
      event_impact: getEventImpact(targetTime)
    });
  }
  
  return predictions;
}

function getWeatherImpact() {
  const impacts = ['none', 'low', 'medium', 'high'];
  const weights = [0.6, 0.25, 0.1, 0.05];
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < impacts.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return impacts[i];
    }
  }
  
  return 'none';
}

function getEventImpact(targetTime) {
  const hour = targetTime.getHours();
  const isWeekend = targetTime.getDay() === 0 || targetTime.getDay() === 6;
  
  if (isWeekend && (hour >= 19 && hour <= 22)) {
    return Math.random() > 0.7 ? 'medium' : 'low';
  }
  
  return 'none';
}

module.exports = (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { station_id, target_time, duration_hours = 3 } = req.query;
    
    if (!station_id) {
      return res.status(400).json({
        status: 'error',
        message: 'station_id is required'
      });
    }
    
    const predictions = generateCongestionPrediction(station_id, parseInt(duration_hours));
    
    return res.status(200).json({
      status: 'success',
      data: {
        station_id,
        predictions,
        generated_at: new Date().toISOString()
      }
    });
  }

  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
};