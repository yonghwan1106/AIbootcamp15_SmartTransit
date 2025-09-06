import React, { useState, useEffect } from 'react';
import './AccessibilityButton.css';

interface AccessibilityOptions {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  focusIndicator: boolean;
}

interface AccessibilityButtonProps {
  className?: string;
}

const AccessibilityButton: React.FC<AccessibilityButtonProps> = ({ 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AccessibilityOptions>({
    fontSize: 'normal',
    contrast: 'normal',
    reducedMotion: false,
    focusIndicator: false,
  });

  // 접근성 설정 로드
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOptions(parsed);
        applySettings(parsed);
      } catch (error) {
        console.error('접근성 설정 로드 오류:', error);
      }
    }
  }, []);

  // 설정 적용
  const applySettings = (settings: AccessibilityOptions) => {
    const root = document.documentElement;
    
    // 폰트 크기
    root.setAttribute('data-font-size', settings.fontSize);
    
    // 대비
    root.setAttribute('data-contrast', settings.contrast);
    
    // 모션 감소
    root.setAttribute('data-reduced-motion', settings.reducedMotion.toString());
    
    // 포커스 인디케이터
    root.setAttribute('data-focus-indicator', settings.focusIndicator.toString());
  };

  // 설정 변경
  const updateSetting = <K extends keyof AccessibilityOptions>(
    key: K, 
    value: AccessibilityOptions[K]
  ) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    applySettings(newOptions);
    localStorage.setItem('accessibility-settings', JSON.stringify(newOptions));
  };

  // 설정 초기화
  const resetSettings = () => {
    const defaultOptions: AccessibilityOptions = {
      fontSize: 'normal',
      contrast: 'normal',
      reducedMotion: false,
      focusIndicator: false,
    };
    setOptions(defaultOptions);
    applySettings(defaultOptions);
    localStorage.removeItem('accessibility-settings');
  };

  // 키보드 이벤트
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        className={`accessibility-button ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="접근성 설정"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="접근성 설정"
      >
        <span className="accessibility-icon" aria-hidden="true">
          ♿
        </span>
        <span className="accessibility-text">접근성</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="accessibility-overlay"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="accessibility-panel"
            role="dialog"
            aria-label="접근성 설정 패널"
            onKeyDown={handleKeyDown}
          >
            <div className="accessibility-header">
              <h2>접근성 설정</h2>
              <button
                className="accessibility-close"
                onClick={() => setIsOpen(false)}
                aria-label="설정 패널 닫기"
              >
                ✕
              </button>
            </div>

            <div className="accessibility-content">
              {/* 폰트 크기 */}
              <div className="accessibility-section">
                <h3>폰트 크기</h3>
                <div className="accessibility-options">
                  {(['small', 'normal', 'large', 'extra-large'] as const).map((size) => (
                    <button
                      key={size}
                      className={`option-button ${options.fontSize === size ? 'active' : ''}`}
                      onClick={() => updateSetting('fontSize', size)}
                      aria-pressed={options.fontSize === size}
                    >
                      {size === 'small' && '작게 A'}
                      {size === 'normal' && '보통 A'}
                      {size === 'large' && '크게 A'}
                      {size === 'extra-large' && '매우크게 A'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 대비 */}
              <div className="accessibility-section">
                <h3>색상 대비</h3>
                <div className="accessibility-options">
                  <button
                    className={`option-button ${options.contrast === 'normal' ? 'active' : ''}`}
                    onClick={() => updateSetting('contrast', 'normal')}
                    aria-pressed={options.contrast === 'normal'}
                  >
                    일반 대비
                  </button>
                  <button
                    className={`option-button ${options.contrast === 'high' ? 'active' : ''}`}
                    onClick={() => updateSetting('contrast', 'high')}
                    aria-pressed={options.contrast === 'high'}
                  >
                    높은 대비
                  </button>
                </div>
              </div>

              {/* 모션 감소 */}
              <div className="accessibility-section">
                <h3>애니메이션</h3>
                <label className="accessibility-toggle">
                  <input
                    type="checkbox"
                    checked={options.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">애니메이션 감소</span>
                </label>
              </div>

              {/* 포커스 인디케이터 */}
              <div className="accessibility-section">
                <h3>키보드 탐색</h3>
                <label className="accessibility-toggle">
                  <input
                    type="checkbox"
                    checked={options.focusIndicator}
                    onChange={(e) => updateSetting('focusIndicator', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">강화된 포커스 표시</span>
                </label>
              </div>

              {/* 초기화 버튼 */}
              <div className="accessibility-actions">
                <button
                  className="reset-button"
                  onClick={resetSettings}
                >
                  설정 초기화
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AccessibilityButton;