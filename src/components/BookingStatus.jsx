import React from 'react';
import { Calendar, Clock, IndianRupee, AlertCircle, CheckCircle, XCircle, Home } from 'lucide-react';

export function BookingStatus({
    booking,
    onBrowseRooms,
    onCancelBooking,
    onPayNow,
    onBookAnother,
    onDismiss
}) {
    // CASE 1: No Booking
    if (!booking) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                <h3 className="text-[#A294F9] font-bold text-lg mb-4">My Booking</h3>
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#E5D9F2] flex items-center justify-center mx-auto mb-4">
                        <Home size={32} className="text-[#A294F9]" />
                    </div>
                    <p className="text-gray-500 mb-6">
                        You do not have any active or pending bookings.
                    </p>
                    <button
                        onClick={onBrowseRooms}
                        className="px-6 py-2.5 bg-[#A294F9] text-white rounded-xl hover:bg-[#9183e8] transition-colors font-semibold shadow-md"
                    >
                        Browse Rooms
                    </button>
                </div>
            </div>
        );
    }

    const status = booking.status?.toLowerCase();

    // CASE 2: Booking Pending
    if (status === 'pending') {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                <h3 className="text-[#A294F9] font-bold text-lg mb-4">My Booking</h3>

                <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        <AlertCircle size={16} />
                        Pending Approval
                    </span>
                </div>

                <div className="bg-[#F5EFFF] rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-4">
                        Your booking request is under review. We'll notify you once it's approved.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Room Number</p>
                            <p className="flex items-center gap-1 font-semibold">
                                <Home size={16} className="text-[#A294F9]" />
                                {booking.room_number}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Floor</p>
                            <p className="font-semibold">Floor {booking.floor_number || 1}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Move-in Date</p>
                            <p className="flex items-center gap-1 text-sm font-semibold">
                                <Calendar size={16} className="text-[#A294F9]" />
                                {new Date(booking.check_in || booking.move_in_date).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Duration</p>
                            <p className="flex items-center gap-1 text-sm font-semibold">
                                <Clock size={16} className="text-[#A294F9]" />
                                {booking.duration_unit ? `${booking.duration_value || 1} ${booking.duration_unit}` : (booking.duration_months ? `${booking.duration_months} Months` : 'N/A')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#CDC1FF]/30">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Total Amount</span>
                            <span className="flex items-center gap-1 font-bold text-gray-900">
                                ₹{parseFloat(booking.total_amount).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onCancelBooking(booking.id)}
                    className="w-full py-2.5 px-4 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold"
                >
                    Cancel Booking Request
                </button>
            </div>
        );
    }

    // CASE 3: Booking Rejected or Cancelled
    if (status === 'rejected' || status === 'cancelled' || status === 'expired') {
        const isRejected = status === 'rejected';
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                <h3 className="text-[#A294F9] font-bold text-lg mb-4">My Booking</h3>

                <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 font-medium">
                        <XCircle size={16} />
                        {isRejected ? 'Booking Rejected' : status === 'expired' ? 'Booking Expired' : 'Booking Cancelled'}
                    </span>
                </div>

                <div className="bg-red-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        {isRejected
                            ? 'Your booking request was not approved by the admin. You may browse other available rooms.'
                            : status === 'expired'
                                ? 'Your approved booking expired because payment was not completed in time.'
                                : 'Your booking was cancelled. You may browse other available rooms.'}
                    </p>
                    <div className="mt-3 pt-3 border-t border-red-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Room</span>
                            <span className="font-semibold text-gray-600">#{booking.room_number}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onBrowseRooms}
                        className="w-full py-2.5 px-4 bg-[#A294F9] text-white rounded-xl hover:bg-[#9183e8] transition-colors font-semibold"
                    >
                        Browse Available Rooms
                    </button>
                    {onDismiss && (
                        <button
                            onClick={() => onDismiss(booking.id)}
                            className="w-full py-2 px-4 text-gray-400 hover:text-gray-600 transition-colors font-bold text-xs uppercase tracking-widest"
                        >
                            Dismiss Notification
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // CASE 4: Booking Approved (Waiting for Payment)
    if (status === 'approved') {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                <h3 className="text-[#A294F9] font-bold text-lg mb-4">My Booking</h3>

                <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium">
                        <CheckCircle size={16} />
                        Approved - Waiting for Payment
                    </span>
                </div>

                <div className="bg-[#F5EFFF] rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-4 font-semibold text-center">
                        🎉 Great news! Your booking is approved. Pay now to confirm your room.
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Room</p>
                            <p className="font-bold text-gray-800">#{booking.room_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Total Due</p>
                            <p className="font-bold text-[#A294F9]">₹{parseFloat(booking.total_amount).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => typeof onPayNow === 'function' ? onPayNow(booking) : console.log('onPayNow not defined')}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#A294F9] to-[#CDC1FF] text-white rounded-xl hover:shadow-lg transition-all font-bold tracking-wide active:scale-95 flex items-center justify-center gap-2"
                    >
                        <IndianRupee size={18} />
                        PAY NOW & CONFIRM
                    </button>
                    <button
                        onClick={() => onCancelBooking(booking.id)}
                        className="w-full py-2.5 px-4 border-2 border-red-100 text-red-400 rounded-xl hover:bg-red-50 transition-colors font-semibold text-sm"
                    >
                        Cancel Booking
                    </button>
                </div>
            </div>
        );
    }

    // CASE 5: Booking Active (Already Paid)
    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <h3 className="text-gray-800 font-bold text-lg mb-4">My Booking</h3>

            <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <CheckCircle size={14} />
                    Active
                </span>
            </div>

            <div className="bg-[#F8F6FF] rounded-2xl p-6 border border-[#E5D9F2]/30">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <p className="text-[10px] text-gray-400 mb-1.5 font-black uppercase tracking-widest">Room Number</p>
                        <p className="flex items-center gap-2 font-bold text-gray-900">
                            <Home size={16} className="text-[#A294F9]" />
                            {booking.room_number}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 mb-1.5 font-black uppercase tracking-widest">Floor</p>
                        <p className="font-bold text-gray-900 text-sm">Floor {booking.floor_number || 1}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 mb-1.5 font-black uppercase tracking-widest">Move-in Date</p>
                        <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <Calendar size={16} className="text-[#A294F9]" />
                            {new Date(booking.check_in || booking.move_in_date).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 mb-1.5 font-black uppercase tracking-widest">Duration</p>
                        <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <Clock size={16} className="text-[#A294F9]" />
                            {booking.duration_unit ? `${booking.duration_value || 1} ${booking.duration_unit}` : (booking.duration_months ? `${booking.duration_months} Months` : 'N/A')}
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    <p className="text-sm font-medium text-green-600 mb-2 flex items-center justify-center gap-1">
                        <CheckCircle size={14} /> Room Assigned & Payment Verified
                    </p>
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-400 font-bold uppercase">Booking ID</span>
                        <span className="font-black text-gray-700 text-sm">#{booking.id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
