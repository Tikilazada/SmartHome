// src/services/api.js
import {
  initialSensorLatest,
  chartDataMap,
  initialDevices,
  initialActionHistory,
  initialSensorDataTable,
  userProfileData
} from '../data/mockData';

const API_BASE_URL = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  DEVICES: 'smarthome_devices_v2',
  ACTION_HISTORY: 'smarthome_action_history_v2',
  SENSOR_LATEST: 'smarthome_sensor_latest_v2',
  CHART_HISTORY_24H: 'smarthome_chart_history_24h'
};

// Helper: Chuẩn hóa timestamp sang YYYY/MM/DD HH:mm:ss
function ensureFullDateTime(val, fallbackDate = '2026/10/07') {
  if (!val || val === '-' || val === '—') return '—';
  if (/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) return val;
  if (/^\d{2}:\d{2}:\d{2}$/.test(val)) {
    return `${fallbackDate} ${val}`;
  }
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return val;
  }
}

// Helper: Khởi tạo localStorage nếu chưa có
function getStoredData(key, defaultVal) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && key === STORAGE_KEYS.ACTION_HISTORY) {
        return parsed.map((item) => ({
          ...item,
          timeSent: ensureFullDateTime(item.timeSent || item.time_sent, item.date ? item.date.replace(/-/g, '/') : '2026/10/07'),
          timeResponse: item.timeResponse === '—' || item.timeResponse === '-' ? '—' : ensureFullDateTime(item.timeResponse || item.response_time, item.date ? item.date.replace(/-/g, '/') : '2026/10/07')
        }));
      }
      return parsed;
    }
  } catch (err) {
    console.warn(`Lỗi đọc localStorage key ${key}:`, err);
  }
  if (defaultVal !== undefined) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
  }
  return defaultVal;
}

function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Lỗi ghi localStorage key ${key}:`, err);
  }
}

// 1. Lấy thông số cảm biến mới nhất (Dashboard)
export async function getLatestSensors() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE_URL}/sensors/latest`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        setStoredData(STORAGE_KEYS.SENSOR_LATEST, json.data);
        return json.data;
      }
    }
  } catch {
    // Backend offline -> fallback sang storage
  }

  const current = getStoredData(STORAGE_KEYS.SENSOR_LATEST, initialSensorLatest);
  return { ...current };
}

// 2. Lấy dữ liệu biểu đồ 24 giờ gần nhất (từ currentTime - 24h đến currentTime)
export async function getSensorHistory(range = '24h') {
  // Ưu tiên gọi API Backend nếu dịch vụ đang chạy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE_URL}/sensors/history?range=${range}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setStoredData(STORAGE_KEYS.CHART_HISTORY_24H, json.data);
        return json.data;
      }
    }
  } catch {
    // Backend offline -> tiếp tục xử lý cục bộ
  }

  // Dùng dữ liệu 24h trượt từ localStorage hoặc khởi tạo động theo đúng thời gian thực hiện tại
  const stored = getStoredData(STORAGE_KEYS.CHART_HISTORY_24H, null);
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;

  if (Array.isArray(stored) && stored.length >= 5) {
    const valid = stored.filter((pt) => {
      const t = pt.timestamp ? new Date(pt.timestamp).getTime() : 0;
      return t >= cutoff;
    });
    if (valid.length >= 5) {
      setStoredData(STORAGE_KEYS.CHART_HISTORY_24H, valid);
      return valid;
    }
  }

  // Khởi tạo mới dữ liệu 24h bám sát mốc thời gian thực tế
  const freshData = chartDataMap['24h'];
  setStoredData(STORAGE_KEYS.CHART_HISTORY_24H, freshData);
  return freshData;
}

