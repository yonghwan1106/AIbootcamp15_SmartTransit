import React, { useState, useEffect, useRef } from 'react';
import './FadeTransition.css';

interface FadeTransitionProps {
  children: React.ReactNode;
  show?: boolean;
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  distance?: number;
  className?: string;
  onComplete?: () => void;
}

const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  show = true,
  duration = 600,
  delay = 0,
  direction = 'fade',
  distance = 30,
  className = '',
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(show);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, delay, duration, onComplete]);

  const getTransformValue = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`;
        case 'down':
          return `translateY(-${distance}px)`;
        case 'left':
          return `translateX(${distance}px)`;
        case 'right':
          return `translateX(-${distance}px)`;
        default:
          return 'none';
      }
    }
    return 'none';
  };

  if (!shouldRender) return null;

  return (
    <div
      ref={elementRef}
      className={`fade-transition fade-transition--${direction} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransformValue(),
        transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeTransition;