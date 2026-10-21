// src/components/common/ErrorState.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Lỗi kết nối',
  message = 'Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại.',
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-rose-50/50 rounded-xl border border-rose-200">
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900 mb-1">{title}</h3>
      <p className="text-xs text-rose-600 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Thử lại
        </button>
      )}
    </div>
  );
}
