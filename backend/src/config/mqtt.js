// backend/src/config/mqtt.js
const mqtt = require('mqtt');
require('dotenv').config();

const MQTT_TOPICS = {
  SENSOR_DATA: 'Sensor_ha',
  DEVICE_COMMAND: 'Device_control_ha',
  DEVICE_STATUS: 'Device_respond_ha'
};

const options = {
  clientId: (process.env.MQTT_CLIENT_ID || 'backend_smarthome_node_server') + '_' + Math.random().toString(16).substring(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 2000
};

if (process.env.MQTT_USERNAME) {
  options.username = process.env.MQTT_USERNAME;
}
if (process.env.MQTT_PASSWORD) {
  options.password = process.env.MQTT_PASSWORD;
}

let client = null;

function connectMQTT() {
  if (process.env.MOCK_MODE === 'true') {
    console.log('⚡ [MQTT Config] Đang chạy ở chế độ MOCK_MODE=true. Bỏ qua kết nối MQTT Broker thật.');
    return null;
  }

  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io:1883';
  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log(`✅ [MQTT Broker] Kết nối thành công tới ${brokerUrl}`);
    // Đăng ký nhận dữ liệu cảm biến và phản hồi thiết bị
    client.subscribe([MQTT_TOPICS.SENSOR_DATA, MQTT_TOPICS.DEVICE_STATUS], (err) => {
      if (err) {
        console.error('❌ [MQTT Subscribe] Lỗi đăng ký topic:', err);
      } else {
        console.log(`📡 [MQTT Subscribe] Đã subscribe: ${MQTT_TOPICS.SENSOR_DATA}, ${MQTT_TOPICS.DEVICE_STATUS}`);
      }
    });
  });

  client.on('error', (err) => {
    console.error('❌ [MQTT Error] Lỗi kết nối Broker:', err.message);
  });

  client.on('reconnect', () => {
    console.log('🔄 [MQTT Reconnect] Đang thử kết nối lại MQTT Broker...');
  });

  return client;
}

function getMQTTClient() {
  return client;
}

module.exports = {
  MQTT_TOPICS,
  connectMQTT,
  getMQTTClient
};
