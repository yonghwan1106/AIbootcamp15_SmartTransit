import axios from 'axios';
import { 
  ApiResponse, 
  Station, 
  CongestionData, 
  PredictionResponse, 
  RecommendationRequest, 
  RecommendationResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Station API
export const stationApi = {
  // Get all stations
  getAll: (params?: { line_id?: string; station_type?: 'subway' | 'bus' }) => {
    return api.get<ApiResponse<{ stations: Station[]; total: number }>>('/stations', { params });
  },

  // Get station by ID
  getById: (stationId: string) => {
    return api.get<ApiResponse<{ station: Station }>>(`/stations/${stationId}`);
  },

  // Get nearby stations
  getNearby: (lat: number, lng: number, radius: number = 1000) => {
    return api.get<ApiResponse<{ stations: Station[] }>>('/stations/nearby', {
      params: { lat, lng, radius }
    });
  },
};

// Congestion API
export const congestionApi = {
  // Get real-time congestion
  getRealtime: (stationId: string, params?: { 
    line_id?: string; 
    direction?: string; 
    vehicle_type?: 'subway' | 'bus' 
  }) => {
    return api.get<ApiResponse<CongestionData>>('/congestion/realtime', {
      params: { station_id: stationId, ...params }
    });
  },

  // Get congestion history
  getHistory: (stationId: string, hours: number = 24) => {
    return api.get<ApiResponse<any>>('/congestion/history', {
      params: { station_id: stationId, hours }
    });
  },

  // Get congestion overview
  getOverview: (lineId?: string) => {
    return api.get<ApiResponse<any>>('/congestion/overview', {
      params: lineId ? { line_id: lineId } : {}
    });
  },
};

// Prediction API
export const predictionApi = {
  // Get congestion prediction
  getPrediction: (stationId: string, params?: { 
    target_time?: string; 
    duration_hours?: number 
  }) => {
    return api.get<ApiResponse<PredictionResponse>>('/prediction', {
      params: { station_id: stationId, ...params }
    });
  },

  // Get prediction trends
  getTrends: (stationId: string, days: number = 7) => {
    return api.get<ApiResponse<any>>('/prediction/trends', {
      params: { station_id: stationId, days }
    });
  },

  // Get prediction accuracy
  getAccuracy: (stationId?: string, period: string = '30d') => {
    return api.get<ApiResponse<any>>('/prediction/accuracy', {
      params: { station_id: stationId, period }
    });
  },
};

// Recommendation API
export const recommendationApi = {
  // Get route recommendations
  getRecommendations: (request: RecommendationRequest) => {
    return api.post<ApiResponse<RecommendationResponse>>('/recommendations', request);
  },

  // Get user patterns
  getUserPatterns: (userId: string) => {
    return api.get<ApiResponse<any>>('/recommendations/user-patterns', {
      params: { user_id: userId }
    });
  },

  // Submit feedback
  submitFeedback: (feedback: {
    user_id?: string;
    route_id: string;
    rating: number;
    feedback_type?: 'positive' | 'negative' | 'suggestion';
    comments?: string;
    actual_congestion?: number;
    actual_time?: number;
  }) => {
    return api.post<ApiResponse<any>>('/recommendations/feedback', feedback);
  },

  // Get popular routes
  getPopularRoutes: (timePeriod: string = '7d', limit: number = 10) => {
    return api.get<ApiResponse<any>>('/recommendations/popular-routes', {
      params: { time_period: timePeriod, limit }
    });
  },
};

// Health check
export const healthApi = {
  check: () => {
    return api.get<{ status: string; timestamp: string; version: string }>('/health');
  },
};

export default api;