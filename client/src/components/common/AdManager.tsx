import React from 'react';
import AdBanner from './AdBanner';
import KakaoAdBanner from './KakaoAdBanner';

interface AdManagerProps {
  position: 'header' | 'sidebar' | 'inline' | 'footer';
  className?: string;
  style?: React.CSSProperties;
}

const AdManager: React.FC<AdManagerProps> = ({ position, className = '', style = {} }) => {
  // 광고 제공업체 우선순위 (구글 애드센스 우선, 실패시 카카오)
  const getAdConfig = (position: string) => {
    switch (position) {
      case 'header':
        return {
          google: { slot: '1234567890', format: 'horizontal' },
          kakao: { unit: 'DAN-xxxxx', width: 728, height: 90 },
          className: 'header-ad'
        };
      case 'sidebar':
        return {
          google: { slot: '0987654321', format: 'vertical' },
          kakao: { unit: 'DAN-yyyyy', width: 300, height: 250 },
          className: 'sidebar-ad'
        };
      case 'inline':
        return {
          google: { slot: '9876543210', format: 'rectangle' },
          kakao: { unit: 'DAN-zzzzz', width: 728, height: 250 },
          className: 'inline-ad'
        };
      case 'footer':
        return {
          google: { slot: '5432109876', format: 'horizontal' },
          kakao: { unit: 'DAN-aaaaa', width: 728, height: 90 },
          className: 'footer-ad'
        };
      default:
        return {
          google: { slot: '1111111111', format: 'auto' },
          kakao: { unit: 'DAN-default', width: 320, height: 50 },
          className: 'default-ad'
        };
    }
  };

  const config = getAdConfig(position);
  const adProvider = Math.random() > 0.5 ? 'google' : 'kakao'; // 50:50 A/B 테스트

  return (
    <div className={`ad-manager ${config.className} ${className}`} style={style}>
      {adProvider === 'google' ? (
        <AdBanner
          slot={config.google.slot}
          format={config.google.format}
          className={config.className}
        />
      ) : (
        <KakaoAdBanner
          unit={config.kakao.unit}
          width={config.kakao.width}
          height={config.kakao.height}
          className={config.className}
        />
      )}
      
      {/* 광고 라벨 */}
      <div className="ad-label">
        <span>Advertisement</span>
      </div>
    </div>
  );
};

export default AdManager;