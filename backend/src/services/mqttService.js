// backend/src/services/mqttService.js
const { MQTT_TOPICS, getMQTTClient } = require('../config/mqtt');
const DataSensor = require('../models/DataSensor');
const Device = require('../models/Device');
const Action = require('../models/Action');

// Bộ lưu trữ các pending promise điều khiển thiết bị
const pendingCommandMap = new Map();

// Map device_id (1, 2, 3) <-> Tên LED ("LED1", "LED2", "LED3")
const DEVICE_MAP = {
  1: 'LED1',
  2: 'LED2',
  3: 'LED3'
};

const LED_TO_DEVICE_ID = {
  LED1: 1,
  LED2: 2,
  LED3: 3
};

const mqttService = {
  // Khởi tạo các listener xử lý tin nhắn MQTT
  initMQTTListeners(client) {
    if (!client) return;

    client.on('message', async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());

        // 1. Nhận dữ liệu cảm biến định kỳ từ ESP8266 (Topic: Sensor_ha)
        if (topic === MQTT_TOPICS.SENSOR_DATA) {
          await mqttService.handleIncomingSensorData(payload);
        }

        // 2. Nhận phản hồi trạng thái điều khiển từ ESP8266 (Topic: Device_respond_ha)
        else if (topic === MQTT_TOPICS.DEVICE_STATUS) {
          await mqttService.handleIncomingDeviceStatus(payload);
        }
      } catch (err) {
        console.error('❌ [MQTT Message Handler] Lỗi parse message:', err.message);
      }
    });
  },

  // Xử lý lưu dữ liệu cảm biến nhận từ MQTT vào Database
  async handleIncomingSensorData(payload) {
    // Payload từ ESP8266 mẫu: { "temperature": 29.5, "humidity": 70.2, "lux": 350 }
    const recordedAt = payload.timestamp ? new Date(payload.timestamp) : new Date();

    const temp = payload.temperature !== undefined ? Number(payload.temperature) : undefined;
    const humi = payload.humidity !== undefined ? Number(payload.humidity) : undefined;
    const light = payload.lux !== undefined ? Number(payload.lux) : (payload.light !== undefined ? Number(payload.light) : undefined);

    if (temp !== undefined && !isNaN(temp)) {
      await DataSensor.create(1, temp, recordedAt);
    }
    if (humi !== undefined && !isNaN(humi)) {
      await DataSensor.create(2, humi, recordedAt);
    }
    if (light !== undefined && !isNaN(light)) {
      await DataSensor.create(3, light, recordedAt);
    }

    console.log(`📥 [MQTT Sensor Data] Đã ghi nhận: Temp=${temp}°C, Humi=${humi}%, Light=${light}lux`);
  },

  // Xử lý phản hồi ACK từ ESP8266 (Ví dụ: {"LED1":"ON", "LED2":"OFF", "LED3":"OFF"})
  async handleIncomingDeviceStatus(payload) {
    console.log(`📥 [MQTT Device Status] Nhận phản hồi từ ESP8266:`, JSON.stringify(payload));

    // Cập nhật trạng thái từng đèn vào database và kích hoạt resolve cho lệnh đang chờ
    for (const [ledKey, status] of Object.entries(payload)) {
      const devId = LED_TO_DEVICE_ID[ledKey];
      if (devId) {
        // Cập nhật trạng thái trong database
        if (status === 'ON' || status === 'OFF') {
          await Device.updateStatus(devId, status);
        }

        // Kiểm tra xem có API đang pending chờ kết quả của device này không
        const key = `${devId}`;
        const pendingCommand = pendingCommandMap.get(key);
        if (pendingCommand) {
          if (status === pendingCommand.action) {
            pendingCommandMap.delete(key);
            pendingCommand.resolve({ success: true, status });
          } else {
            console.warn(
              `⚠️ [MQTT Device Status] LED${devId} phản hồi ${status}, đang chờ ${pendingCommand.action}`
            );
          }
        }
      }
    }
  },

  // Gửi lệnh điều khiển thiết bị xuống MQTT Broker và chờ phản hồi ACK từ ESP8266
  async publishDeviceControl(deviceId, action, actionId, timeoutMs = 5000) {
    const isMock = process.env.MOCK_MODE === 'true';

    // Xử lý chế độ MOCK (Không cần phần cứng thật)
    if (isMock) {
      console.log(`⚡ [MOCK Control] Đang mô phỏng gửi lệnh: Device #${deviceId} -> ${action}`);
      const mockDelay = Math.floor(Math.random() * 400) + 600; // 600ms - 1000ms
      await new Promise((resolve) => setTimeout(resolve, mockDelay));

      const isSuccess = Math.random() > 0.05; // 95% thành công
      if (!isSuccess) {
        throw new Error(`[MOCK] ESP8266 timeout không phản hồi điều khiển thiết bị #${deviceId}`);
      }
      return { success: true, status: action, responseTime: new Date() };
    }

    // Xử lý gửi qua MQTT thật tới ESP8266
    const client = getMQTTClient();
    if (!client || !client.connected) {
      throw new Error('MQTT Broker hiện đang mất kết nối. Không thể gửi lệnh tới ESP8266.');
    }

    const ledKey = DEVICE_MAP[deviceId] || `LED${deviceId}`;
    const payloadObj = {};
    payloadObj[ledKey] = action; // Ví dụ: {"LED1": "ON"}
    const payload = JSON.stringify(payloadObj);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingCommandMap.delete(`${deviceId}`);
        reject(new Error(`Timeout (${timeoutMs}ms) không nhận được phản hồi ACK từ ESP8266`));
      }, timeoutMs);

      pendingCommandMap.set(`${deviceId}`, {
        action,
        resolve: (data) => {
          clearTimeout(timer);
          resolve({ ...data, responseTime: new Date() });
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        }
      });

      client.publish(MQTT_TOPICS.DEVICE_COMMAND, payload, { qos: 1 }, (err) => {
        if (err) {
          clearTimeout(timer);
          pendingCommandMap.delete(`${deviceId}`);
          reject(new Error('Lỗi khi publish lệnh xuống MQTT: ' + err.message));
        } else {
          console.log(`📤 [MQTT Publish] Gửi lệnh -> Topic: ${MQTT_TOPICS.DEVICE_COMMAND}, Payload: ${payload}`);
        }
      });
    });
  },

  // Khởi chạy bộ phát sinh dữ liệu cảm biến giả lập khi chạy MOCK_MODE
  startMockSensorDataGenerator(intervalMs = 8000) {
    if (process.env.MOCK_MODE !== 'true') return;

    console.log(`⚡ [MOCK Sensor] Đã bật bộ tự động sinh dữ liệu cảm biến định kỳ mỗi ${intervalMs / 1000}s`);

    setInterval(async () => {
      try {
        const temp = Number((27 + Math.random() * 3).toFixed(1));
        const humi = Number((65 + Math.random() * 15).toFixed(1));
        const light = Math.floor(250 + Math.random() * 300);

        await DataSensor.create(1, temp);
        await DataSensor.create(2, humi);
        await DataSensor.create(3, light);
      } catch (e) {
        // Bỏ qua lỗi nếu DB chưa sẵn sàng trong lúc khởi động
      }
    }, intervalMs);
  }
};

module.exports = mqttService;
