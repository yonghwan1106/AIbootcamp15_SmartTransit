import React from 'react';
import './LoadingCard.css';

interface LoadingCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ 
  title = '데이터 로딩 중...', 
  subtitle = '실시간 정보를 가져오고 있습니다',
  className = '' 
}) => {
  return (
    <div className={`loading-card ${className}`}>
      <div className="loading-card__header">
        <div className="loading-card__title-skeleton skeleton-shimmer"></div>
        <div className="loading-card__subtitle-skeleton skeleton-shimmer"></div>
      </div>
      
      <div className="loading-card__content">
        {/* 원형 로딩 표시 */}
        <div className="loading-card__circle">
          <div className="loading-spinner">
            <div className="loading-spinner__ring"></div>
            <div className="loading-spinner__ring"></div>
            <div className="loading-spinner__ring"></div>
          </div>
          <div className="loading-card__text">
            <div className="loading-card__title">{title}</div>
            <div className="loading-card__subtitle">{subtitle}</div>
          </div>
        </div>
        
        {/* 하단 상세 정보 스켈레톤 */}
        <div className="loading-card__details">
          <div className="loading-card__detail-item">
            <div className="skeleton-shimmer skeleton-line-short"></div>
            <div className="skeleton-shimmer skeleton-line-medium"></div>
          </div>
          <div className="loading-card__detail-item">
            <div className="skeleton-shimmer skeleton-line-short"></div>
            <div className="skeleton-shimmer skeleton-line-medium"></div>
          </div>
        </div>
        
        {/* 열차 정보 스켈레톤 */}
        <div className="loading-card__vehicles">
          <div className="skeleton-shimmer skeleton-line-medium" style={{ marginBottom: '12px' }}></div>
          <div className="loading-card__vehicle-skeleton">
            <div className="skeleton-shimmer skeleton-line-short"></div>
            <div className="skeleton-shimmer skeleton-line-long"></div>
          </div>
          <div className="loading-card__vehicle-skeleton">
            <div className="skeleton-shimmer skeleton-line-short"></div>
            <div className="skeleton-shimmer skeleton-line-long"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;