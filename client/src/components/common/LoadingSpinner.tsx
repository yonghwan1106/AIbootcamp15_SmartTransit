import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  centered?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  centered = true
}) => {
  const containerClass = centered 
    ? 'loading-spinner-container' 
    : 'loading-spinner-container inline';

  return (
    <div className={containerClass}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring">🚇</div>
      </div>
      {message && (
        <p className="loading-message">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;