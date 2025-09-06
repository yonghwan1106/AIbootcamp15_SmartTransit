import React, { useState, useEffect } from 'react';
import { stationApi, congestionApi } from '../services/api';
import { Station, CongestionData } from '../types';
import { getCongestionColor, getCongestionIcon, formatRelativeTime, debounce } from '../utils/helpers';
import './StationSearch.css';

const StationSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [congestionData, setCongestionData] = useState<CongestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(true);

  // 디바운스된 검색 함수
  const debouncedSearch = debounce((term: string) => {
    if (term.trim()) {
      const filtered = stations.filter((station: any) =>
        station.name.toLowerCase().includes(term.toLowerCase()) ||
        station.line_id.includes(term)
      );
      setFilteredStations(filtered);
    } else {
      setFilteredStations(stations.slice(0, 10)); // 기본적으로 처음 10개만 표시
    }
  }, 300);

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, stations]);

  const loadStations = async () => {
    try {
      setSearchLoading(true);
      const response = await stationApi.getAll({ station_type: 'subway' });
      if (response.data.status === 'success') {
        const stationList = response.data.data!.stations;
        setStations(stationList);
        setFilteredStations(stationList.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStationSelect = async (station: Station) => {
    setSelectedStation(station);
    setLoading(true);
    setCongestionData(null);

    try {
      const response = await congestionApi.getRealtime(station.id);
      if (response.data.status === 'success') {
        setCongestionData(response.data.data!);
      }
    } catch (error) {
      console.error('Error loading congestion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedStation(null);
    setCongestionData(null);
  };

  return (
    <div className="station-search">
      <div className="search-header">
        <h1>개인 맞춤형 혼잡도 예측 알림 서비스</h1>
        <p className="search-contest">
          AI창업부트캠프 15기 오프라인 해커톤 출품작
        </p>
        <p className="search-subtitle">
          검색하고 싶은 역명을 입력하여 실시간 혼잡도를 확인하세요
        </p>
      </div>

      <div className="search-container">
        <div className="search-box">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="역명을 입력하세요 (예: 강남역, 홍대입구역)"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="clear-button"
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}
            <div className="search-icon">🔍</div>
          </div>
          
          {searchTerm && (
            <div className="search-results">
              {searchLoading ? (
                <div className="search-loading">
                  <span className="loading-spinner small">⏳</span>
                  검색 중...
                </div>
              ) : filteredStations.length > 0 ? (
                <div className="station-list">
                  {filteredStations.map(station => (
                    <div
                      key={station.id}
                      className={`station-item ${selectedStation?.id === station.id ? 'selected' : ''}`}
                      onClick={() => handleStationSelect(station)}
                    >
                      <div className="station-info">
                        <span className="station-name">{station.name}</span>
                        <span className="station-line">{station.line_id}호선</span>
                      </div>
                      <div className="station-type">
                        {station.station_type === 'subway' ? '🚇' : '🚌'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <span>😅</span>
                  <p>검색 결과가 없습니다.</p>
                  <small>다른 키워드로 검색해보세요.</small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedStation && (
        <div className="station-details">
          <div className="details-header">
            <h2>{selectedStation.name}</h2>
            <div className="station-meta">
              <span className="line-badge">{selectedStation.line_id}호선</span>
              <span className="station-type-badge">
                {selectedStation.station_type === 'subway' ? '지하철' : '버스'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="details-loading">
              <div className="loading-spinner">🚇</div>
              <p>혼잡도 정보를 불러오는 중...</p>
            </div>
          ) : congestionData ? (
            <div className="congestion-details">
              {/* 현재 혼잡도 */}
              <div className="current-congestion">
                <div className="congestion-header">
                  <h3>현재 혼잡도</h3>
                  <span className="update-time">
                    {formatRelativeTime(congestionData.updated_at)} 업데이트
                  </span>
                </div>
                
                <div className="congestion-main">
                  <div className="congestion-visual">
                    <span className="congestion-icon">
                      {getCongestionIcon(congestionData.congestion_level)}
                    </span>
                    <div className="congestion-meter">
                      <div 
                        className="congestion-fill"
                        style={{
                          width: `${congestionData.current_congestion}%`,
                          backgroundColor: getCongestionColor(congestionData.current_congestion)
                        }}
                      />
                      <span className="congestion-percentage">
                        {congestionData.current_congestion}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="congestion-info">
                    <div className="congestion-level">
                      {congestionData.congestion_level === 'low' ? '여유' :
                       congestionData.congestion_level === 'medium' ? '보통' : '혼잡'}
                    </div>
                    <div className="passenger-count">
                      현재 승객: {congestionData.passenger_count}명
                    </div>
                  </div>
                </div>
              </div>

              {/* 다음 열차 정보 */}
              <div className="upcoming-trains">
                <h3>다음 열차</h3>
                <div className="trains-list">
                  {congestionData.vehicles.map((vehicle, index) => (
                    <div key={vehicle.vehicle_id} className="train-item">
                      <div className="train-header">
                        <span className="train-number">
                          {index + 1}번째 열차
                        </span>
                        <span className="arrival-time">
                          {vehicle.arrival_time}
                        </span>
                      </div>
                      
                      <div className="train-congestion">
                        <div className="train-congestion-bar">
                          <div 
                            className="train-congestion-fill"
                            style={{
                              width: `${vehicle.congestion}%`,
                              backgroundColor: getCongestionColor(vehicle.congestion)
                            }}
                          />
                          <span className="train-congestion-text">
                            {vehicle.congestion}%
                          </span>
                        </div>
                        <span className="train-status">
                          {getCongestionIcon(vehicle.congestion)} 
                          {vehicle.congestion <= 30 ? '여유' :
                           vehicle.congestion <= 70 ? '보통' : '혼잡'}
                        </span>
                      </div>

                      {/* 차량별 혼잡도 (10량) */}
                      <div className="car-congestion">
                        <span className="car-label">차량별:</span>
                        <div className="car-list">
                          {vehicle.car_positions.map((congestion, carIndex) => (
                            <div
                              key={carIndex}
                              className="car-item"
                              style={{
                                backgroundColor: getCongestionColor(congestion)
                              }}
                              title={`${carIndex + 1}번째 차량: ${congestion}%`}
                            >
                              {carIndex + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 추천 사항 */}
              <div className="recommendations">
                <h3>💡 추천 사항</h3>
                <div className="recommendation-list">
                  {congestionData.current_congestion > 70 ? (
                    <>
                      <div className="recommendation-item">
                        <span className="rec-icon">⏰</span>
                        <span>10-15분 후에 이용하시면 혼잡도가 낮아집니다</span>
                      </div>
                      <div className="recommendation-item">
                        <span className="rec-icon">🚶</span>
                        <span>인근 역 이용도 고려해보세요</span>
                      </div>
                    </>
                  ) : congestionData.current_congestion > 40 ? (
                    <div className="recommendation-item">
                      <span className="rec-icon">👍</span>
                      <span>적당한 혼잡도입니다. 이용하기 좋은 시간입니다</span>
                    </div>
                  ) : (
                    <div className="recommendation-item">
                      <span className="rec-icon">✨</span>
                      <span>여유로운 상태입니다. 편안한 이동이 가능합니다</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="details-error">
              <span>❌</span>
              <p>혼잡도 정보를 불러올 수 없습니다</p>
              <button 
                onClick={() => handleStationSelect(selectedStation)}
                className="retry-button"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      )}

      {/* 인기 검색 역 */}
      {!selectedStation && (
        <div className="popular-stations">
          <h3>🔥 인기 검색 역</h3>
          <div className="popular-list">
            {stations.slice(0, 8).map(station => (
              <button
                key={station.id}
                className="popular-station-item"
                onClick={() => handleStationSelect(station)}
              >
                <span className="popular-station-name">{station.name}</span>
                <span className="popular-station-line">{station.line_id}호선</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StationSearch;