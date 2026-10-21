// src/components/dashboard/RecentActivity.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowRight, Lightbulb } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function RecentActivity({ activities }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Nhật ký thao tác gần đây</h3>
          </div>
        </div>

        <Link
          to="/action-history"
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {!activities || activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Chưa có thao tác điều khiển nào gần đây.
          </div>
        ) : (
          activities.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {item.deviceName}
                    <span className="text-[10px] font-normal text-slate-400">({item.location})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Lệnh: <strong className="font-semibold text-slate-700">{item.action === 'ON' ? 'BẬT' : 'TẮT'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-right">
                <StatusBadge status={item.status} />
                <span className="text-[11px] font-mono text-slate-400">{item.timeSent}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
