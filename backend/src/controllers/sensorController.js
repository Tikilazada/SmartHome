// backend/src/controllers/sensorController.js
const sensorService = require('../services/sensorService');

const sensorController = {
  // GET /api/sensors/latest (Dành cho 3 Sensor Summary Cards trên Dashboard)
  async getLatestSensors(req, res, next) {
    try {
      const data = await sensorService.getLatestSensors();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/sensors/history (Dành cho Line Chart trên Dashboard)
  async getChartHistory(req, res, next) {
    try {
      const { range } = req.query; // '1h', '6h', '24h', '7d'
      const data = await sensorService.getChartHistory(range || '24h');
      res.status(200).json({
        success: true,
        range: range || '24h',
        data
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/sensors (Tra cứu dữ liệu cảm biến cho trang Data Sensors: timeString, sensorType, status, page, limit)
  async getSensorHistory(req, res, next) {
    try {
      const { sensorType, sensorId, search, timeString, status, startDate, endDate, page, limit } = req.query;
      const result = await sensorService.getSensorHistory({
        sensorType,
        sensorId,
        search,
        timeString,
        status,
        startDate,
        endDate,
        page,
        limit
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/sensors/:id (Lấy thông tin cảm biến)
  async getSensorById(req, res, next) {
    try {
      const { id } = req.params;
      const sensor = await sensorService.getSensorById(id);
      if (!sensor) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy cảm biến có ID #${id}`
        });
      }
      res.status(200).json({
        success: true,
        data: sensor
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = sensorController;
