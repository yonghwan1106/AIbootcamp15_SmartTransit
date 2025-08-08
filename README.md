# SmartTransit Predictor

개인 맞춤형 혼잡도 예측 알림 서비스 프로토타입

## 🚀 Quick Start

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

- Backend API: http://localhost:3001
- Frontend App: http://localhost:3000

### 개별 실행
```bash
# 백엔드만 실행
npm run server

# 프론트엔드만 실행  
npm run client
```

## 📁 프로젝트 구조

```
smart-transit-predictor/
├── server/          # Backend API (Node.js + Express)
├── client/          # Frontend App (React)
├── data/           # Database & Mock Data
├── docs/           # Documentation
└── README.md
```

## 🎯 주요 기능

- 실시간 지하철/버스 혼잡도 모니터링
- AI 기반 혼잡도 예측 (1-3시간)
- 개인화된 경로 및 출발시간 추천
- 대체 경로 제안
- 스마트 알림 시스템

## 🛠️ 기술 스택

- **Backend**: Node.js, Express, SQLite
- **Frontend**: React, Chart.js, Leaflet Maps
- **AI/ML**: Python FastAPI (통계 기반 모델)
- **Database**: SQLite (개발), PostgreSQL (운영)

## 📊 API 엔드포인트

- `GET /api/congestion/realtime` - 실시간 혼잡도
- `GET /api/prediction` - 혼잡도 예측
- `POST /api/recommendations` - 개인화 추천
- `GET /api/stations` - 역/정류장 정보

## 🎨 데모 데이터

프로토타입은 서울 지하철 2호선 주요 역을 기준으로 가상 데이터를 생성합니다:
- 강남역, 홍대입구역, 건대입구역, 잠실역 등
- 실시간 혼잡도 시뮬레이션
- 시간대별 패턴 반영

---

**2025 국민행복증진 교통·물류 아이디어 공모전 프로토타입**