const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 데이터 디렉토리 확인 및 생성
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'smarttransit.db');

// 데이터베이스 연결
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('📄 Connected to SQLite database:', DB_PATH);
    initializeTables();
  }
});

// 테이블 초기화
function initializeTables() {
  // 지하철 역/버스 정류장 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS stations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      line_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      station_type TEXT NOT NULL CHECK (station_type IN ('subway', 'bus'))
    )
  `);

  // 실시간 혼잡도 데이터 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS congestion_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL,
      vehicle_id TEXT,
      congestion_level INTEGER NOT NULL CHECK (congestion_level BETWEEN 0 AND 100),
      passenger_count INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_source TEXT NOT NULL,
      FOREIGN KEY (station_id) REFERENCES stations (id)
    )
  `);

  // 사용자 패턴 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS user_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      origin_station_id TEXT NOT NULL,
      destination_station_id TEXT NOT NULL,
      typical_departure_time TEXT,
      frequency INTEGER DEFAULT 1,
      day_of_week TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (origin_station_id) REFERENCES stations (id),
      FOREIGN KEY (destination_station_id) REFERENCES stations (id)
    )
  `);

  // 예측 데이터 캐시 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS prediction_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL,
      prediction_time DATETIME NOT NULL,
      predicted_congestion INTEGER NOT NULL,
      confidence REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES stations (id)
    )
  `);

  console.log('✅ Database tables initialized');
  
  // 초기 데이터 삽입
  insertSampleData();
}

// 샘플 데이터 삽입
function insertSampleData() {
  // 서울 지하철 2호선 주요 역 데이터
  const sampleStations = [
    { id: '239', name: '강남역', line_id: '2', lat: 37.4979, lng: 127.0276, type: 'subway' },
    { id: '240', name: '역삼역', line_id: '2', lat: 37.5000, lng: 127.0364, type: 'subway' },
    { id: '238', name: '서초역', line_id: '2', lat: 37.4837, lng: 127.0057, type: 'subway' },
    { id: '241', name: '선릉역', line_id: '2', lat: 37.5044, lng: 127.0490, type: 'subway' },
    { id: '242', name: '삼성역', line_id: '2', lat: 37.5087, lng: 127.0633, type: 'subway' },
    { id: '252', name: '홍대입구역', line_id: '2', lat: 37.5565, lng: 126.9240, type: 'subway' },
    { id: '211', name: '건대입구역', line_id: '2', lat: 37.5405, lng: 127.0700, type: 'subway' },
    { id: '216', name: '잠실역', line_id: '2', lat: 37.5133, lng: 127.1000, type: 'subway' }
  ];

  // 역 데이터 삽입 (중복 체크)
  sampleStations.forEach(station => {
    db.get('SELECT id FROM stations WHERE id = ?', [station.id], (err, row) => {
      if (!row) {
        db.run(
          'INSERT INTO stations (id, name, line_id, latitude, longitude, station_type) VALUES (?, ?, ?, ?, ?, ?)',
          [station.id, station.name, station.line_id, station.lat, station.lng, station.type],
          (err) => {
            if (err) {
              console.error('Error inserting station:', err.message);
            }
          }
        );
      }
    });
  });

  console.log('✅ Sample station data inserted');
}

module.exports = db;