import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { stationApi, predictionApi } from '../services/api';
import { Station, PredictionResponse } from '../types';
import { getCongestionColor, formatTime, formatConfidence } from '../utils/helpers';
import './Prediction.css';

const Prediction: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [predictionHours, setPredictionHours] = useState<number>(3);

  useEffect(() => {
    loadStations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStations = async () => {
    try {
      setStationsLoading(true);
      const response = await stationApi.getAll({ station_type: 'subway' });
      if (response.data.status === 'success') {
        setStations(response.data.data!.stations);
        // 기본으로 강남역 선택
        const gangnam = response.data.data!.stations.find((s: Station) => s.id === '239');
        if (gangnam) {
          setSelectedStation(gangnam);
          await loadPrediction(gangnam, predictionHours);
        }
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setStationsLoading(false);
    }
  };

  const loadPrediction = async (station: Station, hours: number) => {
    try {
      setLoading(true);
      const response = await predictionApi.getPrediction(station.id, { 
        duration_hours: hours 
      });
      if (response.data.status === 'success') {
        setPredictionData(response.data.data!);
      }
    } catch (error) {
      console.error('Error loading prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = async (stationId: string) => {
    const station = stations.find((s: Station) => s.id === stationId);
    if (station) {
      setSelectedStation(station);
      await loadPrediction(station, predictionHours);
    }
  };

  const handleHoursChange = async (hours: number) => {
    setPredictionHours(hours);
    if (selectedStation) {
      await loadPrediction(selectedStation, hours);
    }
  };

  const generateChartData = () => {
    if (!predictionData) return { labels: [], datasets: [] };

    const labels = predictionData.predictions.map(p => 
      formatTime(p.time, 'HH:mm')
    );
    
    const congestionData = predictionData.predictions.map(p => p.congestion);
    const confidenceData = predictionData.predictions.map(p => p.confidence * 100);

    return {
      labels,
      datasets: [
        {
          label: '예상 혼잡도 (%)',
          data: congestionData,
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y',
        },
        {
          label: '예측 신뢰도 (%)',
          data: confidenceData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'y1',
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '시간',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '혼잡도 (%)',
        },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '신뢰도 (%)',
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: `${selectedStation?.name || ''} 혼잡도 예측`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            if (predictionData && context.dataIndex < predictionData.predictions.length) {
              const prediction = predictionData.predictions[context.dataIndex];
              return [
                `날씨 영향: ${prediction.weather_impact}`,
                `이벤트 영향: ${prediction.event_impact}`
              ];
            }
            return [];
          }
        }
      }
    },
  };

  const getPredictionLevel = (congestion: number) => {
    if (congestion <= 30) return 'low';
    if (congestion <= 70) return 'medium';
    return 'heavy';
  };

  const getPredictionText = (level: string) => {
    switch (level) {
      case 'low': return '여유';
      case 'medium': return '보통';
      case 'heavy': return '혼잡';
      default: return '알 수 없음';
    }
  };

  const getRecommendation = (predictions: any[]) => {
    if (!predictions || predictions.length === 0) return null;

    // 다음 3시간 중 가장 여유로운 시간 찾기
    const next3Hours = predictions.slice(0, 6); // 30분 간격이므로 6개
    const bestTime = next3Hours.reduce((best, current) => 
      current.congestion < best.congestion ? current : best
    );

    const worstTime = next3Hours.reduce((worst, current) => 
      current.congestion > worst.congestion ? current : worst
    );

    return {
      bestTime: {
        time: formatTime(bestTime.time, 'HH:mm'),
        congestion: bestTime.congestion,
        confidence: bestTime.confidence
      },
      worstTime: {
        time: formatTime(worstTime.time, 'HH:mm'),
        congestion: worstTime.congestion,
        confidence: worstTime.confidence
      }
    };
  };

  if (stationsLoading) {
    return (
      <div className="prediction">
        <div className="loading-container">
          <div className="loading-spinner">🔮</div>
          <p>예측 시스템을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prediction">
      <div className="prediction-header">
        <h1>개인 맞춤형 혼잡도 예측 알림 서비스</h1>
        <p className="prediction-contest">
          2025 국민행복증진 교통·물류 아이디어 공모전 출품작
        </p>
        <p className="prediction-subtitle">
          AI가 분석한 향후 혼잡도 변화를 확인하고 최적의 이용 시간을 찾아보세요
        </p>
      </div>

      <div className="prediction-controls">
        <div className="control-group">
          <label htmlFor="station-select">역 선택:</label>
          <select
            id="station-select"
            value={selectedStation?.id || ''}
            onChange={(e) => handleStationChange(e.target.value)}
            className="station-select"
          >
            <option value="">역을 선택하세요</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name} ({station.line_id}호선)
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="hours-select">예측 기간:</label>
          <select
            id="hours-select"
            value={predictionHours}
            onChange={(e) => handleHoursChange(parseInt(e.target.value))}
            className="hours-select"
          >
            <option value={1}>1시간</option>
            <option value={2}>2시간</option>
            <option value={3}>3시간</option>
            <option value={6}>6시간</option>
          </select>
        </div>

        <button
          onClick={() => selectedStation && loadPrediction(selectedStation, predictionHours)}
          className="refresh-button"
          disabled={loading || !selectedStation}
        >
          {loading ? '⏳' : '🔄'} 새로고침
        </button>
      </div>

      {loading ? (
        <div className="prediction-loading">
          <div className="loading-spinner">🤖</div>
          <p>AI가 혼잡도를 예측하는 중...</p>
        </div>
      ) : predictionData ? (
        <div className="prediction-results">
          {/* 예측 차트 */}
          <div className="chart-container">
            <div className="chart-wrapper">
              <Line data={generateChartData()} options={chartOptions} />
            </div>
            <div className="model-info">
              <span className="model-accuracy">
                📊 모델 정확도: {formatConfidence(predictionData.model_accuracy)}
              </span>
              <span className="last-update">
                🕐 업데이트: {formatTime(predictionData.prediction_params.generated_at, 'HH:mm')}
              </span>
            </div>
          </div>

          {/* 예측 요약 */}
          {(() => {
            const recommendation = getRecommendation(predictionData.predictions);
            return recommendation ? (
              <div className="prediction-summary">
                <h3>🎯 최적 이용 시간 추천</h3>
                <div className="summary-cards">
                  <div className="summary-card best-time">
                    <div className="card-icon">✨</div>
                    <div className="card-content">
                      <div className="card-title">가장 여유로운 시간</div>
                      <div className="card-time">{recommendation.bestTime.time}</div>
                      <div className="card-congestion">
                        <span style={{ color: getCongestionColor(recommendation.bestTime.congestion) }}>
                          {recommendation.bestTime.congestion}% 혼잡도
                        </span>
                        <span className="confidence">
                          신뢰도 {formatConfidence(recommendation.bestTime.confidence)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="summary-card worst-time">
                    <div className="card-icon">⚠️</div>
                    <div className="card-content">
                      <div className="card-title">가장 혼잡한 시간</div>
                      <div className="card-time">{recommendation.worstTime.time}</div>
                      <div className="card-congestion">
                        <span style={{ color: getCongestionColor(recommendation.worstTime.congestion) }}>
                          {recommendation.worstTime.congestion}% 혼잡도
                        </span>
                        <span className="confidence">
                          신뢰도 {formatConfidence(recommendation.worstTime.confidence)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* 시간대별 예측 상세 */}
          <div className="prediction-timeline">
            <h3>📅 시간대별 예측 상세</h3>
            <div className="timeline-list">
              {predictionData.predictions.slice(0, 12).map((prediction, index) => {
                const level = getPredictionLevel(prediction.congestion);
                return (
                  <div key={index} className={`timeline-item ${level}`}>
                    <div className="timeline-time">
                      {formatTime(prediction.time, 'HH:mm')}
                    </div>
                    <div className="timeline-congestion">
                      <div className="congestion-bar">
                        <div 
                          className="congestion-fill"
                          style={{
                            width: `${prediction.congestion}%`,
                            backgroundColor: getCongestionColor(prediction.congestion)
                          }}
                        />
                      </div>
                      <span className="congestion-text">
                        {prediction.congestion}%
                      </span>
                    </div>
                    <div className="timeline-status">
                      {getPredictionText(level)}
                    </div>
                    <div className="timeline-confidence">
                      신뢰도 {formatConfidence(prediction.confidence)}
                    </div>
                    <div className="timeline-factors">
                      {prediction.weather_impact !== 'none' && (
                        <span className="factor weather">
                          🌦️ 날씨영향
                        </span>
                      )}
                      {prediction.event_impact !== 'none' && (
                        <span className="factor event">
                          🎉 이벤트영향
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 예측 정보 */}
          <div className="prediction-info">
            <h3>🤖 예측 모델 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">모델 정확도</div>
                <div className="info-value">
                  {formatConfidence(predictionData.model_accuracy)}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">예측 기간</div>
                <div className="info-value">
                  {predictionData.prediction_params.duration_hours}시간
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">업데이트 간격</div>
                <div className="info-value">30분</div>
              </div>
              <div className="info-item">
                <div className="info-label">사용 데이터</div>
                <div className="info-value">교통카드, CCTV, 센서</div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedStation ? (
        <div className="prediction-empty">
          <span>📊</span>
          <p>예측 데이터를 불러올 수 없습니다</p>
          <button
            onClick={() => loadPrediction(selectedStation, predictionHours)}
            className="retry-button"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="prediction-select">
          <span>🚇</span>
          <p>역을 선택하여 혼잡도 예측을 확인하세요</p>
        </div>
      )}
    </div>
  );
};

export default Prediction;