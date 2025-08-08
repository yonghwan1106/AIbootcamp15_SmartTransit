// Mock data for client-side development and deployment
export interface Station {
  id: string;
  name: string;
  line_id: string;
  station_type: 'subway' | 'bus';
  latitude: number;
  longitude: number;
  address: string;
}

export interface Vehicle {
  vehicle_id: string;
  congestion: number;
  arrival_time: string;
  car_positions: number[];
}

export interface CongestionData {
  station_id: string;
  station_name: string;
  line_id: string;
  current_congestion: number;
  congestion_level: 'low' | 'medium' | 'heavy';
  passenger_count: number;
  vehicles: Vehicle[];
  updated_at: string;
  data_source: string;
}

export interface PredictionData {
  time: string;
  congestion: number;
  confidence: number;
  weather_impact: string;
  event_impact: string;
}

// Mock stations data
export const mockStations: Station[] = [
  {
    id: '221',
    name: '강남역',
    line_id: '2',
    station_type: 'subway',
    latitude: 37.4979,
    longitude: 127.0276,
    address: '서울특별시 강남구 강남대로 지하396'
  },
  {
    id: '220',
    name: '역삼역',
    line_id: '2',
    station_type: 'subway',
    latitude: 37.5000,
    longitude: 127.0364,
    address: '서울특별시 강남구 역삼동'
  },
  {
    id: '219',
    name: '선릉역',
    line_id: '2',
    station_type: 'subway',
    latitude: 37.5045,
    longitude: 127.0493,
    address: '서울특별시 강남구 선릉로'
  },
  {
    id: '218',
    name: '삼성역',
    line_id: '2',
    station_type: 'subway',
    latitude: 37.5081,
    longitude: 127.0634,
    address: '서울특별시 강남구 삼성동'
  },
  {
    id: '101',
    name: '서울역',
    line_id: '1',
    station_type: 'subway',
    latitude: 37.5546,
    longitude: 126.9706,
    address: '서울특별시 중구 세종대로'
  },
  {
    id: '252',
    name: '홍대입구역',
    line_id: '2',
    station_type: 'subway',
    latitude: 37.5563,
    longitude: 126.9229,
    address: '서울특별시 마포구 양화로'
  },
  {
    id: '211',
    name: '건대입구역',
    line_id: '2',
    station_type: 'subway',
    latitude: 37.5403,
    longitude: 127.0698,
    address: '서울특별시 광진구 능동로'
  },
  {
    id: '215',
    name: '잠실역',
    line_id: '2',
    station_type: 'subway',
    latitude: 37.5133,
    longitude: 127.1000,
    address: '서울특별시 송파구 올림픽로'
  }
];

// Hourly congestion patterns
const HOURLY_PATTERNS = {
  weekday: {
    0: 15, 1: 10, 2: 8, 3: 5, 4: 8, 5: 12,
    6: 25, 7: 65, 8: 90, 9: 75, 10: 45, 11: 50,
    12: 60, 13: 55, 14: 50, 15: 55, 16: 65, 17: 85,
    18: 95, 19: 80, 20: 65, 21: 55, 22: 40, 23: 25
  },
  weekend: {
    0: 12, 1: 8, 2: 5, 3: 3, 4: 5, 5: 8,
    6: 15, 7: 20, 8: 30, 9: 40, 10: 55, 11: 65,
    12: 70, 13: 75, 14: 80, 15: 75, 16: 70, 17: 65,
    18: 60, 19: 55, 20: 50, 21: 45, 22: 35, 23: 20
  }
};

// Station characteristics
const STATION_CHARACTERISTICS: Record<string, { multiplier: number }> = {
  '221': { multiplier: 1.3 }, // 강남역
  '220': { multiplier: 1.1 }, // 역삼역
  '219': { multiplier: 1.0 }, // 선릉역
  '218': { multiplier: 1.05 }, // 삼성역
  '101': { multiplier: 1.25 }, // 서울역
  '252': { multiplier: 1.2 }, // 홍대입구역
  '211': { multiplier: 1.1 }, // 건대입구역
  '215': { multiplier: 1.15 } // 잠실역
};

// 혼잡도 레벨 변환 함수
const getCongestionLevel = (level: number): 'low' | 'medium' | 'heavy' => {
  if (level <= 30) return 'low';
  if (level <= 70) return 'medium';
  return 'heavy';
};

