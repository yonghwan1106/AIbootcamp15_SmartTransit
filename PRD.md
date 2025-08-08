# SmartTransit Predictor - Product Requirements Document (PRD)

## 📋 제품 개요

### 프로젝트명
**SmartTransit Predictor** - 개인 맞춤형 혼잡도 예측 알림 서비스

### 제품 비전
AI와 빅데이터 기술을 활용하여 대중교통 이용객에게 실시간 혼잡도 정보와 개인화된 이동 경로를 제공함으로써, 보다 편리하고 효율적인 대중교통 이용 경험을 제공한다.

### 제품 목표
1. **이용자 편의성 향상**: 개인의 이동 패턴과 선호도를 반영한 맞춤형 서비스 제공
2. **혼잡도 분산**: 승객 분산 유도를 통한 대중교통 시스템 효율성 개선
3. **예측 가능성 증대**: AI 기반 예측 모델을 통한 정확한 혼잡도 예측
4. **사용자 만족도 증진**: 직관적이고 실용적인 인터페이스 제공

### 타겟 사용자
- **주 타겟**: 서울 지역 대중교통 이용자 (지하철, 버스)
- **부 타겟**: 관광객, 출장자 등 일시적 대중교통 이용자
- **확장 타겟**: 교통 운영 기관 (데이터 분석 및 운영 최적화)

---

## 🎯 핵심 기능 명세

### 1. 실시간 혼잡도 모니터링
**기능 설명**: 다양한 데이터 소스를 통합하여 현재 대중교통 혼잡도를 실시간으로 모니터링하고 시각화

**사용자 스토리**:
- 사용자로서, 현재 이용하려는 지하철/버스의 실시간 혼잡도를 색상으로 구분하여 한눈에 확인하고 싶다
- 사용자로서, 각 차량별 혼잡도를 개별적으로 확인하고 싶다

**기술적 요구사항**:
- 교통카드 태그 데이터 실시간 수집 및 분석
- CCTV 영상 분석을 통한 승객 밀도 측정
- IoT 센서 데이터 통합 (무게, 온도, CO2 농도 등)
- 혼잡도 지수 계산 알고리즘 (0-100 스케일)

### 2. AI 기반 혼잡도 예측
**기능 설명**: 머신러닝 모델을 활용하여 향후 1-3시간 내 혼잡도 변화를 예측

**사용자 스토리**:
- 사용자로서, 30분 후 내가 이용할 노선의 혼잡도가 어떨지 미리 알고 싶다
- 사용자로서, 특별한 상황(날씨, 행사 등)이 혼잡도에 미치는 영향을 사전에 파악하고 싶다

**기술적 요구사항**:
- 시계열 데이터 분석 모델 (LSTM, Prophet 등)
- 외부 요인 반영 (날씨, 이벤트, 공휴일, 학교 일정 등)
- 예측 정확도 90% 이상 목표
- 모델 재학습 자동화 시스템

### 3. 개인화 추천 시스템
**기능 설명**: 사용자의 이동 패턴과 선호도를 학습하여 맞춤형 경로와 출발 시간을 추천

**사용자 스토리**:
- 사용자로서, 내 출퇴근 패턴을 기반으로 최적의 출발 시간을 추천받고 싶다
- 사용자로서, 내가 선호하는 혼잡도 수준을 설정하고 그에 맞는 경로를 추천받고 싶다

**기술적 요구사항**:
- 사용자 행동 패턴 분석 알고리즘
- 개인 선호도 프로파일링 시스템
- 추천 엔진 (협업 필터링 + 콘텐츠 기반)
- A/B 테스트 프레임워크

### 4. 대체 경로 추천
**기능 설명**: 혼잡 발생 시 실시간으로 최적의 대체 경로를 제안

**사용자 스토리**:
- 사용자로서, 평소 이용하던 노선이 혼잡할 때 대안 경로를 즉시 제공받고 싶다
- 사용자로서, 대체 경로의 예상 소요 시간과 혼잡도를 미리 확인하고 싶다

