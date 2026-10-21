// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import SensorOverview from "../components/dashboard/SensorOverview";
import EnvironmentChart from "../components/dashboard/EnvironmentChart";
import DeviceControl from "../components/dashboard/DeviceControl";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import {
  getLatestSensors,
  getSensorHistory,
  getDevices,
  controlDevice,
  appendReadingTo24HChart,
} from "../services/api";

export default function Dashboard() {
  const [sensors, setSensors] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [devices, setDevices] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load toàn bộ dữ liệu ban đầu (24 giờ gần nhất)
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sensorsRes, chartRes, devicesRes] = await Promise.all([
        getLatestSensors(),
        getSensorHistory("24h"),
        getDevices(),
      ]);

      setSensors(sensorsRes);
      setChartData(chartRes);
      setDevices(devicesRes);
    } catch (err) {
      console.error(err);
      setError(
        "Không thể kết nối đến máy chủ IoT. Vui lòng kiểm tra lại dịch vụ Backend.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Cập nhật real-time: đồng bộ thông số cảm biến mới và duy trì cửa sổ 24 giờ trượt liên tục
  useEffect(() => {
    const telemetryInterval = setInterval(async () => {
      try {
        const latest = await getLatestSensors();
        if (latest) {
          setSensors(latest);
          setChartData((prev) => appendReadingTo24HChart(prev, latest));
        }
      } catch (err) {
        console.warn("Real-time sync telemetry error:", err);
      }
    }, 4000);

    return () => clearInterval(telemetryInterval);
  }, []);

  // Xử lý điều khiển thiết bị
  const handleControlDevice = async (deviceId, action) => {
    try {
      const result = await controlDevice(deviceId, action);
      // Cập nhật trạng thái device trong state
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? {
                ...d,
                status: action,
                lastActionTime: result.actionRecord.timeResponse,
              }
            : d,
        ),
      );

      // Hiển thị Toast thông báo thành công
      setToastMessage({
        type: "success",
        text: `Đã  ${action === "ON" ? "BẬT" : "TẮT"} ${result.device.name} thành công!`,
      });
      setTimeout(() => setToastMessage(null), 2000);

      return result;
    } catch (err) {
      // Hiển thị Toast thông báo lỗi
      setToastMessage({
        type: "error",
        text: err.message || "Lỗi không nhận được phản hồi từ ESP8266",
      });
      setTimeout(() => setToastMessage(null), 4000);

      throw err;
    }
  };

  if (isLoading) {
    return (
      <Loading message="Đang kết nối và đồng bộ dữ liệu cảm biến & thiết bị..." />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="h-full flex flex-col gap-4 max-w-[1600px] mx-auto">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 transition-all transform ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/20"
              : "bg-rose-600 text-white border-rose-700 shadow-rose-600/20"
          }`}
        >
          <span>{toastMessage.type === "success" ? "✓" : "✗"}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Row 1: 3 Sensor Metric Cards */}
      <div className="flex-shrink-0">
        <SensorOverview sensorData={sensors} />
      </div>

      {/* Row 2: Main Grid (Environment Chart 65% + Device Control 35%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left Column: Environmental Chart */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full min-h-0">
          <EnvironmentChart data={chartData} isLoading={isChartLoading} />
        </div>

        {/* Right Column: Device Control Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full min-h-0">
          <DeviceControl
            devices={devices}
            onControlDevice={handleControlDevice}
          />
        </div>
      </div>
    </div>
  );
}
