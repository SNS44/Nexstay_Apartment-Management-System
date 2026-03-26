import { useState } from 'react';
import { Wrench, MapPin, User, Clock, CheckCircle2, Circle, PlayCircle, Filter, X, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function ServicesRequests() {
    const { requests, rooms, refreshAll, residents } = useData();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedFloor, setSelectedFloor] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState({
        roomId: '',
        serviceType: 'general_maintenance',
        title: '',
        description: ''
    });

    const filteredRequests = (requests || []).filter(request => {
        if (selectedStatus !== 'all' && request.status !== selectedStatus) return false;
        if (selectedFloor !== 'all' && parseInt(request.floor_number) !== parseInt(selectedFloor)) return false;
        return true;
    });

    const statusCounts = {
        pending: (requests || []).filter(s => s.status === 'Pending').length,
        assigned: (requests || []).filter(s => s.status === 'Assigned').length,
        in_progress: (requests || []).filter(s => s.status === 'In_Progress').length,
        completed: (requests || []).filter(s => s.status === 'Completed').length,
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Assigned':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'In_Progress':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return Circle;
            case 'Assigned':
                return CheckCircle2;
            case 'In_Progress':
                return PlayCircle;
            case 'Completed':
                return CheckCircle2;
            default:
                return Circle;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const updateStatus = async (requestId, newStatus, notes = '') => {
        setIsUpdating(true);
        try {
            const res = await fetch('/api/service_status_update.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: requestId, status: newStatus, notes })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Status updated to ${newStatus}`);
                refreshAll();
                setSelectedRequest(null);
            } else {
                alert(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating service status:', error);
            alert('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveNew = async (e) => {
        e.preventDefault();
        const room = (rooms || []).find(r => String(r.id) === String(addFormData.roomId));
        if (!room) {
            alert("Please select a valid room.");
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch('/api/service_create_admin.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: room.resident_id || 0, // Backend will use admin ID if 0
                    room_id: room.id,
                    service_type: addFormData.serviceType,
                    title: addFormData.title,
                    description: addFormData.description
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsAddModalOpen(false);
                setAddFormData({ roomId: '', serviceType: 'general_maintenance', title: '', description: '' });
                refreshAll();
            } else {
                alert(data.message || "Failed to add service card");
            }
        } catch (error) {
            console.error('Error adding service card:', error);
            alert('Failed to add service card');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Pending</p>
                            <h3 className="text-violet-900 mt-1">{statusCounts.pending}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                            <Circle className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Assigned</p>
                            <h3 className="text-violet-900 mt-1">{statusCounts.assigned}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">In Progress</p>
                            <h3 className="text-violet-900 mt-1">{statusCounts.in_progress}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Completed</p>
                            <h3 className="text-violet-900 mt-1">{statusCounts.completed}</h3>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">
                <div className="flex gap-4 items-center">
                    <Filter className="w-5 h-5 text-violet-600" />

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In_Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                        <option value="all">All Floors</option>
                        <option value="1">First Floor</option>
                        <option value="2">Second Floor</option>
                        <option value="3">Third Floor</option>
                        <option value="4">Fourth Floor</option>
                        <option value="5">Fifth Floor</option>
                    </select>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="ml-auto px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Service Card
                    </button>
                </div>
            </div>

            {/* Service Requests List */}
            <div className="space-y-4">
                {filteredRequests.map((request) => {
                    const StatusIcon = getStatusIcon(request.status);

                    return (
                        <div
                            key={request.id}
                            onClick={() => setSelectedRequest(request)}
                            className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <Wrench className="w-6 h-6 text-white" />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-violet-900">{request.service_type || request.title}</h4>
                                            <span className={`px-3 py-1 rounded-lg border text-xs flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {request.status === 'in_progress' ? 'In Progress' : request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                                            </span>
                                        </div>

                                        <p className="text-violet-700 mb-2">{request.description}</p>

                                        <div className="flex items-center gap-4 text-sm text-violet-600">
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {request.user_name}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Room {request.room_number}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatDate(request.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Update Actions */}
                                <div className="flex flex-col gap-2">
                                    {request.status === 'Pending' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'Assigned'); }}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors shadow-sm font-bold"
                                        >
                                            Approve & Assign Staff
                                        </button>
                                    )}
                                    {request.status === 'Assigned' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'In_Progress'); }}
                                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors shadow-sm"
                                        >
                                            Start Progress
                                        </button>
                                    )}
                                    {request.status === 'In_Progress' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'Completed', 'Job finished by maintenance team.'); }}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors shadow-sm"
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Detailed Info (Small) */}
                            <div className="flex items-center gap-6 mt-2 pt-3 border-t border-violet-100/30 text-xs text-violet-400">
                                {request.priority === 'Urgent' && (
                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter ring-1 ring-red-200">URGENT</span>
                                )}
                                {request.admin_notes && (
                                    <span className="italic truncate max-w-[300px]">Notes: {request.admin_notes}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View/Edit Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl overflow-hidden border border-violet-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-violet-950">Service Request Details</h3>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 border border-violet-100">
                                    <Wrench size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-violet-900">{selectedRequest.title}</h4>
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${getStatusColor(selectedRequest.status)}`}>
                                        {selectedRequest.status}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100">
                                <p className="text-sm font-medium text-violet-400 mb-1 uppercase tracking-wider">Description</p>
                                <p className="text-violet-900 font-medium">{selectedRequest.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white border border-violet-100 p-4 rounded-2xl">
                                    <p className="text-xs text-violet-400 font-bold uppercase mb-1">Resident</p>
                                    <p className="text-sm font-bold text-violet-900">{selectedRequest.user_name}</p>
                                    <p className="text-[10px] text-violet-400">{selectedRequest.user_email}</p>
                                </div>
                                <div className="bg-white border border-violet-100 p-4 rounded-2xl">
                                    <p className="text-xs text-violet-400 font-bold uppercase mb-1">Location</p>
                                    <p className="text-sm font-bold text-violet-900">Room {selectedRequest.room_number}</p>
                                    <p className="text-[10px] text-violet-400">Floor {selectedRequest.floor_number}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-violet-400 uppercase tracking-widest pl-1">Actions</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedRequest.status === 'Pending' && (
                                        <button
                                            onClick={() => updateStatus(selectedRequest.id, 'Assigned')}
                                            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={18} /> Approve & Assign Staff
                                        </button>
                                    )}
                                    {selectedRequest.status !== 'Completed' && selectedRequest.status !== 'Pending' && (
                                        <button
                                            onClick={() => updateStatus(selectedRequest.id, 'Completed')}
                                            className="px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={18} /> Mark Complete
                                        </button>
                                    )}
                                    {selectedRequest.status !== 'Cancelled' && (
                                        <button
                                            onClick={() => updateStatus(selectedRequest.id, 'Cancelled')}
                                            className="px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <X size={18} /> Cancel Request
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Service Card Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isUpdating && setIsAddModalOpen(false)} />
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl overflow-hidden border border-violet-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-violet-950">Add New Service Card</h3>
                            <button onClick={() => !isUpdating && setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNew} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
                                <select
                                    required
                                    value={addFormData.roomId}
                                    onChange={(e) => setAddFormData({ ...addFormData, roomId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="">Choose a room...</option>
                                    {(rooms || []).sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true })).map(r => (
                                        <option key={r.id} value={r.id}>
                                            Room {r.room_number} ({r.status})
                                        </option>
                                    ))}
                                </select>
                                {addFormData.roomId && (() => {
                                    const room = rooms.find(r => r.id === parseInt(addFormData.roomId));
                                    return room?.resident_name ? (
                                        <p className="text-[10px] text-violet-500 font-bold mt-1 px-1">
                                            Resident: {room.resident_name}
                                        </p>
                                    ) : null;
                                })()}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                                    <select
                                        required
                                        value={addFormData.serviceType}
                                        onChange={(e) => setAddFormData({ ...addFormData, serviceType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="plumber">Plumber</option>
                                        <option value="electrician">Electrician</option>
                                        <option value="cleaner">Cleaner</option>
                                        <option value="guard">Guard</option>
                                        <option value="ac_repair">AC Repair</option>
                                        <option value="general_maintenance">General Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 bg-opacity-50">
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Title</label>
                                <input
                                    type="text"
                                    required
                                    value={addFormData.title}
                                    onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                                    maxLength={50}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    placeholder="e.g., Kitchen sink leaking"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                                <textarea
                                    required
                                    value={addFormData.description}
                                    onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                    placeholder="Provide more context for the maintenance team..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4 mt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => !isUpdating && setIsAddModalOpen(false)}
                                    className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-[2] py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? 'Saving...' : 'Add Service Card'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {filteredRequests.length === 0 && (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-12 border border-violet-200/50 shadow-lg text-center">
                    <Wrench className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                    <p className="text-violet-600">No service requests found matching your filters</p>
                </div>
            )}
        </div>
    );
}
