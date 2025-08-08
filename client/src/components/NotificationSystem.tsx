import React, { useState, useEffect } from 'react';
import { Station, CongestionData } from '../types';
import './NotificationSystem.css';

interface NotificationRule {
  id: string;
  stationId: string;
  stationName: string;
  threshold: number;
  type: 'above' | 'below';
  enabled: boolean;
  timeRange?: {
    start: string;
    end: string;
  };
}

interface NotificationSystemProps {
  stations: Station[];
  congestionData: { [key: string]: CongestionData };
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ stations, congestionData }) => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    timestamp: Date;
  }>>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // 브라우저 알림 권한 요청
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setPermission(permission);
        });
      }
    }

    // 로컬 스토리지에서 알림 규칙 불러오기
    const savedRules = localStorage.getItem('notificationRules');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, []);

  useEffect(() => {
    // 혼잡도 데이터가 변경될 때마다 알림 규칙 확인
    checkNotificationRules();
  }, [congestionData, rules]);

  const checkNotificationRules = () => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    rules.forEach(rule => {
      if (!rule.enabled) return;

      // 시간 범위 확인
      if (rule.timeRange) {
        const start = parseInt(rule.timeRange.start.replace(':', ''));
        const end = parseInt(rule.timeRange.end.replace(':', ''));
        if (currentTime < start || currentTime > end) return;
      }

      const congestion = congestionData[rule.stationId];
      if (!congestion) return;

      const shouldNotify = rule.type === 'above' 
        ? congestion.current_congestion > rule.threshold
        : congestion.current_congestion < rule.threshold;

      if (shouldNotify) {
        showNotification(rule, congestion);
      }
    });
  };

  const showNotification = (rule: NotificationRule, congestion: CongestionData) => {
    const message = `${rule.stationName}: 현재 혼잡도 ${congestion.current_congestion}% (${rule.type === 'above' ? '기준치 초과' : '기준치 이하'})`;
    
    // 브라우저 알림
    if (permission === 'granted') {
      new Notification('혼잡도 알림', {
        body: message,
        icon: '/favicon.ico',
        tag: rule.id, // 같은 규칙의 중복 알림 방지
      });
    }

    // 인앱 알림
    const notification = {
      id: Date.now().toString(),
      message,
      type: rule.type === 'above' ? 'warning' as const : 'success' as const,
      timestamp: new Date(),
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // 최대 5개 유지

    // 5초 후 자동 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const addRule = (stationId: string, threshold: number, type: 'above' | 'below', timeRange?: { start: string; end: string }) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return;

    const newRule: NotificationRule = {
      id: Date.now().toString(),
      stationId,
      stationName: station.name,
      threshold,
      type,
      enabled: true,
      timeRange,
    };

    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    localStorage.setItem('notificationRules', JSON.stringify(updatedRules));
  };

  const removeRule = (ruleId: string) => {
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    setRules(updatedRules);
    localStorage.setItem('notificationRules', JSON.stringify(updatedRules));
  };

  const toggleRule = (ruleId: string) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    setRules(updatedRules);
    localStorage.setItem('notificationRules', JSON.stringify(updatedRules));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="notification-system">
      {/* 알림 표시 영역 */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <div className="notification-content">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <button 
              className="notification-dismiss"
              onClick={() => dismissNotification(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 알림 설정 버튼 */}
      <button 
        className="notification-settings-btn"
        onClick={() => setShowSettings(true)}
        title="알림 설정"
      >
        🔔 {rules.filter(r => r.enabled).length}
      </button>

      {/* 알림 설정 모달 */}
      {showSettings && (
        <NotificationSettings
          stations={stations}
          rules={rules}
          onAddRule={addRule}
          onRemoveRule={removeRule}
          onToggleRule={toggleRule}
          onClose={() => setShowSettings(false)}
          permission={permission}
        />
      )}
    </div>
  );
};

interface NotificationSettingsProps {
  stations: Station[];
  rules: NotificationRule[];
  onAddRule: (stationId: string, threshold: number, type: 'above' | 'below', timeRange?: { start: string; end: string }) => void;
  onRemoveRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onClose: () => void;
  permission: NotificationPermission;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  stations, rules, onAddRule, onRemoveRule, onToggleRule, onClose, permission
}) => {
  const [formData, setFormData] = useState({
    stationId: '',
    threshold: 70,
    type: 'above' as 'above' | 'below',
    timeEnabled: false,
    startTime: '07:00',
    endTime: '09:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stationId) return;

    const timeRange = formData.timeEnabled ? {
      start: formData.startTime,
      end: formData.endTime,
    } : undefined;

    onAddRule(formData.stationId, formData.threshold, formData.type, timeRange);
    
    // 폼 초기화
    setFormData({
      stationId: '',
      threshold: 70,
      type: 'above',
      timeEnabled: false,
      startTime: '07:00',
      endTime: '09:00',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content notification-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔔 알림 설정</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {permission !== 'granted' && (
            <div className="permission-notice">
              <p>⚠️ 브라우저 알림이 차단되어 있습니다. 알림을 받으시려면 브라우저 설정에서 알림을 허용해주세요.</p>
            </div>
          )}

          {/* 새 알림 규칙 추가 */}
          <div className="add-rule-section">
            <h4>새 알림 규칙 추가</h4>
            <form onSubmit={handleSubmit} className="rule-form">
              <div className="form-row">
                <div className="form-group">
                  <label>역 선택</label>
                  <select
                    value={formData.stationId}
                    onChange={(e) => setFormData({...formData, stationId: e.target.value})}
                    required
                  >
                    <option value="">역을 선택하세요</option>
                    {stations.map(station => (
                      <option key={station.id} value={station.id}>
                        {station.name} ({station.line_id}호선)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>조건</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'above' | 'below'})}
                  >
                    <option value="above">혼잡도가 기준치보다 높을 때</option>
                    <option value="below">혼잡도가 기준치보다 낮을 때</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>기준 혼잡도: {formData.threshold}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.threshold}
                    onChange={(e) => setFormData({...formData, threshold: parseInt(e.target.value)})}
                    className="threshold-slider"
                  />
                </div>
              </div>

              <div className="time-range-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.timeEnabled}
                    onChange={(e) => setFormData({...formData, timeEnabled: e.target.checked})}
                  />
                  특정 시간대에만 알림
                </label>
                
                {formData.timeEnabled && (
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    />
                    <span>~</span>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="add-rule-btn">
                알림 규칙 추가
              </button>
            </form>
          </div>

          {/* 기존 알림 규칙 목록 */}
          <div className="rules-list-section">
            <h4>현재 알림 규칙 ({rules.length}개)</h4>
            {rules.length === 0 ? (
              <p className="no-rules">설정된 알림 규칙이 없습니다.</p>
            ) : (
              <div className="rules-list">
                {rules.map(rule => (
                  <div key={rule.id} className={`rule-item ${!rule.enabled ? 'disabled' : ''}`}>
                    <div className="rule-info">
                      <div className="rule-station">{rule.stationName}</div>
                      <div className="rule-condition">
                        혼잡도 {rule.threshold}% {rule.type === 'above' ? '초과' : '미만'} 시 알림
                      </div>
                      {rule.timeRange && (
                        <div className="rule-time">
                          {rule.timeRange.start} ~ {rule.timeRange.end}
                        </div>
                      )}
                    </div>
                    <div className="rule-actions">
                      <button
                        className="toggle-rule-btn"
                        onClick={() => onToggleRule(rule.id)}
                      >
                        {rule.enabled ? '🔔' : '🔕'}
                      </button>
                      <button
                        className="remove-rule-btn"
                        onClick={() => onRemoveRule(rule.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;