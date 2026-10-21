// backend/src/services/sensorService.js
const DataSensor = require('../models/DataSensor');
const Sensor = require('../models/Sensor');

const sensorService = {
  // Lấy thông số mới nhất của cả 3 cảm biến
  async getLatestSensors() {
    const rows = await DataSensor.getLatestMetrics();

    // Map dữ liệu thành object gọn gàng cho Dashboard
    const result = {
      temperature: { value: 28.5, unit: '°C', sensorId: 'DHT11_01', sensorName: 'Nhiệt độ phòng', updatedAt: 'Vừa xong' },
      humidity: { value: 72.0, unit: '%', sensorId: 'DHT11_01', sensorName: 'Độ ẩm không khí', updatedAt: 'Vừa xong' },
      light: { value: 350, unit: 'lux', sensorId: 'BH1750_01', sensorName: 'Cường độ ánh sáng', updatedAt: 'Vừa xong' }
    };

    rows.forEach((row) => {
      const timeDiff = Math.max(0, Math.floor((Date.now() - new Date(row.recorded_at).getTime()) / 1000));
      const timeStr = timeDiff < 60 ? `${timeDiff} giây trước` : `${Math.floor(timeDiff / 60)} phút trước`;

      if (row.sensor_id === 1 || row.sensor_name.toLowerCase().includes('nhiệt độ')) {
        result.temperature = {
          value: Number(row.value),
          unit: row.unit,
          sensorId: `DHT11_${String(row.sensor_id).padStart(2, '0')}`,
          sensorName: row.sensor_name,
          updatedAt: timeStr
        };
      } else if (row.sensor_id === 2 || row.sensor_name.toLowerCase().includes('độ ẩm')) {
        result.humidity = {
          value: Number(row.value),
          unit: row.unit,
          sensorId: `DHT11_${String(row.sensor_id).padStart(2, '0')}`,
          sensorName: row.sensor_name,
          updatedAt: timeStr
        };
      } else if (row.sensor_id === 3 || row.sensor_name.toLowerCase().includes('ánh sáng')) {
        result.light = {
          value: Number(row.value),
          unit: row.unit,
          sensorId: `BH1750_${String(row.sensor_id).padStart(2, '0')}`,
          sensorName: row.sensor_name,
          updatedAt: timeStr
        };
      }
    });

    return result;
  },

  // Lấy dữ liệu biểu đồ (24 giờ gần nhất hoặc theo range)
  async getChartHistory(range = '24h') {
    const rawRows = await DataSensor.getChartHistory(range);

    if (!rawRows || rawRows.length === 0) {
      return [];
    }

    // Downsample và aggregate theo khoảng thời gian để biểu đồ mượt mà và không quá tải
    // 24h: gom nhóm mỗi 15 phút (96 điểm); 6h: 5 phút; 1h: 1 phút
    const bucketIntervalMs = range === '1h' ? 60 * 1000 : range === '6h' ? 5 * 60 * 1000 : 15 * 60 * 1000;
    const buckets = {};

    rawRows.forEach((row) => {
      const date = new Date(row.recorded_at);
      const timeMs = date.getTime();
      const bucketKey = Math.floor(timeMs / bucketIntervalMs) * bucketIntervalMs;

      if (!buckets[bucketKey]) {
        const bucketDate = new Date(bucketKey);
        const pad = (n) => String(n).padStart(2, '0');
        buckets[bucketKey] = {
          time: `${pad(bucketDate.getHours())}:${pad(bucketDate.getMinutes())}`,
          timestamp: bucketDate.toISOString(),
          fullDate: `${bucketDate.getFullYear()}/${pad(bucketDate.getMonth() + 1)}/${pad(bucketDate.getDate())} ${pad(bucketDate.getHours())}:${pad(bucketDate.getMinutes())}`,
          tempSum: 0,
          tempCount: 0,
          humSum: 0,
          humCount: 0,
          lightSum: 0,
          lightCount: 0
        };
      }

      const val = Number(row.value);
      const name = (row.sensor_name || '').toLowerCase();
      if (row.sensor_id === 1 || name.includes('nhiệt độ')) {
        buckets[bucketKey].tempSum += val;
        buckets[bucketKey].tempCount++;
      } else if (row.sensor_id === 2 || name.includes('độ ẩm')) {
        buckets[bucketKey].humSum += val;
        buckets[bucketKey].humCount++;
      } else if (row.sensor_id === 3 || name.includes('ánh sáng')) {
        buckets[bucketKey].lightSum += val;
        buckets[bucketKey].lightCount++;
      }
    });

    return Object.keys(buckets)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => {
        const b = buckets[k];
        return {
          time: b.time,
          timestamp: b.timestamp,
          fullDate: b.fullDate,
          temperature: b.tempCount > 0 ? Number((b.tempSum / b.tempCount).toFixed(1)) : undefined,
          humidity: b.humCount > 0 ? Number((b.humSum / b.humCount).toFixed(1)) : undefined,
          light: b.lightCount > 0 ? Math.round(b.lightSum / b.lightCount) : undefined
        };
      });
  },

  // Tra cứu dữ liệu cảm biến
  async getSensorHistory(queryParams) {
    return await DataSensor.queryHistory(queryParams);
  },

  // Lấy danh mục sensors
  async getAllSensors() {
    return await Sensor.getAll();
  },

  async getSensorById(id) {
    return await Sensor.getById(id);
  }
};

module.exports = sensorService;