**기술적 요구사항**:
- 실시간 경로 계산 알고리즘 (Dijkstra, A* 등)
- 다중 교통 수단 통합 검색
- 경로 비교 및 우선순위 결정 로직

### 5. 스마트 알림 시스템
**기능 설명**: 사용자의 일정과 위치를 고려한 프로액티브 알림 제공

**사용자 스토리**:
- 사용자로서, 평소 출발 시간 30분 전에 혼잡도 예측 정보를 자동으로 받고 싶다
- 사용자로서, 급작스러운 지연이나 혼잡 발생 시 즉시 알림을 받고 싶다

**기술적 요구사항**:
- 푸시 알림 시스템
- 위치 기반 서비스 (GPS, WiFi, Beacon)
- 캘린더 연동 API
- 알림 개인화 설정 기능

---

## 🏗️ 시스템 아키텍처

### 기술 스택

**Frontend (모바일 앱)**:
- React Native + TypeScript
- Redux Toolkit (상태 관리)
- React Navigation (라우팅)
- React Native Maps (지도)
- Chart.js (데이터 시각화)

**Backend**:
- Node.js + Express + TypeScript
- PostgreSQL (주 데이터베이스)
- Redis (캐싱 및 세션)
- MongoDB (로그 데이터)

**AI/ML**:
- Python + FastAPI
- TensorFlow/PyTorch (머신러닝)
- Pandas, NumPy (데이터 처리)
- Celery + Redis (비동기 작업)

**Infrastructure**:
- AWS (EC2, RDS, S3, Lambda)
- Docker + Kubernetes
- Nginx (로드 밸런서)
- CloudWatch (모니터링)

### 아키텍처 다이어그램

```
[Mobile App] <-> [API Gateway] <-> [Backend Services]
                                        |
                                   [ML Service]
                                        |
                              [Data Processing Pipeline]
                                        |
                                 [External APIs]
                              (교통카드, CCTV, 날씨 등)
```

---

## 📊 가상 API 설계

### 1. 혼잡도 조회 API

**Endpoint**: `GET /api/congestion/realtime`

**Parameters**:
```json
{
  "station_id": "string",
  "line_id": "string", 
  "direction": "string",
  "vehicle_type": "subway|bus"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "station_id": "239",
    "station_name": "강남역",
    "line_id": "2",
    "current_congestion": 85,
    "congestion_level": "heavy",
    "vehicles": [
      {
        "vehicle_id": "2001",
        "congestion": 90,
        "arrival_time": "2분 후",
        "car_positions": [65, 85, 95, 80, 70, 60]
      }
    ],
    "updated_at": "2025-08-08T14:30:00Z"
  }
}
```

### 2. 혼잡도 예측 API

**Endpoint**: `GET /api/prediction`

**Parameters**:
```json
{
  "station_id": "string",
  "target_time": "ISO-8601",
  "duration_hours": "number"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "predictions": [
      {
        "time": "2025-08-08T15:00:00Z",
        "congestion": 75,
        "confidence": 0.92,
        "weather_impact": "low",
        "event_impact": "none"
      }
    ],
    "model_accuracy": 0.89
  }
}
```

### 3. 개인화 추천 API

**Endpoint**: `POST /api/recommendations`

**Request Body**:
```json
{
  "user_id": "string",
  "origin": {"lat": 37.5665, "lng": 126.9780},
  "destination": {"lat": 37.5172, "lng": 127.0473},
  "departure_time": "2025-08-08T08:30:00Z",
  "preferences": {
    "max_congestion": 70,
    "max_walking_time": 10,
    "max_transfers": 2
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "recommended_routes": [
      {
        "route_id": "route_1",
        "total_time": 45,
        "walking_time": 8,
        "transfers": 1,
        "avg_congestion": 65,
        "departure_time": "08:35",
        "arrival_time": "09:20",
        "steps": [
          {
            "type": "walk",
            "duration": 3,
            "description": "강남역까지 도보"
          },
          {
            "type": "subway",
            "line": "2호선",
            "duration": 35,
            "congestion": 65
          }
        ]
      }
    ]
  }
}
```

