import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import LiquidEther from './LiquidEther';
import Navbar from './Navbar';
import {
  User, Home, Wrench, CreditCard, Activity,
  Clock, CheckCircle, Wallet, LogOut, ChevronRight, X,
  Megaphone, Bell, Calendar, Zap, Sparkles, BellRing, Droplets, Wind, Shield, AlertCircle
} from 'lucide-react';

// New Sub-components
import { ProfileOverview } from './ProfileOverview';
import { BookingStatus } from './BookingStatus';
import { CurrentRoomCard as RoomDetails } from './CurrentRoomCard';
import { ServicesList } from './ServicesList';
import { PaymentHistory } from './PaymentHistory';
import { ActivityTimeline } from './ActivityTimeline';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import PaymentModal from './PaymentModal';

const serviceTypes = [
  { id: 'cleaner', label: 'Cleaner', icon: Sparkles, category: 'Housekeeping' },
  { id: 'plumber', label: 'Plumber', icon: Droplets, category: 'Maintenance' },
  { id: 'electrician', label: 'Electrician', icon: Zap, category: 'Maintenance' },
  { id: 'ac_repair', label: 'AC Repair', icon: Wind, category: 'Maintenance' },
  { id: 'guard', label: 'Guard', icon: BellRing, category: 'Staff' },
  { id: 'general_maintenance', label: 'General Maintenance', icon: Wrench, category: 'Maintenance' },
];

const serviceIcons = {
  cleaner: Sparkles,
  plumber: Droplets,
  electrician: Zap,
  ac_repair: Wind,
  guard: BellRing,
  general_maintenance: Wrench,
};

