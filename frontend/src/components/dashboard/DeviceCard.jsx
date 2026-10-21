// src/components/dashboard/DeviceCard.jsx
import React from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';

export default function DeviceCard({ device, onToggle, isPending, feedbackState }) {
  const isOn = device.status === 'ON';

  const handleToggle = () => {
    if (isPending) return;
    const nextAction = isOn ? 'OFF' : 'ON';
    onToggle(device.id, nextAction);
  };

  return (
    <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs transition-all duration-150">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Device Icon & Information */}
        <div className="flex items-center gap-3">
          {/* Light/Device Icon */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              isOn
                ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                : 'bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0]'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-semibold text-[#0F172A] leading-tight">
                {device.name}
              </h4>
            </div>

            {/* Dynamic Status / Feedback Message */}
            <div className="mt-1 flex items-center gap-2 text-xs">
              {isPending ? (
                <span className="text-[#F59E0B] font-normal flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang gửi lệnh...
                </span>
              ) : feedbackState === 'SUCCESS' ? (
                <span className="text-[#10B981] font-normal">
                  ✓ {isOn ? 'Đã bật' : 'Đã tắt'}
                </span>
              ) : feedbackState === 'FAILED' ? (
                <span className="text-[#EF4444] font-normal">
                  ✗ Thất bại
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[12px] font-normal">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOn ? 'bg-[#10B981]' : 'bg-[#94A3B8]'
                    }`}
                  ></span>
                  <span className={isOn ? 'text-[#10B981] font-medium' : 'text-[#64748B]'}>
                    {isOn ? 'Đang bật' : 'Đang tắt'}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Refined Switch (Pill shape, ON = #10B981, OFF = #CBD5E1) */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium font-mono ${isOn ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
            {isOn ? 'ON' : 'OFF'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isOn}
            disabled={isPending}
            onClick={handleToggle}
            className={`relative inline-flex h-[22px] w-[40px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out focus:outline-none ${
              isPending
                ? 'opacity-50 cursor-not-allowed bg-[#F59E0B]'
                : isOn
                ? 'bg-[#10B981]'
                : 'bg-[#CBD5E1] hover:bg-[#94A3B8]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-[#FFFFFF] shadow-xs transition duration-150 ease-in-out mt-[2px] ml-[2px] flex items-center justify-center ${
                isOn ? 'translate-x-[18px]' : 'translate-x-0'
              }`}
            >
              {isPending ? (
                <Loader2 className="w-2.5 h-2.5 text-[#F59E0B] animate-spin" />
              ) : null}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
