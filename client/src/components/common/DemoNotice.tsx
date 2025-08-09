import React, { useState } from 'react';
import './DemoNotice.css';

const DemoNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="demo-notice">
      <div className="demo-notice-content">
        <span className="demo-notice-icon">📊</span>
        <div className="demo-notice-text">
          <strong>2025 국민행복증진 교통·물류 공모전</strong>
          <small>프로토타입 - 시연용 데이터 사용 중</small>
        </div>
        <button 
          className="demo-notice-close" 
          onClick={() => setIsVisible(false)}
          aria-label="알림 닫기"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DemoNotice;