const axios = require('axios');
const moment = require('moment');

/**
 * 서울시 지하철 실시간 도착정보 API 서비스
 * 
 * API 정보:
 * - 제공: 서울 열린데이터 광장
 * - URL: http://swopenapi.seoul.go.kr/api/subway/{인증키}/json/realtimeStationArrival/{시작인덱스}/{종료인덱스}/{지하철역명}
 * 
 * 주의사항:
 * - 데모용으로 샘플 API 키 사용 (실제 서비스에서는 발급받은 키 사용 필요)
 * - 일일 호출 제한이 있을 수 있음
 * - recptnDt 시간차 고려 필요
 */

class SeoulMetroApiService {
  constructor() {
    // 데모용 API 키 (실제로는 환경변수로 관리해야 함)
    this.apiKey = process.env.SEOUL_METRO_API_KEY || 'sample';
    this.baseUrl = 'http://swopenapi.seoul.go.kr/api/subway';
    
    // API 호출 제한을 위한 캐시
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30초 캐시
  }

  /**
   * 역명을 기반으로 실시간 도착정보 조회
   * @param {string} stationName - 지하철 역명 (예: "강남")
   * @returns {Promise<Object>} 실시간 도착정보
   */
  async getRealtimeArrival(stationName) {
    try {
      // 캐시 확인
      const cacheKey = `arrival_${stationName}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
        return cached.data;
      }

      const url = `${this.baseUrl}/${this.apiKey}/json/realtimeStationArrival/1/10/${encodeURIComponent(stationName)}`;
      
      console.log(`Fetching real-time data for ${stationName}...`);
      const response = await axios.get(url, {
        timeout: 10000, // 10초 타임아웃
        headers: {
          'User-Agent': 'SmartTransit-Predictor/1.0'
        }
      });

      const data = response.data;
      
      // API 응답 검증
      if (!data || data.RESULT?.CODE !== 'INFO-000') {
        throw new Error(`API Error: ${data?.RESULT?.MESSAGE || 'Unknown error'}`);
      }

      // 데이터 가공
      const processedData = this.processArrivalData(data.realtimeArrivalList || []);
      
      // 캐시 저장
      this.cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });

      return processedData;

    } catch (error) {
      console.error(`Error fetching arrival data for ${stationName}:`, error.message);
      
      // 실제 API 호출 실패 시 fallback 데이터 반환
      return this.generateFallbackData(stationName);
    }
  }

  /**
   * API 응답 데이터를 우리 서비스 형태로 가공
   * @param {Array} arrivalList - 서울시 API 응답 배열
   * @returns {Object} 가공된 데이터
   */
  processArrivalData(arrivalList) {
    if (!arrivalList || arrivalList.length === 0) {
      return null;
    }

    const trains = arrivalList.map(train => ({
      line: train.subwayId, // 호선 (1~9)
      lineNm: train.subwayNm, // 호선명
      station: train.statnNm, // 역명
      direction: train.trainLineNm, // 방향 (상행/하행)
      destination: train.bstatnNm, // 종착역
      arrivalTime: train.barvlDt, // 도착예정시간 (초)
      arrivalMsg: train.arvlMsg2, // 도착정보 메시지
      arrivalCode: train.arvlCd, // 도착코드 (0:진입, 1:도착, 2:출발, 3:전역출발, 4:전역진입, 5:전역도착)
      trainType: this.getTrainType(train.btrainSttus), // 열차종류
      congestion: this.estimateCongestionFromArrival(train),
      recptnDt: train.recptnDt, // 데이터 생성시간
      updnLine: train.updnLine // 상하행선구분 (0:상행/내선, 1:하행/외선)
    }));

    // 가장 최근 데이터의 역 정보 사용
    const firstTrain = arrivalList[0];
    
    return {
      stationName: firstTrain.statnNm,
      line: firstTrain.subwayId,
      trains: trains.slice(0, 4), // 최대 4개 열차 정보
      lastUpdate: moment().toISOString(),
      dataSource: 'seoul_metro_api'
    };
  }

  /**
   * 열차상태코드를 읽기 쉬운 형태로 변환
   * @param {string} status - 열차상태코드
   * @returns {string} 열차종류
   */
  getTrainType(status) {
    const typeMap = {
      '0': '일반',
      '1': '급행',
      '2': '특급',
      '3': 'KTX',
      '4': '무궁화',
      '5': '새마을'
    };
    return typeMap[status] || '일반';
  }

  /**
   * 도착정보로부터 혼잡도 추정
   * @param {Object} train - 열차 정보
   * @returns {number} 추정 혼잡도 (0-100)
   */
  estimateCongestionFromArrival(train) {
    // 실제 혼잡도 데이터가 없으므로 여러 요인을 고려한 추정
    const now = moment();
    const hour = now.hour();
    
    // 시간대별 기본 혼잡도
    let baseCongestion = 30;
    
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      // 출퇴근 시간
      baseCongestion = 75;
    } else if (hour >= 10 && hour <= 16) {
      // 오후 시간
      baseCongestion = 45;
    } else if (hour >= 20 && hour <= 22) {
      // 저녁 시간
      baseCongestion = 55;
    }

    // 도착 시간이 짧을수록 혼잡할 가능성 (사람들이 기다리고 있음)
    const arrivalSeconds = parseInt(train.barvlDt) || 180;
    const arrivalFactor = Math.max(0, (300 - arrivalSeconds) / 300 * 20); // 최대 20% 추가

    // 랜덤 변동 ±15%
    const randomFactor = (Math.random() - 0.5) * 30;

    const finalCongestion = Math.max(0, Math.min(100, 
      baseCongestion + arrivalFactor + randomFactor
    ));

    return Math.round(finalCongestion);
  }

  /**
   * API 호출 실패 시 사용할 fallback 데이터 생성
   * @param {string} stationName - 역명
   * @returns {Object} fallback 데이터
   */
  generateFallbackData(stationName) {
    const now = moment();
    const hour = now.hour();
    
    // 시간대별 기본 혼잡도 설정
    let baseCongestion = 30;
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      baseCongestion = 80;
    } else if (hour >= 10 && hour <= 16) {
      baseCongestion = 45;
    }

    const trains = [];
    for (let i = 0; i < 3; i++) {
      trains.push({
        line: '2', // 2호선 기본값
        lineNm: '2호선',
        station: stationName,
        direction: i % 2 === 0 ? '내선순환' : '외선순환',
        destination: i % 2 === 0 ? '성수행' : '시청행',
        arrivalTime: (i + 1) * 120, // 2분, 4분, 6분 후
        arrivalMsg: `${(i + 1) * 2}분 후 도착`,
        arrivalCode: '3',
        trainType: '일반',
        congestion: Math.max(20, Math.min(90, baseCongestion + (Math.random() - 0.5) * 30)),
        recptnDt: now.format('YYYY-MM-DD HH:mm:ss'),
        updnLine: i % 2 === 0 ? '0' : '1'
      });
    }

    return {
      stationName: stationName,
      line: '2',
      trains: trains,
      lastUpdate: now.toISOString(),
      dataSource: 'fallback_simulation'
    };
  }

  /**
   * 캐시 정리
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 지원 가능한 역명 목록 (서울시 2호선 위주)
   * @returns {Array<string>} 역명 배열
   */
  getSupportedStations() {
    return [
      '강남', '강변', '건대입구', '구로디지털단지', '신림', '신도림',
      '홍대입구', '합정', '당산', '영등포구청', '문래', '신당',
      '동대문역사문화공원', '을지로4가', '을지로3가', '시청',
      '충정로', '아현', '이대', '신촌', '서강대', '마포구청',
      '공덕', '서울역', '잠실', '종합운동장', '삼성', '선릉',
      '역삼', '교대', '서초', '방배', '사당'
    ];
  }
}

// 싱글톤 인스턴스 생성
const seoulMetroApi = new SeoulMetroApiService();

module.exports = seoulMetroApi;