# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start
```bash
npm install                    # Install all dependencies for both server and client
npm run dev                    # Run both backend (port 3001) and frontend (port 3000) concurrently
```

### Individual Services
```bash
npm run server                 # Backend API only (port 3001)
npm run client                 # Frontend React app only (port 3000)
```

### Build and Test
```bash
npm run build                  # Build React client for production
npm run start                  # Start production server
npm test                       # Run tests (Jest)
```

### Client-specific Commands
```bash
cd client
npm start                      # React development server
npm run build                  # Production build
npm test                       # React tests
```

## Architecture Overview

### Project Structure
- **Server (Backend)**: Node.js + Express API server on port 3001
  - `/server/routes/` - API route handlers for stations, congestion, prediction, recommendations
  - `/server/database/init.js` - SQLite database initialization
  - `/server/utils/mockData.js` - Mock data utilities
- **Client (Frontend)**: React + TypeScript SPA on port 3000
  - Context-based state management with AppContext
  - Component-based architecture with lazy loading
  - TypeScript for type safety

### API Endpoints
- `GET /api/stations` - Station information
- `GET /api/congestion/realtime` - Real-time congestion data
- `GET /api/prediction` - Congestion predictions
- `POST /api/recommendations` - Route recommendations
- `GET /api/health` - Health check

### Frontend Architecture
- **State Management**: React Context + useReducer pattern in `contexts/AppContext.tsx`
- **Routing**: React Router with lazy-loaded components
- **Components**: Modular component structure with separate CSS files
- **Error Handling**: Global ErrorBoundary wrapper
- **Data Layer**: API service layer in `services/api.ts` with mock data fallback

### Key Technologies
- Backend: Node.js, Express, SQLite, CORS
- Frontend: React 19, TypeScript, React Router, Chart.js, Leaflet Maps
- Development: Concurrently, Nodemon for hot reload
- Testing: Jest for both frontend and backend

### Data Flow
1. AppContext manages global state including stations, congestion data, and user settings
2. API calls are made through service layer with error handling
3. Mock data system provides realistic transit data simulation
4. Real-time updates managed through context actions and reducers

This is a prototype for a transit congestion prediction service targeting Seoul subway system, specifically focusing on Line 2 stations for demo purposes.