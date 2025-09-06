import React from 'react';
import './InteractionLoader.css';

interface InteractionLoaderProps {
  message?: string;
  submessage?: string;
  variant?: 'default' | 'minimal' | 'full';
  className?: string;
}

const InteractionLoader: React.FC<InteractionLoaderProps> = ({
  message = "처리 중...",
  submessage = "잠시만 기다려 주세요",
  variant = 'default',
  className = ''
}) => {
  return (
    <div className={`interaction-loader interaction-loader--${variant} ${className}`}>
      <div className="interaction-loader__content">
        {variant === 'full' && (
          <div className="interaction-loader__animation">
            <div className="metro-animation">
              <div className="metro-train">
                <div className="train-car train-car--head"></div>
                <div className="train-car train-car--body"></div>
                <div className="train-car train-car--body"></div>
                <div className="train-car train-car--tail"></div>
              </div>
              <div className="metro-track"></div>
              <div className="metro-stations">
                <div className="station-dot"></div>
                <div className="station-dot"></div>
                <div className="station-dot"></div>
                <div className="station-dot station-dot--active"></div>
                <div className="station-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        {variant !== 'minimal' && (
          <div className="interaction-loader__spinner">
            <div className="spinner-rings">
              <div className="spinner-ring spinner-ring--1"></div>
              <div className="spinner-ring spinner-ring--2"></div>
              <div className="spinner-ring spinner-ring--3"></div>
            </div>
          </div>
        )}

        <div className="interaction-loader__text">
          <div className="loader-message">{message}</div>
          {submessage && (
            <div className="loader-submessage">{submessage}</div>
          )}
        </div>

        {variant === 'default' && (
          <div className="interaction-loader__progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-dots">
              <div className="progress-dot"></div>
              <div className="progress-dot"></div>
              <div className="progress-dot"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionLoader;