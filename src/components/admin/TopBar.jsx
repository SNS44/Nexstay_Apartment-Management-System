import { motion } from 'motion/react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

const viewTitles = {
    dashboard: 'Dashboard Overview',
    rooms: 'Rooms Management',
    floors: 'Floors Overview',
    bookings: 'Bookings Management',
    residents: 'Users Management',
    services: 'Services & Requests',
    activity: 'Activity & Logs',
    settings: 'System Settings',
};

export function TopBar({ currentView, user }) {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-20 bg-white/70 backdrop-blur-2xl border-b border-violet-100 flex items-center justify-between px-8 sticky top-0 z-40"
        >
            <div>
                <motion.h2
                    key={currentView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold text-violet-950"
                >
                    {viewTitles[currentView]}
                </motion.h2>
                <p className="text-violet-500 text-xs font-medium mt-0.5">Manage your apartment building</p>
            </div>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 group-focus-within:text-violet-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2.5 bg-violet-50/50 border border-violet-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all w-64 text-violet-900 placeholder:text-violet-400"
                    />
                </div>

                <div className="h-8 w-[1px] bg-violet-200" />

                {/* Notifications */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2.5 hover:bg-violet-50 rounded-xl transition-colors"
                >
                    <Bell className="w-5 h-5 text-violet-600" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </motion.button>

                {/* Admin Profile */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-violet-50 transition-colors border border-transparent hover:border-violet-100"
                >
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="text-left hidden md:block">
                        <div className="text-sm font-semibold text-violet-900">{user?.name || 'Admin User'}</div>
                        <div className="text-violet-500 text-[10px] uppercase tracking-wider font-medium">{user?.role || 'Owner'}</div>
                    </div>

                </motion.button>
            </div>
        </motion.header>
    );
}
