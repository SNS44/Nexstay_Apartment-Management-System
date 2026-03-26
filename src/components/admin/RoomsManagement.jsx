import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bed, Filter, Plus, X, Trash2, Loader2, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function RoomsManagement() {
    const { rooms, loading, addRoom, updateRoom, deleteRoom, refreshRooms } = useData();
    const [selectedFloor, setSelectedFloor] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'edit'
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        roomNumber: '',
        floor: 1,
        floorName: 'First Floor',
        status: 'Available',
        monthlyPrice: 15000,
        amenities: 'WiFi, AC, TV, Attached Bathroom',
        currentResident: ''
    });

    const getFloorName = (floorNum) => {
        const num = parseInt(floorNum);
        if (num === 1) return 'First Floor';
        if (num === 2) return 'Second Floor';
        if (num === 3) return 'Third Floor';
        if (num === 4) return 'Fourth Floor';
        if (num === 5) return 'Fifth Floor';
        return `Floor ${num}`;
    };

    const handleOpenModal = (mode, room = null) => {
        setModalMode(mode);
        if (room) {
            setSelectedRoom(room);
            setFormData({
                id: room.id,
                roomNumber: room.room_number,
                floor: room.floor_number || room.floor || 1,
                status: room.status || 'Available',
                monthlyPrice: room.base_price_per_night || room.monthly_price || 0,
                amenities: room.description || '',
                currentResident: room.resident_name || ''
            });
        } else {
            setSelectedRoom(null);
            setFormData({
                roomNumber: '',
                floor: 1,
                floorName: 'First Floor',
                status: 'Available',
                monthlyPrice: 15000,
                amenities: 'WiFi, AC, TV, Attached Bathroom',
                currentResident: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (roomId, newStatus) => {
        setUploading(true);
        try {
            const res = await fetch('/api/room_manage.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_status', room_id: roomId, status: newStatus })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Status update failed');
            alert(data.message);
            setIsModalOpen(false);
            await refreshRooms(); // Refresh room list immediately
        } catch (err) {
            alert('Failed to update room status: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            if (modalMode === 'add') {
                await addRoom(formData);
            } else if (modalMode === 'edit') {
                await updateRoom(formData);
            }
            setIsModalOpen(false);
        } catch (err) {
            alert("Failed to save room: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this room?")) {
            setUploading(true);
            try {
                await deleteRoom(selectedRoom.id);
                setIsModalOpen(false);
            } catch (err) {
                alert("Failed to delete room: " + err.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const filteredRooms = rooms.filter(room => {
        if (selectedFloor !== 'all' && parseInt(room.floor_number || room.floor) !== parseInt(selectedFloor)) return false;
        if (selectedStatus !== 'all' && room.status !== selectedStatus) return false;
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-700 border-green-200';
            case 'Occupied': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Reserved': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Maintenance': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const RoomCard = ({ room }) => (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-lg transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${room.status === 'Available' ? 'bg-green-100 text-green-600' :
                        room.status === 'Occupied' ? 'bg-blue-100 text-blue-600' :
                            'bg-violet-100 text-violet-600'
                        }`}>
                        <Bed className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-violet-950">Room {room.room_number}</div>
                        <div className="text-violet-500 text-xs font-medium uppercase tracking-wide">
                            {getFloorName(room.floor_number)}
                        </div>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${getStatusColor(room.status)}`}>
                    {room.status}
                </span>
            </div>

            {/* Price Info */}
            <div className="mb-4">
                <p className="text-2xl font-bold text-violet-900">₹{parseFloat(room.base_price_per_night || room.monthly_price || 0).toLocaleString()}</p>
                <p className="text-xs text-violet-400">per month</p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => handleOpenModal('view', room)}
                    className="flex-1 py-2 bg-white border border-violet-100 rounded-lg text-sm text-violet-600 font-medium shadow-sm hover:bg-violet-50 transition-colors"
                >
                    View
                </button>
                <button
                    onClick={() => handleOpenModal('edit', room)}
                    className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-violet-700 transition-colors"
                >
                    Edit
                </button>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 relative">
            {/* Header with Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-violet-950">Rooms Directory</h3>
                        <p className="text-violet-600 text-sm mt-1">Manage and track status of all {rooms.length} rooms</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal('add')}
                        className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl font-medium flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Room
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center bg-white/50 p-2 rounded-2xl border border-white/50">
                    <div className="flex items-center gap-2 px-3 text-violet-400">
                        <Filter className="w-5 h-5" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="px-4 py-2 bg-white/80 border border-violet-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-violet-700 min-w-[140px]"
                    >
                        <option value="all">All Floors</option>
                        <option value="1">First Floor</option>
                        <option value="2">Second Floor</option>
                        <option value="3">Third Floor</option>
                        <option value="4">Fourth Floor</option>
                        <option value="5">Fifth Floor</option>
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 bg-white/80 border border-violet-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-violet-700 min-w-[140px]"
                    >
                        <option value="all">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
            </motion.div>

            {/* Rooms Grid with Animation */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence>
                    {filteredRooms.map(room => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !uploading && setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-violet-950">
                                    {modalMode === 'add' ? 'Add New Room' :
                                        modalMode === 'edit' ? `Edit Room ${formData.roomNumber}` :
                                            `Room ${formData.roomNumber} Details`}
                                </h3>
                                <button
                                    onClick={() => !uploading && setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Room Number</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={modalMode === 'view' || uploading}
                                            value={formData.roomNumber}
                                            onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Floor</label>
                                        <select
                                            disabled={modalMode === 'view' || uploading}
                                            value={formData.floor}
                                            onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50"
                                        >
                                            <option value={1}>First Floor</option>
                                            <option value={2}>Second Floor</option>
                                            <option value={3}>Third Floor</option>
                                            <option value={4}>Fourth Floor</option>
                                            <option value={5}>Fifth Floor</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        disabled={modalMode === 'view' || uploading}
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Booked">Booked</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Monthly Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        disabled={modalMode === 'view' || uploading}
                                        value={formData.monthlyPrice}
                                        onChange={e => setFormData({ ...formData, monthlyPrice: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Amenities</label>
                                    <textarea
                                        disabled={modalMode === 'view' || uploading}
                                        value={formData.amenities}
                                        onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50 h-24 resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4 mt-4 border-t border-gray-100">
                                    {modalMode === 'view' ? (
                                        <div className="w-full space-y-3">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Quick Status Actions</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['Available', 'Maintenance', 'Inactive'].map(s => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        disabled={uploading || formData.status === s}
                                                        onClick={() => handleStatusUpdate(selectedRoom.id, s)}
                                                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 ${s === 'Available' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                                s === 'Maintenance' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                                                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {uploading ? '...' : s}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="w-full py-2.5 bg-gray-600 text-white rounded-xl font-medium shadow-lg hover:bg-gray-700 transition-colors mt-2"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-3 ml-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsModalOpen(false)}
                                                    disabled={uploading}
                                                    className="px-4 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={uploading}
                                                    className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium shadow-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
                                                >
                                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : (modalMode === 'edit' ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                                                    {uploading ? 'Saving...' : (modalMode === 'edit' ? 'Update Room' : 'Add Room')}
                                                </button>
                                                {modalMode === 'edit' && (
                                                    <button
                                                        type="button"
                                                        onClick={handleDelete}
                                                        disabled={uploading}
                                                        className="px-4 py-2.5 bg-red-50 text-red-600 font-medium hover:bg-red-100 rounded-xl transition-colors flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
