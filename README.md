# HỆ THỐNG THEO DÕI THÔNG SỐ MÔI TRƯỜNG TRONG NHÀ VÀ ĐIỀU KHIỂN THIẾT BỊ
> **Học phần:** Đồ án Tốt nghiệp / Đồ án Chuyên ngành IoT  
> **Kiến trúc:** React Web Dashboard ↔ Express.js REST API ↔ MySQL & MQTT Broker ↔ NodeMCU ESP8266 (DHT11, BH1750, 3 Đèn LED/Relay)

---

## 1. TỔNG QUAN HỆ THỐNG

Dự án xây dựng một giải pháp IoT Smart Home hoàn chỉnh, chuyên nghiệp, bao gồm:
* **Bộ điều khiển trung tâm:** NodeMCU ESP8266 kết nối WiFi.
* **Cảm biến môi trường:**
  * `DHT11`: Thu thập Nhiệt độ ($^\circ\text{C}$) và Độ ẩm ($\%$).
  * `BH1750`: Thu thập Cường độ ánh sáng ($\text{lux}$) qua giao tiếp I2C.
* **Cơ cấu chấp hành:** 3 LED / Relay điều khiển độc lập (`Đèn 1`, `Đèn 2`, `Đèn 3`).
* **Trung gian truyền thông:** MQTT Broker (`broker.emqx.io` / Eclipse Mosquitto) với 3 topic chuẩn:
  * `iot/sensor/data`: ESP8266 gửi dữ liệu cảm biến định kỳ lên Backend.
  * `iot/device/command`: Backend phát lệnh điều khiển Bật/Tắt xuống ESP8266.
  * `iot/device/status`: ESP8266 gửi phản hồi xác nhận trạng thái thực tế (ACK) về Backend.
* **Cơ sở dữ liệu:** MySQL 8.0 gồm 5 bảng quan hệ (`User`, `Devices`, `Sensors`, `Data_Sensor`, `Action`).
* **Máy chủ Backend:** Node.js + Express.js REST API + MQTT.js Client + Chế độ `MOCK_MODE`.
* **Giao diện Web Dashboard:** React.js + Vite + Tailwind CSS + Recharts + Lucide Icons (Desktop-first 1440x900, không cuộn dọc).

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```
SmartHome/
├── database/
│   └── schema.sql              # Kịch bản khởi tạo CSDL MySQL & Seed Data
│
├── backend/                    # Máy chủ RESTful API & MQTT Client (Node.js/Express)
│   ├── .env.example            # Mẫu biến môi trường
│   ├── .env                    # Biến môi trường thực tế
│   ├── package.json
│   └── src/
│       ├── config/             # database.js, mqtt.js
│       ├── models/             # User, Device, Sensor, DataSensor, Action
│       ├── services/           # mqttService, sensorService, deviceService, actionService
│       ├── controllers/        # authController, sensorController, deviceController, actionController
│       ├── routes/             # authRoutes, sensorRoutes, deviceRoutes, actionRoutes
│       ├── middleware/         # authMiddleware, errorMiddleware
│       ├── app.js
│       └── server.js
│
├── frontend/                   # Giao diện Web Dashboard (React + Vite + Tailwind CSS)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── components/         # layout, dashboard, common
│       ├── pages/              # Login, Dashboard, DataSensors, ActionHistory, Profile
│       ├── services/           # api.js (Axios)
│       ├── data/               # mockData.js
│       ├── App.jsx
│       └── main.jsx
│
├── esp8266/                    # Mã nguồn nhúng vi điều khiển NodeMCU ESP8266
│   ├── platformio.ini          # Cấu hình nạp code & thư viện PlatformIO
│   └── src/
│       ├── main.cpp            # Setup WiFi, Timer loop
│       ├── secrets.h.example   # Mẫu cấu hình WiFi/MQTT (không chứa thông tin thật)
│       ├── sensors.h / .cpp    # Đọc DHT11 & BH1750
│       ├── devices.h / .cpp    # Điều khiển 3 LED (D6, D7, D8)
│       └── mqtt.h / .cpp       # Xử lý 3 Topic MQTT Pub/Sub
│
└── README.md
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT & CHẠY TOÀN BỘ HỆ THỐNG

### BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU MYSQL

1. Đảm bảo dịch vụ **MySQL Server** (XAMPP, WampServer hoặc MySQL Workbench) đang chạy tại cổng `3306`.
2. Mở Terminal và thực thi lệnh import schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *(Hoặc mở file `database/schema.sql` trong phpMyAdmin/MySQL Workbench và bấm Run SQL Script).*
3. Cơ sở dữ liệu `iot_home` sẽ tự động được tạo với 5 bảng và dữ liệu mẫu:
   * Tài khoản: `admin` / Mật khẩu: `password123`
   * 3 Thiết bị: `Đèn 1` (ON), `Đèn 2` (OFF), `Đèn 3` (ON)
   * 3 Cảm biến: `Nhiệt độ` (DHT11), `Độ ẩm` (DHT11), `Cường độ ánh sáng` (BH1750)

---

### BƯỚC 2: KHỞI ĐỘNG BACKEND SERVER

1. Mở Terminal mới và chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   ```
3. Cấu hình file `backend/.env`:
   * Chạy kiểm thử không cần phần cứng: Đặt `MOCK_MODE=true`
   * Chạy với phần cứng ESP8266 thực tế: Đặt `MOCK_MODE=false` và cấu hình `MQTT_BROKER_URL=mqtt://broker.emqx.io:1883`
