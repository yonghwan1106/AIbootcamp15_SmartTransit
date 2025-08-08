const moment = require('moment');

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
  '239': { name: '강남역', multiplier: 1.3, businessDistrict: true }, // 강남역 - 매우 혼잡
  '252': { name: '홍대입구역', multiplier: 1.2, entertainmentDistrict: true }, // 홍대입구역
  '211': { name: '건대입구역', multiplier: 1.1, universityArea: true }, // 건대입구역
  '216': { name: '잠실역', multiplier: 1.15, shoppingArea: true }, // 잠실역
  '240': { name: '역삼역', multiplier: 1.1, businessDistrict: true }, // 역삼역
  '241': { name: '선릉역', multiplier: 1.0, businessDistrict: true }, // 선릉역
  '242': { name: '삼성역', multiplier: 1.05, businessDistrict: true }, // 삼성역
  '238': { name: '서초역', multiplier: 0.9, residential: true } // 서초역
};

/**
 * 현재 시간 기준 실시간 혼잡도 생성
 */
function generateRealtimeCongestion(stationId, vehicleId = null) {
  const now = moment();
  const hour = now.hour();
  const isWeekend = now.day() === 0 || now.day() === 6;
  
  // 기본 패턴 가져오기
  const pattern = isWeekend ? HOURLY_PATTERNS.weekend : HOURLY_PATTERNS.weekday;
  const baseLevel = pattern[hour] || 30;
  
  // 역별 특성 반영
  const stationChar = STATION_CHARACTERISTICS[stationId] || { multiplier: 1.0 };
  const adjustedLevel = Math.min(100, baseLevel * stationChar.multiplier);
  
  // 랜덤 변동 추가 (±15)
  const randomVariation = (Math.random() - 0.5) * 30;
  const finalLevel = Math.max(0, Math.min(100, adjustedLevel + randomVariation));
  
  return {
    station_id: stationId,
    vehicle_id: vehicleId || `${stationId}_${Math.floor(Math.random() * 10) + 1}`,
    congestion_level: Math.round(finalLevel),
    passenger_count: Math.round((finalLevel / 100) * 150), // 최대 150명 가정
    timestamp: now.toISOString(),
    data_source: 'simulated'
  };
}

/**
 * 지하철 차량별 혼잡도 생성 (10량 기준)
 */
function generateVehicleCongestion(stationId) {
  const baseCongestion = generateRealtimeCongestion(stationId);
  const vehicles = [];
  
  for (let i = 1; i <= 3; i++) { // 3대 열차 시뮬레이션
    const vehicleData = {
      vehicle_id: `${stationId}_train_${i}`,
      congestion: baseCongestion.congestion_level + (Math.random() - 0.5) * 20,
      arrival_time: `${i * 2}분 후`,
      car_positions: [] // 10량 각각의 혼잡도
    };
    
    // 각 차량(10량)의 혼잡도 생성
    for (let car = 1; car <= 10; car++) {
      const carCongestion = Math.max(0, Math.min(100, 
        vehicleData.congestion + (Math.random() - 0.5) * 40
      ));
      vehicleData.car_positions.push(Math.round(carCongestion));
    }
    
    vehicleData.congestion = Math.round(Math.max(0, Math.min(100, vehicleData.congestion)));
    vehicles.push(vehicleData);
  }
  
  return vehicles;
}

/**
 * 혼잡도 예측 데이터 생성
 */
