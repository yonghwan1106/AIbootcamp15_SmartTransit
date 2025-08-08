import React, { useState, useEffect } from 'react';
import { stationApi } from '../services/api';
import { Station } from '../types';
import { STORAGE_KEYS } from '../config/constants';
import './FavoriteStations.css';

interface FavoriteStationsProps {
  onStationSelect: (stationIds: string[]) => void;
  selectedStations: string[];
}

const FavoriteStations: React.FC<FavoriteStationsProps> = React.memo(({ onStationSelect, selectedStations }) => {
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStations();
    // 로컬 스토리지에서 즐겨찾기 불러오기
    const savedFavorites = localStorage.getItem(STORAGE_KEYS.favoriteStations);
    if (savedFavorites) {
      const parsedFavorites = JSON.parse(savedFavorites);
      setFavorites(parsedFavorites);
      onStationSelect(parsedFavorites);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await stationApi.getAll({ station_type: 'subway' });
      if (response.data.status === 'success') {
        setAllStations(response.data.data!.stations);
      }
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (stationId: string) => {
    const newFavorites = favorites.includes(stationId)
      ? favorites.filter(id => id !== stationId)
      : [...favorites, stationId];
    
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEYS.favoriteStations, JSON.stringify(newFavorites));
    onStationSelect(newFavorites);
  };

  const filteredStations = allStations.filter((station: Station) =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.line_id.includes(searchTerm)
  );

  const favoriteStations = allStations.filter((station: Station) => 
    favorites.includes(station.id)
  );

  return (
    <div className="favorite-stations">
      <div className="favorite-header">
        <h3>🌟 즐겨찾는 역</h3>
        <button 
          className="manage-button"
          onClick={() => setShowModal(true)}
        >
          관리
        </button>
      </div>

      <div className="favorite-list">
        {favoriteStations.length === 0 ? (
          <div className="empty-favorites">
            <p>즐겨찾는 역이 없습니다</p>
            <button onClick={() => setShowModal(true)}>
              역 추가하기
            </button>
          </div>
        ) : (
          favoriteStations.map(station => (
            <div key={station.id} className="favorite-item">
              <span className="station-name">{station.name}</span>
              <span className="line-info">{station.line_id}호선</span>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>즐겨찾는 역 관리</h3>
              <button 
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="search-section">
              <input
                type="text"
                placeholder="역명 또는 호선 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="stations-list">
              {loading ? (
                <div className="loading">역 정보를 불러오는 중...</div>
              ) : (
                filteredStations.map(station => (
                  <div key={station.id} className="station-item">
                    <div className="station-info">
                      <span className="name">{station.name}</span>
                      <span className="line">{station.line_id}호선</span>
                    </div>
                    <button
                      className={`toggle-button ${favorites.includes(station.id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(station.id)}
                    >
                      {favorites.includes(station.id) ? '★' : '☆'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default FavoriteStations;