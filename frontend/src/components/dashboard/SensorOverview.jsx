// src/components/dashboard/SensorOverview.jsx
import React from "react";
import SensorCard from "./SensorCard";

export default function SensorOverview({ sensorData }) {
  if (!sensorData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <SensorCard
        type="temperature"
        title={sensorData.temperature.sensorName || "Nhiệt độ"}
        value={sensorData.temperature.value}
        unit={sensorData.temperature.unit}
        trend={sensorData.temperature.trend}
        trendDirection={sensorData.temperature.trendDirection}
        updatedAt={sensorData.temperature.updatedAt}
        sensorId={sensorData.temperature.sensorId}
      />
      <SensorCard
        type="humidity"
        title={sensorData.humidity.sensorName || "Độ ẩm"}
        value={sensorData.humidity.value}
        unit={sensorData.humidity.unit}
        trend={sensorData.humidity.trend}
        trendDirection={sensorData.humidity.trendDirection}
        updatedAt={sensorData.humidity.updatedAt}
        sensorId={sensorData.humidity.sensorId}
      />
      <SensorCard
        type="light"
        title={sensorData.light.sensorName || "Cường độ ánh sáng"}
        value={sensorData.light.value}
        unit={sensorData.light.unit}
        trend={sensorData.light.trend}
        trendDirection={sensorData.light.trendDirection}
        updatedAt={sensorData.light.updatedAt}
        sensorId={sensorData.light.sensorId}
      />
    </div>
  );
}
