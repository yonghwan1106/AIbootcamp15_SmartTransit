const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { generateRecommendedRoutes } = require('../utils/mockData');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * POST /api/recommendations
 * 개인화 경로 추천
 */
router.post('/', (req, res) => {
  const {
    user_id = 'anonymous',
    origin,
    destination,
    departure_time,
    preferences = {}
  } = req.body;
  
  // 필수 파라미터 검증
  if (!origin || !destination) {
    return res.status(400).json({
      status: 'error',
      message: 'Origin and destination are required'
    });
  }
  
  if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
    return res.status(400).json({
      status: 'error',
      message: 'Origin and destination must include lat and lng coordinates'
    });
  }
  
  // 기본 선호도 설정
  const defaultPreferences = {
    max_congestion: 80,
    max_walking_time: 15,
    max_transfers: 2,
    prefer_speed: true,
    avoid_stairs: false
  };
  
  const userPreferences = { ...defaultPreferences, ...preferences };
  
  // 추천 경로 생성
  const recommendedRoutes = generateRecommendedRoutes(origin, destination, userPreferences);
  
  // 추천 이유 생성
  const recommendations = recommendedRoutes.map((route, index) => {
    const reasons = [];
    
    if (route.avg_congestion <= userPreferences.max_congestion) {
      reasons.push('선호하는 혼잡도 수준 이내');
    }
    
    if (route.walking_time <= userPreferences.max_walking_time) {
      reasons.push('도보 시간이 적음');
    }
    
    if (route.transfers <= userPreferences.max_transfers) {
      reasons.push('환승 횟수가 적음');
    }
    
    if (index === 0) {
      reasons.push('가장 빠른 경로');
    }
    
    return {
      ...route,
      recommendation_score: calculateRecommendationScore(route, userPreferences),
      reasons: reasons,
      estimated_cost: calculateEstimatedCost(route),
      carbon_footprint: calculateCarbonFootprint(route)
    };
  });
  
  // 사용자 패턴 저장 (익명이 아닌 경우)
  if (user_id !== 'anonymous') {
    // 출발지/도착지 근처 역 찾기 (간단한 구현)
    findNearbyStation(origin).then(originStation => {
      findNearbyStation(destination).then(destStation => {
        if (originStation && destStation) {
          saveUserPattern(user_id, originStation.id, destStation.id, departure_time);
        }
      });
    });
  }
  
  res.json({
    status: 'success',
    data: {
      user_id: user_id,
      recommended_routes: recommendations,
      search_params: {
        origin: origin,
        destination: destination,
        departure_time: departure_time || moment().toISOString(),
        preferences: userPreferences
      },
      generated_at: moment().toISOString()
    }
  });
});

/**
 * GET /api/recommendations/user-patterns
 * 사용자 이동 패턴 조회
 */
