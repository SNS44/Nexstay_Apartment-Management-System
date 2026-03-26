import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Eye, UserX, Filter, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function ResidentsManagement() {
    const { residents } = useData();
    const [selectedFloor, setSelectedFloor] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredResidents = (residents || []).filter(resident => {
        if (selectedFloor !== 'all' && (resident.floor_number || resident.floor) != selectedFloor) return false;
        if (searchQuery && !resident.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !resident.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const activeCount = (residents || []).filter(r => r.accountStatus === 'active' || r.booking_status === 'Active' || r.booking_status === 'Occupied').length;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Total Residents</p>
                            <h3 className="text-violet-900 mt-1">{residents.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Active Accounts</p>
                            <h3 className="text-violet-900 mt-1">{activeCount}</h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-600 text-sm">Occupancy Rate</p>
                            <h3 className="text-violet-900 mt-1">{residents.length > 0 ? ((residents.length / 15) * 100).toFixed(0) : 0}%</h3>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
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
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    <Filter className="w-5 h-5 text-violet-600" />

                    <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                        <option value="all">All Floors</option>
                        <option value="1">Ground Floor</option>
                        <option value="2">First Floor</option>
                        <option value="3">Second Floor</option>
                        <option value="4">Third Floor</option>
                        <option value="5">Fourth Floor</option>
                    </select>

                    <div className="text-sm text-violet-600">
                        {filteredResidents.length} of {residents.length}
                    </div>
                </div>
            </div>

            {/* Residents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredResidents.map((resident) => (
                    <div
                        key={resident.id}
                        className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <User className="w-8 h-8 text-white" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-violet-900">{resident.name}</h4>
                                    <span className={`px-2 py-1 rounded text-xs ${resident.accountStatus === 'active'
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}>
                                        {resident.accountStatus.charAt(0).toUpperCase() + resident.accountStatus.slice(1)}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-violet-600">
                                        <Mail className="w-4 h-4" />
                                        <span>{resident.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-violet-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{resident.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 bg-white/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-4 h-4 text-violet-600" />
                                    <span className="text-violet-600 text-xs">Room</span>
                                </div>
                                <p className="text-violet-900 text-sm">{resident.room_number}</p>
                                <p className="text-violet-600 text-xs">
                                    {getFloorName(resident.floor_number || resident.floor)}
                                </p>
                            </div>

                            <div className="p-3 bg-white/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-violet-600" />
                                    <span className="text-violet-600 text-xs">Duration</span>
                                </div>
                                <p className="text-violet-900 text-sm">
                                    {new Date(resident.check_out_date).getTime() - new Date(resident.check_in_date).getTime() > 180 * 24 * 60 * 60 * 1000
                                        ? 'Long-term'
                                        : 'Short-term'}
                                </p>
                                <p className="text-violet-600 text-xs">
                                    Until {formatDate(resident.check_out_date)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-violet-200/30">
                            <div className="text-xs text-violet-600">
                                Check-in: {formatDate(resident.check_in_date)}
                            </div>

                            <div className="flex gap-2">
                                <button className="px-3 py-2 bg-white/70 hover:bg-white border border-violet-200 rounded-lg text-sm text-violet-700 flex items-center gap-2 transition-colors">
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button className="px-3 py-2 bg-white/70 hover:bg-white border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2 transition-colors">
                                    <UserX className="w-4 h-4" />
                                    Deactivate
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredResidents.length === 0 && (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-12 border border-violet-200/50 shadow-lg text-center">
                    <User className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                    <p className="text-violet-600">No residents found matching your search</p>
                </div>
            )}
        </div>
    );
}