function generateCongestionPrediction(stationId, hours = 3) {
  const predictions = [];
  const now = moment();
  const isWeekend = now.day() === 0 || now.day() === 6;
  const pattern = isWeekend ? HOURLY_PATTERNS.weekend : HOURLY_PATTERNS.weekday;
  const stationChar = STATION_CHARACTERISTICS[stationId] || { multiplier: 1.0 };
  
  for (let i = 1; i <= hours * 2; i++) { // 30분 간격
    const targetTime = moment().add(i * 30, 'minutes');
    const targetHour = targetTime.hour();
    
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

/**
 * 날씨 영향도 시뮬레이션
 */
function getWeatherImpact() {
  const impacts = ['none', 'low', 'medium', 'high'];
  const weights = [0.6, 0.25, 0.1, 0.05]; // 보통은 영향 없음
  
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

/**
 * 이벤트 영향도 시뮬레이션
 */
function getEventImpact(targetTime) {
  // 주말 저녁이나 특정 시간대에 이벤트 영향 시뮬레이션
  const hour = targetTime.hour();
  const isWeekend = targetTime.day() === 0 || targetTime.day() === 6;
  
  if (isWeekend && (hour >= 19 && hour <= 22)) {
    return Math.random() > 0.7 ? 'medium' : 'low';
  }
  
  return 'none';
}

/**
 * 개인화 추천을 위한 경로 생성
 */
function generateRecommendedRoutes(origin, destination, preferences = {}) {
  const routes = [];
  const baseTime = 45; // 기본 소요시간 (분)
  
  // 3개의 다른 경로 생성
  for (let i = 0; i < 3; i++) {
    const routeVariation = i * 5; // 경로별 시간 차이
    const congestionLevel = 50 + (Math.random() - 0.5) * 40;
    
    const route = {
      route_id: `route_${i + 1}`,
      total_time: baseTime + routeVariation + Math.floor(Math.random() * 10),
      walking_time: 5 + Math.floor(Math.random() * 10),
      transfers: i,
      avg_congestion: Math.round(Math.max(20, Math.min(90, congestionLevel))),
      departure_time: moment().add(5 + i * 10, 'minutes').format('HH:mm'),
      arrival_time: moment().add(baseTime + routeVariation + 5 + i * 10, 'minutes').format('HH:mm'),
      steps: generateRouteSteps(i)
    };
    
    routes.push(route);
  }
  
  // 선호도에 따른 정렬
  routes.sort((a, b) => {
    if (preferences.max_congestion && a.avg_congestion <= preferences.max_congestion && b.avg_congestion > preferences.max_congestion) {
      return -1;
    }
    if (preferences.max_walking_time && a.walking_time <= preferences.max_walking_time && b.walking_time > preferences.max_walking_time) {
      return -1;
    }
    return a.total_time - b.total_time; // 기본적으로 시간순 정렬
  });
  
  return routes;
}

/**
 * 경로 단계 생성
 */
function generateRouteSteps(routeIndex) {
  const steps = [
    {
      type: 'walk',
      duration: 3 + Math.floor(Math.random() * 5),
      description: '출발지에서 지하철역까지 도보'
    }
  ];
  
  // 환승 횟수에 따른 단계 추가
  if (routeIndex === 0) {
    steps.push({
      type: 'subway',
      line: '2호선',
      duration: 35 + Math.floor(Math.random() * 10),
      congestion: 50 + Math.floor(Math.random() * 30)
    });
  } else if (routeIndex === 1) {
    steps.push({
      type: 'subway',
      line: '2호선',
      duration: 20 + Math.floor(Math.random() * 5),
      congestion: 45 + Math.floor(Math.random() * 20)
    });
    steps.push({
      type: 'transfer',
      duration: 3,
      description: '9호선으로 환승'
    });
    steps.push({
      type: 'subway',
      line: '9호선',
      duration: 15 + Math.floor(Math.random() * 5),
      congestion: 60 + Math.floor(Math.random() * 25)
    });
  } else {
    steps.push({
      type: 'bus',
      line: '간선버스',
      duration: 25 + Math.floor(Math.random() * 10),
      congestion: 40 + Math.floor(Math.random() * 30)
    });
    steps.push({
      type: 'transfer',
      duration: 2,
      description: '지하철로 환승'
    });
    steps.push({
      type: 'subway',
      line: '2호선',
      duration: 20 + Math.floor(Math.random() * 8),
      congestion: 55 + Math.floor(Math.random() * 25)
    });
  }
  
  steps.push({
    type: 'walk',
    duration: 2 + Math.floor(Math.random() * 3),
    description: '지하철역에서 목적지까지 도보'
  });
  
  return steps;
}

module.exports = {
  generateRealtimeCongestion,
  generateVehicleCongestion,
  generateCongestionPrediction,
  generateRecommendedRoutes,
  STATION_CHARACTERISTICS
};