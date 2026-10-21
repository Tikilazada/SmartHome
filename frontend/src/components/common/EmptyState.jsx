// src/components/common/EmptyState.jsx
import React from 'react';
import { Database } from 'lucide-react';

export default function EmptyState({
  title = 'Không có dữ liệu',
  message = 'Không tìm thấy dữ liệu phù hợp với điều kiện tìm kiếm.',
  onReset
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-xl border border-slate-200">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Database className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-xs font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors border border-sky-200"
        >
          Đặt lại bộ lọc
        </button>
      )}
    </div>
  );
}
