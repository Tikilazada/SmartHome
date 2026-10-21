// src/components/common/Loading.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Đang tải dữ liệu...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className="w-8 h-8 text-sky-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
