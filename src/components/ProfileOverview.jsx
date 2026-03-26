import React from 'react';
import { User as UserIcon, Mail, Phone, AlertCircle, Home, CheckCircle } from 'lucide-react';

export function ProfileOverview({
    user,
    activeBooking,
    onEditProfile,
    onChangePassword,
    onViewActivity
}) {
    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/50 hover:shadow-md transition-shadow">
            <h3 className="text-gray-800 font-black text-lg mb-10 tracking-tight">My Profile</h3>

            {/* Avatar & Badges */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center text-violet-400 mb-4 border-4 border-white shadow-sm">
                    <UserIcon size={48} />
                </div>

                <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    {user?.name || 'Verified User'}
                </h4>

                <div className="flex gap-2">
                    <span className="px-4 py-1 rounded-full bg-violet-100 text-violet-400 text-sm font-medium">
                        Active
                    </span>
                    {user?.is_resident ? (
                        <span className="px-4 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium flex items-center gap-1.5">
                            <CheckCircle size={16} />
                            Verified Resident
                        </span>
                    ) : (
                        <span className="px-4 py-1 rounded-full bg-green-50 text-green-600 text-sm font-medium">
                            Registered Member
                        </span>
                    )}
                </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                    <div className="mt-1 text-violet-400">
                        <Mail size={18} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Email</p>
                        <p className="text-[15px] text-gray-600 mt-0.5">{user?.email}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="mt-1 text-violet-400">
                        <Phone size={18} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Phone</p>
                        <p className="text-[15px] text-gray-600 mt-0.5">{user?.phone || 'Not provided'}</p>
                    </div>
                </div>



                {activeBooking && (
                    <div className="flex items-start gap-4">
                        <div className="mt-1 text-violet-400">
                            <Home size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Room Number</p>
                            <p className="text-[15px] text-gray-600 mt-0.5">Room {activeBooking.room_number} - Floor {activeBooking.floor_number || 1}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={onEditProfile}
                    className="w-full py-2.5 px-4 bg-[#A294F9] text-white rounded-xl hover:bg-[#9183e8] transition-colors font-semibold shadow-md"
                >
                    Edit Profile
                </button>
                <button
                    onClick={onChangePassword}
                    className="w-full py-2.5 px-4 bg-[#E5D9F2] text-[#A294F9] rounded-xl hover:bg-[#CDC1FF] transition-colors font-semibold"
                >
                    Change Password
                </button>
                <button
                    onClick={onViewActivity}
                    className="w-full py-2.5 px-4 border-2 border-[#CDC1FF] text-[#A294F9] rounded-xl hover:bg-[#F5EFFF] transition-colors font-semibold"
                >
                    View Recent Activity
                </button>
            </div>
        </div>
    );
}
