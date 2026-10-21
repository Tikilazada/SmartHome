// src/pages/Profile.jsx
import React from "react";
import { ExternalLink } from "lucide-react";

// ============================================================
// CẤU HÌNH LIÊN KẾT TÀI NGUYÊN DỰ ÁN
// ============================================================
const projectLinks = {
  github: "https://github.com",
  figma:
    "https://www.figma.com/design/dR9ppoYJqGskdrMke9fSJl/SmartHome?node-id=0-1&t=HEYNDvpsy93xkvXB-1",
  postman: "https://postman.com",
  pdf: "https://example.com/document.pdf",
};

// SVG Icon chính xác cho GitHub
function GithubIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

// SVG Icon nhận diện cho Figma
function FigmaIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 24C9.20914 24 11 22.2091 11 20V16H7C4.79086 16 3 17.7909 3 20C3 22.2091 4.79086 24 7 24Z"
        fill="#0ACF83"
      />
      <path
        d="M3 12C3 9.79086 4.79086 8 7 8H11V16H7C4.79086 16 3 14.2091 3 12Z"
        fill="#A259FF"
      />
      <path
        d="M3 4C3 1.79086 4.79086 0 7 0H11V8H7C4.79086 8 3 6.20914 3 4Z"
        fill="#F24E1E"
      />
      <path
        d="M11 0H15C17.2091 0 19 1.79086 19 4C19 6.20914 17.2091 8 15 8H11V0Z"
        fill="#FF7262"
      />
      <path
        d="M19 12C19 14.2091 17.2091 16 15 16C12.7909 16 11 14.2091 11 12C11 9.79086 12.7909 8 15 8C17.2091 8 19 9.79086 19 12Z"
        fill="#1ABCFE"
      />
    </svg>
  );
}

// SVG Icon nhận diện cho Postman
function PostmanIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.001 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12.001 12C18.627 24 24 18.627 24 12c0-6.627-5.373-12-11.999-12zm6.275 7.424l-3.321 3.321 1.414 1.414 3.321-3.321a.999.999 0 0 0 0-1.414 1 1 0 0 0-1.414 0zm-7.662 7.662l3.321-3.321-1.414-1.414-3.321 3.321a1 1 0 0 0 0 1.414 1 1 0 0 0 1.414 0zm1.754-6.848l-1.414 1.414 6.945 6.945 1.414-1.414-6.945-6.945z" />
    </svg>
  );
}

// SVG Icon chuẩn tài liệu PDF
function PdfIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 2H5C3.9 2 3 2.9 3 4v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9.5 8.5H8v1.5h1.5c.55 0 1-.45 1-1s-.45-.5-1-.5zm4.5 3h-1.5v-4H14c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5zm-4.5-5H8v1.5h1.5c.55 0 1-.45 1-1s-.45-.5-1-.5zm8.5 2h-2V11h2V9.5h-3.5v5H18V12zM6 6.5h3.5c1.38 0 2.5 1.12 2.5 2.5 0 .84-.42 1.58-1.06 2.03.64.44 1.06 1.18 1.06 1.97 0 1.38-1.12 2.5-2.5 2.5H6V6.5zm6.5 0H14c1.66 0 3 1.34 3 3v2c0 1.66-1.34 3-3 3h-1.5V6.5z" />
    </svg>
  );
}

const resources = [
  {
    id: "github",
    title: "GitHub Repository",
    description: "Mã nguồn của dự án",
    buttonText: "Mở GitHub",
    url: projectLinks.github,
    icon: GithubIcon,
    iconBoxStyle: "bg-slate-100 text-slate-800 border-slate-200/80",
    iconColor: "w-6 h-6 text-slate-800",
  },
  {
    id: "figma",
    title: "Figma Design",
    description: "Thiết kế giao diện và prototype",
    buttonText: "Mở Figma",
    url: projectLinks.figma,
    icon: FigmaIcon,
    iconBoxStyle: "bg-violet-50/80 text-violet-600 border-violet-100",
    iconColor: "w-5 h-5",
  },
  {
    id: "postman",
    title: "Postman / API",
    description: "API Collection và tài liệu kiểm thử",
    buttonText: "Mở Postman",
    url: projectLinks.postman,
    icon: PostmanIcon,
    iconBoxStyle: "bg-orange-50/80 text-orange-600 border-orange-100",
    iconColor: "w-6 h-6 text-orange-600",
  },
  {
    id: "pdf",
    title: "Tài liệu PDF",
    description: "Tài liệu và báo cáo dự án",
    buttonText: "Xem tài liệu",
    url: projectLinks.pdf,
    icon: PdfIcon,
    iconBoxStyle: "bg-rose-50/80 text-rose-600 border-rose-100",
    iconColor: "w-6 h-6 text-rose-600",
  },
];

export default function Profile() {
  return (
    <div className="max-w-[960px] mx-auto flex flex-col justify-center h-full py-2 space-y-6">
      {/* ============================================================ */}
      {/* 1. CARD THÔNG TIN CÁ NHÂN */}
      {/* ============================================================ */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 lg:p-7 border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 lg:gap-8">
          {/* Avatar dạng tròn với chấm xanh Online ở góc dưới */}
          <div className="relative flex-shrink-0">
            <img
              src="/avatar.jpg"
              alt="Nguyễn Việt Hà"
              className="w-32 h-32 lg:w-36 lg:h-36 rounded-full object-cover object-[58%_20%] border-2 border-slate-100 shadow-xs"
            />
            {/* Chấm xanh nhỏ Online */}
            <span
              className="absolute bottom-1.5 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-500/20 shadow-xs"
              title="Online"
            />
          </div>

          {/* Chi tiết thông tin cá nhân */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-[28px] lg:text-[32px] font-bold text-[#0F172A] tracking-tight leading-tight">
              Nguyễn Việt Hà
            </h2>

            <p className="text-[16px] font-medium text-[#64748B] mt-1.5">
              Sinh viên ngành An toàn thông tin
            </p>

            <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-sm font-medium text-[#475569]">
                Mã sinh viên:
              </span>
              <span className="text-sm font-bold font-mono text-[#0EA5E9] tracking-wider">
                B23DACT085
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TÀI NGUYÊN DỰ ÁN (BỐ CỤC 2x2) */}
      {/* ============================================================ */}
      <div className="space-y-3.5">
        {/* Section title & subtitle */}
        <div>
          <h3 className="text-[18px] lg:text-[20px] font-bold text-[#0F172A] tracking-tight">
            Tài nguyên dự án
          </h3>
          <p className="text-[14px] text-[#64748B] mt-0.5 font-normal">
            Liên kết và tài liệu của đồ án
          </p>
        </div>

        {/* Grid 2x2 Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-xs p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#0EA5E9]/50 flex items-center justify-between gap-4 group"
              >
                {/* Khối bên trái: Icon + Title & Description */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Icon trong ô vuông bo góc 48-52px */}
                  <div
                    className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center border flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${item.iconBoxStyle}`}
                  >
                    <Icon className={item.iconColor} />
                  </div>

                  {/* Ở giữa: Tên & mô tả */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-semibold text-[#0F172A] leading-snug group-hover:text-[#0EA5E9] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[13px] text-[#64748B] mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Khối bên phải: Button mở resource */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0EA5E9] bg-[#0EA5E9]/10 hover:bg-[#0EA5E9] hover:text-white rounded-lg border border-[#0EA5E9]/20 transition-all duration-150 shrink-0 group-hover:bg-[#0EA5E9] group-hover:text-white shadow-2xs"
                >
                  <span>{item.buttonText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
