const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Import routes
const stationsRouter = require('./routes/stations');
const congestionRouter = require('./routes/congestion');
const predictionRouter = require('./routes/prediction');
const recommendationsRouter = require('./routes/recommendations');

// Initialize database
const db = require('./database/init');

// Routes
app.use('/api/stations', stationsRouter);
app.use('/api/congestion', congestionRouter);
app.use('/api/prediction', predictionRouter);
app.use('/api/recommendations', recommendationsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚇 SmartTransit Predictor API Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
});