---

## 🗄️ 데이터베이스 설계

### 주요 테이블 구조

**Users Table**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferences JSONB,
    is_active BOOLEAN DEFAULT TRUE
);
```

**Stations Table**:
```sql
CREATE TABLE stations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    line_id VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    station_type VARCHAR(20) NOT NULL -- 'subway', 'bus'
);
```

**Congestion_Data Table**:
```sql
CREATE TABLE congestion_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id VARCHAR(50) REFERENCES stations(id),
    vehicle_id VARCHAR(50),
    congestion_level INTEGER NOT NULL CHECK (congestion_level BETWEEN 0 AND 100),
    passenger_count INTEGER,
    timestamp TIMESTAMP NOT NULL,
    data_source VARCHAR(50) NOT NULL, -- 'card', 'cctv', 'sensor'
    INDEX idx_station_timestamp (station_id, timestamp)
);
```

**User_Patterns Table**:
```sql
CREATE TABLE user_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    origin_station_id VARCHAR(50) REFERENCES stations(id),
    destination_station_id VARCHAR(50) REFERENCES stations(id),
    typical_departure_time TIME,
    frequency INTEGER DEFAULT 1,
    day_of_week INTEGER[], -- [1,2,3,4,5] for weekdays
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 UI/UX 디자인 가이드라인

### 디자인 원칙
1. **직관성**: 혼잡도 정보를 색상으로 즉시 인지 가능
2. **개인화**: 사용자별 맞춤 정보 우선 표시
3. **실시간성**: 정보 업데이트 상태 명확히 표시
4. **접근성**: 색약자, 시각 장애인을 고려한 디자인

### 주요 화면 구성

**1. 메인 대시보드**:
- 즐겨찾기 역/정류장 혼잡도 카드
- 개인화된 출발 시간 추천
- 날씨 및 특별 알림

**2. 지도 화면**:
- 실시간 혼잡도 오버레이
- 역별 상세 정보 팝업
- 경로 검색 및 비교

**3. 알림 설정**:
- 출발 시간 알림
- 혼잡도 임계값 설정
- 푸시 알림 관리

### 색상 체계
- 🟢 여유 (0-30): #4CAF50
- 🟡 보통 (31-70): #FFC107  
- 🔴 혼잡 (71-100): #F44336

---

## 📈 개발 로드맵

### Phase 1: MVP (2개월)
**목표**: 기본 혼잡도 조회 및 알림 기능 구현

**주요 기능**:
- [ ] 실시간 혼잡도 조회
- [ ] 기본 알림 시스템
- [ ] 사용자 계정 관리
- [ ] 모바일 앱 (iOS/Android)

**기술적 구현**:
- [ ] 가상 데이터 생성 시스템
- [ ] 기본 API 서버 구축
- [ ] 데이터베이스 스키마 구현
- [ ] 기본 ML 모델 (단순 통계 기반)

### Phase 2: AI 예측 (1.5개월)
**목표**: 머신러닝 기반 혼잡도 예측 기능 추가

**주요 기능**:
- [ ] 시간대별 혼잡도 예측
- [ ] 날씨/이벤트 요인 반영
- [ ] 예측 정확도 표시

**기술적 구현**:
- [ ] 시계열 예측 모델 개발
- [ ] 모델 학습 파이프라인
- [ ] 예측 성능 모니터링

### Phase 3: 개인화 (1.5개월)
**목표**: 개인 패턴 학습 및 맞춤형 추천

**주요 기능**:
- [ ] 개인 이동 패턴 분석
- [ ] 맞춤형 경로 추천
- [ ] 개인화된 출발 시간 제안

**기술적 구현**:
- [ ] 사용자 행동 분석 시스템
- [ ] 추천 알고리즘 구현
- [ ] A/B 테스트 프레임워크

### Phase 4: 고급 기능 (1개월)
**목표**: 대체 경로, 인센티브 시스템 등 고급 기능

