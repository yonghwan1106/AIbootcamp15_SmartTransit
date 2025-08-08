const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { generateCongestionPrediction } = require('../utils/mockData');
const moment = require('moment');

/**
 * GET /api/prediction
 * 혼잡도 예측 조회
 */
router.get('/', (req, res) => {
  const { station_id, target_time, duration_hours = 3 } = req.query;
  
  if (!station_id) {
    return res.status(400).json({
      status: 'error',
      message: 'station_id is required'
    });
  }
  
  // 역 정보 확인
  db.get('SELECT * FROM stations WHERE id = ?', [station_id], (err, station) => {
    if (err) {
      console.error('Error fetching station:', err.message);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
    
    if (!station) {
      return res.status(404).json({
        status: 'error',
        message: 'Station not found'
      });
    }
    
    // 예측 데이터 생성
    const predictions = generateCongestionPrediction(station_id, parseInt(duration_hours));
    
    // 캐시에 저장 (선택사항)
    predictions.forEach(pred => {
      db.run(
        'INSERT INTO prediction_cache (station_id, prediction_time, predicted_congestion, confidence) VALUES (?, ?, ?, ?)',
        [station_id, pred.time, pred.congestion, pred.confidence],
        (err) => {
          if (err) {
            console.error('Error caching prediction:', err.message);
          }
        }
      );
    });
    
    // 모델 정확도 계산 (시뮬레이션)
    const modelAccuracy = 0.85 + Math.random() * 0.1; // 85-95%
    
    res.json({
      status: 'success',
      data: {
        station_id: station_id,
        station_name: station.name,
        predictions: predictions,
        model_accuracy: Math.round(modelAccuracy * 100) / 100,
        prediction_params: {
          duration_hours: parseInt(duration_hours),
          generated_at: moment().toISOString()
        }
      }
    });
  });
});

/**
 * GET /api/prediction/trends
 * 예측 트렌드 분석
 */
router.get('/trends', (req, res) => {
  const { station_id, days = 7 } = req.query;
  
  if (!station_id) {
    return res.status(400).json({
      status: 'error',
      message: 'station_id is required'
    });
  }
  
  // 주간 패턴 분석 (시뮬레이션)
  const weeklyPattern = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (let day = 0; day < 7; day++) {
    const hourlyPattern = [];
    for (let hour = 0; hour < 24; hour++) {
      // 요일별, 시간대별 패턴 시뮬레이션
      let baseCongestion;
      if (day === 0 || day === 6) { // 주말
        baseCongestion = hour < 10 ? 20 + Math.random() * 20 : 
                        hour < 18 ? 40 + Math.random() * 30 : 
                        30 + Math.random() * 25;
      } else { // 평일
        baseCongestion = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 
                        70 + Math.random() * 25 : 
                        30 + Math.random() * 30;
      }
      
      hourlyPattern.push({
        hour: hour,
        avg_congestion: Math.round(Math.max(5, Math.min(95, baseCongestion))),
        confidence: 0.8 + Math.random() * 0.15
      });
    }
    
    weeklyPattern.push({
      day_of_week: day,
      day_name: daysOfWeek[day],
      hourly_pattern: hourlyPattern
    });
  }
  
  // 특별 이벤트 예측
  const upcomingEvents = [
    {
      date: moment().add(2, 'days').format('YYYY-MM-DD'),
      event: '콘서트',
      impact_level: 'high',
      affected_hours: [18, 19, 20, 21, 22],
      expected_increase: '40-60%'
    },
    {
      date: moment().add(5, 'days').format('YYYY-MM-DD'),
      event: '지하철 점검',
      impact_level: 'medium',
      affected_hours: [23, 0, 1, 2, 3, 4, 5],
      expected_increase: '20-30%'
    }
  ];
  
  res.json({
    status: 'success',
    data: {
      station_id: station_id,
      weekly_pattern: weeklyPattern,
      upcoming_events: upcomingEvents,
      analysis_period: {
        days: parseInt(days),
        from: moment().subtract(days, 'days').format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD')
      }
    }
  });
});

/**
 * GET /api/prediction/accuracy
 * 예측 모델 정확도 통계
 */
router.get('/accuracy', (req, res) => {
  const { station_id, period = '30d' } = req.query;
  
  // 모델 성능 시뮬레이션
  const accuracyStats = {
    overall_accuracy: 0.87 + Math.random() * 0.08, // 87-95%
    by_time_range: {
      '1_hour': 0.92 + Math.random() * 0.05,
      '2_hours': 0.88 + Math.random() * 0.05,
      '3_hours': 0.84 + Math.random() * 0.05,
      '6_hours': 0.79 + Math.random() * 0.05
    },
    by_congestion_level: {
      'low': 0.91 + Math.random() * 0.05,
      'medium': 0.86 + Math.random() * 0.05,
      'heavy': 0.83 + Math.random() * 0.05
    },
    by_day_type: {
      'weekday': 0.89 + Math.random() * 0.05,
      'weekend': 0.85 + Math.random() * 0.05,
      'holiday': 0.78 + Math.random() * 0.05
    }
  };
  
  // 정확도를 백분율로 변환
  Object.keys(accuracyStats.by_time_range).forEach(key => {
    accuracyStats.by_time_range[key] = Math.round(accuracyStats.by_time_range[key] * 100) / 100;
  });
  
  Object.keys(accuracyStats.by_congestion_level).forEach(key => {
    accuracyStats.by_congestion_level[key] = Math.round(accuracyStats.by_congestion_level[key] * 100) / 100;
  });
  
  Object.keys(accuracyStats.by_day_type).forEach(key => {
    accuracyStats.by_day_type[key] = Math.round(accuracyStats.by_day_type[key] * 100) / 100;
  });
  
  accuracyStats.overall_accuracy = Math.round(accuracyStats.overall_accuracy * 100) / 100;
  
  res.json({
    status: 'success',
    data: {
      station_id: station_id || 'all',
      accuracy_stats: accuracyStats,
      model_info: {
        model_type: 'LSTM + Random Forest Ensemble',
        last_trained: moment().subtract(7, 'days').toISOString(),
        training_data_size: '2.5M records',
        features_used: [
          'historical_congestion',
          'time_of_day',
          'day_of_week',
          'weather',
          'events',
          'holiday_flag'
        ]
      },
      evaluation_period: period
    }
  });
});

module.exports = router;