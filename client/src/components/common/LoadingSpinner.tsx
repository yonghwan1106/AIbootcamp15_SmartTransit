import React from 'react';

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
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClass = centered 
    ? 'flex flex-col items-center justify-center min-h-[200px]' 
    : 'flex items-center gap-2';

  return (
    <div className={`loading-spinner-container ${containerClass}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="spinner-ring">🚇</div>
      </div>
      {message && (
        <p className="loading-message mt-2 text-gray-600 animate-pulse">
          {message}
        </p>
      )}
      
      <style jsx>{`
        .loading-spinner {
          display: inline-block;
          position: relative;
        }
        
        .spinner-ring {
          font-size: ${size === 'large' ? '2rem' : size === 'medium' ? '1.5rem' : '1rem'};
          animation: spin 2s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        .loading-message {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;