const Profile = ({ user, onLogout, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(user);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showServiceRequest, setShowServiceRequest] = useState(false);
  const [showServiceDetails, setShowServiceDetails] = useState(null);

  const [requestServiceData, setRequestServiceData] = useState({
    type: 'general_maintenance',
    title: '',
    description: ''
  });
  const [submittingService, setSubmittingService] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setUserData(user);
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [userRes, bookingsRes, servicesRes, paymentsRes, activityRes] = await Promise.all([
        fetch('/api/user_current.php'),
        fetch('/api/bookings_user.php'),
        fetch('/api/services_user.php'),
        fetch('/api/payments_user.php'),
        fetch('/api/user_activity.php')
      ]);

      // Check for 401 Unauthorized - session expired
      if (userRes.status === 401 || bookingsRes.status === 401 || servicesRes.status === 401) {
        console.warn('Session expired, redirecting to login...');
        navigate('/auth');
        return;
      }

      const [userDataJson, bookingsData, servicesData, paymentsData, activityData] = await Promise.all([
        userRes.ok ? userRes.json().catch(() => ({ success: false })) : { success: false },
        bookingsRes.ok ? bookingsRes.json().catch(() => ({ success: false })) : { success: false },
        servicesRes.ok ? servicesRes.json().catch(() => ({ success: false })) : { success: false },
        paymentsRes.ok ? paymentsRes.json().catch(() => ({ success: false })) : { success: false },
        activityRes.ok ? activityRes.json().catch(() => ({ success: false })) : { success: false }
      ]);

      if (userDataJson.success) setUserData(userDataJson.user);
      if (bookingsData.success) setBookings(bookingsData.bookings || []);
      if (servicesData.success) setServices(servicesData.requests || []);
      if (paymentsData.success) setPayments(paymentsData.payments || []);
      if (activityData.success) setActivities(activityData.activities || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper for safe JSON parsing
  const noticesDataRes = async (res) => { try { return await res.json(); } catch (e) { return { success: false }; } };
  const activityDataRes = async (res) => { try { return await res.json(); } catch (e) { return { success: false }; } };

  const activeBooking = useMemo(() => {
    // Only consider non-terminal bookings OR terminal ones that haven't been archived
    const relevant = bookings.filter(b =>
      ['Active', 'Approved', 'Pending', 'Rejected', 'Cancelled', 'Expired'].includes(b.status)
    );
    const order = { 'Active': 0, 'Approved': 1, 'Pending': 2, 'Rejected': 3, 'Cancelled': 4, 'Expired': 5 };
    const sorted = [...relevant].sort((a, b) =>
      (order[a.status] ?? 99) - (order[b.status] ?? 99)
    );
    return sorted[0] || null;
  }, [bookings]);

  const handleDismissBooking = async (id) => {
    try {
      const res = await fetch('/api/booking_dismiss.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id })
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage('Notification dismissed.');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isResident = userData?.is_resident === 1;
  const hasApprovedOrActive = useMemo(() => {
    return (bookings || []).some(b => {
      const s = b.status?.toLowerCase();
      return s === 'approved' || s === 'active';
    });
  }, [bookings]);

  const canAccessPayments = isResident || hasApprovedOrActive;

  // Stats
  const stats = useMemo(() => ([
    { icon: Wrench, label: 'Total Services', value: services.length, color: '#A294F9' },
    { icon: Clock, label: 'Pending', value: services.filter(s => s.status === 'Pending').length, color: '#f59e0b' },
    { icon: CheckCircle, label: 'Completed', value: services.filter(s => s.status === 'Completed').length, color: '#22c55e' },
    {
      icon: Wallet,
      label: 'Monthly Rent',
      value: activeBooking ? `₹${parseFloat(activeBooking.total_amount / (activeBooking.duration_value || 6)).toLocaleString()}` : '₹0',
      color: '#A294F9'
    }
  ]), [services, activeBooking]);

  const handleUpdateProfile = async (data) => {
    try {
      const res = await fetch('/api/user_update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (json.user) {
          if (setUser) setUser(json.user);
          setUserData(json.user);
        }
        fetchDashboardData();
        return true;
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      throw err;
    }
  };

  const handleUpdatePassword = async (data) => {
    try {
      const res = await fetch('/api/user_update_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        return true;
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      throw err;
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch('/api/booking_cancel.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Booking cancelled successfully.' });
        fetchDashboardData();
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePayNow = (booking) => {
    setShowPaymentModal(true);
  };

  const handleCancelService = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this service request?')) return;
    try {
      const res = await fetch('/api/service_status_update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Cancelled' })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Service request cancelled.' });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitServiceRequest = async (e) => {
    e.preventDefault();
    setSubmittingService(true);
    try {
      const res = await fetch('/api/service_create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: requestServiceData.type,
          title: requestServiceData.title,
          description: requestServiceData.description
        })
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage('Request submitted!');
        setShowServiceRequest(false);
        setRequestServiceData({ type: 'general_maintenance', title: '', description: '' });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingService(false);
    }
  };

  const setSuccessMessage = (text) => {
    setMessage({ type: 'success', text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50">
        <LiquidEther />
        <div className="relative z-10">
          <div className="pt-24 text-center px-6">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-[#A294F9]/20 border-t-[#A294F9] rounded-full animate-spin"></div>
              <div>
                <h2 className="text-2xl font-black text-[#A294F9] mb-2 tracking-tighter">PREPARING DASHBOARD</h2>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Building your NexStay experience...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'booking', label: 'Booking', icon: Home },
    { id: 'services', label: 'Services', icon: Wrench, disabled: !isResident },
    { id: 'payments', label: 'Payments', icon: CreditCard, disabled: !canAccessPayments },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F5EFFF] via-[#E5D9F2] to-[#CDC1FF]/40">
      <LiquidEther />

      <div className="relative z-10">
        <main className="pt-8 pb-20 px-6 max-w-7xl mx-auto">

          {/* Success/Error Message Toast */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 mb-8 border backdrop-blur-md z-50 sticky top-24 ${message.type === 'success'
                  ? 'bg-green-50/80 text-green-700 border-green-200'
                  : 'bg-red-50/80 text-red-700 border-red-200'
                  }`}
              >
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <p className="font-bold">{message.text}</p>
                <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto p-1 hover:bg-black/5 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 p-1.5 rounded-3xl mb-12 flex gap-1 overflow-x-auto scrollbar-hide sticky top-24 z-20 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all whitespace-nowrap font-bold text-sm ${isActive
                    ? 'bg-[#A294F9] text-white shadow-lg shadow-[#A294F9]/20 scale-[1.02]'
                    : isDisabled
                      ? 'text-gray-400 opacity-50 cursor-not-allowed grayscale'
                      : 'text-gray-600 hover:bg-white/60 hover:text-[#A294F9]'
                    }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {isDisabled && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-200 text-gray-500 font-black">
                      RESIDENTS ONLY
                    </span>
                  )}
                </button>
              );
            })}
          </div>



          {/* Tab Content */}
          <div className="space-y-8 min-h-[500px]">

            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <ProfileOverview
                    user={userData}
                    activeBooking={activeBooking}
                    onEditProfile={() => setShowEditProfile(true)}
                    onChangePassword={() => setShowChangePassword(true)}
                    onViewActivity={() => setActiveTab('activity')}
                  />
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <BookingStatus
                    booking={activeBooking}
                    onBrowseRooms={() => navigate('/rooms')}
                    onCancelBooking={handleCancelBooking}
                    onPayNow={handlePayNow}
                    onBookAnother={() => navigate('/rooms')}
                    onDismiss={handleDismissBooking}
                  />
                  {activeBooking && activeBooking.status === 'Active' && (
                    <RoomDetails room={activeBooking} isResident={isResident} />
                  )}
                </div>
              </div>
            )}

            {/* Tab: Booking */}
            {activeTab === 'booking' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <BookingStatus
                    booking={activeBooking}
                    onBrowseRooms={() => navigate('/rooms')}
                    onCancelBooking={handleCancelBooking}
                    onPayNow={handlePayNow}
                    onBookAnother={() => navigate('/rooms')}
                    onDismiss={handleDismissBooking}
                  />
                  <div className="bg-white/60 p-6 rounded-3xl border border-white/60">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar size={20} className="text-[#A294F9]" />
                      Plan Your Stay
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 font-medium">
                      Manage your future bookings, check-in dates, and duration. Our flexible monthly plans allow you to extend your stay at any time.
                    </p>
                    <button
                      onClick={() => navigate('/rooms')}
                      className="w-full py-4 bg-white/80 border border-[#CDC1FF] rounded-2xl font-bold text-[#A294F9] hover:bg-[#A294F9] hover:text-white transition-all shadow-sm"
                    >
                      Explore Available Rooms
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  {activeBooking ? (
                    <RoomDetails room={activeBooking} isResident={isResident} />
                  ) : (
                    <div className="bg-[#A294F9]/10 p-12 rounded-3xl border-2 border-[#A294F9]/20 border-dashed text-center">
                      <Home size={48} className="text-[#A294F9]/40 mx-auto mb-4" />
                      <p className="text-[#A294F9] font-bold text-sm">No Active Room Assigned</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Services */}
            {activeTab === 'services' && isResident && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  {activeBooking && activeBooking.status === 'Active' && <RoomDetails room={activeBooking} isResident={isResident} />}
                  <div className="mt-8 bg-gradient-to-br from-[#A294F9] to-[#CDC1FF] p-6 rounded-3xl text-white shadow-lg">
                    <Sparkles size={32} className="mb-4 text-white/40" />
                    <h4 className="font-black text-xl mb-2">PREMIUM SERVICES</h4>
                    <p className="text-sm font-medium text-white/80 mb-6">Need something else? Our staff is available 24/7 for your comfort.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-xs font-bold"><CheckCircle size={14} /> On-demand Cleaning</li>
                      <li className="flex items-center gap-2 text-xs font-bold"><CheckCircle size={14} /> Rapid Maintenance</li>
                      <li className="flex items-center gap-2 text-xs font-bold"><CheckCircle size={14} /> Secure Parcel Pickup</li>
                    </ul>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <ServicesList
                    services={services}
                    isResident={isResident}
                    onCancelService={handleCancelService}
                    onViewDetails={(s) => setShowServiceDetails(s)}
                    onRequestService={() => setShowServiceRequest(true)}
                  />
                </div>
              </div>
            )}

            {/* Tab: Payments */}
            {activeTab === 'payments' && canAccessPayments && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <PaymentHistory payments={payments} activeBooking={activeBooking} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-white/60 shadow-lg text-center">
                    <CreditCard size={48} className="text-[#A294F9] mx-auto mb-4" />
                    <h4 className="font-black text-xl text-gray-900 mb-2">PAY RENT</h4>
                    <p className="text-sm text-gray-500 font-medium mb-8">Quick and secure payments using UPI, Card, or Netbanking.</p>
                    <button
                      onClick={() => activeBooking && setShowPaymentModal(true)}
                      disabled={!activeBooking}
                      className="w-full py-4 bg-[#A294F9] text-white rounded-2xl font-black shadow-lg shadow-[#A294F9]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      {activeBooking ? 'PAY NOW' : 'NO ACTIVE RENT'}
                    </button>
                  </div>

                  {activeBooking && (
                    <div className="bg-green-50/50 p-6 rounded-3xl border border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield size={24} className="text-green-600" />
                        <h4 className="font-bold text-green-800">Payment Security</h4>
                      </div>
                      <p className="text-xs text-green-700 font-medium italic">
                        All transactions are encrypted and processed through secure banking gateways. NexStay never stores your full card details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Activity */}
            {activeTab === 'activity' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ActivityTimeline activities={activities} />
                <div className="space-y-8">
                  <div className="bg-[#A294F9] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                    <Activity size={40} className="mb-4 text-white/50" />
                    <h4 className="text-2xl font-black mb-2 tracking-tighter">LIVE MONITORING</h4>
                    <p className="text-white/80 font-medium text-sm">Stay updated with every movement in your account. Real-time logs for security and transparency.</p>
                  </div>
                  <PaymentHistory payments={payments.slice(0, 3)} activeBooking={activeBooking} />
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* MODALS */}
      <EditProfileModal
        user={userData}
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleUpdateProfile}
      />

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSave={handleUpdatePassword}
      />

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={activeBooking}
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchDashboardData();
            setSuccessMessage('Payment successful!');
          }}
        />
      )}

      {/* Service Request Modal */}
      <AnimatePresence>
        {showServiceRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20"
            >
              <div className="p-10 border-b border-[#E5D9F2] bg-[#F5EFFF]/30 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-[#A294F9] tracking-tighter uppercase">New Request</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Maintenance & Service Hub</p>
                </div>
                <button onClick={() => setShowServiceRequest(false)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white text-gray-500 hover:text-red-500 shadow-sm transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={submitServiceRequest} className="p-10 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Service Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {serviceTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setRequestServiceData({ ...requestServiceData, type: type.id })}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${requestServiceData.type === type.id
                          ? 'border-[#A294F9] bg-[#A294F9]/5 text-[#A294F9] scale-[1.02]'
                          : 'border-gray-100 hover:border-violet-200 text-gray-600'
                          }`}
                      >
                        <type.icon size={18} />
                        <span className="text-xs font-bold">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Short Title</label>
                  <input
                    type="text"
                    required
                    value={requestServiceData.title}
                    onChange={(e) => setRequestServiceData({ ...requestServiceData, title: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A294F9] transition-all text-sm font-bold placeholder:text-gray-300"
                    placeholder="e.g., Bedroom Fan making noise"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    value={requestServiceData.description}
                    onChange={(e) => setRequestServiceData({ ...requestServiceData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A294F9] transition-all text-sm font-bold resize-none placeholder:text-gray-300"
                    placeholder="Provide more context so our staff can help faster..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowServiceRequest(false)}
                    className="flex-1 py-5 border-2 border-gray-100 text-gray-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingService}
                    className="flex-[2] py-5 bg-gradient-to-r from-[#A294F9] to-[#CDC1FF] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#A294F9]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {submittingService ? 'Processing...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Details Modal */}
      <AnimatePresence>
        {showServiceDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 border-b border-[#E5D9F2] bg-gray-50 flex items-center justify-between">
                <h3 className="font-black text-[#A294F9] uppercase tracking-tighter">Request Details</h3>
                <button onClick={() => setShowServiceDetails(null)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A294F9]/20 to-[#CDC1FF]/10 flex items-center justify-center">
                    {(() => {
                      const Icon = serviceIcons[showServiceDetails.service_type?.toLowerCase()] || Wrench;
                      return <Icon className="text-[#A294F9]" size={24} />;
                    })()}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 leading-none mb-2 capitalize">{showServiceDetails.service_type?.replace('_', ' ')}</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${showServiceDetails.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                      {showServiceDetails.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</p>
                    <p className="text-sm font-black text-gray-800">{showServiceDetails.title || 'Service Request'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                    <p className="text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-2xl italic">{showServiceDetails.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created</p>
                      <p className="text-xs font-bold text-gray-600">{new Date(showServiceDetails.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Request ID</p>
                      <p className="text-xs font-bold text-gray-600">#SRV-{showServiceDetails.id}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowServiceDetails(null)}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
