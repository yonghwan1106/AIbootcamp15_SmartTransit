import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Station, CongestionData } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../config/constants';

// Action Types
export enum ActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_STATIONS = 'SET_STATIONS',
  SET_SELECTED_STATIONS = 'SET_SELECTED_STATIONS',
  SET_CONGESTION_DATA = 'SET_CONGESTION_DATA',
  UPDATE_CONGESTION_DATA = 'UPDATE_CONGESTION_DATA',
  SET_SETTINGS = 'SET_SETTINGS',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  CLEAR_ERROR = 'CLEAR_ERROR'
}

// Action Interfaces
interface SetLoadingAction {
  type: ActionType.SET_LOADING;
  payload: boolean;
}

interface SetErrorAction {
  type: ActionType.SET_ERROR;
  payload: string | null;
}

interface SetStationsAction {
  type: ActionType.SET_STATIONS;
  payload: Station[];
}

interface SetSelectedStationsAction {
  type: ActionType.SET_SELECTED_STATIONS;
  payload: Station[];
}

interface SetCongestionDataAction {
  type: ActionType.SET_CONGESTION_DATA;
  payload: { [key: string]: CongestionData };
}

interface UpdateCongestionDataAction {
  type: ActionType.UPDATE_CONGESTION_DATA;
  payload: { [key: string]: CongestionData };
}

interface SetSettingsAction {
  type: ActionType.SET_SETTINGS;
  payload: AppSettings;
}

interface UpdateSettingsAction {
  type: ActionType.UPDATE_SETTINGS;
  payload: Partial<AppSettings>;
}

interface ClearErrorAction {
  type: ActionType.CLEAR_ERROR;
}

type AppAction = 
  | SetLoadingAction
  | SetErrorAction
  | SetStationsAction
  | SetSelectedStationsAction
  | SetCongestionDataAction
  | UpdateCongestionDataAction
  | SetSettingsAction
  | UpdateSettingsAction
  | ClearErrorAction;

// App Settings Interface
export interface AppSettings {
  favoriteStationIds: string[];
  updateInterval: number;
  notificationSettings: {
    enabled: boolean;
    threshold: number;
    sound: boolean;
    desktop: boolean;
  };
  displaySettings: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
}

// State Interface
export interface AppState {
  loading: boolean;
  error: string | null;
  allStations: Station[];
  selectedStations: Station[];
  congestionData: { [key: string]: CongestionData };
  settings: AppSettings;
  lastUpdated: Date | null;
}

// Initial State
const initialState: AppState = {
  loading: false,
  error: null,
  allStations: [],
  selectedStations: [],
  congestionData: {},
  settings: DEFAULT_SETTINGS,
  lastUpdated: null
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionType.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionType.SET_STATIONS:
      return { ...state, allStations: action.payload };
    
    case ActionType.SET_SELECTED_STATIONS:
      return { ...state, selectedStations: action.payload };
    
    case ActionType.SET_CONGESTION_DATA:
      return { 
        ...state, 
        congestionData: action.payload,
        lastUpdated: new Date()
      };
    
    case ActionType.UPDATE_CONGESTION_DATA:
      return { 
        ...state, 
        congestionData: { ...state.congestionData, ...action.payload },
        lastUpdated: new Date()
      };
    
    case ActionType.SET_SETTINGS:
      return { ...state, settings: action.payload };
    
    case ActionType.UPDATE_SETTINGS:
      const updatedSettings = { ...state.settings, ...action.payload };
      // 설정을 로컬 스토리지에 저장
      localStorage.setItem(STORAGE_KEYS.userSettings, JSON.stringify(updatedSettings));
      return { ...state, settings: updatedSettings };
    
    default:
      return state;
  }
};

// Context Interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    setStations: (stations: Station[]) => void;
    setSelectedStations: (stations: Station[]) => void;
    setCongestionData: (data: { [key: string]: CongestionData }) => void;
    updateCongestionData: (data: { [key: string]: CongestionData }) => void;
    updateSettings: (settings: Partial<AppSettings>) => void;
    setFavoriteStations: (stationIds: string[]) => void;
  };
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Props
interface AppProviderProps {
  children: ReactNode;
}

// Provider Component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    // 로컬 스토리지에서 설정 불러오기
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.userSettings);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        return {
          ...initial,
          settings: { ...DEFAULT_SETTINGS, ...parsedSettings }
        };
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    
    return initial;
  });

  // Action Creators
  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: ActionType.SET_LOADING, payload: loading }),
    setError: (error: string | null) => dispatch({ type: ActionType.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionType.CLEAR_ERROR }),
    setStations: (stations: Station[]) => dispatch({ type: ActionType.SET_STATIONS, payload: stations }),
    setSelectedStations: (stations: Station[]) => dispatch({ type: ActionType.SET_SELECTED_STATIONS, payload: stations }),
    setCongestionData: (data: { [key: string]: CongestionData }) => dispatch({ type: ActionType.SET_CONGESTION_DATA, payload: data }),
    updateCongestionData: (data: { [key: string]: CongestionData }) => dispatch({ type: ActionType.UPDATE_CONGESTION_DATA, payload: data }),
    updateSettings: (settings: Partial<AppSettings>) => dispatch({ type: ActionType.UPDATE_SETTINGS, payload: settings }),
    setFavoriteStations: (stationIds: string[]) => {
      const updatedSettings = { ...state.settings, favoriteStationIds: stationIds };
      localStorage.setItem(STORAGE_KEYS.favoriteStations, JSON.stringify(stationIds));
      dispatch({ type: ActionType.UPDATE_SETTINGS, payload: { favoriteStationIds: stationIds } });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;