// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  History,
  User,
  LogOut,
  Cpu,
  X
} from 'lucide-react';
import { userProfileData } from '../../data/mockData';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Data Sensors', path: '/data-sensors', icon: Activity },
  { name: 'Action History', path: '/action-history', icon: History },
  { name: 'Profile', path: '/profile', icon: User }
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F172A] border-r border-[#1E293B] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header Logo (H1 24px / 600) */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-[#FFFFFF] shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#FFFFFF] leading-none">Smart Home</h1>
                <span className="text-[11px] font-normal text-[#94A3B8] tracking-wider uppercase">IoT Monitor</span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#FFFFFF] lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links (Navigation: 14px / 500) */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-normal text-[#64748B] uppercase tracking-wider">
              Hệ thống
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#2563EB] text-[#FFFFFF]'
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-[#FFFFFF]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-[#FFFFFF]' : 'text-[#94A3B8] group-hover:text-[#CBD5E1]'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Card */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0F172A]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1E293B] border border-[#334155] shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative flex-shrink-0">
                <img
                  src={userProfileData.avatarUrl}
                  alt={userProfileData.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-[#334155]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-[#1E293B]"></span>
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-[#FFFFFF] truncate">{userProfileData.fullName}</h4>
                <p className="text-[11px] text-[#10B981] font-normal flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Online
                </p>
              </div>
            </div>
            <button
              title="Đăng xuất"
              onClick={() => alert('Chức năng Đăng xuất mô phỏng trong đồ án.')}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
