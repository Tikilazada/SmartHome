// src/components/common/StatusBadge.jsx
import React from 'react';

export default function StatusBadge({ status, text }) {
  const normalized = (status || '').toUpperCase();

  if (normalized === 'ON') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#059669] border border-[#10B981]/25">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
        <span>{text || 'ON'}</span>
      </span>
    );
  }

  if (normalized === 'LOADING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/25">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
        <span>{text || 'LOADING'}</span>
      </span>
    );
  }

  if (normalized === 'OFF') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
        <span>{text || 'OFF'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
      <span>{text || status}</span>
    </span>
  );
}

