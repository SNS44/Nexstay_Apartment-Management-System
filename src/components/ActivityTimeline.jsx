import React from 'react';
import { Activity, Bell, CreditCard, Home, Wrench, CheckCircle, Clock } from 'lucide-react';

const iconMap = {
    'booking': <Home size={20} />,
    'payment': <CreditCard size={20} />,
    'service': <Wrench size={20} />,
    'status': <Activity size={20} />,
    'mention': <Bell size={20} />,
};

export function ActivityTimeline({ activities = [] }) {
    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <h3 className="text-[#A294F9] font-bold text-lg mb-6">Recent Activity</h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:border-l-2 before:border-[#E5D9F2] before:border-dashed before:my-8">
                {activities.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Activity size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No recent activity</p>
                    </div>
                ) : (
                    activities.map((activity, index) => {
                        const Icon = iconMap[activity.reference_type?.toLowerCase()] || <Activity size={20} />;
                        return (
                            <div key={activity.id || index} className="flex gap-4 relative z-10 group">
                                {/* Icon Container */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-[#E5D9F2] shadow-sm flex items-center justify-center text-[#A294F9] group-hover:scale-110 transition-transform">
                                    {Icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1">
                                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                                        {activity.description || activity.activity_type}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                        <Clock size={12} />
                                        <span>
                                            {new Date(activity.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