// Hàm thêm điểm đọc cảm biến mới vào biểu đồ và duy trì cửa sổ 24 giờ trượt
export function appendReadingTo24HChart(currentChart, latestSensor) {
  if (!latestSensor) return currentChart;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const nowFull = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const cutoff = now.getTime() - 24 * 60 * 60 * 1000;

  const newPoint = {
    time: nowTime,
    timestamp: now.toISOString(),
    fullDate: nowFull,
    temperature: Number(latestSensor.temperature?.value ?? 28.5),
    humidity: Number(latestSensor.humidity?.value ?? 72),
    light: Number(latestSensor.light?.value ?? 350)
  };

  // 1. Lọc bỏ các điểm cũ hơn 24 giờ
  const filtered = (currentChart || []).filter((pt) => {
    const t = pt.timestamp ? new Date(pt.timestamp).getTime() : 0;
    return t >= cutoff;
  });

  // 2. Nếu điểm cuối cùng trùng phút, cập nhật giá trị mới nhất của phút đó; nếu sang phút mới, thêm điểm mới
  let updated;
  if (filtered.length > 0 && filtered[filtered.length - 1].time === nowTime) {
    updated = [...filtered.slice(0, -1), newPoint];
  } else {
    updated = [...filtered, newPoint];
  }

  setStoredData(STORAGE_KEYS.CHART_HISTORY_24H, updated);
  return updated;
}

// 3. Lấy trạng thái thiết bị thật từ Backend
export async function getDevices() {
  const res = await fetch(`${API_BASE_URL}/devices`);
  const json = await res.json();

  if (!res.ok || !json.success || !Array.isArray(json.data)) {
    throw new Error(json.message || "Không thể tải trạng thái thiết bị từ Backend");
  }

  const devices = json.data.map((device) => ({
    id: Number(device.device_id),
    name: device.device_name,
    location: device.location || "",
    status: device.status,
    lastActionTime: ensureFullDateTime(device.updated_at)
  }));

  setStoredData(STORAGE_KEYS.DEVICES, devices);
  return devices;
}

// 4. Điều khiển thiết bị thật qua Backend -> MQTT -> ESP8266 -> ACK
export async function controlDevice(deviceId, targetAction) {
  const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: targetAction })
  });
  const json = await res.json();

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message || "ESP8266 chưa xác nhận lệnh điều khiển");
  }

  const result = json.data;
  const devices = getStoredData(STORAGE_KEYS.DEVICES, initialDevices);
  const targetDevice = devices.find((device) => device.id === Number(deviceId));
  const responseDate = new Date(result.responseTime);
  const responseTime = Number.isNaN(responseDate.getTime())
    ? "—"
    : ensureFullDateTime(responseDate.toISOString());
  const newRecord = {
    id: result.actionId,
    deviceId: Number(result.deviceId),
    deviceName: result.deviceName,
    location: targetDevice?.location || "",
    action: result.status,
    status: result.status,
    timeSent: ensureFullDateTime(result.timeSent),
    timeResponse: responseTime,
    durationMs: result.durationMs,
    date: result.timeSent?.split("T")[0]
  };

  const updatedDevices = devices.map((device) =>
    device.id === Number(deviceId)
      ? { ...device, status: result.status, lastActionTime: responseTime }
      : device
  );
  setStoredData(STORAGE_KEYS.DEVICES, updatedDevices);

  const history = getStoredData(STORAGE_KEYS.ACTION_HISTORY, initialActionHistory);
  setStoredData(STORAGE_KEYS.ACTION_HISTORY, [newRecord, ...history]);

  return {
    success: true,
    device: {
      ...(targetDevice || {}),
      id: Number(result.deviceId),
      name: result.deviceName,
      status: result.status,
      lastActionTime: responseTime
    },
    actionRecord: newRecord
  };
}

// 5. Lấy danh sách hoạt động gần đây (Recent Activities cho Dashboard)
export async function getRecentActions(limit = 5) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const history = getStoredData(STORAGE_KEYS.ACTION_HISTORY, initialActionHistory);
  return history.slice(0, limit);
}

