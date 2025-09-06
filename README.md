# 🚇 SmartTransit Predictor

AI창업부트캠프 15기 오프라인 해커톤 출품작 (바이브코딩 해커톤 2025.09.06)

개인 맞춤형 혼잡도 예측 알림 서비스 - 광고 연동 수익화 모델 적용

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

## 🏆 해커톤 핵심 구현 요구사항

✅ **광고 연동** - 구글 애드센스 & 카카오 애드픽 연동  
🔄 **실시간 API** - 서울 열린데이터 광장 API 연동 예정  
✅ **프로토타입 구현** - 실제 작동하는 MVP 완성  
🎨 **UI/UX 완성도** - 직관적이고 사용하기 쉬운 인터페이스  

## 🎯 주요 기능

- 실시간 지하철/버스 혼잡도 모니터링
- AI 기반 혼잡도 예측 (1-3시간)
- 개인화된 경로 및 출발시간 추천
- 대체 경로 제안
- 스마트 알림 시스템
- **광고 수익화 모델** (구글 애드센스 + 카카오 애드픽)

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

## 💰 수익화 모델

### 광고 연동 시스템
- **구글 애드센스**: 자동 광고 최적화 및 고수익 보장
- **카카오 애드픽**: 한국 사용자 특화 광고 플랫폼
- **A/B 테스트**: 50:50 비율로 광고 성능 비교
- **자연스러운 배치**: 헤더, 콘텐츠 중간, 푸터 위치

### 광고 위치 전략
- 📱 **헤더 배너**: 첫 화면 인상 극대화
- 📊 **인라인 광고**: 차트 하단 자연스러운 배치
- 🔽 **푸터 광고**: 스크롤 완료 후 노출

---

**🏆 AI창업부트캠프 15기 바이브코딩 해커톤 출품작 (2025.09.06)**

---

*본 프로젝트는 교육 및 해커톤 목적으로 제작된 프로토타입입니다.*