router.get('/user-patterns', (req, res) => {
  const { user_id } = req.query;
  
  if (!user_id) {
    return res.status(400).json({
      status: 'error',
      message: 'user_id is required'
    });
  }
  
  const query = `
    SELECT 
      up.*,
      os.name as origin_name,
      ds.name as destination_name
    FROM user_patterns up
    LEFT JOIN stations os ON up.origin_station_id = os.id
    LEFT JOIN stations ds ON up.destination_station_id = ds.id
    WHERE up.user_id = ?
    ORDER BY up.frequency DESC, up.updated_at DESC
    LIMIT 10
  `;
  
  db.all(query, [user_id], (err, rows) => {
    if (err) {
      console.error('Error fetching user patterns:', err.message);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
    
    // 패턴 분석
    const patternAnalysis = analyzeUserPatterns(rows);
    
    res.json({
      status: 'success',
      data: {
        user_id: user_id,
        patterns: rows,
        analysis: patternAnalysis
      }
    });
  });
});

/**
 * POST /api/recommendations/feedback
 * 추천 피드백 수집
 */
router.post('/feedback', (req, res) => {
  const {
    user_id,
    route_id,
    rating,
    feedback_type,
    comments,
    actual_congestion,
    actual_time
  } = req.body;
  
  if (!route_id || !rating) {
    return res.status(400).json({
      status: 'error',
      message: 'route_id and rating are required'
    });
  }
  
  // 피드백 데이터 저장 (간단한 로그)
  const feedbackLog = {
    id: uuidv4(),
    user_id: user_id || 'anonymous',
    route_id: route_id,
    rating: rating, // 1-5 점수
    feedback_type: feedback_type, // 'positive', 'negative', 'suggestion'
    comments: comments,
    actual_congestion: actual_congestion,
    actual_time: actual_time,
    timestamp: moment().toISOString()
  };
  
  // 실제로는 데이터베이스에 저장
  console.log('Feedback received:', feedbackLog);
  
  res.json({
    status: 'success',
    message: 'Feedback received successfully',
    data: {
      feedback_id: feedbackLog.id,
      thank_you_points: 10 // 피드백 포인트 적립
    }
  });
});

/**
 * GET /api/recommendations/popular-routes
 * 인기 경로 조회
 */
router.get('/popular-routes', (req, res) => {
  const { time_period = '7d', limit = 10 } = req.query;
  
  // 인기 경로 시뮬레이션 (실제로는 사용자 데이터 분석)
  const popularRoutes = [
    {
      origin_name: '강남역',
      destination_name: '홍대입구역',
      usage_count: 1250,
      avg_rating: 4.3,
      avg_time: 48,
      avg_congestion: 65,
      recommended_times: ['07:30', '08:00', '18:30']
    },
    {
      origin_name: '잠실역',
      destination_name: '강남역',
      usage_count: 980,
      avg_rating: 4.1,
      avg_time: 35,
      avg_congestion: 70,
      recommended_times: ['08:15', '18:00', '18:45']
    },
    {
      origin_name: '건대입구역',
      destination_name: '삼성역',
      usage_count: 756,
      avg_rating: 4.0,
      avg_time: 42,
      avg_congestion: 58,
      recommended_times: ['07:45', '08:30', '18:15']
    }
  ];
  
  res.json({
    status: 'success',
    data: {
      popular_routes: popularRoutes.slice(0, parseInt(limit)),
      analysis_period: time_period,
      updated_at: moment().toISOString()
    }
  });
});

// Helper Functions

/**
 * 추천 점수 계산
 */
function calculateRecommendationScore(route, preferences) {
  let score = 100;
  
  // 시간 가중치
  score -= route.total_time * 0.5;
  
  // 혼잡도 가중치
  if (route.avg_congestion > preferences.max_congestion) {
    score -= (route.avg_congestion - preferences.max_congestion) * 0.8;
  }
  
  // 도보 시간 가중치
  if (route.walking_time > preferences.max_walking_time) {
    score -= (route.walking_time - preferences.max_walking_time) * 1.2;
  }
  
  // 환승 가중치
  score -= route.transfers * 5;
  
  return Math.max(0, Math.round(score));
}

/**
 * 예상 비용 계산
 */
function calculateEstimatedCost(route) {
  const baseCost = 1500; // 기본 요금
  const transferCost = route.transfers * 0; // 환승 추가 비용 없음
  
  return baseCost + transferCost;
}

/**
 * 탄소 발자국 계산 (kg CO2)
 */
function calculateCarbonFootprint(route) {
  // 대중교통: 0.04kg CO2 per km (추정)
  const estimatedDistance = route.total_time * 0.5; // 시간당 평균 30km/h 가정
  return Math.round(estimatedDistance * 0.04 * 100) / 100;
}

/**
 * 근처 역 찾기
 */
async function findNearbyStation(location) {
  return new Promise((resolve) => {
    const query = `
      SELECT *,
      (
        6371000 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )
      ) AS distance
      FROM stations
      ORDER BY distance
      LIMIT 1
    `;
    
    db.get(query, [location.lat, location.lng, location.lat], (err, row) => {
      resolve(err ? null : row);
    });
  });
}

/**
 * 사용자 패턴 저장
 */
function saveUserPattern(userId, originStationId, destStationId, departureTime) {
  const time = moment(departureTime);
  const dayOfWeek = time.day();
  const typicalTime = time.format('HH:mm');
  
  // 기존 패턴 업데이트 또는 새로 생성
  db.get(
    'SELECT * FROM user_patterns WHERE user_id = ? AND origin_station_id = ? AND destination_station_id = ?',
    [userId, originStationId, destStationId],
    (err, row) => {
      if (row) {
        // 기존 패턴 업데이트
        db.run(
          'UPDATE user_patterns SET frequency = frequency + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [row.id]
        );
      } else {
        // 새 패턴 생성
        db.run(
          'INSERT INTO user_patterns (user_id, origin_station_id, destination_station_id, typical_departure_time, day_of_week) VALUES (?, ?, ?, ?, ?)',
          [userId, originStationId, destStationId, typicalTime, JSON.stringify([dayOfWeek])]
        );
      }
    }
  );
}

/**
 * 사용자 패턴 분석
 */
function analyzeUserPatterns(patterns) {
  if (patterns.length === 0) {
    return { message: 'No patterns found' };
  }
  
  const totalTrips = patterns.reduce((sum, p) => sum + p.frequency, 0);
  const mostFrequentRoute = patterns[0];
  
  const timePatterns = {};
  patterns.forEach(p => {
    const time = p.typical_departure_time;
    if (time) {
      const hour = parseInt(time.split(':')[0]);
      timePatterns[hour] = (timePatterns[hour] || 0) + p.frequency;
    }
  });
  
  const peakHour = Object.keys(timePatterns).reduce((a, b) => 
    timePatterns[a] > timePatterns[b] ? a : b
  );
  
  return {
    total_trips: totalTrips,
    unique_routes: patterns.length,
    most_frequent_route: {
      origin: mostFrequentRoute.origin_name,
      destination: mostFrequentRoute.destination_name,
      frequency: mostFrequentRoute.frequency
    },
    peak_departure_hour: parseInt(peakHour),
    commute_type: totalTrips > 20 ? 'regular_commuter' : 'occasional_user'
  };
}

module.exports = router;