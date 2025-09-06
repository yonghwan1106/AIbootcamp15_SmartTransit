import React, { useEffect, useRef } from 'react';
import './AdBanner.css';

interface KakaoAdBannerProps {
  unit: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    kakaoPixel?: any;
  }
}

const KakaoAdBanner: React.FC<KakaoAdBannerProps> = ({ 
  unit,
  width = 320,
  height = 50,
  className = '',
  style = {}
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!scriptLoaded.current) {
      // 카카오 애드픽 스크립트 동적 로드
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://t1.daumcdn.net/kas/static/ba.min.js';
      script.onload = () => {
        scriptLoaded.current = true;
        loadAd();
      };
      document.head.appendChild(script);
    } else {
      loadAd();
    }

    function loadAd() {
      if (adRef.current && window.kakaoPixel) {
        try {
          window.kakaoPixel.render({
            unit: unit,
            width: width,
            height: height,
            container: adRef.current
          });
        } catch (error) {
          console.error('Kakao Ad error:', error);
        }
      }
    }
  }, [unit, width, height]);

  return (
    <div className={`ad-banner kakao-ad ${className}`} style={style}>
      <div 
        ref={adRef}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          margin: '0 auto'
        }}
      />
    </div>
  );
};

export default KakaoAdBanner;