// backend/src/controllers/deviceController.js
const deviceService = require('../services/deviceService');

const deviceController = {
  // GET /api/devices (Lấy trạng thái 3 đèn)
  async getAllDevices(req, res, next) {
    try {
      const devices = await deviceService.getAllDevices();
      res.status(200).json({
        success: true,
        data: devices
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/devices/:id
  async getDeviceById(req, res, next) {
    try {
      const { id } = req.params;
      const device = await deviceService.getDeviceById(id);
      if (!device) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy thiết bị có ID #${id}`
        });
      }
      res.status(200).json({
        success: true,
        data: device
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/devices/:id/control (Bật / Tắt thiết bị và chờ ACK)
  async controlDevice(req, res, next) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const userId = req.user ? req.user.userId : 1;

      if (!action) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp hành động điều khiển (action: "ON" hoặc "OFF").'
        });
      }

      const result = await deviceService.controlDevice(id, action.toUpperCase(), userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = deviceController;
