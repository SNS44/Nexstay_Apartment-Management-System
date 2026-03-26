import { useState } from 'react';
import { Activity, Calendar, Wrench, User, Shield, Filter, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function ActivityLogs() {
    const { activities } = useData();
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLogs = (activities || []).filter(log => {
        if (selectedType !== 'all' && log.type !== selectedType) return false;
        if (searchQuery && !log.action?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.details?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'booking':
                return Calendar;
            case 'service':
                return Wrench;
            case 'user':
                return User;
            case 'admin':
                return Shield;
            default:
                return Activity;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'booking':
                return 'from-blue-500 to-cyan-500';
            case 'service':
                return 'from-purple-500 to-pink-500';
            case 'user':
                return 'from-green-500 to-emerald-500';
            case 'admin':
                return 'from-orange-500 to-amber-500';
            default:
                return 'from-violet-500 to-purple-500';
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const typeCounts = {
        booking: (activities || []).filter(l => l.type === 'booking').length,
        service: (activities || []).filter(l => l.type === 'service').length,
        user: (activities || []).filter(l => l.type === 'user').length,
        admin: (activities || []).filter(l => l.type === 'admin').length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Booking Events</p>
                            <h3 className="text-violet-900 mt-1">{typeCounts.booking}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Service Events</p>
                            <h3 className="text-violet-900 mt-1">{typeCounts.service}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">User Events</p>
                            <h3 className="text-violet-900 mt-1">{typeCounts.user}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Admin Actions</p>
                            <h3 className="text-violet-900 mt-1">{typeCounts.admin}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                        <input
                            type="text"
                            placeholder="Search activity logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    <Filter className="w-5 h-5 text-violet-600" />

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                        <option value="all">All Events</option>
                        <option value="booking">Booking Events</option>
                        <option value="service">Service Events</option>
                        <option value="user">User Events</option>
                        <option value="admin">Admin Actions</option>
                    </select>

                    <div className="text-sm text-violet-600">
                        {filteredLogs.length} of {(activities || []).length} logs
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                <h3 className="text-violet-900 mb-6">Activity Timeline</h3>

                <div className="space-y-4">
                    {filteredLogs.map((log, index) => {
                        const TypeIcon = getTypeIcon(log.type);
                        const typeColor = getTypeColor(log.type);

                        return (
                            <div key={log.id} className="relative">
                                {index !== filteredLogs.length - 1 && (
                                    <div className="absolute left-6 top-12 w-0.5 h-full bg-violet-200" />
                                )}

                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                        <TypeIcon className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1 bg-white/50 rounded-xl p-4 border border-violet-200/30">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="text-violet-900">{log.action}</h4>
                                                <p className="text-violet-700 text-sm mt-1">{log.details}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-xs capitalize ${log.type === 'booking' ? 'bg-blue-100 text-blue-700' :
                                                log.type === 'service' ? 'bg-purple-100 text-purple-700' :
                                                    log.type === 'user' ? 'bg-green-100 text-green-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {log.type}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-violet-600">
                                                <User className="w-4 h-4" />
                                                <span>{log.user}</span>
                                            </div>
                                            <div className="text-violet-500">
                                                {formatTimestamp(log.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                        <p className="text-violet-600">No activity logs found matching your search</p>
                    </div>
                )}
            </div>
        </div>
    );
}
