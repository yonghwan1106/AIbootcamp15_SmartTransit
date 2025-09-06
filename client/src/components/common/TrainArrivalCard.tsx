import React from 'react';
import { getCongestionColor } from '../../utils/helpers';
import './TrainArrivalCard.css';

interface TrainArrivalInfo {
  vehicle_id: string;
  congestion: number;
  arrival_time: string;
  direction?: string;
  destination?: string;
  train_type?: string;
  car_positions?: number[];
}

interface TrainArrivalCardProps {
  trains: TrainArrivalInfo[];
  className?: string;
}

const TrainArrivalCard: React.FC<TrainArrivalCardProps> = ({ trains, className = '' }) => {
  const getArrivalIcon = (arrivalTime: string) => {
    if (arrivalTime.includes('곧') || arrivalTime.includes('0분')) return '🚇';
    if (arrivalTime.includes('1분') || arrivalTime.includes('2분')) return '⏰';
    return '🕐';
  };

  const getArrivalStatus = (arrivalTime: string) => {
    if (arrivalTime.includes('곧') || arrivalTime.includes('0분')) return 'imminent';
    if (arrivalTime.includes('1분') || arrivalTime.includes('2분')) return 'soon';
    return 'later';
  };

  return (
    <div className={`train-arrival-card ${className}`}>
      <div className="train-arrival-card__header">
        <h4>다음 열차 🚇</h4>
        <div className="train-arrival-card__count">
          {trains.length}대 운행 중
        </div>
      </div>

      <div className="train-arrival-card__list">
        {trains.slice(0, 3).map((train, index) => {
          const status = getArrivalStatus(train.arrival_time);
          const icon = getArrivalIcon(train.arrival_time);

          return (
            <div 
              key={train.vehicle_id} 
              className={`train-item train-item--${status}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="train-item__icon">
                {icon}
              </div>
              
              <div className="train-item__info">
                <div className="train-item__time">
                  {train.arrival_time}
                </div>
                <div className="train-item__destination">
                  {train.destination || train.direction || '운행 중'}
                </div>
                {train.train_type && train.train_type !== '일반' && (
                  <div className="train-item__type">
                    {train.train_type}
                  </div>
                )}
              </div>

              <div className="train-item__congestion">
                <div className="train-item__congestion-bar">
                  <div 
                    className="train-item__congestion-fill"
                    style={{ 
                      width: `${train.congestion}%`,
                      backgroundColor: getCongestionColor(train.congestion)
                    }}
                  />
                </div>
                <div className="train-item__congestion-text">
                  {train.congestion}%
                </div>
              </div>

              {/* 칸별 혼잡도 */}
              {train.car_positions && train.car_positions.length > 0 && (
                <div className="train-item__cars">
                  <div className="train-cars">
                    {train.car_positions.map((congestion, carIndex) => (
                      <div 
                        key={carIndex}
                        className="train-car"
                        style={{ 
                          backgroundColor: getCongestionColor(congestion),
                          opacity: 0.7 + (congestion / 100) * 0.3
                        }}
                        title={`${carIndex + 1}칸: ${congestion}%`}
                      >
                        {carIndex + 1}
                      </div>
                    ))}
                  </div>
                  <div className="train-cars__label">칸별 혼잡도</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {trains.length === 0 && (
        <div className="train-arrival-card__empty">
          <div className="empty-state">
            <span className="empty-state__icon">🚫</span>
            <span className="empty-state__text">운행 정보 없음</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainArrivalCard;