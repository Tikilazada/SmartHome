// src/data/mockData.js

export const initialSensorLatest = {
  temperature: {
    value: 28.5,
    unit: '°C',
    trend: 1.2,
    trendDirection: 'up',
    updatedAt: '10 giây trước',
    sensorId: 'DHT11_01',
    sensorName: 'Nhiệt độ phòng'
  },
  humidity: {
    value: 72,
    unit: '%',
    trend: 2.1,
    trendDirection: 'down',
    updatedAt: '10 giây trước',
    sensorId: 'DHT11_01',
    sensorName: 'Độ ẩm không khí'
  },
  light: {
    value: 350,
    unit: 'lux',
    trend: 15,
    trendDirection: 'up',
    updatedAt: '10 giây trước',
    sensorId: 'BH1750_01',
    sensorName: 'Cường độ ánh sáng'
  }
};

// Hàm sinh dữ liệu 24 giờ gần nhất trượt theo thời gian thực (currentTime - 24h -> currentTime)
export function generateRecent24HoursChartData() {
  const points = [];
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');

  // 25 mốc cách nhau 1 giờ từ now - 24h đến now
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = t.getHours();

    const isDay = hour >= 6 && hour <= 18;
    const tempBase = isDay ? 28.0 + Math.sin(((hour - 6) / 12) * Math.PI) * 3.2 : 25.0;
    const humBase = isDay ? 68.0 - Math.sin(((hour - 6) / 12) * Math.PI) * 8.0 : 78.0;
    const lightBase = isDay ? Math.round(Math.sin(((hour - 6) / 12) * Math.PI) * 550 + 60) : 10;

    const temp = i === 0 ? 28.5 : Number((tempBase + (Math.sin(i * 1.5) * 0.3)).toFixed(1));
    const hum = i === 0 ? 72 : Math.round(humBase + Math.cos(i) * 1.2);
    const light = i === 0 ? 350 : Math.max(0, lightBase + Math.round(Math.sin(i) * 15));

    points.push({
      time: `${pad(t.getHours())}:${pad(t.getMinutes())}`,
      timestamp: t.toISOString(),
      fullDate: `${t.getFullYear()}/${pad(t.getMonth() + 1)}/${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}`,
      temperature: temp,
      humidity: hum,
      light: light
    });
  }

  return points;
}

export const chartDataMap = {
  get '24h'() {
    return generateRecent24HoursChartData();
  }
};

export const initialDevices = [
  {
    id: 1,
    code: 'LIGHT_01',
    name: 'Đèn 1',
    location: 'Phòng khách',
    status: 'ON',
    connected: true,
    lastActionTime: '10:25:30'
  },
  {
    id: 2,
    code: 'LIGHT_02',
    name: 'Đèn 2',
    location: 'Phòng bếp',
    status: 'OFF',
    connected: true,
    lastActionTime: '10:20:15'
  },
  {
    id: 3,
    code: 'LIGHT_03',
    name: 'Đèn 3',
    location: 'Phòng ngủ',
    status: 'ON',
    connected: true,
    lastActionTime: '10:18:02'
  }
];

export const initialActionHistory = [
  {
    id: 101,
    deviceId: 1,
    deviceName: 'Đèn 1',
    location: 'Phòng khách',
    action: 'ON',
    status: 'ON',
    timeSent: '2026/10/07 10:25:18',
    timeResponse: '2026/10/07 10:25:19',
    durationMs: 320,
    date: '2026-10-07'
  },
  {
    id: 102,
    deviceId: 2,
    deviceName: 'Đèn 2',
    location: 'Phòng bếp',
    action: 'OFF',
    status: 'OFF',
    timeSent: '2026/10/07 10:25:20',
    timeResponse: '2026/10/07 10:25:21',
    durationMs: 290,
    date: '2026-10-07'
  },
  {
    id: 103,
    deviceId: 1,
    deviceName: 'Đèn 1',
    location: 'Phòng khách',
    action: 'ON',
    status: 'LOADING',
    timeSent: '2026/10/07 10:26:10',
    timeResponse: '—',
    durationMs: null,
    date: '2026-10-07'
  },
  {
    id: 104,
    deviceId: 1,
    deviceName: 'Đèn 1',
    location: 'Phòng khách',
    action: 'OFF',
    status: 'OFF',
    timeSent: '2026/10/07 09:45:10',
    timeResponse: '2026/10/07 09:45:11',
    durationMs: 310,
    date: '2026-10-07'
  },
  {
    id: 105,
    deviceId: 2,
    deviceName: 'Đèn 2',
    location: 'Phòng bếp',
    action: 'ON',
    status: 'ON',
    timeSent: '2026/10/07 09:15:00',
    timeResponse: '2026/10/07 09:15:01',
    durationMs: 350,
    date: '2026-10-07'
  },
  {
    id: 106,
    deviceId: 3,
    deviceName: 'Đèn 3',
    location: 'Phòng ngủ',
    action: 'OFF',
    status: 'OFF',
    timeSent: '2026/10/07 08:30:22',
    timeResponse: '2026/10/07 08:30:23',
    durationMs: 280,
    date: '2026-10-07'
  },
  {
    id: 107,
    deviceId: 1,
    deviceName: 'Đèn 1',
    location: 'Phòng khách',
    action: 'ON',
    status: 'ON',
    timeSent: '2026/10/07 07:10:05',
    timeResponse: '2026/10/07 07:10:06',
    durationMs: 340,
    date: '2026-10-07'
  },
  {
    id: 108,
    deviceId: 2,
    deviceName: 'Đèn 2',
    location: 'Phòng bếp',
    action: 'OFF',
    status: 'OFF',
    timeSent: '2026/10/07 06:05:40',
    timeResponse: '2026/10/07 06:05:41',
    durationMs: 310,
    date: '2026-10-07'
  }
];

// Sinh danh sách 60 bản ghi quan trắc mẫu để kiểm thử phân trang và rút gọn trang (...)
function generateInitialSensorRecords() {
  const records = [];
  const now = new Date(2026, 8, 9, 10, 25, 30); // 2026/09/09 10:25:30
  const pad = (n) => String(n).padStart(2, '0');

  for (let i = 0; i < 60; i++) {
    const t = new Date(now.getTime() - i * 10 * 1000); // cách nhau 10 giây
    const timeStr = `${t.getFullYear()}/${pad(t.getMonth() + 1)}/${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
    const mod = i % 3;

    if (mod === 0) {
      records.push({
        id: 101 + i,
        sensorId: 'DHT11_01',
        sensorName: 'Nhiệt độ',
        value: (28.0 + (Math.sin(i) * 0.8)).toFixed(1),
        unit: '°C',
        timestamp: timeStr
      });
    } else if (mod === 1) {
      records.push({
        id: 101 + i,
        sensorId: 'DHT11_01',
        sensorName: 'Độ ẩm',
        value: String(Math.round(72 + Math.cos(i) * 3)),
        unit: '%',
        timestamp: timeStr
      });
    } else {
      records.push({
        id: 101 + i,
        sensorId: 'BH1750_01',
        sensorName: 'Ánh sáng',
        value: String(Math.round(350 + Math.sin(i) * 25)),
        unit: 'lux',
        timestamp: timeStr
      });
    }
  }
  return records;
}

export const initialSensorDataTable = generateInitialSensorRecords();


export const userProfileData = {
  fullName: 'Nguyễn Việt Hà',
  major: 'Sinh viên ngành An toàn thông tin',
  studentId: 'B23DACT085',
  avatarUrl: '/avatar.jpg',
  project: {
    name: 'Hệ thống theo dõi thông số môi trường trong nhà và điều khiển thiết bị',
    description: 'Đồ án nghiên cứu và xây dựng giải pháp IoT thu thập dữ liệu cảm biến thời gian thực (Nhiệt độ, Độ ẩm, Cường độ ánh sáng) và điều khiển thiết bị điện gia dụng qua giao thức MQTT bảo mật, hỗ trợ giám sát trực quan trên nền tảng Web Dashboard.',
    hardware: [
      { name: 'ESP8266 NodeMCU', role: 'Bộ điều khiển trung tâm' },
      { name: 'DHT11', role: 'Cảm biến Nhiệt độ & Độ ẩm' },
      { name: 'BH1750', role: 'Cảm biến Cường độ ánh sáng' },
      { name: 'Relay Module 3 Kênh', role: 'Công tắc điều khiển Đèn 1, 2, 3' }
    ],
    software: [
      { name: 'MQTT Broker', tech: 'Eclipse Mosquitto / EMQX' },
      { name: 'Backend', tech: 'Node.js / Express.js REST API' },
      { name: 'Database', tech: 'MySQL / SQLite' },
      { name: 'Frontend', tech: 'React.js, Tailwind CSS, Recharts' }
    ]
  },
  resources: [
    {
      id: 'github',
      title: 'GitHub Repository',
      description: 'Mã nguồn toàn bộ dự án gồm Firmware ESP8266, Backend RESTful API và Frontend React Dashboard.',
      icon: 'Github',
      url: 'https://github.com/example/iot-smarthome-dashboard',
      tag: 'Source Code'
    },
    {
      id: 'figma',
      title: 'Figma Design System',
      description: 'Bản thiết kế UI/UX High-Fidelity, Design Tokens, Flow tương tác và bộ Component chuẩn.',
      icon: 'Figma',
      url: 'https://figma.com/@smarthome-iot',
      tag: 'UI/UX Design'
    },
    {
      id: 'postman',
      title: 'Postman Collection',
      description: 'Bộ sưu tập kiểm thử toàn bộ API Endpoints cho cảm biến, điều khiển thiết bị và lịch sử thao tác.',
      icon: 'FileCode',
      url: 'https://postman.com/collections/smarthome-api',
      tag: 'API Testing'
    },
    {
      id: 'swagger',
      title: 'Swagger API Docs',
      description: 'Tài liệu chuẩn OpenAPI Specification 3.0 mô tả chi tiết schema request/response.',
      icon: 'Layers',
      url: 'https://swagger.io/docs/smarthome',
      tag: 'API Spec'
    },
    {
      id: 'pdf',
      title: 'PDF Documentation',
      description: 'Báo cáo thuyết minh đồ án hoàn chỉnh, sơ đồ khối, sơ đồ nguyên lý mạch và hướng dẫn cài đặt.',
      icon: 'FileText',
      url: '#',
      tag: 'Report PDF'
    }
  ]
};
