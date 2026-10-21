// backend/src/app.js
const express = require('express');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const actionRoutes = require('./routes/actionRoutes');

// Import Middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware chung
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Hệ thống theo dõi thông số môi trường trong nhà và điều khiển thiết bị',
    status: 'ONLINE',
    version: '1.0.0',
    mode: process.env.MOCK_MODE === 'true' ? 'MOCK_MODE' : 'PRODUCTION_MQTT',
    timestamp: new Date().toISOString()
  });
});

// Đăng ký API Routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Cho phép gọi trực tiếp /api/profile
app.use('/api/sensors', sensorRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/actions', actionRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
