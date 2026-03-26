import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Building2, Bed, Users, Calendar, Wrench, DoorOpen, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function DashboardOverview() {
    const { rooms, residents, usersList, bookings, requests, activities } = useData();
    const navigate = useNavigate();

    const totalRooms = (rooms || []).length;
    const occupiedRooms = (rooms || []).filter(r => r.status?.toLowerCase() === 'occupied').length;
    const availableRooms = (rooms || []).filter(r => r.status?.toLowerCase() === 'available').length;
    const totalUsers = (usersList || []).length;
    const pendingBookings = (bookings || []).filter(b => b.status?.toLowerCase() === 'pending').length;
    const openServiceRequests = (requests || []).filter(s => s.status?.toLowerCase() === 'requested' || s.status?.toLowerCase() === 'pending').length;

    const stats = [
        {
            title: 'Total Floors',
            value: '5',
            icon: Building2,
            color: 'from-violet-500 to-purple-600',
            trend: null,
        },
        {
            title: 'Total Rooms',
            value: totalRooms.toString(),
            icon: Bed,
            color: 'from-blue-500 to-cyan-600',
            trend: null,
        },
        {
            title: 'Occupied Rooms',
            value: occupiedRooms.toString(),
            subtitle: `${totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(0) : 0}% occupancy`,
            icon: DoorOpen,
            color: 'from-green-500 to-emerald-600',
            trend: 'up',
        },
        {
            title: 'Available Rooms',
            value: availableRooms.toString(),
            subtitle: 'Ready for booking',
            icon: Bed,
            color: 'from-teal-500 to-cyan-600',
            trend: null,
        },
        {
            title: 'Total Users',
            value: totalUsers.toString(),
            subtitle: 'Registered accounts',
            icon: Users,
            color: 'from-indigo-500 to-purple-600',
            trend: totalUsers > 0 ? 'up' : null,
        },
        {
            title: 'Pending Bookings',
            value: pendingBookings.toString(),
            subtitle: 'Awaiting approval',
            icon: Calendar,
            color: 'from-orange-500 to-amber-600',
            trend: pendingBookings > 0 ? 'down' : null,
        },
        {
            title: 'Open Service Requests',
            value: openServiceRequests.toString(),
            subtitle: 'Require attention',
            icon: Wrench,
            color: 'from-pink-500 to-rose-600',
            trend: openServiceRequests > 2 ? 'down' : 'up',
        },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={item} className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h2 className="text-3xl font-bold text-violet-950 relative z-10">Dashboard Overview</h2>
                <p className="text-violet-600 mt-2 text-lg relative z-10">Welcome back, Admin. Here's what's happening today.</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            variants={item}
                            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                            className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-violet-600 font-medium mb-1">{stat.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-bold text-violet-950">{stat.value}</h3>
                                        {stat.trend && (
                                            <span className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                                                {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 ml-1" /> : <TrendingDown className="w-4 h-4 ml-1" />}
                                            </span>
                                        )}
                                    </div>
                                    {stat.subtitle && (
                                        <p className="text-violet-500 text-sm mt-2">{stat.subtitle}</p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-violet-500/20`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Floor Summary */}
            <motion.div variants={item} className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                <h3 className="text-xl font-bold text-violet-950 mb-6">Floor Status Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((floor) => {
                        const floorRooms = (rooms || []).filter(r => (r.floor_number || r.floor || r.floor_id) == floor);
                        const occupied = floorRooms.filter(r => r.status?.toLowerCase() === 'occupied').length;
                        const available = floorRooms.filter(r => r.status?.toLowerCase() === 'available').length;
                        const floorName = floor === 1 ? 'Ground' : ['First', 'Second', 'Third', 'Fourth'][floor - 1];
                        const occupancyRate = (occupied / 3) * 100;

                        return (
                            <motion.div
                                key={floor}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/70 rounded-2xl p-5 border border-white/60 shadow-md hover:shadow-lg transition-all"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-violet-900">{floorName} Floor</span>
                                    <span className="text-xs font-medium px-2 py-1 bg-violet-100 text-violet-700 rounded-full">3 Rooms</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-violet-600">Occupancy</span>
                                        <span className="font-semibold text-violet-900">{Math.round(occupancyRate)}%</span>
                                    </div>

                                    <div className="h-2.5 bg-violet-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${occupancyRate}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Activity & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Actions */}
                <motion.div variants={item} className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                    <h3 className="text-xl font-bold text-violet-950 mb-6">Pending Actions</h3>
                    <div className="space-y-4">
                        {pendingBookings > 0 || openServiceRequests > 0 ? (
                            <>
                                {pendingBookings > 0 && (
                                    <div
                                        onClick={() => navigate('/admin/bookings')}
                                        className="flex items-center gap-4 p-4 bg-orange-50/80 border border-orange-100 rounded-2xl cursor-pointer hover:bg-orange-100/50 transition-colors"
                                    >
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Calendar className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-orange-900">{pendingBookings} Booking Request{pendingBookings !== 1 ? 's' : ''}</h4>
                                            <p className="text-orange-700 text-sm">Awaiting your approval</p>
                                        </div>
                                        <div className="text-orange-500 text-xs font-bold uppercase tracking-wider">Review →</div>
                                    </div>
                                )}

                                {openServiceRequests > 0 && (
                                    <div
                                        onClick={() => navigate('/admin/services')}
                                        className="flex items-center gap-4 p-4 bg-pink-50/80 border border-pink-100 rounded-2xl cursor-pointer hover:bg-pink-100/50 transition-colors"
                                    >
                                        <div className="p-2 bg-pink-100 rounded-lg">
                                            <Wrench className="w-6 h-6 text-pink-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-pink-900">{openServiceRequests} Service Request{openServiceRequests !== 1 ? 's' : ''}</h4>
                                            <p className="text-pink-700 text-sm">Require attention</p>
                                        </div>
                                        <div className="text-pink-500 text-xs font-bold uppercase tracking-wider">Review →</div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10 text-violet-400">
                                <p>No pending actions. You're all caught up!</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={item} className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl">
                    <h3 className="text-xl font-bold text-violet-950 mb-6">Recent Activity</h3>
                    <div className="space-y-4 text-left">
                        {(activities || []).slice(0, 5).map((log) => (
                            <div key={log.id} className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${log.type === 'booking' ? 'from-blue-500 to-cyan-500' :
                                    log.type === 'service' ? 'from-purple-500 to-pink-500' :
                                        'from-violet-500 to-purple-500'
                                    } flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="text-violet-900 text-sm font-semibold truncate">{log.action}</div>
                                    <div className="text-violet-500 text-xs truncate overflow-hidden">{log.details}</div>
                                </div>
                                <div className="text-violet-400 text-[10px] whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                        {(!activities || activities.length === 0) && (
                            <div className="text-center py-10 text-violet-400">
                                <p>No activity recorded yet.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
