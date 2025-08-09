import React, { useState, useEffect } from 'react';
import { recommendationApi, stationApi } from '../services/api';
import { RecommendationResponse, Station, Coordinates, UserPreferences } from '../types';
import { formatDuration, formatCost, getCongestionColor, getCongestionIcon } from '../utils/helpers';
import './RouteRecommendation.css';

const RouteRecommendation: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [originStation, setOriginStation] = useState<Station | null>(null);
  const [destinationStation, setDestinationStation] = useState<Station | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    max_congestion: 80,
    max_walking_time: 15,
    max_transfers: 2,
    prefer_speed: true,
  });
  const [loading, setLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(true);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setStationsLoading(true);
      const response = await stationApi.getAll({ station_type: 'subway' });
      if (response.data.status === 'success') {
        setStations(response.data.data!.stations);
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setStationsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!originStation || !destinationStation) {
      alert('출발지와 도착지를 모두 선택해주세요.');
      return;
    }

    if (originStation.id === destinationStation.id) {
      alert('출발지와 도착지가 같습니다. 다른 역을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const origin: Coordinates = {
        lat: originStation.latitude,
        lng: originStation.longitude
      };
      
      const destination: Coordinates = {
        lat: destinationStation.latitude,
        lng: destinationStation.longitude
      };

      const response = await recommendationApi.getRecommendations({
        origin,
        destination,
        preferences
      });

      if (response.data.status === 'success') {
        setRecommendations(response.data.data!);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('경로 추천을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = (type: 'origin' | 'destination', stationId: string) => {
    const station = stations.find((s: Station) => s.id === stationId) || null;
    if (type === 'origin') {
      setOriginStation(station);
    } else {
      setDestinationStation(station);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const swapStations = () => {
    const temp = originStation;
    setOriginStation(destinationStation);
    setDestinationStation(temp);
  };

  const getRouteTypeIcon = (type: string) => {
    switch (type) {
      case 'walk': return '🚶';
      case 'subway': return '🚇';
      case 'bus': return '🚌';
      case 'transfer': return '🔄';
      default: return '📍';
    }
  };

  const getBestRouteIndex = () => {
    if (!recommendations || !recommendations.recommended_routes || recommendations.recommended_routes.length === 0) return -1;
    
    // 추천 점수가 가장 높은 경로 찾기
    let bestIndex = 0;
    let bestScore = recommendations.recommended_routes[0].recommendation_score || 0;
    
    recommendations.recommended_routes.forEach((route, index) => {
      if ((route.recommendation_score || 0) > bestScore) {
        bestScore = route.recommendation_score || 0;
        bestIndex = index;
      }
    });
    
    return bestIndex;
  };

  if (stationsLoading) {
    return (
      <div className="route-recommendation">
        <div className="loading-container">
          <div className="loading-spinner">🗺️</div>
          <p>경로 추천 시스템을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-recommendation">
      <div className="recommendation-header">
        <h1>개인 맞춤형 혼잡도 예측 알림 서비스</h1>
        <p className="recommendation-contest">
          2025 국민행복증진 교통·물류 아이디어 공모전 출품작
        </p>
        <p className="recommendation-subtitle">
          출발지와 도착지를 선택하고 개인 맞춤형 최적 경로를 추천받으세요
        </p>
      </div>

      {/* 검색 폼 */}
      <div className="search-form">
        <div className="station-selectors">
          <div className="selector-group">
            <label htmlFor="origin-select">🔵 출발지</label>
            <select
              id="origin-select"
              value={originStation?.id || ''}
              onChange={(e) => handleStationChange('origin', e.target.value)}
              className="station-select"
            >
              <option value="">출발지를 선택하세요</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name} ({station.line_id}호선)
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={swapStations}
            className="swap-button"
            title="출발지와 도착지 바꾸기"
          >
            ⇄
          </button>

          <div className="selector-group">
            <label htmlFor="destination-select">🔴 도착지</label>
            <select
              id="destination-select"
              value={destinationStation?.id || ''}
              onChange={(e) => handleStationChange('destination', e.target.value)}
              className="station-select"
            >
              <option value="">도착지를 선택하세요</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name} ({station.line_id}호선)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 선호도 설정 */}
        <div className="preferences-section">
          <h3>⚙️ 개인 설정</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label>최대 혼잡도: {preferences.max_congestion}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={preferences.max_congestion}
                onChange={(e) => handlePreferenceChange('max_congestion', parseInt(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>여유</span>
                <span>혼잡</span>
              </div>
            </div>

            <div className="preference-item">
              <label>최대 도보시간: {preferences.max_walking_time}분</label>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={preferences.max_walking_time}
                onChange={(e) => handlePreferenceChange('max_walking_time', parseInt(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>5분</span>
                <span>30분</span>
              </div>
            </div>

            <div className="preference-item">
              <label>최대 환승횟수: {preferences.max_transfers}회</label>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={preferences.max_transfers}
                onChange={(e) => handlePreferenceChange('max_transfers', parseInt(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>직행</span>
                <span>3회</span>
              </div>
            </div>

            <div className="preference-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.prefer_speed || false}
                  onChange={(e) => handlePreferenceChange('prefer_speed', e.target.checked)}
                />
                빠른 경로 우선
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="search-button"
          disabled={loading || !originStation || !destinationStation}
        >
          {loading ? '🔍 검색 중...' : '🚇 경로 찾기'}
        </button>
      </div>

      {/* 검색 결과 */}
      {loading ? (
        <div className="search-loading">
          <div className="loading-spinner">🤖</div>
          <p>AI가 최적의 경로를 찾는 중...</p>
        </div>
      ) : recommendations ? (
        <div className="recommendation-results">
          <div className="results-header">
            <h2>📍 {originStation?.name} → {destinationStation?.name}</h2>
            <p>{recommendations.recommended_routes?.length || 0}개의 경로를 찾았습니다</p>
          </div>

          <div className="routes-list">
            {(recommendations.recommended_routes || []).map((route, index) => {
              const isBest = index === getBestRouteIndex();
              return (
                <div key={route.route_id} className={`route-card ${isBest ? 'best-route' : ''}`}>
                  {isBest && (
                    <div className="best-badge">
                      ⭐ 추천 경로
                    </div>
                  )}
                  
                  <div className="route-header">
                    <div className="route-title">
                      <h3>경로 {index + 1}</h3>
                      {route.recommendation_score && (
                        <div className="route-score">
                          점수: {route.recommendation_score}
                        </div>
                      )}
                    </div>
                    
                    <div className="route-summary">
                      <div className="summary-item">
                        <span className="summary-label">소요시간</span>
                        <span className="summary-value time">
                          {formatDuration(route.total_time)}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">환승</span>
                        <span className="summary-value">
                          {route.transfers}회
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">혼잡도</span>
                        <span 
                          className="summary-value congestion"
                          style={{ color: getCongestionColor(route.avg_congestion) }}
                        >
                          {getCongestionIcon(route.avg_congestion)} {route.avg_congestion}%
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">도보</span>
                        <span className="summary-value">
                          {formatDuration(route.walking_time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="route-timeline">
                    <div className="timeline-item start">
                      <div className="timeline-time">{route.departure_time}</div>
                      <div className="timeline-content">
                        <span className="timeline-icon">🔵</span>
                        <span className="timeline-text">{originStation?.name}에서 출발</span>
                      </div>
                    </div>

                    {(route.steps || []).map((step, stepIndex) => (
                      <div key={stepIndex} className="timeline-item step">
                        <div className="timeline-time">
                          {formatDuration(step.duration)}
                        </div>
                        <div className="timeline-content">
                          <span className="timeline-icon">
                            {getRouteTypeIcon(step.type)}
                          </span>
                          <div className="timeline-details">
                            <span className="timeline-text">
                              {step.description || `${step.line || step.type} 이용`}
                            </span>
                            {step.congestion && (
                              <div className="step-congestion">
                                <span 
                                  style={{ color: getCongestionColor(step.congestion) }}
                                >
                                  {getCongestionIcon(step.congestion)} {step.congestion}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="timeline-item end">
                      <div className="timeline-time">{route.arrival_time}</div>
                      <div className="timeline-content">
                        <span className="timeline-icon">🔴</span>
                        <span className="timeline-text">{destinationStation?.name}에 도착</span>
                      </div>
                    </div>
                  </div>

                  {/* 추천 이유 */}
                  {route.reasons && route.reasons.length > 0 && (
                    <div className="route-reasons">
                      <h4>💡 추천 이유</h4>
                      <div className="reasons-list">
                        {route.reasons.map((reason, reasonIndex) => (
                          <span key={reasonIndex} className="reason-tag">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 추가 정보 */}
                  <div className="route-extra">
                    <div className="extra-info">
                      {route.estimated_cost && (
                        <div className="info-item">
                          <span className="info-icon">💰</span>
                          <span>예상 요금: {formatCost(route.estimated_cost)}</span>
                        </div>
                      )}
                      {route.carbon_footprint && (
                        <div className="info-item">
                          <span className="info-icon">🌱</span>
                          <span>CO₂ 배출: {route.carbon_footprint}kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : originStation && destinationStation ? (
        <div className="search-prompt">
          <span>🔍</span>
          <p>경로 찾기 버튼을 클릭하여 추천 경로를 확인하세요</p>
        </div>
      ) : (
        <div className="initial-state">
          <span>🗺️</span>
          <p>출발지와 도착지를 선택해주세요</p>
        </div>
      )}
    </div>
  );
};

export default RouteRecommendation;