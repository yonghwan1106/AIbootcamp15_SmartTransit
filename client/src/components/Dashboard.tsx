import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { stationApi, congestionApi } from '../services/api';
import { Station, CongestionData } from '../types';
import { formatTime, formatRelativeTime } from '../utils/helpers';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './common/Toast';
import { DEFAULT_SETTINGS, STORAGE_KEYS, ERROR_MESSAGES } from '../config/constants';
import FavoriteStations from './FavoriteStations';
import NotificationSystem from './NotificationSystem';
import UserProfile from './UserProfile';
import AdManager from './common/AdManager';
import CongestionMeter from './common/CongestionMeter';
import TrainArrivalCard from './common/TrainArrivalCard';
import InteractionLoader from './common/InteractionLoader';
import FadeTransition from './common/FadeTransition';
import AnimatedCounter from './common/AnimatedCounter';
import AccessibilityButton from './common/AccessibilityButton';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [selectedStations, setSelectedStations] = useState<Station[]>([]);
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [congestionData, setCongestionData] = useState<{ [key: string]: CongestionData }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [useRealApi, setUseRealApi] = useState(false);
  const toast = useToast();

  // 기본 즐겨찾기 역들 (constants에서 가져오기)
  const defaultFavoriteStationIds = DEFAULT_SETTINGS.favoriteStationIds;

  const loadCongestionData = useCallback(async (stations?: Station[]) => {
    const stationsToLoad = stations || selectedStations;
    if (stationsToLoad.length === 0) return;

    try {
      const congestionPromises = stationsToLoad.map(station =>
        congestionApi.getRealtime(station.id, { use_real_api: useRealApi })
      );

      const results = await Promise.allSettled(congestionPromises);
      const newCongestionData: { [key: string]: CongestionData } = {};

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.data.status === 'success' && result.value.data.data) {
          const station = stationsToLoad[index];
          newCongestionData[station.id] = result.value.data.data;
        } else if (result.status === 'rejected') {
          console.error(`Error loading congestion for ${stationsToLoad[index].name}:`, result.reason);
        }
      });

      setCongestionData(prev => ({ ...prev, ...newCongestionData }));
      
      // 성공적으로 로드된 데이터가 없으면 경고 표시
      const successCount = Object.keys(newCongestionData).length;
      if (successCount === 0 && stationsToLoad.length > 0) {
        toast.warning(
          '혼잡도 데이터 없음',
          '실시간 혼잡도 정보를 가져올 수 없습니다.'
        );
      } else if (successCount < stationsToLoad.length) {
        toast.info(
          '일부 데이터 로딩 실패',
          `${stationsToLoad.length}개 중 ${successCount}개 역의 데이터를 불러왔습니다.`
        );
      }
    } catch (err: any) {
      console.error('Error loading congestion data:', err);
      toast.error(
        '혼잡도 데이터 로딩 실패',
        '실시간 혼잡도 정보를 불러올 수 없습니다.'
      );
    }
  }, [selectedStations, toast, useRealApi]);

  useEffect(() => {
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedStations.length === 0) return;

    const interval = setInterval(() => {
      loadCongestionData(selectedStations);
    }, DEFAULT_SETTINGS.updateInterval);
    
    return () => clearInterval(interval);
  }, [selectedStations, loadCongestionData]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // 모든 역 정보 로드
      const stationsResponse = await stationApi.getAll({ station_type: 'subway' });
      if (stationsResponse.data.status === 'success' && stationsResponse.data.data) {
        const stations = stationsResponse.data.data.stations;
        setAllStations(stations);
        
        // 사용자 즐겨찾기가 있으면 사용, 없으면 기본값 사용
        const savedFavorites = localStorage.getItem(STORAGE_KEYS.favoriteStations);
        const favoriteIds = savedFavorites ? JSON.parse(savedFavorites) : defaultFavoriteStationIds;
        
        const favorites = stations.filter((station: Station) => 
          favoriteIds.includes(station.id)
        );
        setSelectedStations(favorites);
        
        // 초기 혼잡도 데이터 로드
        await loadCongestionData(favorites);
      }
    } catch (err: any) {
      const errorMessage = err?.message || '데이터를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('Dashboard data loading error:', err);
      
      toast.error(
        '데이터 로딩 실패',
        ERROR_MESSAGES.DATA_LOADING_ERROR,
        {
          label: '다시 시도',
          onClick: () => {
            setError(null);
            loadInitialData();
          }
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteStationsChange = useCallback((stationIds: string[]) => {
    const favorites = allStations.filter((station: Station) => 
      stationIds.includes(station.id)
    );
    setSelectedStations(favorites);
    
    // 새로 선택된 역들의 혼잡도 데이터 로드
    if (favorites.length > 0) {
      loadCongestionData(favorites);
    }
  }, [allStations, loadCongestionData]);

  const chartData = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    const datasets: any[] = [];

    // 지난 6시간부터 현재까지의 시간 레이블 생성
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      labels.push(formatTime(time, 'HH:mm'));
    }

    // 각 선택된 역에 대한 데이터셋 생성
    selectedStations.forEach((station, index) => {
      const congestion = congestionData[station.id];
      if (congestion) {
        // 시뮬레이션: 현재 혼잡도를 기준으로 과거 데이터 생성
        const currentLevel = congestion.current_congestion;
        const historicalData = labels.map((_, i) => {
          const variation = (Math.random() - 0.5) * 20;
          return Math.max(0, Math.min(100, currentLevel + variation));
        });

        const colors = [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)', 
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
        ];

        datasets.push({
          label: station.name,
          data: historicalData,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + '20',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        });
      }
    });

    return { labels, datasets };
  }, [selectedStations, congestionData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '실시간 혼잡도 추이',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
        title: {
          display: true,
          text: '혼잡도 (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: '시간',
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  }), []);

  if (loading) {
    return (
      <div className="dashboard">
        <InteractionLoader 
          variant="full"
          message="스마트 교통 데이터 로딩 중"
          submessage="실시간 지하철 정보를 가져오고 있습니다"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={loadInitialData} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* 스킵 네비게이션 */}
      <a href="#main-content" className="skip-link">메인 콘텐츠로 바로가기</a>
      
      <div className="dashboard-header" id="main-content">
        <h1>개인 맞춤형 혼잡도 예측 알림 서비스</h1>
        <p className="dashboard-contest">
          AI창업부트캠프 15기 오프라인 해커톤 출품작
        </p>
        <p className="dashboard-subtitle">
          AI와 빅데이터 기술로 대중교통 혼잡도를 예측하고 개인 맞춤형 경로를 추천합니다
        </p>
        <div className="dashboard-actions">
          <div className="api-toggle-container">
            <label className="api-toggle-label">
              <input
                type="checkbox"
                checked={useRealApi}
                onChange={(e) => {
                  setUseRealApi(e.target.checked);
                  if (e.target.checked) {
                    toast.info(
                      '실시간 API 활성화',
                      '서울시 실제 지하철 데이터를 사용합니다. 데이터 로딩이 다소 시간이 걸릴 수 있습니다.'
                    );
                  } else {
                    toast.info(
                      '시뮬레이션 모드',
                      '데모용 시뮬레이션 데이터를 사용합니다.'
                    );
                  }
                }}
                className="api-toggle-checkbox"
              />
              <span className="api-toggle-slider"></span>
              <span className="api-toggle-text">
                {useRealApi ? '🌐 실시간 API' : '🎮 시뮬레이션'}
              </span>
            </label>
          </div>
          <button 
            className="profile-btn"
            onClick={() => setShowUserProfile(true)}
          >
            👤 사용자 프로필
          </button>
        </div>
      </div>

      {/* 실시간 상태 표시 */}
      <div className="status-section">
        <div className="status-indicator">
          <span className="status-dot online"></span>
          <span className="status-text">실시간 데이터 업데이트 중</span>
        </div>
      </div>

      {/* 상단 광고 배너 */}
      <AdManager 
        position="header"
        style={{ margin: '16px 0' }}
      />

      {/* 즐겨찾는 역 관리 */}
      <FavoriteStations
        onStationSelect={handleFavoriteStationsChange}
        selectedStations={selectedStations.map(s => s.id)}
      />

      {/* 실시간 혼잡도 카드 */}
      <div className="congestion-cards stagger-container">
        {selectedStations.map((station, index) => {
          const congestion = congestionData[station.id];
          return (
            <FadeTransition 
              key={station.id} 
              direction="up" 
              delay={index * 100}
              className="congestion-card-wrapper"
            >
              <div className="congestion-card">
                <div className="card-header">
                  <h3>{station.name}</h3>
                  <span className="line-badge">
                    {station.line_id}호선
                  </span>
                </div>
                
                {congestion ? (
                  <div className="card-content">
                    <div className="congestion-main">
                      <CongestionMeter 
                        level={congestion.current_congestion}
                        size="medium"
                        animated={true}
                        className="station-congestion-meter"
                      />
                    </div>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">승객 수:</span>
                        <span className="detail-value">
                          <AnimatedCounter 
                            end={congestion.passenger_count} 
                            suffix="명"
                            duration={1500}
                            delay={200}
                          />
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">업데이트:</span>
                        <span className="detail-value">
                          {formatRelativeTime(congestion.updated_at)}
                        </span>
                      </div>
                    </div>

                    {/* 향상된 열차 도착 정보 */}
                    <TrainArrivalCard 
                      trains={congestion.vehicles}
                      className="station-trains"
                    />
                  </div>
                ) : (
                  <InteractionLoader 
                    variant="default"
                    message={useRealApi ? "실시간 데이터 로딩 중..." : "시뮬레이션 데이터 생성 중..."}
                    submessage={useRealApi ? "서울시 API에서 정보를 가져오고 있습니다" : "데모용 혼잡도 정보를 생성하고 있습니다"}
                  />
                )}
              </div>
            </FadeTransition>
          );
        })}
      </div>

      {/* 혼잡도 추이 차트 */}
      <FadeTransition direction="up" delay={400}>
        <div className="chart-container">
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </FadeTransition>

      {/* 인라인 광고 배너 */}
      <AdManager 
        position="inline"
        style={{ margin: '24px auto' }}
      />

      {/* 요약 통계 */}
      <FadeTransition direction="up" delay={600}>
        <div className="summary-stats">
          <h2>현재 상황 요약</h2>
          <div className="stats-grid stagger-container">
            <FadeTransition direction="up" delay={700}>
              <div className="stat-card hover-lift">
                <div className="stat-icon">🚇</div>
                <div className="stat-content">
                  <div className="stat-number">
                    <AnimatedCounter 
                      end={Object.keys(congestionData).length}
                      duration={1000}
                      delay={800}
                    />
                  </div>
                  <div className="stat-label">모니터링 중인 역</div>
                </div>
              </div>
            </FadeTransition>
            <FadeTransition direction="up" delay={800}>
              <div className="stat-card hover-lift">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-number">
                    <AnimatedCounter 
                      end={Object.values(congestionData).length > 0 ? 
                        Math.round(
                          Object.values(congestionData)
                            .reduce((sum, data) => sum + data.current_congestion, 0) /
                          Object.values(congestionData).length
                        )
                        : 0
                      }
                      suffix="%"
                      duration={1200}
                      delay={900}
                    />
                  </div>
                  <div className="stat-label">평균 혼잡도</div>
                </div>
              </div>
            </FadeTransition>
            <FadeTransition direction="up" delay={900}>
              <div className="stat-card hover-lift">
                <div className="stat-icon animate-pulse">⚡</div>
                <div className="stat-content">
                  <div className="stat-number">실시간</div>
                  <div className="stat-label">데이터 업데이트</div>
                </div>
              </div>
            </FadeTransition>
            <FadeTransition direction="up" delay={1000}>
              <div className="stat-card hover-lift">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-number">
                    <AnimatedCounter 
                      end={90}
                      suffix="%+"
                      duration={1500}
                      delay={1100}
                    />
                  </div>
                  <div className="stat-label">예측 정확도</div>
                </div>
              </div>
            </FadeTransition>
          </div>
        </div>
      </FadeTransition>

      {/* 알림 시스템 */}
      <NotificationSystem
        stations={allStations}
        congestionData={congestionData}
      />

      {/* 사용자 프로필 모달 */}
      {showUserProfile && (
        <UserProfile
          stations={allStations}
          onClose={() => setShowUserProfile(false)}
        />
      )}
      
      <ToastContainer
        messages={toast.messages}
        onClose={toast.removeToast}
      />
      {/* 하단 광고 배너 */}
      <AdManager 
        position="footer"
        style={{ margin: '32px 0 16px 0' }}
      />
      
      
      {/* 접근성 버튼 */}
      <AccessibilityButton />
    </div>
  );
};

export default Dashboard;