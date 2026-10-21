// backend/src/services/deviceService.js
const Device = require('../models/Device');
const Action = require('../models/Action');
const mqttService = require('./mqttService');

const deviceService = {
  // Lấy toàn bộ danh sách 3 đèn
  async getAllDevices() {
    return await Device.getAll();
  },

  // Lấy thông tin thiết bị theo ID
  async getDeviceById(id) {
    return await Device.getById(id);
  },

  // Điều khiển thiết bị và xử lý chu trình phản hồi ACK
  async controlDevice(deviceId, targetAction, userId = 1) {
    const device = await Device.getById(deviceId);
    if (!device) {
      const error = new Error(`Thiết bị có ID #${deviceId} không tồn tại trong hệ thống.`);
      error.statusCode = 404;
      throw error;
    }

    if (targetAction !== 'ON' && targetAction !== 'OFF') {
      const error = new Error('Hành động không hợp lệ. Chỉ chấp nhận giá trị "ON" hoặc "OFF".');
      error.statusCode = 400;
      throw error;
    }

    const timeSent = new Date();

    // 1. Tạo bản ghi Action ở trạng thái PENDING
    const actionId = await Action.create({
      deviceId: device.device_id,
      userId,
      action: targetAction,
      status: 'PENDING',
      timeSent
    });

    try {
      // 2. Gửi lệnh qua MQTT và chờ phản hồi ACK từ ESP8266
      const result = await mqttService.publishDeviceControl(deviceId, targetAction, actionId, 5000);

      // 3. Cập nhật Action sang SUCCESS và lưu response_time
      const responseTime = result.responseTime || new Date();
      await Action.updateStatus(actionId, 'SUCCESS', responseTime);

      // 4. Cập nhật trạng thái ON/OFF trong bảng Devices
      await Device.updateStatus(deviceId, targetAction);

      const durationMs = responseTime.getTime() - timeSent.getTime();

      return {
        success: true,
        actionId,
        deviceId: device.device_id,
        deviceName: device.device_name,
        status: targetAction,
        timeSent: timeSent.toISOString(),
        responseTime: responseTime.toISOString(),
        durationMs,
        message: `Điều khiển ${device.device_name} sang trạng thái ${targetAction} thành công.`
      };
    } catch (err) {
      // 5. Nếu lỗi hoặc timeout: Cập nhật Action sang FAILED
      await Action.updateStatus(actionId, 'FAILED', null);

      const error = new Error(err.message || 'Lỗi không nhận được phản hồi từ ESP8266.');
      error.statusCode = 504; // Gateway Timeout
      error.actionId = actionId;
      throw error;
    }
  }
};

module.exports = deviceService;
