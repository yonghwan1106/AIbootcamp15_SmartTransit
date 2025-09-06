import React from 'react';
import './CongestionMeter.css';

interface CongestionMeterProps {
  level: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

const CongestionMeter: React.FC<CongestionMeterProps> = ({
  level,
  size = 'medium',
  showPercentage = true,
  showIcon = true,
  animated = true,
  className = ''
}) => {
  const getCongestionData = (level: number) => {
    if (level <= 30) {
      return {
        status: 'low',
        text: '여유',
        color: '#4CAF50',
        icon: '😊',
        description: '자리가 많아요'
      };
    } else if (level <= 70) {
      return {
        status: 'medium',
        text: '보통',
        color: '#FF9800',
        icon: '😐',
        description: '적당해요'
      };
    } else {
      return {
        status: 'heavy',
        text: '혼잡',
        color: '#F44336',
        icon: '😰',
        description: '매우 붐벼요'
      };
    }
  };

  const congestionData = getCongestionData(level);
  const circumference = 2 * Math.PI * 45; // 반지름 45px의 원둘레
  const strokeDashoffset = circumference - (level / 100) * circumference;

  const sizeClasses = {
    small: 'congestion-meter--small',
    medium: 'congestion-meter--medium',
    large: 'congestion-meter--large'
  };

  return (
    <div className={`congestion-meter ${sizeClasses[size]} ${animated ? 'congestion-meter--animated' : ''} ${className}`}>
      {/* 원형 진행률 표시 */}
      <div className="congestion-meter__circle-container">
        <svg className="congestion-meter__svg" viewBox="0 0 100 100">
          {/* 배경 원 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="8"
          />
          {/* 진행률 원 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={congestionData.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? strokeDashoffset : 0}
            className="congestion-meter__progress-circle"
            style={{
              '--final-offset': strokeDashoffset
            } as React.CSSProperties}
          />
        </svg>
        
        {/* 중앙 내용 */}
        <div className="congestion-meter__content">
          {showIcon && (
            <div className="congestion-meter__icon">
              {congestionData.icon}
            </div>
          )}
          {showPercentage && (
            <div className="congestion-meter__percentage">
              {level}%
            </div>
          )}
          <div 
            className="congestion-meter__status"
            style={{ color: congestionData.color }}
          >
            {congestionData.text}
          </div>
        </div>
      </div>
      
      {/* 하단 설명 */}
      <div className="congestion-meter__description">
        {congestionData.description}
      </div>
    </div>
  );
};

export default CongestionMeter;