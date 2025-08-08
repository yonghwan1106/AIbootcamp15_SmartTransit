import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { AppProvider } from './contexts/AppContext';

// 지연 로딩으로 컴포넌트 import
const Dashboard = lazy(() => import('./components/Dashboard'));
const StationSearch = lazy(() => import('./components/StationSearch'));
const Prediction = lazy(() => import('./components/Prediction'));
const RouteRecommendation = lazy(() => import('./components/RouteRecommendation'));

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Suspense fallback={<LoadingSpinner message="페이지를 로딩 중입니다..." />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/search" element={<StationSearch />} />
                  <Route path="/prediction" element={<Prediction />} />
                  <Route path="/recommendation" element={<RouteRecommendation />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
