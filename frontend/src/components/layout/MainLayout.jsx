// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const routeMeta = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Giám sát thông số môi trường và trạng thái thiết bị'
  },
  '/data-sensors': {
    title: 'Data Sensors',
    subtitle: 'Tra cứu dữ liệu cảm biến đã được lưu trữ trong Database'
  },
  '/action-history': {
    title: 'Action History',
    subtitle: 'Lịch sử điều khiển thiết bị qua ESP8266 & MQTT Broker'
  },
  '/profile': {
    title: 'Profile',
    subtitle: 'Thông tin cá nhân và tài nguyên dự án'
  }
};

export default function MainLayout({ onGlobalRefresh, isRefreshing }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentMeta = routeMeta[location.pathname] || {
    title: 'Smart Home IoT',
    subtitle: 'Hệ thống giám sát và điều khiển'
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefresh={onGlobalRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-6 overflow-y-auto lg:overflow-hidden min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
