import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Wifi, Wind, Tv, Bath, Award, Shield, Zap,
  ChevronLeft, Star, MapPin, Share2, Heart,
  Calendar, Clock, CheckCircle, AlertCircle, Home, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import roomImg from '../assets/Room.png';

const amenityIcons = {
  'wifi': <Wifi size={20} />,
  'ac': <Wind size={20} />,
  'power': <Zap size={20} />,
  'security': <Shield size={20} />,
  'tv': <Tv size={20} />,
  'bath': <Bath size={20} />,
  'balcony': <Award size={20} />,
};

export function RoomDetails({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/room_get.php?id=${id}`);

        // Check for authentication errors
        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          setLoading(false);
          return;
        }

        // Check if response is OK before parsing
        if (!res.ok) {
          setError(`Failed to load room (Error: ${res.status})`);
          setLoading(false);
          return;
        }

        const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));

        if (data.success) {
          setRoom(data.room);
        } else {
          setError(data.message || 'Room not found');
        }
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to fetch room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! {error || 'Room not found'}</h2>
        <p className="text-gray-500 mb-8 max-w-md">We couldn't find the room you're looking for. It might have been moved or removed.</p>
        <button
          onClick={() => navigate('/rooms')}
          className="px-8 py-3 bg-violet-600 text-white rounded-2xl font-bold shadow-lg hover:bg-violet-700 transition-all"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  const amenities = room.amenities?.split(',').map(a => a.trim()) || ['WiFi', 'AC', 'TV', 'Bathroom', 'Security'];

  return (
    <div className="min-h-screen bg-[#F8F6FF] pb-20">
      {/* Header / Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/rooms')}
          className="flex items-center gap-2 text-gray-600 hover:text-violet-600 font-bold transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Browse
        </button>
        <div className="flex gap-4">
          <button className="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all">
            <Heart size={20} />
          </button>
          <button className="p-3 bg-white rounded-2xl text-gray-400 hover:text-violet-600 shadow-sm transition-all">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Image Gallery */}
            <div className="relative group">
              <div className="aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src={room.image_url || room.image_path || roomImg}
                  alt={`Room ${room.room_number}`}
                  onError={(e) => { e.target.src = roomImg; }}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center gap-2">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="font-black text-gray-900">4.9</span>
                <span className="text-gray-400 font-medium">(120 Reviews)</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">
                    Premium Room {room.room_number}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <MapPin size={18} className="text-violet-500" />
                    <span>NexStay Apartment, Floor {room.floor_number || 3}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-violet-600 tracking-tighter">
                    ₹{parseFloat(room.price || room.monthly_price).toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Per Month</div>
                </div>
              </div>

              <div className="py-8 border-t border-b border-gray-100 mb-8">
                <div className="grid grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
                      <Home size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Size</p>
                    <p className="font-bold text-gray-800">450 sqft</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
                      <UserIcon size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Sleeps</p>
                    <p className="font-bold text-gray-800">2 People</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
                      <Bath size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Baths</p>
                    <p className="font-bold text-gray-800">1 Private</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
                      <Shield size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Security</p>
                    <p className="font-bold text-gray-800">24/7 Guards</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">About this space</h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {room.description || "Indulge in luxury living with our meticulously designed premium rooms. Each space is curated to provide the perfect balance of comfort and sophistication, featuring modern architecture, high-end finishes, and an abundance of natural light."}
                </p>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-white">
              <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Premium Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10">
                {amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-gray-700 group">
                    <div className="w-10 h-10 rounded-xl bg-violet-100/50 text-violet-500 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                      {amenityIcons[amenity.toLowerCase()] || <Star size={18} />}
                    </div>
                    <span className="font-bold">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Booking / Sidebar Column */}
          <div className="space-y-8">
            <div className="sticky top-24">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-3xl -mr-16 -mt-16" />

                <h3 className="text-2xl font-black text-gray-900 mb-8 relative">Reserve Your Stay</h3>

                <div className="space-y-6 relative">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Check-in Date</label>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                      <Calendar size={20} className="text-violet-500" />
                      <span className="font-bold text-gray-900 text-sm">Select dates...</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Stay Duration</label>
                    <div className="flex gap-2">
                      <button className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold active:scale-95 transition-all text-sm">Long Term</button>
                      <button className="flex-1 py-3 bg-gray-50 text-gray-500 border border-gray-100 rounded-xl font-bold hover:bg-gray-100 active:scale-95 transition-all text-sm">Short Visit</button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-400">Monthly Rent</span>
                      <span className="text-gray-900">₹{parseFloat(room.price || room.monthly_price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-400">Security Deposit</span>
                      <span className="text-gray-900">₹{parseFloat((room.price || room.monthly_price) * 2).toLocaleString()}</span>
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                      <span className="text-lg font-black text-gray-900">Total</span>
                      <span className="text-2xl font-black text-violet-600 tracking-tighter">₹{parseFloat((room.price || room.monthly_price) * 3).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/rooms', { state: { openBooking: room.id } })}
                    className="w-full py-5 bg-gradient-to-r from-[#A294F9] to-[#CDC1FF] text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-violet-200 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Check Availability
                  </button>

                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-4">
                    Approval required within 24 hours
                  </p>
                </div>
              </div>

              {/* Support Card */}
              <div className="mt-8 bg-violet-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <Sparkles className="absolute top-4 right-4 text-violet-300 opacity-20" size={60} />
                <h4 className="text-xl font-black mb-2 relative">Need Customization?</h4>
                <p className="text-violet-200 text-sm font-medium mb-6 relative">Speak with our resident advisors for personalized stay options.</p>
                <button className="w-full py-4 bg-white text-violet-900 rounded-2xl font-black hover:bg-violet-50 transition-colors shadow-lg">
                  Speak with Experts
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Named Icon for User to avoid conflict
function UserIcon({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default RoomDetails;
