import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-icon">🚇</span>
            <span className="logo-text">SmartTransit</span>
          </Link>
        </div>
        
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            대시보드
          </Link>
          <Link 
            to="/search" 
            className={`nav-link ${isActive('/search') ? 'active' : ''}`}
          >
            <span className="nav-icon">🔍</span>
            역 검색
          </Link>
          <Link 
            to="/prediction" 
            className={`nav-link ${isActive('/prediction') ? 'active' : ''}`}
          >
            <span className="nav-icon">🔮</span>
            혼잡도 예측
          </Link>
          <Link 
            to="/recommendation" 
            className={`nav-link ${isActive('/recommendation') ? 'active' : ''}`}
          >
            <span className="nav-icon">🗺️</span>
            경로 추천
          </Link>
        </nav>

        <div className="header-right">
          <div className="status-indicator">
            <span className="status-dot online"></span>
            <span className="status-text">실시간</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;