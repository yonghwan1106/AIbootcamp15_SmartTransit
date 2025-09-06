import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface AnimatedCounterProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  trigger?: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  start = 0,
  duration = 2000,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  trigger = true,
}) => {
  const [count, setCount] = useState(start);
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.3,
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (!isVisible || !trigger) return;

    const startTime = Date.now() + delay;
    const endTime = startTime + duration;
    const range = end - start;

    const timer = setInterval(() => {
      const now = Date.now();
      
      if (now < startTime) return;
      
      if (now >= endTime) {
        setCount(end);
        clearInterval(timer);
        return;
      }

      const progress = (now - startTime) / duration;
      // easeOutQuart easing function
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (range * easedProgress);
      
      setCount(currentCount);
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [isVisible, trigger, start, end, duration, delay]);

  const formatNumber = (num: number): string => {
    if (decimals === 0) {
      return Math.floor(num).toLocaleString();
    }
    return num.toFixed(decimals);
  };

  return (
    <span ref={elementRef} className={`animated-counter ${className}`}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default AnimatedCounter;