**주요 기능**:
- [ ] 실시간 대체 경로 추천
- [ ] 사용자 피드백 시스템
- [ ] 포인트/인센티브 시스템

**기술적 구현**:
- [ ] 복합 경로 계산 알고리즘
- [ ] 피드백 수집 및 분석 시스템
- [ ] 게이미피케이션 요소

---

## 📊 성공 지표 (KPI)

### 사용자 지표
- **DAU (Daily Active Users)**: 월 10만명 목표
- **사용자 만족도**: App Store/Play Store 4.5점 이상
- **사용자 유지율**: 30일 후 60% 이상

### 서비스 지표
- **예측 정확도**: 90% 이상 유지
- **응답 시간**: API 응답 시간 100ms 이하
- **알림 클릭률**: 30% 이상

### 비즈니스 지표
- **혼잡도 분산 효과**: 피크 시간 혼잡도 15% 감소
- **사용자 이동 시간 단축**: 평균 10분 단축
- **대중교통 만족도 향상**: 설문 조사 20% 개선

---

## 🔒 보안 및 개인정보 보호

### 데이터 보안
- 모든 API 통신 HTTPS 암호화
- 사용자 위치 데이터 익명화 처리
- 개인정보 암호화 저장 (AES-256)

### 개인정보 보호
- 최소한의 개인정보만 수집
- 사용자 동의 기반 데이터 활용
- 데이터 삭제 요청 지원 (GDPR 준수)
- 데이터 보관 기간 설정 (2년)

### 접근 권한 관리
- JWT 기반 인증 시스템
- Role-based 접근 제어
- API 레이트 리미팅

---

## 💰 비용 산정 및 수익 모델

### 개발 비용 (6개월)
- **개발자 5명**: 월 3,000만원 × 6개월 = 1.8억원
- **디자이너 1명**: 월 400만원 × 4개월 = 1,600만원
- **인프라 비용**: 월 200만원 × 6개월 = 1,200만원
- **외부 API 비용**: 월 100만원 × 6개월 = 600만원
- **총 개발 비용**: 약 2억 200만원

### 운영 비용 (월)
- **서버 인프라**: 500만원
- **외부 API**: 200만원
- **유지보수**: 300만원
- **마케팅**: 1,000만원
- **총 운영 비용**: 월 2,000만원

### 수익 모델
1. **프리미엄 구독**: 월 3,000원 (고급 예측, 무제한 알림)
2. **광고 수익**: 지역 상권 및 교통 관련 광고
3. **데이터 라이센싱**: 교통 운영 기관에 분석 데이터 판매
4. **파트너십**: 교통카드사, 지도 서비스와의 제휴

---

## 🚀 출시 전략

### 베타 테스트
- **기간**: 개발 완료 1개월 전부터 2주간
- **대상**: 서울 2호선 이용자 1,000명 선발
- **목표**: 사용성 테스트 및 버그 수정

### 마케팅 전략
1. **SNS 마케팅**: 출퇴근 관련 콘텐츠 제작
2. **지하철역 광고**: 주요 환승역 디지털 광고
3. **인플루언서 협업**: 교통 관련 유튜버/블로거 협업
4. **언론 보도**: IT/교통 전문 매체 보도자료 배포

### 확산 전략
1. **서울 지하철 2호선 → 전체 지하철 → 버스 → 전국 확산**
2. **사용자 추천 인센티브**: 친구 추천 시 프리미엄 1개월 무료
3. **교통 기관 파트너십**: 서울교통공사와의 공식 협력

---

## 📞 연락처 및 팀 정보

**프로젝트 매니저**: 박용환
- **이메일**: sanoramyun8@gmail.com
- **연락처**: 010-7939-3123
- **소속**: Creative Nexus

**개발 팀 구성** (예정):
- Backend Developer (2명)
- Frontend Developer (2명) 
- ML Engineer (1명)
- UI/UX Designer (1명)
- DevOps Engineer (1명)

---

*본 PRD는 2025 국민행복증진 교통·물류 아이디어 공모전 제안을 기반으로 작성된 프로토타입 개발 문서입니다.*