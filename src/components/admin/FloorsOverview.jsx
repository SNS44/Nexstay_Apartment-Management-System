import { Building2, Bed, User, DoorOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function FloorsOverview() {
    const { rooms, residents } = useData();

    const floors = [1, 2, 3, 4, 5].map(floorNumber => {
        const floorRooms = (rooms || []).filter(r => (r.floor_number || r.floor || r.floor_id) == floorNumber);
        const occupied = floorRooms.filter(r => r.status?.toLowerCase() === 'occupied');
        const available = floorRooms.filter(r => r.status?.toLowerCase() === 'available');
        const reserved = floorRooms.filter(r => r.status?.toLowerCase() === 'reserved' || r.status?.toLowerCase() === 'booked');
        const maintenance = floorRooms.filter(r => r.status?.toLowerCase() === 'maintenance' || r.status?.toLowerCase() === 'cleaning');
        const floorResidents = (residents || []).filter(r => (r.floor_number || r.floor) == floorNumber);

        return {
            number: floorNumber,
            name: floorNumber === 1 ? 'Ground Floor' : ['First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor'][floorNumber - 2],
            totalRooms: floorRooms.length,
            occupied: occupied,
            available: available,
            reserved: reserved,
            maintenance: maintenance,
            residents: floorResidents,
            rooms: floorRooms,
        };
    });

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {floors.map((floor) => (
                    <div
                        key={floor.number}
                        className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${floor.number === 0 ? 'from-violet-500 to-purple-500' :
                                floor.number === 1 ? 'from-blue-500 to-cyan-500' :
                                    floor.number === 2 ? 'from-green-500 to-emerald-500' :
                                        floor.number === 3 ? 'from-orange-500 to-amber-500' :
                                            'from-pink-500 to-rose-500'
                                } flex items-center justify-center`}>
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-violet-900">{floor.name}</div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-violet-600">Total Rooms:</span>
                                <span className="text-violet-900">{floor.totalRooms}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-600">Occupied:</span>
                                <span className="text-violet-900">{floor.occupied.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-600">Available:</span>
                                <span className="text-violet-900">{floor.available.length}</span>
                            </div>
                            {floor.reserved.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-orange-600">Reserved:</span>
                                    <span className="text-violet-900">{floor.reserved.length}</span>
                                </div>
                            )}
                            {floor.maintenance.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-red-600">Maintenance:</span>
                                    <span className="text-violet-900">{floor.maintenance.length}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-3 h-2 bg-violet-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                style={{ width: `${floor.totalRooms > 0 ? (floor.occupied.length / floor.totalRooms) * 100 : 0}%` }}
                            />
                        </div>

                        <div className="mt-3 pt-3 border-t border-violet-200/30 text-center">
                            <span className="text-violet-600 text-xs">{floor.residents.length} resident{floor.residents.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Floor Views */}
            {floors.map((floor) => (
                <div
                    key={floor.number}
                    className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${floor.number === 0 ? 'from-violet-500 to-purple-500' :
                                floor.number === 1 ? 'from-blue-500 to-cyan-500' :
                                    floor.number === 2 ? 'from-green-500 to-emerald-500' :
                                        floor.number === 3 ? 'from-orange-500 to-amber-500' :
                                            'from-pink-500 to-rose-500'
                                } flex items-center justify-center shadow-lg`}>
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-violet-900">{floor.name}</h3>
                                <p className="text-violet-600 text-sm">
                                    {floor.occupied.length} of {floor.totalRooms} rooms occupied ({floor.totalRooms > 0 ? ((floor.occupied.length / floor.totalRooms) * 100).toFixed(0) : 0}%)
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm border border-green-200">
                                {floor.available.length} Available
                            </div>
                            {floor.reserved.length > 0 && (
                                <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm border border-orange-200">
                                    {floor.reserved.length} Reserved
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rooms Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {floor.rooms.map((room) => (
                            <div
                                key={room.id}
                                className={`p-4 rounded-xl border-2 ${room.status?.toLowerCase() === 'occupied' ? 'bg-blue-50 border-blue-200' :
                                    room.status?.toLowerCase() === 'available' ? 'bg-green-50 border-green-200' :
                                        (room.status?.toLowerCase() === 'reserved' || room.status?.toLowerCase() === 'booked') ? 'bg-orange-50 border-orange-200' :
                                            'bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Bed className={`w-5 h-5 ${room.status?.toLowerCase() === 'occupied' ? 'text-blue-600' :
                                            room.status?.toLowerCase() === 'available' ? 'text-green-600' :
                                                (room.status?.toLowerCase() === 'reserved' || room.status?.toLowerCase() === 'booked') ? 'text-orange-600' :
                                                    'text-red-600'
                                            }`} />
                                        <span className={`${room.status?.toLowerCase() === 'occupied' ? 'text-blue-900' :
                                            room.status?.toLowerCase() === 'available' ? 'text-green-900' :
                                                (room.status?.toLowerCase() === 'reserved' || room.status?.toLowerCase() === 'booked') ? 'text-orange-900' :
                                                    'text-red-900'
                                            }`}>Room {room.room_number || room.roomNumber}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${room.status?.toLowerCase() === 'occupied' ? 'bg-blue-200 text-blue-800' :
                                        room.status?.toLowerCase() === 'available' ? 'bg-green-200 text-green-800' :
                                            (room.status?.toLowerCase() === 'reserved' || room.status?.toLowerCase() === 'booked') ? 'bg-orange-200 text-orange-800' :
                                                'bg-red-200 text-red-800'
                                        }`}>
                                        {room.status}
                                    </span>
                                </div>
                                {room.currentResident && (
                                    <div className="flex items-center gap-2 text-sm text-blue-700">
                                        <User className="w-4 h-4" />
                                        <span>{room.currentResident}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Residents on this floor */}
                    {floor.residents.length > 0 && (
                        <div>
                            <h4 className="text-violet-900 mb-3">Current Residents</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {floor.residents.map((resident) => (
                                    <div key={resident.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-violet-200/30">
                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-violet-900 text-sm truncate">{resident.name}</div>
                                            <div className="text-violet-600 text-xs">Room {resident.room_number}</div>
                                        </div>
                                        <DoorOpen className="w-4 h-4 text-green-600" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
