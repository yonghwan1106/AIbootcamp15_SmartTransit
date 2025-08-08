const mockStations = [
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
  }
];

module.exports = (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { line_id, station_type } = req.query;
    
    let filteredStations = mockStations;
    
    if (line_id) {
      filteredStations = filteredStations.filter(station => station.line_id === line_id);
    }
    
    if (station_type) {
      filteredStations = filteredStations.filter(station => station.station_type === station_type);
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        stations: filteredStations,
        total: filteredStations.length
      }
    });
  }

  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
};