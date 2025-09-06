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
          <strong>AI창업부트캠프 15기 오프라인 해커톤 출품작</strong>
          <small>프로토타입 - 실시간 API 연동 중</small>
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