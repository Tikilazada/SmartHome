// src/pages/ActionHistory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActionHistory } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

export default function ActionHistory() {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Form draft state: chỉ lưu giá trị người dùng đang chọn/nhập (KHÔNG gọi API hay lọc bảng)
  const [draftDevice, setDraftDevice] = useState('ALL');
  const [draftAction, setDraftAction] = useState('ALL');
  const [draftStatus, setDraftStatus] = useState('ALL');
  const [draftKeyword, setDraftKeyword] = useState('');

  // 2. Applied state: lưu điều kiện tìm kiếm thực sự đang được áp dụng
  const [appliedFilters, setAppliedFilters] = useState({
    deviceId: 'ALL',
    action: 'ALL',
    status: 'ALL',
    search: ''
  });

  // 3. Phân trang: số bản ghi mỗi trang và trang hiện tại
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // Hàm thực thi truy vấn tìm kiếm/lọc
  const executeQuery = useCallback(async (filtersToApply) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getActionHistory(filtersToApply);
      setHistoryList(result);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError('Không thể tải lịch sử điều khiển từ Database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chỉ nạp dữ liệu ban đầu duy nhất 1 lần khi trang được mở
  useEffect(() => {
    executeQuery({ deviceId: 'ALL', action: 'ALL', status: 'ALL', search: '' });
  }, [executeQuery]);

  // Chỉ khi người dùng nhấn "Tìm kiếm" (hoặc submit form) mới kích hoạt tìm kiếm
  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    const newFilters = {
      deviceId: draftDevice,
      action: draftAction,
      status: draftStatus,
      search: draftKeyword.trim()
    };
    setAppliedFilters(newFilters);
    executeQuery(newFilters);
  };

  // Nút Reset: đặt lại toàn bộ draft & applied state và nạp lại toàn bộ dữ liệu ban đầu
  const handleReset = () => {
    setDraftDevice('ALL');
    setDraftAction('ALL');
    setDraftStatus('ALL');
    setDraftKeyword('');
    const resetFilters = {
      deviceId: 'ALL',
      action: 'ALL',
      status: 'ALL',
      search: ''
    };
    setAppliedFilters(resetFilters);
    executeQuery(resetFilters);
  };

  // Pagination calculations theo pageSize
  const totalActions = historyList.length;
  const totalPages = Math.ceil(totalActions / pageSize) || 1;
  const paginatedList = historyList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const startRecord = totalActions === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalActions);

  // Helper to ensure strict YYYY/MM/DD HH:mm:ss format
  const formatDateTime = (val, dateFallback = '2026/10/07') => {
    if (!val || val === '-' || val === '—') return '—';
    const str = String(val).trim();
    if (/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) return str;
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) {
      const formattedDate = dateFallback.replace(/-/g, '/');
      return `${formattedDate} ${str}`;
    }
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
      return str;
    }
  };

  // Helper to guarantee status is strictly ON, OFF, or LOADING
  const resolveStatus = (row) => {
    const rawStatus = (row.status || '').toUpperCase();
    const actionVal = (row.action || '').toUpperCase();
    if (rawStatus === 'ON') return 'ON';
    if (rawStatus === 'OFF') return 'OFF';
    if (rawStatus === 'LOADING' || rawStatus === 'PENDING') return 'LOADING';
    if (rawStatus === 'SUCCESS') return actionVal === 'OFF' ? 'OFF' : 'ON';
    if (rawStatus === 'FAILED' || rawStatus === 'ERROR') return 'LOADING';
    return actionVal || 'ON';
  };

  return (
    <div className="flex flex-col h-full gap-3.5 max-w-[1600px] mx-auto min-h-0">
      {/* Filter Card (Clean, horizontal compact layout) */}
      <div className="flex-shrink-0 bg-[#FFFFFF] rounded-xl p-3.5 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-md bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/20">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-semibold text-[#0F172A] leading-tight">
            Bộ lọc lịch sử thao tác
          </h3>
        </div>

        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* 1. THIẾT BỊ (approx 25%) */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-[#64748B] mb-1">THIẾT BỊ</label>
            <select
              value={draftDevice}
              onChange={(e) => setDraftDevice(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs font-normal text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả thiết bị</option>
              <option value="1">Đèn 1</option>
              <option value="2">Đèn 2</option>
              <option value="3">Đèn 3</option>
            </select>
          </div>

          {/* 2. ACTION (approx 16.6%) */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-[#64748B] mb-1">ACTION</label>
            <select
              value={draftAction}
              onChange={(e) => setDraftAction(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs font-normal text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả</option>
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
            </select>
          </div>

          {/* 3. STATUS (approx 16.6%) */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-[#64748B] mb-1">STATUS</label>
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs font-normal text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả</option>
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
              <option value="LOADING">LOADING</option>
            </select>
          </div>

          {/* 4. Từ khóa tìm kiếm (approx 25%) */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-[#64748B] mb-1">Từ khóa tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập ID, thiết bị, action, status hoặc thời gian..."
                value={draftKeyword}
                onChange={(e) => setDraftKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs font-normal text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Action Buttons (approx 16.6%) */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#FFFFFF] text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tìm kiếm</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Đặt lại bộ lọc"
              className="px-2.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] text-xs font-medium rounded-lg border border-[#E2E8F0] transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Main Table Card (Flex-1 with auto scroll table area and pinned pagination footer) */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="flex-shrink-0 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h4 className="text-sm font-semibold text-[#0F172A]">Lịch sử điều khiển thiết bị</h4>
            <span className="text-[11px] font-medium text-[#64748B] bg-[#F8FAFC] px-2.5 py-0.5 rounded-full border border-[#E2E8F0]">
              {totalActions} bản ghi
            </span>
          </div>
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Loading message="Đang tải nhật ký điều khiển..." />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
            <ErrorState message={error} onRetry={() => executeQuery(appliedFilters)} />
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
            <EmptyState
              title="Không tìm thấy dữ liệu phù hợp."
              message="Không có bản ghi nào khớp với điều kiện lọc hiện tại."
              onReset={handleReset}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Vùng bảng có cuộn dọc và ghim header */}
            <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
              <table className="w-full text-left text-xs table-fixed">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold text-[12px] uppercase tracking-wider shadow-xs">
                  <tr className="h-[44px]">
                    <th className="py-3 px-5 whitespace-nowrap w-[10%] bg-[#F8FAFC]">ID</th>
                    <th className="py-3 px-5 whitespace-nowrap w-[18%] bg-[#F8FAFC]">THIẾT BỊ</th>
                    <th className="py-3 px-5 whitespace-nowrap w-[14%] bg-[#F8FAFC]">ACTION</th>
                    <th className="py-3 px-5 whitespace-nowrap w-[16%] bg-[#F8FAFC]">STATUS</th>
                    <th className="py-3 px-5 whitespace-nowrap w-[21%] bg-[#F8FAFC]">THỜI GIAN BẬT</th>
                    <th className="py-3 px-5 whitespace-nowrap w-[21%] bg-[#F8FAFC]">THỜI GIAN PHẢN HỒI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                  {paginatedList.map((row) => {
                    const rowId = row.id || row.action_id;
                    const deviceName = row.deviceName || row.device_name;
                    const actionVal = row.action;
                    const statusVal = resolveStatus(row);
                    const dateVal = row.date ? String(row.date).replace(/-/g, '/') : '2026/10/07';
                    const timeSentFormatted = formatDateTime(row.timeSent || row.time_sent, dateVal);
                    const timeResponseFormatted = formatDateTime(row.timeResponse || row.response_time, dateVal);

                    return (
                      <tr key={rowId} className="h-[54px] hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-5 font-mono text-[13px] font-normal text-[#64748B] whitespace-nowrap">#{rowId}</td>
                        <td className="py-3 px-5 text-[14px] font-semibold text-[#0F172A] whitespace-nowrap">
                          {deviceName}
                        </td>
                        {/* ACTION: Clean subtle badge representing user's command */}
                        <td className="py-3 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-[13px] font-medium tracking-wide ${
                              actionVal === 'ON'
                                ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/25'
                                : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                            }`}
                          >
                            {actionVal}
                          </span>
                        </td>
                        {/* STATUS: Distinct device status badge (ON / LOADING / OFF) */}
                        <td className="py-3 px-5 whitespace-nowrap">
                          <StatusBadge status={statusVal} />
                        </td>
                        {/* Datetime: Strict single-line YYYY/MM/DD HH:mm:ss */}
                        <td className="py-3 px-5 font-mono text-[13px] font-normal text-[#64748B] whitespace-nowrap">
                          {timeSentFormatted}
                        </td>
                        <td className="py-3 px-5 font-mono text-[13px] font-normal text-[#64748B] whitespace-nowrap">
                          {timeResponseFormatted}
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>

            {/* Pagination Controls luôn luôn được ghim ở đáy thẻ bảng */}
            <div className="flex-shrink-0 px-5 py-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] bg-[#FFFFFF]">
              <div className="flex items-center gap-3">
                <div>
                  Hiển thị <span className="font-semibold text-[#0F172A]">{startRecord}–{endRecord}</span> trong <span className="font-semibold text-[#0F172A]">{totalActions}</span> bản ghi
                </div>

                {/* Chọn số bản ghi mỗi trang */}
                <div className="flex items-center gap-1.5 ml-2 border-l border-[#E2E8F0] pl-3">
                  <span className="text-[#64748B]">Mỗi trang:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-md text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] cursor-pointer"
                  >
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={60}>60</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Render danh sách trang có giới hạn để không tràn nếu có nhiều trang */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .reduce((acc, page, idx, arr) => {
                      if (idx > 0 && page - arr[idx - 1] > 1) {
                        acc.push("ellipsis-" + page);
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item) => {
                      if (typeof item === "string") {
                        return (
                          <span key={item} className="px-1 text-[#94A3B8] font-medium">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                            currentPage === item
                              ? 'bg-[#2563EB] text-[#FFFFFF] shadow-xs'
                              : 'text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Trang tiếp"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


