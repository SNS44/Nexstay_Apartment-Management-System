import React from 'react';
import { Wrench, AlertCircle, Clock, CheckCircle, XCircle, User, Lock, Sparkles, Zap, BellRing } from 'lucide-react';

const statusColors = {
    pending: 'bg-gray-100 text-gray-700 border-gray-200',
    assigned: 'bg-blue-100 text-blue-700 border-blue-200',
    'in_progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons = {
    pending: <Clock size={14} />,
    assigned: <User size={14} />,
    'in_progress': <Wrench size={14} />,
    completed: <CheckCircle size={14} />,
    cancelled: <XCircle size={14} />,
};

const serviceIcons = {
    'plumber': Wrench,
    'electrician': Zap,
    'cleaner': Sparkles,
    'guard': BellRing,
    'ac_repair': Wrench,
    'general_maintenance': Wrench
};

export function ServicesList({ services, isResident, onCancelService, onViewDetails, onRequestService }) {
    if (!isResident) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                <h3 className="text-[#A294F9] font-bold text-lg mb-4">Services</h3>
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#E5D9F2] flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} className="text-[#A294F9]" />
                    </div>
                    <p className="text-gray-500 max-w-[200px] mx-auto">
                        Available only for residents with an active booking.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#A294F9] font-bold text-lg">Services</h3>
                <button
                    onClick={onRequestService}
                    className="px-4 py-2 bg-[#A294F9] text-white rounded-xl hover:bg-[#9183e8] shadow-md transition-all text-sm font-semibold"
                >
                    Request Service
                </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-violet-200">
                {services.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Wrench size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No service requests yet</p>
                    </div>
                ) : (
                    services.map((service) => {
                        const Icon = serviceIcons[service.service_type?.toLowerCase()] || Wrench;
                        const status = service.status?.toLowerCase();
                        return (
                            <div
                                key={service.id}
                                className="bg-white/80 rounded-2xl p-4 border border-[#E5D9F2] hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-[#A294F9]/10 flex items-center justify-center text-[#A294F9]">
                                                <Icon size={18} />
                                            </div>
                                            <h4 className="font-bold text-gray-900 capitalize">{service.service_type?.replace('_', ' ')}</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {service.description || 'Request for maintenance/service in the room.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || statusColors.pending}`}>
                                        {statusIcons[status] || statusIcons.pending}
                                        {status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                                        <Clock size={12} />
                                        {new Date(service.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onViewDetails(service)}
                                        className="flex-1 py-2 px-3 bg-[#E5D9F2] text-[#A294F9] rounded-xl hover:bg-[#CDC1FF] transition-colors text-xs font-bold"
                                    >
                                        View Details
                                    </button>
                                    {status === 'pending' && (
                                        <button
                                            onClick={() => onCancelService(service.id)}
                                            className="flex-1 py-2 px-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-xs font-bold"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
