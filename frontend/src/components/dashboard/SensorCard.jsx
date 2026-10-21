// src/components/dashboard/SensorCard.jsx
import React from "react";
import { Thermometer, Droplets, Sun } from "lucide-react";

const metricConfigs = {
  temperature: {
    icon: Thermometer,
    bgBadge: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  },
  humidity: {
    icon: Droplets,
    bgBadge: "bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/20",
  },
  light: {
    icon: Sun,
    bgBadge: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  },
};

export default function SensorCard({ type, title, value, unit }) {
  const config = metricConfigs[type] || metricConfigs.temperature;
  const Icon = config.icon;

  return (
    <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E2E8F0] shadow-xs">
      {/* Top row: Name & Icon */}
      <div className="flex items-center gap-2">
        <span className={`p-1.5 rounded-lg border ${config.bgBadge}`}>
          <Icon className="w-4 h-4" />
        </span>
        <h3 className="text-[15px] font-semibold text-[#0F172A] leading-tight">
          {title}
        </h3>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[32px] font-semibold tracking-tight text-[#0F172A] leading-none">
          {value ?? "--"}
        </span>
        <span className="text-sm font-normal text-[#64748B]">{unit}</span>
      </div>
    </div>
  );
}
