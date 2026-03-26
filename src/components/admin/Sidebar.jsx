import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Building2, Bed, Calendar, Users, Wrench, Activity, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms Management', icon: Bed },
    { id: 'bookings', label: 'Bookings Management', icon: Calendar },
    { id: 'residents', label: 'Users Management', icon: Users },
    { id: 'services', label: 'Services & Requests', icon: Wrench },
    { id: 'floors', label: 'Floors Overview', icon: Building2 },
    { id: 'activity', label: 'Activity & Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentView, onNavigate, collapsed, onToggleCollapse, onLogout }) {
    return (
        <motion.aside
            initial={{ width: 256 }}
            animate={{ width: collapsed ? 80 : 256 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed left-0 top-0 h-screen bg-white/70 backdrop-blur-2xl border-r border-violet-200/50 shadow-2xl z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="h-20 border-b border-violet-100 flex items-center justify-between px-6">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">NexStay</h1>
                            <p className="text-violet-400 text-xs font-medium tracking-wider">ADMIN PANEL</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onToggleCollapse}
                    className="p-2 rounded-lg transition-colors flex items-center justify-center"
                >
                    {collapsed ? <ChevronRight className="w-5 h-5 text-violet-600" /> : <ChevronLeft className="w-5 h-5 text-violet-600" />}
                </motion.button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            whileHover={{ scale: 1.02, x: collapsed ? 0 : 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative group overflow-hidden ${isActive
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                                : 'text-violet-600 hover:bg-violet-50'
                                } ${collapsed ? 'justify-center' : ''}`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'text-white' : 'group-hover:text-violet-700'}`} />

                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="text-sm font-medium relative z-10 whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-8 left-0 right-0 px-4">
                <motion.button
                    onClick={onLogout}
                    whileHover={{ scale: 1.02, backgroundColor: '#FEE2E2', color: '#DC2626' }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-50 text-red-500 transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-sm font-medium whitespace-nowrap"
                            >
                                Logout Account
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.aside>
    );
}
