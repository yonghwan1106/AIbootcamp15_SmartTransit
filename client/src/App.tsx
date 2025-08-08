import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StationSearch from './components/StationSearch';
import Prediction from './components/Prediction';
import RouteRecommendation from './components/RouteRecommendation';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<StationSearch />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/recommendation" element={<RouteRecommendation />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
