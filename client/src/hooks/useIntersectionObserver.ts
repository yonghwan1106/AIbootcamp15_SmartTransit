import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    freezeOnceVisible = false,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 이미 보였고 freeze 옵션이 활성화된 경우 옵저버를 생성하지 않음
    if (freezeOnceVisible && hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyVisible = entry.isIntersecting;
        setIsVisible(isCurrentlyVisible);
        
        if (isCurrentlyVisible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, freezeOnceVisible, hasBeenVisible]);

  return {
    elementRef,
    isVisible: freezeOnceVisible ? hasBeenVisible : isVisible,
    hasBeenVisible,
  };
};