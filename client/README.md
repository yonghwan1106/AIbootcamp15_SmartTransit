# Smart Transit Predictor - Frontend

AI창업부트캠프 15기 오프라인 해커톤 출품작

지하철 실시간 혼잡도 예측 및 경로 추천 서비스의 React 기반 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **React 19** with TypeScript
- **React Router** for navigation
- **Context API** for state management
- **Chart.js** for data visualization
- **Leaflet** for maps
- **CSS Modules** for styling

## 🎯 주요 기능

### 🏠 대시보드
- 실시간 지하철 혼잡도 모니터링
- 시간대별 혼잡도 트렌드 차트
- 즐겨찾기 역 관리
- 실시간 데이터 자동 업데이트

### 🔍 역 검색
- 자동완성 검색
- 상세 혼잡도 정보
- 칸별 혼잡도 시각화
- 실시간 열차 도착 정보

### 🔮 혼잡도 예측
- AI 기반 1-6시간 예측
- 예측 신뢰도 표시
- 최적 이용 시간 추천
- 시간대별 상세 분석

### 🗺️ 경로 추천
- 개인 맞춤형 경로 제안
- 실시간 혼잡도 반영
- 다중 경로 옵션
- 상세 이동 가이드

## 🎨 디자인 특징

- **반응형 디자인**: 모바일/데스크탑 최적화
- **접근성**: 고대비 모드, 키보드 내비게이션
- **직관적 UI**: 색상 기반 혼잡도 시각화
- **부드러운 애니메이션**: 로딩 상태 및 트랜지션

## 📱 Available Scripts

### `npm start`
개발 서버를 시작합니다. http://localhost:3000에서 확인 가능합니다.

### `npm test`
테스트 러너를 실행합니다.

### `npm run build`
프로덕션용 빌드를 생성합니다.

### `npm run eject`
Create React App 설정을 커스터마이징합니다. (비추천)

## 🔧 환경 설정

### 환경 변수
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_USE_MOCK_DATA=false
REACT_APP_APP_NAME=Smart Transit Predictor
```

### 개발 모드
- 백엔드 서버가 포트 3001에서 실행되어야 합니다
- 실시간 핫 리로드 지원
- 개발자 도구에서 API 호출 로그 확인 가능

## 📊 컴포넌트 구조

```
src/
├── components/
│   ├── common/          # 공통 컴포넌트
│   │   ├── AdManager/    # 광고 관리
│   │   ├── TrainArrivalCard/  # 열차 정보 카드
│   │   ├── CongestionMeter/   # 혼잡도 미터
│   │   └── AccessibilityButton/  # 접근성 기능
│   └── layout/          # 레이아웃 컴포넌트
├── contexts/            # React Context
├── pages/              # 페이지 컴포넌트
├── services/           # API 서비스
├── types/              # TypeScript 타입
└── config/             # 설정 파일
```

## 🎯 주요 React Hooks

- `useContext`: 전역 상태 관리
- `useEffect`: 데이터 페칭 및 실시간 업데이트
- `useState`: 로컬 상태 관리
- `useCallback`: 성능 최적화
- `useMemo`: 계산 결과 캐싱

## 📈 성능 최적화

- **Code Splitting**: 라우트별 지연 로딩
- **Memoization**: 불필요한 리렌더링 방지
- **Image Optimization**: 이미지 지연 로딩
- **Bundle Analysis**: Webpack Bundle Analyzer

## 🔍 문제 해결

### 일반적인 문제
1. **API 연결 오류**: 백엔드 서버 상태 확인
2. **CORS 오류**: 백엔드 CORS 설정 확인
3. **환경 변수 오류**: .env 파일 위치 및 형식 확인

### 개발 팁
- 브라우저 개발자 도구의 Network 탭에서 API 호출 상태 확인
- Console 탭에서 에러 메시지 확인
- Redux DevTools로 상태 변화 추적 (Context API 사용 시)

---

**개발팀**: AI창업부트캠프 15기  
**개발 기간**: 2025.09.06 해커톤  
**GitHub**: https://github.com/yonghwan1106/AIbootcamp15_SmartTransit