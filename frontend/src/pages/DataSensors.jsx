// src/pages/DataSensors.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getSensorTableData } from "../services/api";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

export default function DataSensors() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Form draft state: tiêu chí tìm kiếm và từ khóa
  const [draftCriteria, setDraftCriteria] = useState("ALL");
  const [draftKeyword, setDraftKeyword] = useState("");

  // 2. Applied state: lưu điều kiện đã áp dụng khi nhấn nút "Tìm kiếm"
  const [appliedFilters, setAppliedFilters] = useState({
    criteria: "ALL",
    search: "",
  });

  // 3. Phân trang: số bản ghi mỗi trang (cho phép người dùng tùy chọn) & trang hiện tại
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // Hàm thực thi truy vấn tìm kiếm/lọc
  const executeQuery = useCallback(async (filtersToApply) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSensorTableData(filtersToApply);
      setData(result);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách dữ liệu cảm biến từ Database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chỉ nạp dữ liệu ban đầu duy nhất 1 lần khi trang được mở
  useEffect(() => {
    executeQuery({ criteria: "ALL", search: "" });
  }, [executeQuery]);

  // Chỉ khi người dùng nhấn "Tìm kiếm" (hoặc submit form) mới kích hoạt tìm kiếm
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const newFilters = {
      criteria: draftCriteria,
      search: draftKeyword.trim(),
    };
    setAppliedFilters(newFilters);
    executeQuery(newFilters);
  };

  // Nút Reset: đặt lại toàn bộ draft & applied state và hiển thị lại toàn bộ dữ liệu
  const handleReset = () => {
    setDraftCriteria("ALL");
    setDraftKeyword("");
    const resetFilters = {
      criteria: "ALL",
      search: "",
    };
    setAppliedFilters(resetFilters);
    executeQuery(resetFilters);
  };

  // Tính toán phân trang linh hoạt theo pageSize
  const totalRecords = data.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const startRecord =
    totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col h-full gap-3.5 max-w-[1600px] mx-auto min-h-0">
      {/* Filter Card (Compact & Clean) */}
      <div className="flex-shrink-0 bg-[#FFFFFF] rounded-xl p-3.5 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-md bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/20">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-semibold text-[#0F172A] leading-tight">
            Bộ lọc tra cứu dữ liệu cảm biến
          </h3>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          {/* 1. Tiêu chí tìm kiếm (Dropdown) */}
          <div className="md:col-span-4 lg:col-span-4">
            <label className="block text-xs font-medium text-[#64748B] mb-1">
              Tìm kiếm theo
            </label>
            <select
              value={draftCriteria}
              onChange={(e) => setDraftCriteria(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs font-normal text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả thông tin</option>
              <option value="TEMPERATURE">Nhiệt độ</option>
              <option value="HUMIDITY">Độ ẩm</option>
              <option value="LIGHT">Ánh sáng</option>
              <option value="TIME">Thời gian</option>
            </select>
          </div>

          {/* 2. Từ khóa tìm kiếm (Text Input) */}
          <div className="md:col-span-5 lg:col-span-5">
            <label className="block text-xs font-medium text-[#64748B] mb-1">
              Từ khóa tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={
                  draftCriteria === "TEMPERATURE"
                    ? "Nhập giá trị nhiệt độ (VD: 28, 28.5)..."
                    : draftCriteria === "HUMIDITY"
                    ? "Nhập giá trị độ ẩm (VD: 72, 74)..."
                    : draftCriteria === "LIGHT"
                    ? "Nhập giá trị ánh sáng (VD: 350, 340)..."
                    : draftCriteria === "TIME"
                    ? "Nhập ngày, giờ (VD: 2026/09/09, 10:25)..."
                    : "Nhập giá trị nhiệt độ, độ ẩm, ánh sáng hoặc thời gian..."
                }
                value={draftKeyword}
                onChange={(e) => setDraftKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs font-normal text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Action Buttons: Tìm kiếm & Reset */}
          <div className="md:col-span-3 lg:col-span-3 flex items-center gap-2">
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
        {/* Table Header / Toolbar */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h4 className="text-sm font-semibold text-[#0F172A]">
              Dữ liệu quan trắc môi trường
            </h4>
            <span className="text-[11px] font-medium text-[#64748B] bg-[#F8FAFC] px-2.5 py-0.5 rounded-full border border-[#E2E8F0]">
              {totalRecords} bản ghi
            </span>
          </div>
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Loading message="Đang truy vấn Database..." />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
            <ErrorState
              message={error}
              onRetry={() => executeQuery(appliedFilters)}
            />
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
            <EmptyState
              title="Không tìm thấy dữ liệu phù hợp."
              message="Không có bản ghi nào khớp với điều kiện lọc. Hãy thử thay đổi bộ lọc hoặc từ khóa."
              onReset={handleReset}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Vùng bảng có cuộn dọc và ghim header */}
            <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
              <table className="w-full text-left text-xs table-fixed">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold text-[12px] uppercase tracking-wider shadow-xs">
                  <tr className="h-[42px]">
                    <th className="py-2.5 px-5 w-[12%] bg-[#F8FAFC]">ID</th>
                    <th className="py-2.5 px-5 w-[22%] bg-[#F8FAFC]">MÃ CẢM BIẾN</th>
                    <th className="py-2.5 px-5 w-[22%] bg-[#F8FAFC]">LOẠI CẢM BIẾN</th>
                    <th className="py-2.5 px-5 w-[20%] bg-[#F8FAFC]">GIÁ TRỊ ĐO</th>
                    <th className="py-2.5 px-5 w-[24%] bg-[#F8FAFC]">THỜI GIAN GHI NHẬN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                  {paginatedData.map((row) => (
                    <tr
                      key={row.id}
                      className="h-[52px] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-2.5 px-5 font-mono font-medium text-[#64748B] whitespace-nowrap">
                        #{row.id}
                      </td>
                      <td className="py-2.5 px-5 text-[13px] font-semibold text-[#0F172A] whitespace-nowrap">
                        {row.sensorId}
                      </td>
                      <td className="py-2.5 px-5 font-medium whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            row.sensorName.includes("Nhiệt độ")
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : row.sensorName.includes("Độ ẩm")
                                ? "bg-sky-50 text-sky-700 border border-sky-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {row.sensorName}
                        </span>
                      </td>
                      <td className="py-2.5 px-5 font-semibold text-[#0F172A] text-xs whitespace-nowrap">
                        {row.value} {row.unit || ""}
                      </td>
                      <td className="py-2.5 px-5 font-mono text-[#64748B] text-xs whitespace-nowrap">
                        {row.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls luôn luôn được ghim ở đáy thẻ bảng */}
            <div className="flex-shrink-0 px-5 py-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] bg-[#FFFFFF]">
              <div className="flex items-center gap-3">
                <div>
                  Hiển thị{" "}
                  <span className="font-semibold text-[#0F172A]">
                    {startRecord}–{endRecord}
                  </span>{" "}
                  trong{" "}
                  <span className="font-semibold text-[#0F172A]">
                    {totalRecords}
                  </span>{" "}
                  bản ghi
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
                          <span
                            key={item}
                            className="px-1 text-[#94A3B8] font-medium"
                          >
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
                              ? "bg-[#2563EB] text-[#FFFFFF] shadow-xs"
                              : "text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
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
