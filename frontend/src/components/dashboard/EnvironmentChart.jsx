// src/components/dashboard/EnvironmentChart.jsx
import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Activity, Calendar } from "lucide-react";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const fullDate =
      payload[0]?.payload?.fullDate || payload[0]?.payload?.timestamp || label;
    return (
      <div className="bg-[#0F172A] text-[#FFFFFF] p-3 rounded-lg shadow-lg border border-[#1E293B] text-xs">
        <p className="font-normal text-[#94A3B8] mb-2 flex items-center gap-1.5 border-b border-[#334155] pb-1.5 font-mono text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-[#0EA5E9]" />
          <span>{fullDate}</span>
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-1.5 text-[#94A3B8] text-xs font-normal">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></span>
                {entry.name}:
              </span>
              <span className="font-semibold font-mono text-[#FFFFFF] text-xs">
                {entry.value} {entry.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function EnvironmentChart({ data, isLoading }) {
  const [visibleSeries, setVisibleSeries] = useState({
    temperature: true,
    humidity: true,
    light: true,
  });

  const toggleSeries = (key) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col h-full">
      {/* 1. Header: Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/20">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-[#0F172A] leading-tight">
            Biểu đồ giám sát môi trường
          </h2>
          <p className="text-[12px] lg:text-[13px] font-normal text-[#64748B] mt-0.5">
            DHT11 (Nhiệt độ, Độ ẩm) & BH1750 (Ánh sáng)
          </p>
        </div>
      </div>

      {/* 2. Compact Legend Badges (Clean & Minimal) */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        {/* Temperature Badge */}
        <button
          onClick={() => toggleSeries("temperature")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-normal transition-all ${
            visibleSeries.temperature
              ? "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] opacity-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
          <span>Nhiệt độ (°C)</span>
        </button>

        {/* Humidity Badge */}
        <button
          onClick={() => toggleSeries("humidity")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-normal transition-all ${
            visibleSeries.humidity
              ? "bg-[#0EA5E9]/10 border-[#0EA5E9]/20 text-[#0EA5E9]"
              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] opacity-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
          <span>Độ ẩm (%)</span>
        </button>

        {/* Light Badge */}
        <button
          onClick={() => toggleSeries("light")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-normal transition-all ${
            visibleSeries.light
              ? "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]"
              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] opacity-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
          <span>Ánh sáng (lux)</span>
        </button>
      </div>

      {/* 3. Chart Canvas */}
      <div className="flex-1 w-full min-h-[260px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FFFFFF]/80 z-10">
            <span className="text-xs text-[#64748B] font-normal">
              Đang tải dữ liệu biểu đồ...
            </span>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 10, left: 15, bottom: 0 }}
          >
            {/* Very Subtle Horizontal Grid Lines Only */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F5F9"
              vertical={false}
            />

            {/* X-Axis: 12px / 400 muted */}
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              interval="preserveStartEnd"
              minTickGap={35}
            />

            {/* Left Y-Axis: For Temp (°C) & Humidity (%) with unit label */}
            <YAxis
              yAxisId="left"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickCount={6}
              unit="°C / %"
              width={75}
              hide={!visibleSeries.temperature && !visibleSeries.humidity}
            />

            {/* Right Y-Axis: For Light Intensity (lux) with unit label */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 1000]}
              tickCount={6}
              unit=" lx"
              hide={!visibleSeries.light}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Temperature Line (Red) */}
            {visibleSeries.temperature && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                name="Nhiệt độ"
                unit="°C"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#FFFFFF", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}

            {/* Humidity Line (Blue) */}
            {visibleSeries.humidity && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="humidity"
                name="Độ ẩm"
                unit="%"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#FFFFFF", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}

            {/* Light Line (Orange) */}
            {visibleSeries.light && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="light"
                name="Ánh sáng"
                unit="lux"
                stroke="#F59E0B"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 4, stroke: "#FFFFFF", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
