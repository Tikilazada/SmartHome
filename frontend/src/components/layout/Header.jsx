// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Menu, Clock, RefreshCw } from 'lucide-react';
import { userProfileData } from '../../data/mockData';

export default function Header({ title, subtitle, onOpenSidebar, onRefresh, isRefreshing }) {
  // Format time without seconds (e.g. "09:56 AM" or "09:56")
  const formatCompactTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [currentTime, setCurrentTime] = useState(formatCompactTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatCompactTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger & Page Title (24px, 600) + Subtitle (13-14px, #64748B) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F8FAFC] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-[20px] lg:text-[24px] font-semibold text-[#0F172A] leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-[13px] font-normal text-[#64748B] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Balanced & Clean Status Area */}
      <div className="flex items-center gap-3">
        {/* Refresh Action Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu"
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0EA5E9]' : ''}`} />
          </button>
        )}

        {/* 1. Primary Highlight: System Online Badge (#ECFDF5, text #059669, border #A7F3D0) */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
          </span>
          <span>System Online</span>
        </div>

        {/* 2. Clock: Reduced visual weight without seconds */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-normal text-[#64748B] bg-[#F8FAFC] px-2.5 py-1 rounded-lg border border-[#E2E8F0] font-mono">
          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>{currentTime}</span>
        </div>

        {/* 3. User Avatar */}
        <div className="flex items-center">
          <img
            src={userProfileData.avatarUrl}
            alt={userProfileData.fullName}
            className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
          />
        </div>
      </div>
    </header>
  );
}
