const express = require('express');
const router = express.Router();
const db = require('../database/init');
const { generateRealtimeCongestion, generateVehicleCongestion, STATION_CHARACTERISTICS } = require('../utils/mockData');
const moment = require('moment');

/**
 * GET /api/congestion/realtime
 * 실시간 혼잡도 조회
 */
router.get('/realtime', (req, res) => {
  const { station_id, line_id, direction, vehicle_type } = req.query;
  
  if (!station_id) {
    return res.status(400).json({
      status: 'error',
      message: 'station_id is required'
    });
  }
  
  // 역 정보 먼저 확인
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
    
    // 실시간 혼잡도 생성
    const realtimeData = generateRealtimeCongestion(station_id);
    const vehicles = generateVehicleCongestion(station_id);
    
    // 혼잡도 레벨 결정
    let congestionLevel;
    if (realtimeData.congestion_level <= 30) {
      congestionLevel = 'low';
    } else if (realtimeData.congestion_level <= 70) {
      congestionLevel = 'medium';
    } else {
      congestionLevel = 'heavy';
    }
    
    // 데이터베이스에 저장 (선택사항)
    db.run(
      'INSERT INTO congestion_data (station_id, vehicle_id, congestion_level, passenger_count, data_source) VALUES (?, ?, ?, ?, ?)',
      [station_id, realtimeData.vehicle_id, realtimeData.congestion_level, realtimeData.passenger_count, 'simulated'],
      (err) => {
        if (err) {
          console.error('Error saving congestion data:', err.message);
        }
      }
    );
    
    res.json({
      status: 'success',
      data: {
        station_id: station_id,
        station_name: station.name,
        line_id: station.line_id,
        current_congestion: realtimeData.congestion_level,
        congestion_level: congestionLevel,
        passenger_count: realtimeData.passenger_count,
        vehicles: vehicles,
        updated_at: realtimeData.timestamp,
        data_source: 'simulated'
      }
    });
  });
});

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

module.exports = router;