4. Khởi động Backend Server:
   ```bash
   npm run dev
   ```
   * Server sẽ chạy tại: **`http://localhost:5000`**
   * Kiểm tra API: Mở trình duyệt truy cập `http://localhost:5000` để xem trạng thái `ONLINE`.

---

### BƯỚC 3: KHỞI ĐỘNG FRONTEND DASHBOARD

1. Mở Terminal thứ hai và chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi động giao diện Web Dashboard:
   ```bash
   npm run dev
   ```
4. Truy cập Web Dashboard trên trình duyệt: **`http://localhost:3000`** (hoặc `http://localhost:5173`).

---

### BƯỚC 4: NẠP CODE VÀ KẾT NỐI PHẦN CỨNG ESP8266

1. **Sơ đồ nối dây:**
   * `DHT11`: Chân Data nối vào **`D4`** (GPIO2), VCC vào `3V3`, GND vào `GND`.
   * `BH1750`: Chân `SDA` nối vào **`D2`** (GPIO4), `SCL` nối vào **`D1`** (GPIO5), VCC vào `3V3`, GND vào `GND`.
   * `Đèn 1` (LED 1): Nối vào **`D6`** (GPIO12).
   * `Đèn 2` (LED 2): Nối vào **`D7`** (GPIO13).
   * `Đèn 3` (LED 3): Nối vào **`D8`** (GPIO15).
2. Mở thư mục `esp8266` bằng **VS Code (PlatformIO)**.
3. Sao chép `esp8266/src/secrets.h.example` thành `esp8266/src/secrets.h` và điền thông tin WiFi/MQTT của bạn.
4. Cắm cáp USB nối ESP8266 với máy tính $\to$ Bấm **PlatformIO: Upload (→)**.
5. Mở **Serial Monitor** với baud rate `115200` để xem địa chỉ IP và xác nhận kết nối MQTT thành công.

---

## 4. QUY TRÌNH KIỂM THỬ 5 USE CASE CHUẨN

### UC01: ĐĂNG NHẬP HỆ THỐNG
1. Mở trang Web `http://localhost:3000/login`.
2. Nhập: Username: `admin` | Password: `password123`.
3. Bấm **Đăng nhập hệ thống**. Hệ thống xác thực qua API `POST /api/auth/login`, nhận JWT Token và tự động chuyển hướng đến màn hình **Dashboard**.

### UC02: GIÁM SÁT THÔNG SỐ MÔI TRƯỜNG THỜI GIAN THỰC
1. Quan sát **3 Sensor Summary Cards**: Nhiệt độ ($^\circ\text{C}$), Độ ẩm ($\%$) và Ánh sáng ($\text{lux}$).
2. Dữ liệu tự động cập nhật liên tục từ Database (được ESP8266 publish qua MQTT topic `iot/sensor/data`).
3. Quan sát **Biểu đồ Line Chart (Recharts)**:
   * Thử chuyển đổi các khoảng thời gian: `1 giờ`, `6 giờ`, `24 giờ`, `7 ngày`.
   * Thử ẩn/hiện từng chuỗi dữ liệu (Nhiệt độ, Độ ẩm, Ánh sáng) để kiểm tra tính năng scale trục đa chiều.

### UC03: ĐIỀU KHIỂN THIẾT BỊ CÓ XÁC NHẬN PHẢN HỒI (ACK)
1. Trên khối **Điều khiển thiết bị**, bấm nút Toggle của **Đèn 1**, **Đèn 2** hoặc **Đèn 3**.
2. **Kiểm tra trạng thái trung gian (PENDING):** Nút toggle chuyển sang màu vàng mờ kèm icon xoay tròn (*Spinner*), khóa click chống spam.
3. Backend gửi lệnh xuống Topic `iot/device/command`. ESP8266 nhận lệnh, bật/tắt LED vật lý và publish ACK lên `iot/device/status`.
4. **Kiểm tra trạng thái thành công (SUCCESS):** Nút toggle chuyển sang màu xanh lá (`ON`) hoặc xám (`OFF`), thông báo Toast góc phải hiển thị `✓ Đã điều khiển thiết bị thành công`.
5. **Kiểm tra lưu trạng thái:** Nhấn F5 reload trang, trạng thái đèn vẫn được giữ nguyên do được truy vấn trực tiếp từ MySQL (`GET /api/devices`).

