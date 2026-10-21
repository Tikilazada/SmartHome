import React, { useState } from "react";
import { Sliders } from "lucide-react";
import DeviceCard from "./DeviceCard";
export default function DeviceControl({ devices, onControlDevice }) {
  const [pendingMap, setPendingMap] = useState({});
  const [feedbackMap, setFeedbackMap] = useState({});

  const handleDeviceToggle = async (deviceId, nextAction) => {
    // 1. Chuyển sang PENDING
    setPendingMap((prev) => ({ ...prev, [deviceId]: true }));
    setFeedbackMap((prev) => ({ ...prev, [deviceId]: null }));

    try {
      // 2. Gửi lệnh tới API / MQTT
      await onControlDevice(deviceId, nextAction);

      // 3. Nhận phản hồi thành công (SUCCESS)
      setFeedbackMap((prev) => ({ ...prev, [deviceId]: "SUCCESS" }));
    } catch (err) {
      console.error(err);
      // 4. Nhận phản hồi lỗi (FAILED)
      setFeedbackMap((prev) => ({ ...prev, [deviceId]: "FAILED" }));
    } finally {
      // 5. Tắt PENDING
      setPendingMap((prev) => ({ ...prev, [deviceId]: false }));

      // Tự động xóa trạng thái feedback sau 3 giây để giao diện gọn gàng
      setTimeout(() => {
        setFeedbackMap((prev) => ({ ...prev, [deviceId]: null }));
      }, 3000);
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#0F172A] leading-tight">
                Điều khiển thiết bị
              </h3>
              <p className="text-xs font-normal text-[#64748B] mt-0.5">
                Rơ-le ESP8266 & Phản hồi 2 chiều
              </p>
            </div>
          </div>
        </div>

        {/* Device Cards List (3 lamps, spacing 12px = space-y-3) */}
        <div className="space-y-3 mt-3">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={handleDeviceToggle}
              isPending={Boolean(pendingMap[device.id])}
              feedbackState={feedbackMap[device.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
