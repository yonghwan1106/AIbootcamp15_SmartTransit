import React, { useState, useEffect } from 'react';
import { Station } from '../types';
import './UserProfile.css';

interface UserPattern {
  id: string;
  originStationId: string;
  destinationStationId: string;
  originStationName: string;
  destinationStationName: string;
  typicalDepartureTime: string;
  frequency: number;
  avgDuration: number;
}

interface UserPreferences {
  maxCongestion: number;
  maxWalkingTime: number;
  maxTransfers: number;
  preferSpeed: boolean;
  preferCost: boolean;
  preferComfort: boolean;
  notificationEnabled: boolean;
  earlyWarning: number; // 출발 몇 분 전에 알림
}

interface UserProfileProps {
  stations: Station[];
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ stations, onClose }) => {
  const [activeTab, setActiveTab] = useState<'patterns' | 'preferences' | 'stats'>('patterns');
  const [patterns, setPatterns] = useState<UserPattern[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    maxCongestion: 70,
    maxWalkingTime: 15,
    maxTransfers: 2,
    preferSpeed: true,
    preferCost: false,
    preferComfort: false,
    notificationEnabled: true,
    earlyWarning: 10,
  });
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [newPattern, setNewPattern] = useState({
    originStationId: '',
    destinationStationId: '',
    typicalDepartureTime: '09:00',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // 로컬 스토리지에서 사용자 데이터 불러오기
    const savedPatterns = localStorage.getItem('userPatterns');
    const savedPreferences = localStorage.getItem('userPreferences');

    if (savedPatterns) {
      setPatterns(JSON.parse(savedPatterns));
    }

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  };

  const savePatterns = (newPatterns: UserPattern[]) => {
    setPatterns(newPatterns);
    localStorage.setItem('userPatterns', JSON.stringify(newPatterns));
  };

  const savePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const addPattern = () => {
    if (!newPattern.originStationId || !newPattern.destinationStationId) {
      alert('출발지와 도착지를 모두 선택해주세요.');
      return;
    }

    if (newPattern.originStationId === newPattern.destinationStationId) {
      alert('출발지와 도착지가 같을 수 없습니다.');
      return;
    }

    const originStation = stations.find(s => s.id === newPattern.originStationId);
    const destinationStation = stations.find(s => s.id === newPattern.destinationStationId);

    if (!originStation || !destinationStation) {
      alert('유효하지 않은 역입니다.');
      return;
    }

    const pattern: UserPattern = {
      id: Date.now().toString(),
      originStationId: newPattern.originStationId,
      destinationStationId: newPattern.destinationStationId,
      originStationName: originStation.name,
      destinationStationName: destinationStation.name,
      typicalDepartureTime: newPattern.typicalDepartureTime,
      frequency: 1,
      avgDuration: 35 + Math.floor(Math.random() * 20), // 예상 소요시간
    };

    savePatterns([...patterns, pattern]);
    setNewPattern({
      originStationId: '',
      destinationStationId: '',
      typicalDepartureTime: '09:00',
    });
    setShowAddPattern(false);
  };

  const removePattern = (patternId: string) => {
    const updatedPatterns = patterns.filter(p => p.id !== patternId);
    savePatterns(updatedPatterns);
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const calculateStats = () => {
    const totalPatterns = patterns.length;
    const avgDuration = patterns.length > 0 
      ? Math.round(patterns.reduce((sum, p) => sum + p.avgDuration, 0) / patterns.length)
      : 0;
    const totalFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0);
    const mostUsedRoute = patterns.sort((a, b) => b.frequency - a.frequency)[0];

    return {
      totalPatterns,
      avgDuration,
      totalFrequency,
      mostUsedRoute,
    };
  };

  const stats = calculateStats();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>👤 사용자 프로필</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            🚇 이용 패턴
          </button>
          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ 설정
          </button>
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 통계
          </button>
        </div>

        <div className="profile-content">
          {/* 이용 패턴 탭 */}
          {activeTab === 'patterns' && (
            <div className="patterns-tab">
              <div className="tab-header">
                <h4>자주 이용하는 경로</h4>
                <button 
                  className="add-pattern-btn"
                  onClick={() => setShowAddPattern(true)}
                >
                  + 경로 추가
                </button>
              </div>

              {patterns.length === 0 ? (
                <div className="empty-patterns">
                  <p>등록된 이용 패턴이 없습니다.</p>
                  <p>자주 이용하는 경로를 등록하면 맞춤형 예측을 받을 수 있습니다.</p>
                </div>
              ) : (
                <div className="patterns-list">
                  {patterns.map(pattern => (
                    <div key={pattern.id} className="pattern-item">
                      <div className="pattern-route">
                        <div className="route-stations">
                          <span className="origin">{pattern.originStationName}</span>
                          <span className="arrow">→</span>
                          <span className="destination">{pattern.destinationStationName}</span>
                        </div>
                        <div className="pattern-details">
                          <span className="departure-time">🕐 {pattern.typicalDepartureTime}</span>
                          <span className="frequency">📊 {pattern.frequency}회 이용</span>
                          <span className="duration">⏱️ 평균 {pattern.avgDuration}분</span>
                        </div>
                      </div>
                      <button
                        className="remove-pattern-btn"
                        onClick={() => removePattern(pattern.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 패턴 추가 모달 */}
              {showAddPattern && (
                <div className="add-pattern-modal">
                  <div className="add-pattern-content">
                    <h4>새 이용 패턴 추가</h4>
                    <div className="pattern-form">
                      <div className="form-group">
                        <label>출발지</label>
                        <select
                          value={newPattern.originStationId}
                          onChange={(e) => setNewPattern({...newPattern, originStationId: e.target.value})}
                        >
                          <option value="">출발지를 선택하세요</option>
                          {stations.map(station => (
                            <option key={station.id} value={station.id}>
                              {station.name} ({station.line_id}호선)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>도착지</label>
                        <select
                          value={newPattern.destinationStationId}
                          onChange={(e) => setNewPattern({...newPattern, destinationStationId: e.target.value})}
                        >
                          <option value="">도착지를 선택하세요</option>
                          {stations.map(station => (
                            <option key={station.id} value={station.id}>
                              {station.name} ({station.line_id}호선)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>주로 출발하는 시간</label>
                        <input
                          type="time"
                          value={newPattern.typicalDepartureTime}
                          onChange={(e) => setNewPattern({...newPattern, typicalDepartureTime: e.target.value})}
                        />
                      </div>
                      <div className="pattern-form-actions">
                        <button className="cancel-btn" onClick={() => setShowAddPattern(false)}>
                          취소
                        </button>
                        <button className="add-btn" onClick={addPattern}>
                          추가
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 설정 탭 */}
          {activeTab === 'preferences' && (
            <div className="preferences-tab">
              <h4>개인 맞춤 설정</h4>
              
              <div className="preference-groups">
                <div className="preference-group">
                  <h5>경로 추천 기준</h5>
                  <div className="preference-item">
                    <label>최대 허용 혼잡도: {preferences.maxCongestion}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={preferences.maxCongestion}
                      onChange={(e) => updatePreference('maxCongestion', parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="slider-labels">
                      <span>여유함</span>
                      <span>혼잡함</span>
                    </div>
                  </div>
                  
                  <div className="preference-item">
                    <label>최대 도보시간: {preferences.maxWalkingTime}분</label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={preferences.maxWalkingTime}
                      onChange={(e) => updatePreference('maxWalkingTime', parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="slider-labels">
                      <span>5분</span>
                      <span>30분</span>
                    </div>
                  </div>
                  
                  <div className="preference-item">
                    <label>최대 환승횟수: {preferences.maxTransfers}회</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={preferences.maxTransfers}
                      onChange={(e) => updatePreference('maxTransfers', parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="slider-labels">
                      <span>직행</span>
                      <span>3회</span>
                    </div>
                  </div>
                </div>

                <div className="preference-group">
                  <h5>우선순위</h5>
                  <div className="checkbox-preferences">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={preferences.preferSpeed}
                        onChange={(e) => updatePreference('preferSpeed', e.target.checked)}
                      />
                      빠른 이동시간 우선
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={preferences.preferCost}
                        onChange={(e) => updatePreference('preferCost', e.target.checked)}
                      />
                      저렴한 요금 우선
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={preferences.preferComfort}
                        onChange={(e) => updatePreference('preferComfort', e.target.checked)}
                      />
                      편안한 이동 우선
                    </label>
                  </div>
                </div>

                <div className="preference-group">
                  <h5>알림 설정</h5>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={preferences.notificationEnabled}
                      onChange={(e) => updatePreference('notificationEnabled', e.target.checked)}
                    />
                    개인화 알림 받기
                  </label>
                  
                  {preferences.notificationEnabled && (
                    <div className="preference-item">
                      <label>출발 {preferences.earlyWarning}분 전 알림</label>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={preferences.earlyWarning}
                        onChange={(e) => updatePreference('earlyWarning', parseInt(e.target.value))}
                        className="slider"
                      />
                      <div className="slider-labels">
                        <span>5분 전</span>
                        <span>30분 전</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 통계 탭 */}
          {activeTab === 'stats' && (
            <div className="stats-tab">
              <h4>이용 통계</h4>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🚇</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalPatterns}</div>
                    <div className="stat-label">등록된 경로</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.avgDuration}분</div>
                    <div className="stat-label">평균 이동시간</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalFrequency}회</div>
                    <div className="stat-label">총 이용 횟수</div>
                  </div>
                </div>
                
                {stats.mostUsedRoute && (
                  <div className="stat-card most-used">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                      <div className="stat-route">
                        {stats.mostUsedRoute.originStationName} → {stats.mostUsedRoute.destinationStationName}
                      </div>
                      <div className="stat-label">가장 많이 이용한 경로</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="usage-insights">
                <h5>이용 패턴 분석</h5>
                <div className="insights-list">
                  {patterns.length > 0 ? (
                    <>
                      <div className="insight-item">
                        💡 주로 {patterns[0]?.typicalDepartureTime.slice(0,2)}시경에 이동하시는군요!
                      </div>
                      <div className="insight-item">
                        🎯 평균 이동시간이 {stats.avgDuration}분입니다.
                      </div>
                      {patterns.length >= 3 && (
                        <div className="insight-item">
                          ⚡ 여러 경로를 이용하시는 규칙적인 사용자입니다.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="insight-item">
                      📝 이용 패턴을 등록하면 맞춤형 분석을 받을 수 있습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;