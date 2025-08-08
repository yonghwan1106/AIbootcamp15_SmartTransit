import moment from 'moment';

// 혼잡도 레벨에 따른 색상 반환
export const getCongestionColor = (level: number | string): string => {
  if (typeof level === 'string') {
    switch (level) {
      case 'low': return '#4CAF50'; // 녹색
      case 'medium': return '#FFC107'; // 노란색
      case 'heavy': return '#F44336'; // 빨간색
      default: return '#9E9E9E'; // 회색
    }
  }
  
  if (level <= 30) return '#4CAF50';
  if (level <= 70) return '#FFC107';
  return '#F44336';
};

// 혼잡도 레벨 텍스트 반환
export const getCongestionText = (level: number | string): string => {
  if (typeof level === 'string') {
    switch (level) {
      case 'low': return '여유';
      case 'medium': return '보통';
      case 'heavy': return '혼잡';
      default: return '정보없음';
    }
  }
  
  if (level <= 30) return '여유';
  if (level <= 70) return '보통';
  return '혼잡';
};

// 혼잡도 아이콘 반환
export const getCongestionIcon = (level: number | string): string => {
  if (typeof level === 'string') {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'heavy': return '🔴';
      default: return '⚪';
    }
  }
  
  if (level <= 30) return '🟢';
  if (level <= 70) return '🟡';
  return '🔴';
};

// 시간 포맷팅
export const formatTime = (time: string | Date, format: string = 'HH:mm'): string => {
  return moment(time).format(format);
};

// 상대 시간 반환 (예: "2분 전", "1시간 후")
export const formatRelativeTime = (time: string | Date): string => {
  return moment(time).fromNow();
};

// 소요 시간 포맷팅 (분 단위)
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
};

// 거리 포맷팅
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// 비용 포맷팅
export const formatCost = (won: number): string => {
  return `₩${won.toLocaleString()}`;
};

// 신뢰도 퍼센트 포맷팅
export const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

// 좌표 거리 계산 (Haversine formula)
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371000; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// 배열 청크 분할
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// 디바운스 함수
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// 로컬 스토리지 헬퍼
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },
  
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// 날짜 유틸리티
export const dateUtils = {
  isToday: (date: string | Date): boolean => {
    return moment(date).isSame(moment(), 'day');
  },
  
  isWeekend: (date: string | Date): boolean => {
    const day = moment(date).day();
    return day === 0 || day === 6; // Sunday or Saturday
  },
  
  getKoreanDayName: (date: string | Date): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[moment(date).day()];
  },
  
  formatKoreanDate: (date: string | Date): string => {
    const m = moment(date);
    return `${m.format('MM')}월 ${m.format('DD')}일 (${dateUtils.getKoreanDayName(date)})`;
  },
};

// 에러 메시지 처리
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

// 랜덤 ID 생성
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// 배열에서 최대값/최소값 찾기
export const arrayUtils = {
  max: (array: number[]): number => Math.max(...array),
  min: (array: number[]): number => Math.min(...array),
  average: (array: number[]): number => array.reduce((a, b) => a + b, 0) / array.length,
  sum: (array: number[]): number => array.reduce((a, b) => a + b, 0),
};