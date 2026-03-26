import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardOverview } from './DashboardOverview';
import { RoomsManagement } from './RoomsManagement';
import { BookingsManagement } from './BookingsManagement';
import { UsersManagement } from './UsersManagement';
import { ServicesRequests } from './ServicesRequests';
import { FloorsOverview } from './FloorsOverview';
import { ActivityLogs } from './ActivityLogs';
import { Settings } from './Settings';

export default function AdminPanel({ onLogout, user }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Determine current view based on path (e.g. /admin/rooms -> 'rooms')
    const currentPath = location.pathname.split('/admin/')[1] || 'dashboard';

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-100 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                currentView={currentPath}
                onNavigate={(viewId) => navigate(viewId === 'dashboard' ? '/admin' : `/admin/${viewId}`)}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onLogout={onLogout}
            />

            {/* Main Content */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                <TopBar currentView={currentPath} user={user} />

                <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto w-full">
                        <Routes>
                            <Route path="/" element={<DashboardOverview />} />
                            <Route path="dashboard" element={<DashboardOverview />} />
                            <Route path="rooms" element={<RoomsManagement />} />
                            <Route path="bookings" element={<BookingsManagement />} />
                            <Route path="residents" element={<UsersManagement />} />
                            <Route path="services" element={<ServicesRequests />} />
                            <Route path="floors" element={<FloorsOverview />} />
                            <Route path="activity" element={<ActivityLogs />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/admin" replace />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
}
