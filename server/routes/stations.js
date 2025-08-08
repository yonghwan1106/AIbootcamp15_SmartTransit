const express = require('express');
const router = express.Router();
const db = require('../database/init');

/**
 * GET /api/stations
 * 모든 역/정류장 정보 조회
 */
router.get('/', (req, res) => {
  const { line_id, station_type } = req.query;
  
  let query = 'SELECT * FROM stations';
  let params = [];
  
  if (line_id || station_type) {
    query += ' WHERE ';
    const conditions = [];
    
    if (line_id) {
      conditions.push('line_id = ?');
      params.push(line_id);
    }
    
    if (station_type) {
      conditions.push('station_type = ?');
      params.push(station_type);
    }
    
    query += conditions.join(' AND ');
  }
  
  query += ' ORDER BY name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching stations:', err.message);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        stations: rows,
        total: rows.length
      }
    });
  });
});

/**
 * GET /api/stations/:id
 * 특정 역/정류장 정보 조회
 */
router.get('/:id', (req, res) => {
  const stationId = req.params.id;
  
  db.get('SELECT * FROM stations WHERE id = ?', [stationId], (err, row) => {
    if (err) {
      console.error('Error fetching station:', err.message);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
    
    if (!row) {
      return res.status(404).json({
        status: 'error',
        message: 'Station not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        station: row
      }
    });
  });
});

/**
 * GET /api/stations/nearby
 * 근처 역/정류장 검색 (위치 기반)
 */
router.get('/nearby', (req, res) => {
  const { lat, lng, radius = 1000 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({
      status: 'error',
      message: 'Latitude and longitude are required'
    });
  }
  
  // 간단한 거리 계산 (실제로는 더 정교한 계산 필요)
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
    HAVING distance <= ?
    ORDER BY distance
    LIMIT 10
  `;
  
  db.all(query, [lat, lng, lat, radius], (err, rows) => {
    if (err) {
      console.error('Error fetching nearby stations:', err.message);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        stations: rows,
        search_params: {
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius: parseInt(radius)
        }
      }
    });
  });
});

module.exports = router;