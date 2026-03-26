import React from 'react';
import { Wifi, Wind, Tv, Bath, Award, Shield, Zap } from 'lucide-react';
import roomImg from '../assets/Room.png';

const amenityIcons = {
    'wifi': <Wifi size={16} />,
    'ac': <Wind size={16} />,
    'power': <Zap size={16} />,
    'security': <Shield size={16} />,
    'tv': <Tv size={16} />,
    'bath': <Bath size={16} />,
    'balcony': <Award size={16} />,
};

export function CurrentRoomCard({ room, isResident }) {
    if (!room) return null;

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-white/50 hover:shadow-md transition-shadow">
            <h3 className="p-6 pb-4 text-gray-800 font-bold text-lg">Current Room Details</h3>

            {/* Room Image */}
            <div className="px-6 pb-4">
                <div className="relative group overflow-hidden rounded-2xl">
                    <img
                        src={room.image_path || roomImg}
                        alt={`Room ${room.room_number}`}
                        className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />
                </div>
            </div>

            <div className="px-6 pb-6">
                {/* Room Info */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-xl font-black text-gray-900 leading-tight">Room {room.room_number}</h4>
                        <p className="text-sm text-gray-500 font-medium tracking-wide">{room.floor_name || 'Floor ' + (room.floor_number || '?')}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-green-100/80 text-green-700 text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {room.status || 'Occupied'}
                    </span>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                    <p className="text-[10px] text-gray-400 mb-3 font-black uppercase tracking-widest">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'wifi', name: 'WiFi' },
                            { id: 'ac', name: 'AC' },
                            { id: 'tv', name: 'TV' },
                            { id: 'bath', name: 'Attached Bathroom' },
                            { id: 'balcony', name: 'Balcony' }
                        ].map((amenity) => (
                            <span
                                key={amenity.id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#F5EFFF] text-[#A294F9] rounded-xl text-[11px] font-bold border border-[#E5D9F2]/50"
                            >
                                {amenityIcons[amenity.id] || <Award size={14} />}
                                {amenity.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Monthly Price */}
                <div className="pt-5 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400 font-bold">Monthly Price</span>
                        <span className="text-lg font-black text-[#A294F9] tracking-tighter">₹{parseFloat(room.price || 15000).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CurrentRoomCard;
