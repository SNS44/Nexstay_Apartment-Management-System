import { useState } from 'react';

import { Calendar, Check, X, Eye, Filter, Clock, MapPin, CreditCard, Loader } from 'lucide-react';

import { useData } from '../../context/DataContext';



export function BookingsManagement() {

    const { bookings, refreshAll, loading } = useData();

    const [selectedStatus, setSelectedStatus] = useState('all');

    const [selectedFloor, setSelectedFloor] = useState('all');

    const [actionLoading, setActionLoading] = useState(null);



    const filteredBookings = (bookings || []).filter(booking => {
        const status = (booking.status || 'pending').toLowerCase();
        const floor = booking.floor_number || booking.floor || 0;

        if (selectedStatus !== 'all' && status !== selectedStatus.toLowerCase()) return false;
        if (selectedFloor !== 'all' && parseInt(floor) !== parseInt(selectedFloor)) return false;
        return true;
    });



    const getStatusCounts = () => {
        const counts = { pending: 0, approved: 0, rejected: 0, total: (bookings || []).length };
        (bookings || []).forEach(b => {
            const s = (b.status || 'pending').toLowerCase();
            if (counts[s] !== undefined) counts[s]++;
        });
        return counts;
    };



    const statusCounts = getStatusCounts();



    const handleAction = async (id, action) => {

        const actionText = action === 'approve' ? 'approve' : 'reject';
        if (window.confirm(`Are you sure you want to ${actionText} this booking?`)) {

            setActionLoading(id);

            try {

                // Use booking_approve.php for approve/reject actions
                const res = await fetch('/api/booking_approve.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        booking_id: id,
                        action: action
                    })
                });

                const data = await res.json();

                if (!data.success) {
                    throw new Error(data.message || 'Action failed');
                }

                alert(data.message || `Booking ${actionText}d successfully`);
                refreshAll(); // Full site refresh

            } catch (err) {

                alert(err.message);

            } finally {

                setActionLoading(null);

            }

        }

    };



    const handleVerifyPayment = async (bookingId) => {

        if (window.confirm('Verify this payment and activate the booking?')) {

            setActionLoading(bookingId);

            try {

                const res = await fetch('/api/payment_verify.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ booking_id: bookingId })
                });

                const data = await res.json();

                if (!data.success) {
                    throw new Error(data.message || 'Verification failed');
                }

                alert('Payment verified! Booking is now active.');
                refreshAll();

            } catch (err) {

                alert(err.message);

            } finally {

                setActionLoading(null);

            }

        }

    };



    const getStatusColor = (status) => {

        switch (status) {

            case 'pending':

                return 'bg-orange-100 text-orange-700 border-orange-200';

            case 'approved':

                return 'bg-green-100 text-green-700 border-green-200';

            case 'rejected':

                return 'bg-red-100 text-red-700 border-red-200';

            case 'cancelled':

                return 'bg-gray-100 text-gray-700 border-gray-200';

            case 'completed':

                return 'bg-blue-100 text-blue-700 border-blue-200';

            default:

                return 'bg-gray-100 text-gray-700';

        }

    };



    const formatDate = (dateString) => {

        if (!dateString) return 'N/A';

        return new Date(dateString).toLocaleDateString();

    };



    if (loading && bookings.length === 0) {

        return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

    }



    return (

        <div className="space-y-6">

            {/* Stats Overview */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-violet-600 text-sm">Pending Approval</p>

                            <h3 className="text-violet-900 mt-1">{statusCounts.pending}</h3>

                        </div>

                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">

                            <Clock className="w-5 h-5 text-white" />

                        </div>

                    </div>

                </div>



                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-violet-600 text-sm">Approved</p>

                            <h3 className="text-violet-900 mt-1">{statusCounts.approved}</h3>

                        </div>

                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">

                            <Check className="w-5 h-5 text-white" />

                        </div>

                    </div>

                </div>



                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-violet-600 text-sm">Rejected</p>

                            <h3 className="text-violet-900 mt-1">{statusCounts.rejected}</h3>

                        </div>

                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">

                            <X className="w-5 h-5 text-white" />

                        </div>

                    </div>

                </div>



                <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-violet-600 text-sm">Total Bookings</p>

                            <h3 className="text-violet-900 mt-1">{statusCounts.total}</h3>

                        </div>

                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">

                            <Calendar className="w-5 h-5 text-white" />

                        </div>

                    </div>

                </div>

            </div>



            {/* Filters */}

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 border border-violet-200/50 shadow-lg">

                <div className="flex gap-4 items-center flex-wrap">

                    <Filter className="w-5 h-5 text-violet-600" />



                    <select

                        value={selectedStatus}

                        onChange={(e) => setSelectedStatus(e.target.value)}

                        className="px-4 py-2 bg-white/50 border border-violet-200/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"

                    >

                        <option value="all">All Status (Active)</option>

                        <option value="pending">Pending</option>

                        <option value="approved">Approved</option>

                        <option value="rejected">Rejected</option>

                        <option value="archived">Archived (Dismissed)</option>

                        <option value="cancelled">Cancelled</option>

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



                    <div className="ml-auto text-sm text-violet-600">

                        Showing {filteredBookings.length} of {bookings.length} bookings

                    </div>

                </div>

            </div>



            {/* Bookings List */}

            <div className="space-y-4">

                {filteredBookings.length === 0 && (

                    <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-12 border border-violet-200/50 shadow-lg text-center">

                        <Calendar className="w-12 h-12 text-violet-400 mx-auto mb-4" />

                        <p className="text-violet-600">No bookings found matching filters.</p>

                    </div>

                )}



                {filteredBookings.map((booking) => (

                    <div

                        key={booking.id}

                        className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 shadow-lg hover:shadow-xl transition-shadow"

                    >

                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">

                            <div className="flex items-start gap-4">

                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">

                                    <Calendar className="w-6 h-6 text-white" />

                                </div>

                                <div>

                                    <div className="flex items-center gap-3 mb-1 flex-wrap">

                                        <h4 className="text-violet-900 font-bold">{booking.user_name || booking.residentName || 'Unknown User'}</h4>

                                        <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${getStatusColor(booking.status)}`}>

                                            {(booking.status || 'pending').toUpperCase()}

                                        </span>

                                    </div>

                                    <p className="text-violet-600 text-sm">{booking.user_email || 'No Email'}</p>

                                </div>

                            </div>



                            {((booking.status || '').toLowerCase() === 'pending') && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(booking.id, 'approve')}
                                        disabled={actionLoading === booking.id}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(booking.id, 'reject')}
                                        disabled={actionLoading === booking.id}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            )}

                            {((booking.status || '').toLowerCase() === 'approved') && (

                                <div className="flex gap-2">

                                    <button

                                        onClick={() => handleVerifyPayment(booking.id)}

                                        disabled={actionLoading === booking.id}

                                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"

                                    >

                                        <CreditCard className="w-4 h-4" />

                                        Verify Payment & Activate

                                    </button>

                                </div>

                            )}

                        </div>



                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

                            <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">

                                <MapPin className="w-4 h-4 text-violet-600" />

                                <div>

                                    <p className="text-violet-600 text-xs">Room</p>

                                    <p className="text-violet-900 text-sm font-semibold">{booking.room_number || 'N/A'}</p>

                                </div>

                            </div>



                            <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">

                                <Calendar className="w-4 h-4 text-violet-600" />

                                <div>

                                    <p className="text-violet-600 text-xs">Duration</p>

                                    <p className="text-violet-900 text-sm font-semibold">{booking.duration || 1} {booking.duration_unit || 'month'}</p>

                                </div>

                            </div>



                            <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">

                                <Clock className="w-4 h-4 text-violet-600" />

                                <div>

                                    <p className="text-violet-600 text-xs">Check-in</p>
                                    <p className="text-violet-900 text-sm font-semibold">{formatDate(booking.check_in || booking.check_in_date || booking.startDate)}</p>

                                </div>

                            </div>



                            <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">

                                <Clock className="w-4 h-4 text-violet-600" />

                                <div>

                                    <p className="text-violet-600 text-xs">Check-out</p>
                                    <p className="text-violet-900 text-sm font-semibold">{formatDate(booking.check_out || booking.check_out_date || booking.endDate)}</p>

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

