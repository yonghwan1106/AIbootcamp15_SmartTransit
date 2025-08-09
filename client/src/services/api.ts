import axios from 'axios';
import { 
  ApiResponse, 
  Station, 
  CongestionData, 
  PredictionResponse, 
  RecommendationRequest, 
  RecommendationResponse 
} from '../types';
import { 
  mockStations, 
  generateRealtimeCongestion, 
  generateCongestionPrediction, 
  generateRecommendedRoutes 
} from './mockData';

const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL;
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
    
    // Fallback to mock data on API error
    if (USE_MOCK_DATA) {
      console.warn('Using mock data due to API error');
      return Promise.reject({ ...error, useMockData: true });
    }
    
    return Promise.reject(error);
  }
);

// Helper to create mock response
const createMockResponse = <T>(data: T): Promise<{ data: ApiResponse<T> }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          status: 'success',
          data
        }
      });
    }, Math.random() * 500 + 200); // Simulate network delay
  });
};

// Station API
export const stationApi = {
  // Get all stations
  getAll: async (params?: { line_id?: string; station_type?: 'subway' | 'bus' }): Promise<{ data: ApiResponse<{ stations: Station[]; total: number }> }> => {
    if (USE_MOCK_DATA) {
      let filteredStations = mockStations;
      
      if (params?.line_id) {
        filteredStations = filteredStations.filter(station => station.line_id === params.line_id);
      }
      
      if (params?.station_type) {
        filteredStations = filteredStations.filter(station => station.station_type === params.station_type);
      }
      
      return createMockResponse({ stations: filteredStations, total: filteredStations.length });
    }
    
    try {
      return await api.get<ApiResponse<{ stations: Station[]; total: number }>>('/stations', { params });
    } catch (error: any) {
      if (error.useMockData) {
        return stationApi.getAll(params); // Retry with mock data
      }
      throw error;
    }
  },

  // Get station by ID
  getById: async (stationId: string) => {
    if (USE_MOCK_DATA) {
      const station = mockStations.find(s => s.id === stationId);
      if (!station) {
        throw new Error('Station not found');
      }
      return createMockResponse({ station });
    }
    
    try {
      return await api.get<ApiResponse<{ station: Station }>>(`/stations/${stationId}`);
    } catch (error: any) {
      if (error.useMockData) {
        return stationApi.getById(stationId);
      }
      throw error;
    }
  },

  // Get nearby stations
  getNearby: async (lat: number, lng: number, radius: number = 1000) => {
    if (USE_MOCK_DATA) {
      // Simple distance calculation for mock data
      const nearbyStations = mockStations.filter(station => {
        const distance = Math.sqrt(
          Math.pow((station.latitude - lat) * 111000, 2) + 
          Math.pow((station.longitude - lng) * 88800, 2)
        );
        return distance <= radius;
      }).slice(0, 5); // Limit to 5 stations
      
      return createMockResponse({ stations: nearbyStations });
    }
    
    try {
      return await api.get<ApiResponse<{ stations: Station[] }>>('/stations/nearby', {
        params: { lat, lng, radius }
      });
    } catch (error: any) {
      if (error.useMockData) {
        return stationApi.getNearby(lat, lng, radius);
      }
      throw error;
    }
  },
};

// Congestion API
export const congestionApi = {
  // Get real-time congestion
  getRealtime: async (stationId: string, params?: { 
    line_id?: string; 
    direction?: string; 
    vehicle_type?: 'subway' | 'bus' 
  }) => {
    if (USE_MOCK_DATA) {
      const congestionData = generateRealtimeCongestion(stationId);
      return createMockResponse(congestionData);
    }
    
    try {
      return await api.get<ApiResponse<CongestionData>>('/congestion/realtime', {
        params: { station_id: stationId, ...params }
      });
    } catch (error: any) {
      if (error.useMockData) {
        return congestionApi.getRealtime(stationId, params);
      }
      throw error;
    }
  },

  // Get congestion history
  getHistory: async (stationId: string, hours: number = 24) => {
    if (USE_MOCK_DATA) {
      // Generate mock history data
      const history = [];
      for (let i = hours; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60 * 60 * 1000);
        history.push({
          timestamp: time.toISOString(),
          congestion_level: Math.floor(Math.random() * 100),
          passenger_count: Math.floor(Math.random() * 150)
        });
      }
      return createMockResponse({ history, station_id: stationId });
    }
    
    try {
      return await api.get<ApiResponse<any>>('/congestion/history', {
        params: { station_id: stationId, hours }
      });
    } catch (error: any) {
      if (error.useMockData) {
        return congestionApi.getHistory(stationId, hours);
      }
      throw error;
    }
  },

  // Get congestion overview
  getOverview: async (lineId?: string) => {
    if (USE_MOCK_DATA) {
      const overview = mockStations
        .filter(station => !lineId || station.line_id === lineId)
        .map(station => ({
          station_id: station.id,
          station_name: station.name,
          current_congestion: Math.floor(Math.random() * 100),
          trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
        }));
      
      return createMockResponse({ overview, line_id: lineId });
    }
    
    try {
      return await api.get<ApiResponse<any>>('/congestion/overview', {
        params: lineId ? { line_id: lineId } : {}
      });
    } catch (error: any) {
      if (error.useMockData) {
        return congestionApi.getOverview(lineId);
      }
      throw error;
    }
  },
};