// 역 이름 매핑
const getStationName = (stationId: string): string => {
  const station = mockStations.find(s => s.id === stationId);
  return station ? station.name : `역${stationId}`;
};

// 차량 데이터 생성
const generateVehicles = (stationId: string, baseCongestion: number): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  for (let i = 1; i <= 3; i++) {
    const vehicleId = `${stationId}_train_${i}`;
    const vehicleCongestion = Math.max(0, Math.min(100, baseCongestion + (Math.random() - 0.5) * 20));
    
    const carPositions: number[] = [];
    for (let car = 1; car <= 10; car++) {
      const carCongestion = Math.max(0, Math.min(100, vehicleCongestion + (Math.random() - 0.5) * 40));
      carPositions.push(Math.round(carCongestion));
    }
    
    vehicles.push({
      vehicle_id: vehicleId,
      congestion: Math.round(vehicleCongestion),
      arrival_time: `${i * 2}분 후`,
      car_positions: carPositions
    });
  }
  return vehicles;
};

export const generateRealtimeCongestion = (stationId: string): CongestionData => {
  const now = new Date();
  const hour = now.getHours();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  
  const pattern = isWeekend ? HOURLY_PATTERNS.weekend : HOURLY_PATTERNS.weekday;
  const baseLevel = pattern[hour as keyof typeof pattern] || 30;
  
  const stationChar = STATION_CHARACTERISTICS[stationId] || { multiplier: 0.85 };
  const adjustedLevel = Math.min(100, baseLevel * stationChar.multiplier);
  
  const randomVariation = (Math.random() - 0.5) * 30;
  const finalLevel = Math.max(0, Math.min(100, adjustedLevel + randomVariation));
  
  const station = mockStations.find(s => s.id === stationId);
  const vehicles = generateVehicles(stationId, finalLevel);
  
  return {
    station_id: stationId,
    station_name: getStationName(stationId),
    line_id: station?.line_id || '2',
    current_congestion: Math.round(finalLevel),
    congestion_level: getCongestionLevel(finalLevel),
    passenger_count: Math.round((finalLevel / 100) * 150),
    vehicles,
    updated_at: now.toISOString(),
    data_source: 'simulated'
  };
};

export const generateCongestionPrediction = (stationId: string, hours: number = 3): PredictionData[] => {
  const predictions: PredictionData[] = [];
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const pattern = isWeekend ? HOURLY_PATTERNS.weekend : HOURLY_PATTERNS.weekday;
  const stationChar = STATION_CHARACTERISTICS[stationId] || { multiplier: 0.85 };
  
  for (let i = 1; i <= hours * 2; i++) {
    const targetTime = new Date(now.getTime() + (i * 30 * 60 * 1000));
    const targetHour = targetTime.getHours();
    
    const baseLevel = pattern[targetHour as keyof typeof pattern] || 30;
    const adjustedLevel = Math.min(100, baseLevel * stationChar.multiplier);
    
    const uncertainty = Math.min(20, i * 2);
    const randomVariation = (Math.random() - 0.5) * uncertainty;
    const predictedLevel = Math.max(0, Math.min(100, adjustedLevel + randomVariation));
    
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
};

const getWeatherImpact = (): string => {
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
};

const getEventImpact = (targetTime: Date): string => {
  const hour = targetTime.getHours();
  const isWeekend = targetTime.getDay() === 0 || targetTime.getDay() === 6;
  
  if (isWeekend && (hour >= 19 && hour <= 22)) {
    return Math.random() > 0.7 ? 'medium' : 'low';
  }
  
  return 'none';
};

export const generateRecommendedRoutes = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
  const routes = [];
  const baseTime = 45;
  
  for (let i = 0; i < 3; i++) {
    const routeVariation = i * 5;
    const congestionLevel = 50 + (Math.random() - 0.5) * 40;
    
    const now = new Date();
    const departureTime = new Date(now.getTime() + (5 + i * 10) * 60 * 1000);
    const arrivalTime = new Date(now.getTime() + (baseTime + routeVariation + 5 + i * 10) * 60 * 1000);
    
    routes.push({
      route_id: `route_${i + 1}`,
      total_time: baseTime + routeVariation + Math.floor(Math.random() * 10),
      walking_time: 5 + Math.floor(Math.random() * 10),
      transfers: i,
      avg_congestion: Math.round(Math.max(20, Math.min(90, congestionLevel))),
      departure_time: departureTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      arrival_time: arrivalTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    });
  }
  
  return routes.sort((a, b) => a.total_time - b.total_time);
};