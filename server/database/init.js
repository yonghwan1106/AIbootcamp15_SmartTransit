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
  // 서울 지하철 주요 역 데이터 (1호선~9호선 포함)
  const sampleStations = [
    // 1호선
    { id: '101', name: '서울역', line_id: '1', lat: 37.5544, lng: 126.9706, type: 'subway' },
    { id: '102', name: '시청역', line_id: '1', lat: 37.5658, lng: 126.9778, type: 'subway' },
    { id: '103', name: '종각역', line_id: '1', lat: 37.5695, lng: 126.9827, type: 'subway' },
    { id: '104', name: '종로3가역', line_id: '1', lat: 37.5709, lng: 126.9910, type: 'subway' },
    { id: '105', name: '동대문역', line_id: '1', lat: 37.5714, lng: 127.0098, type: 'subway' },
    { id: '106', name: '신설동역', line_id: '1', lat: 37.5752, lng: 127.0256, type: 'subway' },
    
    // 2호선
    { id: '201', name: '을지로입구역', line_id: '2', lat: 37.5663, lng: 126.9824, type: 'subway' },
    { id: '202', name: '을지로3가역', line_id: '2', lat: 37.5663, lng: 126.9915, type: 'subway' },
    { id: '203', name: '동대문역사문화공원역', line_id: '2', lat: 37.5657, lng: 127.0079, type: 'subway' },
    { id: '204', name: '신당역', line_id: '2', lat: 37.5662, lng: 127.0179, type: 'subway' },
    { id: '205', name: '상왕십리역', line_id: '2', lat: 37.5619, lng: 127.0287, type: 'subway' },
    { id: '206', name: '왕십리역', line_id: '2', lat: 37.5612, lng: 127.0371, type: 'subway' },
    { id: '207', name: '한양대역', line_id: '2', lat: 37.5558, lng: 127.0444, type: 'subway' },
    { id: '208', name: '뚝섬역', line_id: '2', lat: 37.5477, lng: 127.0470, type: 'subway' },
    { id: '209', name: '성수역', line_id: '2', lat: 37.5445, lng: 127.0557, type: 'subway' },
    { id: '210', name: '용답역', line_id: '2', lat: 37.5603, lng: 127.0551, type: 'subway' },
    { id: '211', name: '건대입구역', line_id: '2', lat: 37.5405, lng: 127.0700, type: 'subway' },
    { id: '212', name: '구의역', line_id: '2', lat: 37.5368, lng: 127.0852, type: 'subway' },
    { id: '213', name: '강변역', line_id: '2', lat: 37.5349, lng: 127.0944, type: 'subway' },
    { id: '214', name: '잠실나루역', line_id: '2', lat: 37.5200, lng: 127.1005, type: 'subway' },
    { id: '215', name: '잠실역', line_id: '2', lat: 37.5133, lng: 127.1000, type: 'subway' },
    { id: '216', name: '잠실새내역', line_id: '2', lat: 37.5115, lng: 127.0859, type: 'subway' },
    { id: '217', name: '종합운동장역', line_id: '2', lat: 37.5105, lng: 127.0735, type: 'subway' },
    { id: '218', name: '삼성역', line_id: '2', lat: 37.5087, lng: 127.0633, type: 'subway' },
    { id: '219', name: '선릉역', line_id: '2', lat: 37.5044, lng: 127.0490, type: 'subway' },
    { id: '220', name: '역삼역', line_id: '2', lat: 37.5000, lng: 127.0364, type: 'subway' },
    { id: '221', name: '강남역', line_id: '2', lat: 37.4979, lng: 127.0276, type: 'subway' },
    { id: '222', name: '교대역', line_id: '2', lat: 37.4937, lng: 127.0146, type: 'subway' },
    { id: '223', name: '서초역', line_id: '2', lat: 37.4837, lng: 127.0057, type: 'subway' },
    { id: '224', name: '방배역', line_id: '2', lat: 37.4813, lng: 126.9976, type: 'subway' },
    { id: '225', name: '사당역', line_id: '2', lat: 37.4767, lng: 126.9813, type: 'subway' },
    { id: '252', name: '홍대입구역', line_id: '2', lat: 37.5565, lng: 126.9240, type: 'subway' },
    { id: '253', name: '신촌역', line_id: '2', lat: 37.5556, lng: 126.9364, type: 'subway' },
    { id: '254', name: '이대역', line_id: '2', lat: 37.5562, lng: 126.9461, type: 'subway' },
    { id: '255', name: '아현역', line_id: '2', lat: 37.5582, lng: 126.9563, type: 'subway' },
    
    // 3호선
    { id: '301', name: '종로3가역', line_id: '3', lat: 37.5709, lng: 126.9910, type: 'subway' },
    { id: '302', name: '안국역', line_id: '3', lat: 37.5760, lng: 126.9855, type: 'subway' },
    { id: '303', name: '경복궁역', line_id: '3', lat: 37.5759, lng: 126.9731, type: 'subway' },
    { id: '304', name: '독립문역', line_id: '3', lat: 37.5741, lng: 126.9563, type: 'subway' },
    { id: '305', name: '무악재역', line_id: '3', lat: 37.5820, lng: 126.9531, type: 'subway' },
    { id: '306', name: '홍제역', line_id: '3', lat: 37.5895, lng: 126.9497, type: 'subway' },
    { id: '307', name: '불광역', line_id: '3', lat: 37.6108, lng: 126.9298, type: 'subway' },
    { id: '308', name: '연신내역', line_id: '3', lat: 37.6188, lng: 126.9213, type: 'subway' },
    { id: '309', name: '구파발역', line_id: '3', lat: 37.6366, lng: 126.9164, type: 'subway' },
    { id: '320', name: '충무로역', line_id: '3', lat: 37.5637, lng: 126.9944, type: 'subway' },
    { id: '321', name: '동대입구역', line_id: '3', lat: 37.5582, lng: 126.9999, type: 'subway' },
    { id: '322', name: '약수역', line_id: '3', lat: 37.5544, lng: 127.0100, type: 'subway' },
    { id: '323', name: '금고개역', line_id: '3', lat: 37.5488, lng: 127.0148, type: 'subway' },
    { id: '324', name: '옥수역', line_id: '3', lat: 37.5401, lng: 127.0186, type: 'subway' },
    { id: '325', name: '압구정역', line_id: '3', lat: 37.5272, lng: 127.0282, type: 'subway' },
    { id: '326', name: '신사역', line_id: '3', lat: 37.5165, lng: 127.0204, type: 'subway' },
    { id: '327', name: '잠원역', line_id: '3', lat: 37.5115, lng: 127.0111, type: 'subway' },
    { id: '328', name: '고속터미널역', line_id: '3', lat: 37.5051, lng: 127.0046, type: 'subway' },
    { id: '329', name: '교대역', line_id: '3', lat: 37.4937, lng: 127.0146, type: 'subway' },
    { id: '330', name: '남부터미널역', line_id: '3', lat: 37.4766, lng: 127.0064, type: 'subway' },
    
    // 4호선 
    { id: '401', name: '수유역', line_id: '4', lat: 37.6377, lng: 127.0254, type: 'subway' },
    { id: '402', name: '미아역', line_id: '4', lat: 37.6133, lng: 127.0301, type: 'subway' },
    { id: '403', name: '미아사거리역', line_id: '4', lat: 37.6136, lng: 127.0297, type: 'subway' },
    { id: '404', name: '길음역', line_id: '4', lat: 37.6016, lng: 127.0254, type: 'subway' },
    { id: '405', name: '성신여대입구역', line_id: '4', lat: 37.5927, lng: 127.0164, type: 'subway' },
    { id: '406', name: '한성대입구역', line_id: '4', lat: 37.5888, lng: 127.0064, type: 'subway' },
    { id: '407', name: '혜화역', line_id: '4', lat: 37.5823, lng: 127.0016, type: 'subway' },
    { id: '408', name: '동대문역', line_id: '4', lat: 37.5714, lng: 127.0098, type: 'subway' },
    { id: '409', name: '동대문역사문화공원역', line_id: '4', lat: 37.5657, lng: 127.0079, type: 'subway' },
    { id: '410', name: '충무로역', line_id: '4', lat: 37.5637, lng: 126.9944, type: 'subway' },
    { id: '411', name: '명동역', line_id: '4', lat: 37.5636, lng: 126.9836, type: 'subway' },
    { id: '412', name: '회현역', line_id: '4', lat: 37.5590, lng: 126.9780, type: 'subway' },
    { id: '413', name: '서울역', line_id: '4', lat: 37.5544, lng: 126.9706, type: 'subway' },
    { id: '414', name: '삼각지역', line_id: '4', lat: 37.5347, lng: 126.9734, type: 'subway' },
    { id: '415', name: '신용산역', line_id: '4', lat: 37.5299, lng: 126.9646, type: 'subway' },
    { id: '416', name: '이촌역', line_id: '4', lat: 37.5219, lng: 126.9745, type: 'subway' },
    { id: '417', name: '동작역', line_id: '4', lat: 37.5029, lng: 126.9787, type: 'subway' },
    { id: '418', name: '총신대입구역', line_id: '4', lat: 37.4864, lng: 126.9825, type: 'subway' },
    { id: '419', name: '사당역', line_id: '4', lat: 37.4767, lng: 126.9813, type: 'subway' },
    
    // 5호선
    { id: '501', name: '김포공항역', line_id: '5', lat: 37.5629, lng: 126.8010, type: 'subway' },
    { id: '502', name: '송정역', line_id: '5', lat: 37.5491, lng: 126.8215, type: 'subway' },
    { id: '503', name: '마곡역', line_id: '5', lat: 37.5595, lng: 126.8252, type: 'subway' },
    { id: '504', name: '발산역', line_id: '5', lat: 37.5587, lng: 126.8374, type: 'subway' },
    { id: '505', name: '우장산역', line_id: '5', lat: 37.5484, lng: 126.8372, type: 'subway' },
    { id: '506', name: '화곡역', line_id: '5', lat: 37.5407, lng: 126.8405, type: 'subway' },
    { id: '507', name: '까치산역', line_id: '5', lat: 37.5307, lng: 126.8465, type: 'subway' },
    { id: '508', name: '신정역', line_id: '5', lat: 37.5247, lng: 126.8562, type: 'subway' },
    { id: '509', name: '목동역', line_id: '5', lat: 37.5265, lng: 126.8649, type: 'subway' },
    { id: '510', name: '오목교역', line_id: '5', lat: 37.5242, lng: 126.8754, type: 'subway' },
    { id: '511', name: '양평역', line_id: '5', lat: 37.5342, lng: 126.8901, type: 'subway' },
    { id: '512', name: '영등포구청역', line_id: '5', lat: 37.5254, lng: 126.8976, type: 'subway' },
    { id: '513', name: '여의도역', line_id: '5', lat: 37.5219, lng: 126.9242, type: 'subway' },
    { id: '514', name: '여의나루역', line_id: '5', lat: 37.5275, lng: 126.9343, type: 'subway' },
    { id: '515', name: '마포역', line_id: '5', lat: 37.5390, lng: 126.9459, type: 'subway' },
    { id: '516', name: '공덕역', line_id: '5', lat: 37.5441, lng: 126.9514, type: 'subway' },
    { id: '517', name: '애오개역', line_id: '5', lat: 37.5515, lng: 126.9566, type: 'subway' },
    { id: '518', name: '충정로역', line_id: '5', lat: 37.5599, lng: 126.9632, type: 'subway' },
    { id: '519', name: '서대문역', line_id: '5', lat: 37.5663, lng: 126.9668, type: 'subway' },
    { id: '520', name: '광화문역', line_id: '5', lat: 37.5717, lng: 126.9761, type: 'subway' },
    { id: '521', name: '종로3가역', line_id: '5', lat: 37.5709, lng: 126.9910, type: 'subway' },
    { id: '522', name: '을지로4가역', line_id: '5', lat: 37.5661, lng: 126.9989, type: 'subway' },
    { id: '523', name: '동대문역사문화공원역', line_id: '5', lat: 37.5657, lng: 127.0079, type: 'subway' },
    { id: '524', name: '청구역', line_id: '5', lat: 37.5604, lng: 127.0147, type: 'subway' },
    { id: '525', name: '왕십리역', line_id: '5', lat: 37.5612, lng: 127.0371, type: 'subway' },
    { id: '526', name: '마장역', line_id: '5', lat: 37.5663, lng: 127.0443, type: 'subway' },
    { id: '527', name: '답십리역', line_id: '5', lat: 37.5662, lng: 127.0553, type: 'subway' },
    { id: '528', name: '장한평역', line_id: '5', lat: 37.5613, lng: 127.0647, type: 'subway' },
    { id: '529', name: '군자역', line_id: '5', lat: 37.5578, lng: 127.0794, type: 'subway' },
    { id: '530', name: '아차산역', line_id: '5', lat: 37.5482, lng: 127.0918, type: 'subway' },
    { id: '531', name: '광나루역', line_id: '5', lat: 37.5453, lng: 127.1077, type: 'subway' },
    { id: '532', name: '천호역', line_id: '5', lat: 37.5383, lng: 127.1239, type: 'subway' },
    { id: '533', name: '강동역', line_id: '5', lat: 37.5272, lng: 127.1262, type: 'subway' },
    
    // 6호선
    { id: '601', name: '봉화산역', line_id: '6', lat: 37.6958, lng: 127.1257, type: 'subway' },
    { id: '602', name: '화랑대역', line_id: '6', lat: 37.6354, lng: 127.0780, type: 'subway' },
    { id: '603', name: '태릉입구역', line_id: '6', lat: 37.6171, lng: 127.0751, type: 'subway' },
    { id: '604', name: '석계역', line_id: '6', lat: 37.6065, lng: 127.0658, type: 'subway' },
    { id: '605', name: '돌곶이역', line_id: '6', lat: 37.5951, lng: 127.0566, type: 'subway' },
    { id: '606', name: '상월곡역', line_id: '6', lat: 37.5898, lng: 127.0474, type: 'subway' },
    { id: '607', name: '월곡역', line_id: '6', lat: 37.5860, lng: 127.0423, type: 'subway' },
    { id: '608', name: '고려대역', line_id: '6', lat: 37.5849, lng: 127.0333, type: 'subway' },
    { id: '609', name: '안암역', line_id: '6', lat: 37.5851, lng: 127.0283, type: 'subway' },
    { id: '610', name: '보문역', line_id: '6', lat: 37.5889, lng: 127.0184, type: 'subway' },
    { id: '611', name: '창신역', line_id: '6', lat: 37.5879, lng: 127.0108, type: 'subway' },
    { id: '612', name: '동묘앞역', line_id: '6', lat: 37.5719, lng: 127.0157, type: 'subway' },
    { id: '613', name: '신당역', line_id: '6', lat: 37.5662, lng: 127.0179, type: 'subway' },
    { id: '614', name: '청구역', line_id: '6', lat: 37.5604, lng: 127.0147, type: 'subway' },
    { id: '615', name: '약수역', line_id: '6', lat: 37.5544, lng: 127.0100, type: 'subway' },
    { id: '616', name: '버티고개역', line_id: '6', lat: 37.5492, lng: 127.0053, type: 'subway' },
    { id: '617', name: '한강진역', line_id: '6', lat: 37.5382, lng: 126.9968, type: 'subway' },
    { id: '618', name: '이태원역', line_id: '6', lat: 37.5346, lng: 126.9946, type: 'subway' },
    { id: '619', name: '녹사평역', line_id: '6', lat: 37.5340, lng: 126.9885, type: 'subway' },
    { id: '620', name: '삼각지역', line_id: '6', lat: 37.5347, lng: 126.9734, type: 'subway' },
    { id: '621', name: '효창공원앞역', line_id: '6', lat: 37.5393, lng: 126.9611, type: 'subway' },
    { id: '622', name: '공덕역', line_id: '6', lat: 37.5441, lng: 126.9514, type: 'subway' },
    { id: '623', name: '대흥역', line_id: '6', lat: 37.5531, lng: 126.9589, type: 'subway' },
    { id: '624', name: '광흥창역', line_id: '6', lat: 37.5595, lng: 126.9436, type: 'subway' },
    { id: '625', name: '상수역', line_id: '6', lat: 37.5476, lng: 126.9227, type: 'subway' },
    { id: '626', name: '합정역', line_id: '6', lat: 37.5497, lng: 126.9138, type: 'subway' },
    { id: '627', name: '망원역', line_id: '6', lat: 37.5555, lng: 126.9105, type: 'subway' },
    { id: '628', name: '마포구청역', line_id: '6', lat: 37.5638, lng: 126.9050, type: 'subway' },
    { id: '629', name: '월드컵경기장역', line_id: '6', lat: 37.5686, lng: 126.9002, type: 'subway' },
    { id: '630', name: '디지털미디어시티역', line_id: '6', lat: 37.5768, lng: 126.8959, type: 'subway' },
    
    // 7호선
    { id: '701', name: '장암역', line_id: '7', lat: 37.6444, lng: 127.1264, type: 'subway' },
    { id: '702', name: '도봉산역', line_id: '7', lat: 37.6896, lng: 127.0470, type: 'subway' },
    { id: '703', name: '수락산역', line_id: '7', lat: 37.6368, lng: 127.0772, type: 'subway' },
    { id: '704', name: '마들역', line_id: '7', lat: 37.6154, lng: 127.0587, type: 'subway' },
    { id: '705', name: '노원역', line_id: '7', lat: 37.6546, lng: 127.0615, type: 'subway' },
    { id: '706', name: '중계역', line_id: '7', lat: 37.6413, lng: 127.0749, type: 'subway' },
    { id: '707', name: '하계역', line_id: '7', lat: 37.6363, lng: 127.0666, type: 'subway' },
    { id: '708', name: '공릉역', line_id: '7', lat: 37.6254, lng: 127.0727, type: 'subway' },
    { id: '709', name: '태릉입구역', line_id: '7', lat: 37.6171, lng: 127.0751, type: 'subway' },
    { id: '710', name: '먹골역', line_id: '7', lat: 37.6166, lng: 127.0775, type: 'subway' },
    { id: '711', name: '중화역', line_id: '7', lat: 37.6008, lng: 127.0781, type: 'subway' },
    { id: '712', name: '상봉역', line_id: '7', lat: 37.5966, lng: 127.0852, type: 'subway' },
    { id: '713', name: '면목역', line_id: '7', lat: 37.5888, lng: 127.0899, type: 'subway' },
    { id: '714', name: '사가정역', line_id: '7', lat: 37.5828, lng: 127.0956, type: 'subway' },
    { id: '715', name: '용마산역', line_id: '7', lat: 37.5743, lng: 127.1012, type: 'subway' },
    { id: '716', name: '중곡역', line_id: '7', lat: 37.5656, lng: 127.0850, type: 'subway' },
    { id: '717', name: '군자역', line_id: '7', lat: 37.5578, lng: 127.0794, type: 'subway' },
    { id: '718', name: '어린이대공원역', line_id: '7', lat: 37.5486, lng: 127.0746, type: 'subway' },
    { id: '719', name: '건대입구역', line_id: '7', lat: 37.5405, lng: 127.0700, type: 'subway' },
    { id: '720', name: '뚝섬유원지역', line_id: '7', lat: 37.5304, lng: 127.0672, type: 'subway' },
    { id: '721', name: '청담역', line_id: '7', lat: 37.5196, lng: 127.0534, type: 'subway' },
    { id: '722', name: '강남구청역', line_id: '7', lat: 37.5175, lng: 127.0414, type: 'subway' },
    { id: '723', name: '학동역', line_id: '7', lat: 37.5142, lng: 127.0314, type: 'subway' },
    { id: '724', name: '논현역', line_id: '7', lat: 37.5106, lng: 127.0223, type: 'subway' },
    { id: '725', name: '반포역', line_id: '7', lat: 37.5050, lng: 127.0111, type: 'subway' },
    { id: '726', name: '고속터미널역', line_id: '7', lat: 37.5051, lng: 127.0046, type: 'subway' },
    { id: '727', name: '내방역', line_id: '7', lat: 37.4998, lng: 126.9966, type: 'subway' },
    { id: '728', name: '이수역', line_id: '7', lat: 37.4869, lng: 126.9819, type: 'subway' },
    { id: '729', name: '남성역', line_id: '7', lat: 37.4838, lng: 126.9728, type: 'subway' },
    { id: '730', name: '숭실대입구역', line_id: '7', lat: 37.4961, lng: 126.9571, type: 'subway' },
    { id: '731', name: '상도역', line_id: '7', lat: 37.5028, lng: 126.9490, type: 'subway' },
    { id: '732', name: '장승배기역', line_id: '7', lat: 37.4859, lng: 126.9353, type: 'subway' },
    { id: '733', name: '신대방삼거리역', line_id: '7', lat: 37.4878, lng: 126.9137, type: 'subway' },
    { id: '734', name: '보라매역', line_id: '7', lat: 37.4940, lng: 126.9255, type: 'subway' },
    { id: '735', name: '신풍역', line_id: '7', lat: 37.4887, lng: 126.9329, type: 'subway' },
    { id: '736', name: '대림역', line_id: '7', lat: 37.4930, lng: 126.8953, type: 'subway' },
    { id: '737', name: '남구로역', line_id: '7', lat: 37.4866, lng: 126.8871, type: 'subway' },
    { id: '738', name: '가산디지털단지역', line_id: '7', lat: 37.4817, lng: 126.8821, type: 'subway' },
    { id: '739', name: '철산역', line_id: '7', lat: 37.4806, lng: 126.8685, type: 'subway' },
    { id: '740', name: '광명사거리역', line_id: '7', lat: 37.4788, lng: 126.8661, type: 'subway' },
    { id: '741', name: '천왕역', line_id: '7', lat: 37.4764, lng: 126.8614, type: 'subway' },
    { id: '742', name: '온수역', line_id: '7', lat: 37.4915, lng: 126.8258, type: 'subway' },
    { id: '743', name: '까치울역', line_id: '7', lat: 37.4996, lng: 126.8461, type: 'subway' },
    { id: '744', name: '부천종합운동장역', line_id: '7', lat: 37.5101, lng: 126.8451, type: 'subway' },
    { id: '745', name: '춘의역', line_id: '7', lat: 37.5168, lng: 126.8483, type: 'subway' },
    { id: '746', name: '신중동역', line_id: '7', lat: 37.5205, lng: 126.8528, type: 'subway' },
    { id: '747', name: '부천시청역', line_id: '7', lat: 37.5089, lng: 126.8667, type: 'subway' },
    { id: '748', name: '상동역', line_id: '7', lat: 37.5015, lng: 126.8549, type: 'subway' },
    { id: '749', name: '삼산체육관역', line_id: '7', lat: 37.5015, lng: 126.8549, type: 'subway' },
    { id: '750', name: '굴포천역', line_id: '7', lat: 37.5032, lng: 126.8407, type: 'subway' },
    { id: '751', name: '부평구청역', line_id: '7', lat: 37.5078, lng: 126.7218, type: 'subway' },
    
    // 8호선
    { id: '801', name: '암사역', line_id: '8', lat: 37.5502, lng: 127.1281, type: 'subway' },
    { id: '802', name: '천호역', line_id: '8', lat: 37.5383, lng: 127.1239, type: 'subway' },
    { id: '803', name: '강동구청역', line_id: '8', lat: 37.5302, lng: 127.1260, type: 'subway' },
    { id: '804', name: '몽촌토성역', line_id: '8', lat: 37.5216, lng: 127.1253, type: 'subway' },
    { id: '805', name: '잠실역', line_id: '8', lat: 37.5133, lng: 127.1000, type: 'subway' },
    { id: '806', name: '석촌역', line_id: '8', lat: 37.5050, lng: 127.1058, type: 'subway' },
    { id: '807', name: '송파역', line_id: '8', lat: 37.5041, lng: 127.1122, type: 'subway' },
    { id: '808', name: '가락시장역', line_id: '8', lat: 37.4924, lng: 127.1184, type: 'subway' },
    { id: '809', name: '문정역', line_id: '8', lat: 37.4842, lng: 127.1222, type: 'subway' },
    { id: '810', name: '장지역', line_id: '8', lat: 37.4786, lng: 127.1262, type: 'subway' },
    { id: '811', name: '복정역', line_id: '8', lat: 37.4702, lng: 127.1257, type: 'subway' },
    { id: '812', name: '산성역', line_id: '8', lat: 37.4432, lng: 127.1378, type: 'subway' },
    { id: '813', name: '남한산성입구역', line_id: '8', lat: 37.4434, lng: 127.1455, type: 'subway' },
    { id: '814', name: '단대오거리역', line_id: '8', lat: 37.4434, lng: 127.1299, type: 'subway' },
    { id: '815', name: '신흥역', line_id: '8', lat: 37.4410, lng: 127.1244, type: 'subway' },
    { id: '816', name: '수진역', line_id: '8', lat: 37.4343, lng: 127.1372, type: 'subway' },
    { id: '817', name: '모란역', line_id: '8', lat: 37.4293, lng: 127.1294, type: 'subway' },
    
    // 9호선
    { id: '901', name: '개화역', line_id: '9', lat: 37.5578, lng: 126.7946, type: 'subway' },
    { id: '902', name: '김포공항역', line_id: '9', lat: 37.5629, lng: 126.8010, type: 'subway' },
    { id: '903', name: '공항시장역', line_id: '9', lat: 37.5632, lng: 126.8120, type: 'subway' },
    { id: '904', name: '신방화역', line_id: '9', lat: 37.5583, lng: 126.8137, type: 'subway' },
    { id: '905', name: '마곡나루역', line_id: '9', lat: 37.5656, lng: 126.8248, type: 'subway' },
    { id: '906', name: '양천향교역', line_id: '9', lat: 37.5519, lng: 126.8333, type: 'subway' },
    { id: '907', name: '가양역', line_id: '9', lat: 37.5616, lng: 126.8548, type: 'subway' },
    { id: '908', name: '증미역', line_id: '9', lat: 37.5680, lng: 126.8636, type: 'subway' },
    { id: '909', name: '등촌역', line_id: '9', lat: 37.5506, lng: 126.8718, type: 'subway' },
    { id: '910', name: '염창역', line_id: '9', lat: 37.5485, lng: 126.8751, type: 'subway' },
    { id: '911', name: '신목동역', line_id: '9', lat: 37.5260, lng: 126.8751, type: 'subway' },
    { id: '912', name: '선유도역', line_id: '9', lat: 37.5345, lng: 126.8942, type: 'subway' },
    { id: '913', name: '당산역', line_id: '9', lat: 37.5342, lng: 126.9025, type: 'subway' },
    { id: '914', name: '국회의사당역', line_id: '9', lat: 37.5294, lng: 126.9177, type: 'subway' },
    { id: '915', name: '여의도역', line_id: '9', lat: 37.5219, lng: 126.9242, type: 'subway' },
    { id: '916', name: '샛강역', line_id: '9', lat: 37.5175, lng: 126.9367, type: 'subway' },
    { id: '917', name: '노량진역', line_id: '9', lat: 37.5141, lng: 126.9422, type: 'subway' },
    { id: '918', name: '노들역', line_id: '9', lat: 37.5188, lng: 126.9519, type: 'subway' },
    { id: '919', name: '흑석역', line_id: '9', lat: 37.5060, lng: 126.9618, type: 'subway' },
    { id: '920', name: '동작역', line_id: '9', lat: 37.5029, lng: 126.9787, type: 'subway' },
    { id: '921', name: '구반포역', line_id: '9', lat: 37.5088, lng: 126.9964, type: 'subway' },
    { id: '922', name: '신반포역', line_id: '9', lat: 37.5040, lng: 127.0046, type: 'subway' },
    { id: '923', name: '고속터미널역', line_id: '9', lat: 37.5051, lng: 127.0046, type: 'subway' },
    { id: '924', name: '사평역', line_id: '9', lat: 37.4916, lng: 127.0088, type: 'subway' },
    { id: '925', name: '신논현역', line_id: '9', lat: 37.4943, lng: 127.0252, type: 'subway' },
    { id: '926', name: '언주역', line_id: '9', lat: 37.4967, lng: 127.0352, type: 'subway' },
    { id: '927', name: '선정릉역', line_id: '9', lat: 37.5043, lng: 127.0436, type: 'subway' },
    { id: '928', name: '삼성중앙역', line_id: '9', lat: 37.5096, lng: 127.0581, type: 'subway' },
    { id: '929', name: '종합운동장역', line_id: '9', lat: 37.5105, lng: 127.0735, type: 'subway' },
    { id: '930', name: '삼전역', line_id: '9', lat: 37.5105, lng: 127.0844, type: 'subway' },
    { id: '931', name: '석촌고분역', line_id: '9', lat: 37.5050, lng: 127.0982, type: 'subway' },
    { id: '932', name: '석촌역', line_id: '9', lat: 37.5050, lng: 127.1058, type: 'subway' },
    { id: '933', name: '송파나루역', line_id: '9', lat: 37.5155, lng: 127.1118, type: 'subway' },
    { id: '934', name: '한성백제역', line_id: '9', lat: 37.5094, lng: 127.1169, type: 'subway' },
    { id: '935', name: '올림픽공원역', line_id: '9', lat: 37.5203, lng: 127.1221, type: 'subway' },
    { id: '936', name: '둔촌오륜역', line_id: '9', lat: 37.5265, lng: 127.1360, type: 'subway' },
    { id: '937', name: '중앙보훈병원역', line_id: '9', lat: 37.5394, lng: 127.1427, type: 'subway' }
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