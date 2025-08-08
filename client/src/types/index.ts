// Station types
export interface Station {
  id: string;
  name: string;
  line_id: string;
  latitude: number;
  longitude: number;
  station_type: 'subway' | 'bus';
}

// Congestion types
export interface CongestionData {
  station_id: string;
  station_name: string;
  line_id: string;
  current_congestion: number;
  congestion_level: 'low' | 'medium' | 'heavy';
  passenger_count: number;
  vehicles: Vehicle[];
  updated_at: string;
  data_source: string;
}

export interface Vehicle {
  vehicle_id: string;
  congestion: number;
  arrival_time: string;
  car_positions: number[];
}

// Prediction types
export interface Prediction {
  time: string;
  congestion: number;
  confidence: number;
  weather_impact: 'none' | 'low' | 'medium' | 'high';
  event_impact: 'none' | 'low' | 'medium' | 'high';
}

export interface PredictionResponse {
  station_id: string;
  station_name: string;
  predictions: Prediction[];
  model_accuracy: number;
  prediction_params: {
    duration_hours: number;
    generated_at: string;
  };
}

// Recommendation types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteStep {
  type: 'walk' | 'subway' | 'bus' | 'transfer';
  duration: number;
  description?: string;
  line?: string;
  congestion?: number;
}

export interface RecommendedRoute {
  route_id: string;
  total_time: number;
  walking_time: number;
  transfers: number;
  avg_congestion: number;
  departure_time: string;
  arrival_time: string;
  steps: RouteStep[];
  recommendation_score?: number;
  reasons?: string[];
  estimated_cost?: number;
  carbon_footprint?: number;
}

export interface UserPreferences {
  max_congestion: number;
  max_walking_time: number;
  max_transfers: number;
  prefer_speed?: boolean;
  avoid_stairs?: boolean;
}

export interface RecommendationRequest {
  user_id?: string;
  origin: Coordinates;
  destination: Coordinates;
  departure_time?: string;
  preferences?: Partial<UserPreferences>;
}

export interface RecommendationResponse {
  user_id: string;
  recommended_routes: RecommendedRoute[];
  search_params: {
    origin: Coordinates;
    destination: Coordinates;
    departure_time: string;
    preferences: UserPreferences;
  };
  generated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}