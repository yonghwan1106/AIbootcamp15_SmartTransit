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

function generateRealtimeCongestion(stationId, vehicleId = null) {
  const now = new Date();
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  
  // 기본 패턴 가져오기
  const pattern = isWeekend ? HOURLY_PATTERNS.weekend : HOURLY_PATTERNS.weekday;
  const baseLevel = pattern[hour] || 30;
  
  // 역별 특성 반영
  const stationChar = STATION_CHARACTERISTICS[stationId] || STATION_CHARACTERISTICS.default;
  const adjustedLevel = Math.min(100, baseLevel * stationChar.multiplier);
  
  // 랜덤 변동 추가 (±15)
  const randomVariation = (Math.random() - 0.5) * 30;
  const finalLevel = Math.max(0, Math.min(100, adjustedLevel + randomVariation));
  
  return {
    station_id: stationId,
    vehicle_id: vehicleId || `${stationId}_${Math.floor(Math.random() * 10) + 1}`,
    congestion_level: Math.round(finalLevel),
    passenger_count: Math.round((finalLevel / 100) * 150),
    timestamp: now.toISOString(),
    data_source: 'simulated'
  };
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
    const { station_id, line_id, direction, vehicle_type } = req.query;
    
    if (!station_id) {
      return res.status(400).json({
        status: 'error',
        message: 'station_id is required'
      });
    }
    
    const congestionData = generateRealtimeCongestion(station_id);
    
    return res.status(200).json({
      status: 'success',
      data: congestionData
    });
  }

  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
};