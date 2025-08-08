// App Configuration
export const APP_CONFIG = {
  name: process.env.REACT_APP_APP_NAME || 'Smart Transit Predictor',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  apiUrl: process.env.REACT_APP_API_URL || '/api',
  useMockData: process.env.REACT_APP_USE_MOCK_DATA === 'true'
};

// Map Configuration
export const MAP_CONFIG = {
  defaultLat: parseFloat(process.env.REACT_APP_DEFAULT_LAT || '37.5665'),
  defaultLng: parseFloat(process.env.REACT_APP_DEFAULT_LNG || '126.9780'),
  defaultZoom: 12
};

// Feature Flags
export const FEATURES = {
  notifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
  analytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  userProfile: true,
  realTimeUpdates: true
};

// Default Settings
export const DEFAULT_SETTINGS = {
  // 기본 즐겨찾기 역들 (주요 터미널 및 환승역 중심)
  favoriteStationIds: [
    '221', // 강남역 (2호선) - 주요 비즈니스 지구
    '252', // 홍대입구역 (2호선) - 대학가/엔터테인먼트
    '211', // 건대입구역 (2호선) - 대학가
    '215', // 잠실역 (2호선) - 쇼핑/레저
    '101', // 서울역 (1호선) - 메인 터미널
    '520', // 광화문역 (5호선) - 비즈니스 지구
    '411', // 명동역 (4호선) - 관광/쇼핑
    '513'  // 여의도역 (5호선) - 금융가
  ],
  
  updateInterval: 30000, // 30초마다 업데이트
  
  notificationSettings: {
    enabled: FEATURES.notifications,
    threshold: 80, // 혼잡도 80% 이상일 때 알림
    sound: false,
    desktop: true
  },
  
  displaySettings: {
    theme: 'auto', // 'light' | 'dark' | 'auto'
    language: 'ko',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  stations: '/stations',
  congestion: '/congestion',
  predictions: '/predictions',
  recommendations: '/recommendations',
  health: '/health'
};

// Congestion Levels
export const CONGESTION_LEVELS = {
  LOW: { min: 0, max: 30, label: '여유', color: '#22c55e', icon: '🟢' },
  MODERATE: { min: 31, max: 60, label: '보통', color: '#eab308', icon: '🟡' },
  HIGH: { min: 61, max: 80, label: '혼잡', color: '#f97316', icon: '🟠' },
  VERY_HIGH: { min: 81, max: 100, label: '매우혼잡', color: '#ef4444', icon: '🔴' }
} as const;

// Transit Lines (Seoul Subway)
export const TRANSIT_LINES = {
  '1': { name: '1호선', color: '#0052A4' },
  '2': { name: '2호선', color: '#00A84D' },
  '3': { name: '3호선', color: '#EF7C1C' },
  '4': { name: '4호선', color: '#00A4E3' },
  '5': { name: '5호선', color: '#996CAC' },
  '6': { name: '6호선', color: '#CD7C2F' },
  '7': { name: '7호선', color: '#747F00' },
  '8': { name: '8호선', color: '#E6186C' },
  '9': { name: '9호선', color: '#BDB092' }
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  favoriteStations: 'favoriteStations',
  userSettings: 'userSettings',
  notificationPermission: 'notificationPermission',
  lastVisit: 'lastVisit'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  API_ERROR: 'API 요청 중 오류가 발생했습니다.',
  DATA_LOADING_ERROR: '데이터를 불러올 수 없습니다.',
  STATION_NOT_FOUND: '역 정보를 찾을 수 없습니다.',
  PERMISSION_DENIED: '권한이 거부되었습니다.',
  GEOLOCATION_ERROR: '위치 정보를 가져올 수 없습니다.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: '데이터를 성공적으로 불러왔습니다.',
  SETTINGS_SAVED: '설정이 저장되었습니다.',
  NOTIFICATION_ENABLED: '알림이 활성화되었습니다.',
  FAVORITES_UPDATED: '즐겨찾기가 업데이트되었습니다.'
} as const;

export default {
  APP_CONFIG,
  MAP_CONFIG,
  FEATURES,
  DEFAULT_SETTINGS,
  API_ENDPOINTS,
  CONGESTION_LEVELS,
  TRANSIT_LINES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};