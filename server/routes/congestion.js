const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { generateRealtimeCongestion, generateVehicleCongestion, STATION_CHARACTERISTICS } = require('../utils/mockData');
const moment = require('moment');
const seoulMetroApi = require('../services/seoulMetroApi');

/**
 * GET /api/congestion/realtime
 * 실시간 혼잡도 조회 - 서울시 실제 API 연동
 */
router.get('/realtime', async (req, res) => {
  const { station_id, line_id, direction, vehicle_type, use_real_api } = req.query;
  
  if (!station_id) {
    return res.status(400).json({
      status: 'error',
      message: 'station_id is required'
    });
  }
  
  try {
    // 역 정보 먼저 확인
    const station = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM stations WHERE id = ?', [station_id], (err, station) => {
        if (err) reject(err);
        else resolve(station);
      });
    });
    
    if (!station) {
      return res.status(404).json({
        status: 'error',
        message: 'Station not found'
      });
    }

    let responseData;

    // use_real_api 파라미터가 true이면 실제 서울시 API 사용
    if (use_real_api === 'true') {
      try {
        // 역명에서 '역' 제거 (서울시 API는 역명만 사용)
        const stationName = station.name.replace('역', '');
        const realApiData = await seoulMetroApi.getRealtimeArrival(stationName);
        
        if (realApiData && realApiData.trains && realApiData.trains.length > 0) {
          // 서울시 API 데이터를 우리 형식으로 변환
          const avgCongestion = Math.round(
            realApiData.trains.reduce((sum, train) => sum + train.congestion, 0) / 
            realApiData.trains.length
          );
          
          const vehicles = realApiData.trains.map((train, index) => ({
            vehicle_id: `${station.id}_${train.line}_${index}`,
            congestion: train.congestion,
            arrival_time: train.arrivalMsg,
            car_positions: Array.from({length: 6}, () => 
              Math.max(30, Math.min(100, train.congestion + (Math.random() - 0.5) * 20))
            ),
            direction: train.direction,
            destination: train.destination,
            train_type: train.trainType
          }));

          responseData = {
            station_id: station_id,
            station_name: station.name,
            line_id: station.line_id,
            current_congestion: avgCongestion,
            congestion_level: avgCongestion <= 30 ? 'low' : 
                            avgCongestion <= 70 ? 'medium' : 'heavy',
            passenger_count: Math.round(avgCongestion * 15), // 추정 승객 수
            vehicles: vehicles,
            updated_at: realApiData.lastUpdate,
            data_source: realApiData.dataSource,
            api_info: {
              station_searched: stationName,
              trains_found: realApiData.trains.length,
              last_update: realApiData.lastUpdate
            }
          };

          // 실제 데이터 DB 저장
          db.run(
            'INSERT INTO congestion_data (station_id, vehicle_id, congestion_level, passenger_count, data_source) VALUES (?, ?, ?, ?, ?)',
            [station_id, `real_${Date.now()}`, avgCongestion, responseData.passenger_count, realApiData.dataSource],
            (err) => {
              if (err) {
                console.error('Error saving real API data:', err.message);
              }
            }
          );

        } else {
          // 실제 API 호출 실패 시 시뮬레이션 데이터로 fallback
          throw new Error('No real API data available');
        }
        
      } catch (apiError) {
        console.log(`Real API failed for ${station.name}, falling back to simulation:`, apiError.message);
        // fallback to simulation
        responseData = generateSimulationData(station_id, station);
      }
    } else {
      // 기본값: 시뮬레이션 데이터 사용
      responseData = generateSimulationData(station_id, station);
    }

    res.json({
      status: 'success',
      data: responseData
    });

  } catch (error) {
    console.error('Error in realtime congestion API:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

/**
 * 시뮬레이션 데이터 생성 함수
 * @param {string} station_id - 역 ID
 * @param {Object} station - 역 정보
 * @returns {Object} 시뮬레이션 데이터
 */
function generateSimulationData(station_id, station) {
  const realtimeData = generateRealtimeCongestion(station_id);
  const vehicles = generateVehicleCongestion(station_id);
  
  const congestionLevel = realtimeData.congestion_level <= 30 ? 'low' : 
                         realtimeData.congestion_level <= 70 ? 'medium' : 'heavy';
  
  // 데이터베이스에 저장
  db.run(
    'INSERT INTO congestion_data (station_id, vehicle_id, congestion_level, passenger_count, data_source) VALUES (?, ?, ?, ?, ?)',
    [station_id, realtimeData.vehicle_id, realtimeData.congestion_level, realtimeData.passenger_count, 'simulated'],
    (err) => {
      if (err) {
        console.error('Error saving congestion data:', err.message);
      }
    }
  );
  
  return {
    station_id: station_id,
    station_name: station.name,
    line_id: station.line_id,
    current_congestion: realtimeData.congestion_level,
    congestion_level: congestionLevel,
    passenger_count: realtimeData.passenger_count,
    vehicles: vehicles,
    updated_at: realtimeData.timestamp,
    data_source: 'simulated'
  };
}

/**
 * GET /api/congestion/history
 * 혼잡도 이력 조회
 */
router.get('/history', (req, res) => {
  const { station_id, hours = 24 } = req.query;
  
  if (!station_id) {
    return res.status(400).json({
      status: 'error',
      message: 'station_id is required'
    });
  }
  
  const hoursAgo = moment().subtract(hours, 'hours').toISOString();
  
  const query = `
    SELECT 
      congestion_level,
      passenger_count,
      timestamp,
      data_source
    FROM congestion_data 
    WHERE station_id = ? 
      AND timestamp >= ? 
    ORDER BY timestamp DESC
    LIMIT 100
  `;
  
  db.all(query, [station_id, hoursAgo], (err, rows) => {
    if (err) {
      console.error('Error fetching congestion history:', err.message);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
    
    // 시간대별 평균 계산
    const hourlyAverage = {};
    rows.forEach(row => {
      const hour = moment(row.timestamp).format('HH:00');
      if (!hourlyAverage[hour]) {
        hourlyAverage[hour] = { total: 0, count: 0 };
      }
      hourlyAverage[hour].total += row.congestion_level;
      hourlyAverage[hour].count += 1;
    });
    
    const hourlyData = Object.keys(hourlyAverage).map(hour => ({
      time: hour,
      avg_congestion: Math.round(hourlyAverage[hour].total / hourlyAverage[hour].count),
      data_points: hourlyAverage[hour].count
    })).sort();
    
    res.json({
      status: 'success',
      data: {
        station_id: station_id,
        history: rows,
        hourly_average: hourlyData,
        query_params: {
          hours: parseInt(hours),
          from: hoursAgo
        }
      }
    });
  });
});

/**
 * GET /api/congestion/overview
 * 전체 노선 혼잡도 개요
 */
router.get('/overview', (req, res) => {
  const { line_id } = req.query;
  
  // 모든 역에 대한 현재 혼잡도 생성
  let query = 'SELECT id, name, line_id FROM stations';
  let params = [];
  
  if (line_id) {
    query += ' WHERE line_id = ?';
    params.push(line_id);
  }
  
  query += ' ORDER BY name';
  
  db.all(query, params, (err, stations) => {
    if (err) {
      console.error('Error fetching stations for overview:', err.message);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
    
    const stationOverview = stations.map(station => {
      const realtimeData = generateRealtimeCongestion(station.id);
      const stationChar = STATION_CHARACTERISTICS[station.id] || {};
      
      return {
        station_id: station.id,
        station_name: station.name,
        line_id: station.line_id,
        current_congestion: realtimeData.congestion_level,
        congestion_level: realtimeData.congestion_level <= 30 ? 'low' : 
                         realtimeData.congestion_level <= 70 ? 'medium' : 'heavy',
        characteristics: stationChar,
        updated_at: realtimeData.timestamp
      };
    });
    
    // 노선별 통계
    const lineStats = {};
    stationOverview.forEach(station => {
      if (!lineStats[station.line_id]) {
        lineStats[station.line_id] = {
          line_id: station.line_id,
          station_count: 0,
          avg_congestion: 0,
          max_congestion: 0,
          min_congestion: 100
        };
      }
      
      const stat = lineStats[station.line_id];
      stat.station_count += 1;
      stat.avg_congestion += station.current_congestion;
      stat.max_congestion = Math.max(stat.max_congestion, station.current_congestion);
      stat.min_congestion = Math.min(stat.min_congestion, station.current_congestion);
    });
    
    Object.values(lineStats).forEach(stat => {
      stat.avg_congestion = Math.round(stat.avg_congestion / stat.station_count);
    });
    
    res.json({
      status: 'success',
      data: {
        stations: stationOverview,
        line_statistics: Object.values(lineStats),
        updated_at: moment().toISOString()
      }
    });
  });
});

/**
 * GET /api/congestion/seoul-metro-test
 * 서울시 지하철 실시간 API 직접 테스트
 */
router.get('/seoul-metro-test', async (req, res) => {
  const { station_name = '강남' } = req.query;
  
  try {
    console.log(`Testing Seoul Metro API for station: ${station_name}`);
    const apiData = await seoulMetroApi.getRealtimeArrival(station_name);
    
    res.json({
      status: 'success',
      data: {
        requested_station: station_name,
        api_response: apiData,
        supported_stations: seoulMetroApi.getSupportedStations(),
        cache_info: {
          cache_timeout: '30 seconds',
          data_source: apiData ? apiData.dataSource : 'unknown'
        }
      }
    });
    
  } catch (error) {
    console.error('Seoul Metro API test error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      supported_stations: seoulMetroApi.getSupportedStations()
    });
  }
});

/**
 * POST /api/congestion/clear-cache
 * API 캐시 정리
 */
router.post('/clear-cache', (req, res) => {
  try {
    seoulMetroApi.clearCache();
    res.json({
      status: 'success',
      message: 'API cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cache'
    });
  }
});

module.exports = router;