### UC04: TRA CỨU DỮ LIỆU CẢM BIẾN (DATA SENSORS)
1. Bấm vào menu **Data Sensors** (`/data-sensors`) trên Sidebar.
2. Chọn loại cảm biến: `Nhiệt độ` $\to$ Bấm **Tìm kiếm**.
3. Bảng dữ liệu tự động lọc chính xác các bản ghi DHT11 từ bảng `Data_Sensor`.
4. Thử chuyển các trang phân trang `1, 2, 3...` và bấm **Đặt lại** để phục hồi toàn bộ dữ liệu.

### UC05: THEO DÕI LỊCH SỬ ĐIỀU KHIỂN (ACTION HISTORY)
1. Bấm vào menu **Action History** (`/action-history`) trên Sidebar.
2. Quan sát **3 Summary Cards**: Tổng số lệnh, Số lệnh thành công, Số lệnh thất bại.
3. Quan sát bảng lịch sử: Hiển thị đầy đủ Thiết bị, Hành động (BẬT/TẮT), Badge trạng thái (`SUCCESS` / `FAILED`), Thời gian gửi lệnh và Thời gian phản hồi từ phần cứng (Round-Trip Time ms).
4. Thử lọc theo thiết bị (`Đèn 1`) và trạng thái (`SUCCESS`).

---

## 5. DANH MỤC RESTful API ENDPOINTS

| Nhóm | Phương thức | Đường dẫn Endpoint | Chức năng |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Xác thực đăng nhập & Cấp JWT Token |
| **Sensors** | `GET` | `/api/sensors/latest` | Lấy 3 thông số cảm biến mới nhất |
| | `GET` | `/api/sensors/history?range=24h` | Lấy chuỗi dữ liệu vẽ biểu đồ |
| | `GET` | `/api/sensors` | Tra cứu dữ liệu cảm biến (lọc & phân trang) |
| | `GET` | `/api/sensors/:id` | Xem chi tiết 1 cảm biến |
| **Devices** | `GET` | `/api/devices` | Lấy trạng thái hiện tại của 3 đèn |
| | `GET` | `/api/devices/:id` | Xem chi tiết 1 thiết bị |
| | `POST` | `/api/devices/:id/control` | Gửi lệnh Bật/Tắt và chờ ACK từ ESP8266 |
| **Actions** | `GET` | `/api/actions/recent?limit=5` | Lấy 5 hoạt động điều khiển gần nhất |
| | `GET` | `/api/actions` | Xem toàn bộ lịch sử điều khiển |
| | `GET` | `/api/actions/:id` | Xem chi tiết 1 bản ghi điều khiển |
| **Profile** | `GET` | `/api/profile` | Lấy thông tin cá nhân & tài nguyên đồ án |

---

## 6. HƯỚNG DẪN XỬ LÝ LỖI PHỔ BIẾN (TROUBLESHOOTING)

1. **Lỗi `ER_NOT_SUPPORTED_AUTH_MODE` hoặc không kết nối được MySQL:**
   * Đảm bảo MySQL đang chạy và tài khoản `root` trong file `backend/.env` khớp với mật khẩu MySQL của bạn.
   * Kiểm tra đã import file `database/schema.sql`.
2. **Lỗi `Timeout không nhận được phản hồi ACK từ ESP8266`:**
   * Kiểm tra ESP8266 đã kết nối WiFi và subscribe đúng topic `iot/device/command` chưa qua Serial Monitor.
   * Nếu đang chạy thử nghiệm mà không có board phần cứng, hãy đặt `MOCK_MODE=true` trong file `backend/.env`.
3. **Lỗi giao diện bị trắng khi mở web:**
   * Đảm bảo đã chạy lệnh `npm install` ở cả hai thư mục `backend` và `frontend`.
   * Kiểm tra cổng Backend (5000) và Frontend (3000) không bị chiếm dụng bởi ứng dụng khác.

---

**Tác giả đồ án:** Nhóm Sinh viên Nghiên cứu & Phát triển IoT  
**Khoa:** Công nghệ Thông tin / Điện tử Viễn thông  
**Trường:** Học viện Công nghệ Bưu chính Viễn thông (PTIT)