// Prediction API
export const predictionApi = {
  // Get congestion prediction
  getPrediction: async (stationId: string, params?: { 
    target_time?: string; 
    duration_hours?: number 
  }) => {
    if (USE_MOCK_DATA) {
      const predictions = generateCongestionPrediction(stationId, params?.duration_hours || 3);
      return createMockResponse({
        station_id: stationId,
        station_name: `Station ${stationId}`,
        predictions,
        model_accuracy: 0.85 + Math.random() * 0.1,
        prediction_params: {
          duration_hours: params?.duration_hours || 3,
          generated_at: new Date().toISOString()
        }
      });
    }
    
    try {
      return await api.get<ApiResponse<PredictionResponse>>('/prediction', {
        params: { station_id: stationId, ...params }
      });
    } catch (error: any) {
      if (error.useMockData) {
        return predictionApi.getPrediction(stationId, params);
      }
      throw error;
    }
  },

  // Get prediction trends
  getTrends: async (stationId: string, days: number = 7) => {
    if (USE_MOCK_DATA) {
      const trends = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        trends.push({
          date: date.toISOString().split('T')[0],
          avg_congestion: Math.floor(Math.random() * 100),
          peak_time: `${7 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          accuracy: 0.8 + Math.random() * 0.2
        });
      }
      return createMockResponse({ trends, station_id: stationId });
    }
    
    try {
      return await api.get<ApiResponse<any>>('/prediction/trends', {
        params: { station_id: stationId, days }
      });
    } catch (error: any) {
      if (error.useMockData) {
        return predictionApi.getTrends(stationId, days);
      }
      throw error;
    }
  },

  // Get prediction accuracy
  getAccuracy: async (stationId?: string, period: string = '30d') => {
    if (USE_MOCK_DATA) {
      return createMockResponse({
        overall_accuracy: 0.85 + Math.random() * 0.1,
        station_accuracy: stationId ? 0.8 + Math.random() * 0.15 : undefined,
        period,
        last_updated: new Date().toISOString()
      });
    }
    
    try {
      return await api.get<ApiResponse<any>>('/prediction/accuracy', {
        params: { station_id: stationId, period }
      });
    } catch (error: any) {
      if (error.useMockData) {
        return predictionApi.getAccuracy(stationId, period);
      }
      throw error;
    }
  },
};

// Recommendation API
export const recommendationApi = {
  // Get route recommendations
  getRecommendations: async (request: RecommendationRequest) => {
    if (USE_MOCK_DATA) {
      const routes = generateRecommendedRoutes(request.origin, request.destination);
      return createMockResponse({
        user_id: request.user_id || 'anonymous',
        recommended_routes: routes,
        search_params: {
          origin: request.origin,
          destination: request.destination,
          departure_time: request.departure_time || new Date().toISOString(),
          preferences: request.preferences || {
            max_congestion: 80,
            max_walking_time: 15,
            max_transfers: 2,
            prefer_speed: true
          }
        },
        generated_at: new Date().toISOString()
      });
    }
    
    try {
      return await api.post<ApiResponse<RecommendationResponse>>('/recommendations', request);
    } catch (error: any) {
      if (error.useMockData) {
        return recommendationApi.getRecommendations(request);
      }
      throw error;
    }
  },

  // Get user patterns
  getUserPatterns: async (userId: string) => {
    if (USE_MOCK_DATA) {
      const patterns = {
        frequent_routes: [
          { origin: '강남역', destination: '홍대입구역', frequency: 15 },
          { origin: '서울역', destination: '잠실역', frequency: 8 }
        ],
        peak_hours: ['08:00-09:00', '18:00-19:00'],
        preferred_transport: 'subway'
      };
      return createMockResponse({ patterns, user_id: userId });
    }
    
    try {
      return await api.get<ApiResponse<any>>('/recommendations/user-patterns', {
        params: { user_id: userId }
      });
    } catch (error: any) {
      if (error.useMockData) {
        return recommendationApi.getUserPatterns(userId);
      }
      throw error;
    }
  },

  // Submit feedback
  submitFeedback: async (feedback: {
    user_id?: string;
    route_id: string;
    rating: number;
    feedback_type?: 'positive' | 'negative' | 'suggestion';
    comments?: string;
    actual_congestion?: number;
    actual_time?: number;
  }) => {
    if (USE_MOCK_DATA) {
      return createMockResponse({
        feedback_id: `fb_${Date.now()}`,
        status: 'received',
        message: 'Thank you for your feedback!'
      });
    }
    
    try {
      return await api.post<ApiResponse<any>>('/recommendations/feedback', feedback);
    } catch (error: any) {
      if (error.useMockData) {
        return recommendationApi.submitFeedback(feedback);
      }
      throw error;
    }
  },

  // Get popular routes
  getPopularRoutes: async (timePeriod: string = '7d', limit: number = 10) => {
    if (USE_MOCK_DATA) {
      const popularRoutes = [
        { origin: '강남역', destination: '홍대입구역', usage_count: 1250, avg_rating: 4.2 },
        { origin: '서울역', destination: '잠실역', usage_count: 980, avg_rating: 4.0 },
        { origin: '건대입구역', destination: '강남역', usage_count: 850, avg_rating: 3.9 }
      ].slice(0, limit);
      
      return createMockResponse({ routes: popularRoutes, period: timePeriod });
    }
    
    try {
      return await api.get<ApiResponse<any>>('/recommendations/popular-routes', {
        params: { time_period: timePeriod, limit }
      });
    } catch (error: any) {
      if (error.useMockData) {
        return recommendationApi.getPopularRoutes(timePeriod, limit);
      }
      throw error;
    }
  },
};

// Health check
export const healthApi = {
  check: async () => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: 'mock'
        }
      });
    }
    
    try {
      return await api.get<{ status: string; timestamp: string; version: string }>('/health');
    } catch (error: any) {
      if (error.useMockData) {
        return healthApi.check();
      }
      throw error;
    }
  },
};

export default api;