// 6. Lấy toàn bộ lịch sử điều khiển kèm bộ lọc (Action History Page)
export async function getActionHistory(filters = {}) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let list = getStoredData(STORAGE_KEYS.ACTION_HISTORY, initialActionHistory);

  if (filters.deviceId && filters.deviceId !== 'ALL') {
    list = list.filter((item) => item.deviceId === Number(filters.deviceId));
  }
  if (filters.action && filters.action !== 'ALL') {
    list = list.filter((item) => item.action === filters.action);
  }
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter((item) => item.status === filters.status);
  }
  if (filters.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (item) =>
        String(item.id).toLowerCase().includes(q) ||
        (item.deviceName && item.deviceName.toLowerCase().includes(q)) ||
        (item.action && item.action.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q)) ||
        (item.timeSent && item.timeSent.toLowerCase().includes(q)) ||
        (item.timeResponse && item.timeResponse.toLowerCase().includes(q))
    );
  }

  return list;
}

// 7. Tra cứu dữ liệu cảm biến (Data Sensors Page với Filter & Pagination)
export async function getSensorTableData(filters = {}) {
  // 1. Thử gọi API Backend nếu máy chủ đang chạy
  try {
    const params = new URLSearchParams();
    if (filters.sensorType && filters.sensorType !== 'ALL') params.append('sensorType', filters.sensorType);
    if (filters.criteria) params.append('criteria', filters.criteria);
    if (filters.search && filters.search.trim() !== '') params.append('search', filters.search.trim());
    params.append('limit', '100');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE_URL}/sensors?${params.toString()}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((item) => ({
          id: item.data_id,
          sensorId: item.sensor_type || `SENSOR_${item.sensor_id}`,
          sensorName: item.sensor_name,
          value: String(item.value),
          unit: item.unit,
          timestamp: item.recorded_at ? item.recorded_at.replace('T', ' ').substring(0, 19).replace(/-/g, '/') : ''
        }));
      }
    }
  } catch {
    // Backend offline -> fallback sang dữ liệu cục bộ
  }

  // 2. Xử lý lọc dữ liệu cục bộ
  await new Promise((resolve) => setTimeout(resolve, 200));
  let list = [...initialSensorDataTable];

  const q = filters.search ? filters.search.toLowerCase().trim() : '';

  if (filters.criteria === 'TEMPERATURE') {
    // Chỉ lấy dòng Nhiệt độ, nếu có nhập ô text thì lọc thêm theo giá trị
    list = list.filter((item) => item.sensorName.toLowerCase().includes('nhiệt độ'));
    if (q) list = list.filter((item) => String(item.value).toLowerCase().includes(q));
  } else if (filters.criteria === 'HUMIDITY') {
    // Chỉ lấy dòng Độ ẩm, nếu có nhập ô text thì lọc thêm theo giá trị
    list = list.filter((item) => item.sensorName.toLowerCase().includes('độ ẩm'));
    if (q) list = list.filter((item) => String(item.value).toLowerCase().includes(q));
  } else if (filters.criteria === 'LIGHT') {
    // Chỉ lấy dòng Ánh sáng, nếu có nhập ô text thì lọc thêm theo giá trị
    list = list.filter((item) => item.sensorName.toLowerCase().includes('ánh sáng'));
    if (q) list = list.filter((item) => String(item.value).toLowerCase().includes(q));
  } else if (filters.criteria === 'TIME') {
    // Tìm kiếm chuỗi thời gian (ngày, giờ, phút, giây)
    if (q) list = list.filter((item) => item.timestamp && item.timestamp.toLowerCase().includes(q));
  } else {
    // ALL: Tìm kiếm tự do trên tất cả các cột
    if (q) {
      list = list.filter(
        (item) =>
          item.sensorName.toLowerCase().includes(q) ||
          String(item.value).toLowerCase().includes(q) ||
          (item.timestamp && item.timestamp.toLowerCase().includes(q))
      );
    }
  }

  return list;
}

// 8. Lấy thông tin người dùng & đồ án
export async function getUserProfile() {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return userProfileData;
}
