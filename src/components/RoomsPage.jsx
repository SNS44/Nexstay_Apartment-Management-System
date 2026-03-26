import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { AlertTriangle, Calendar, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Wifi, Zap, Shield, Wind, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import roomImage from '../assets/Room.png';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseISODate(iso) {
  // Force local midnight to avoid timezone drift
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDaysISO(iso, days) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function addMonthsISO(iso, months) {
  const d = parseISODate(iso);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

function diffDays(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const ms = end.getTime() - start.getTime();
  return Math.max(Math.round(ms / (1000 * 60 * 60 * 24)), 0);
}

function rangeOverlapsDaysSet(startISO, endISO, daysSet) {
  if (!startISO || !endISO) return false;
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    if (daysSet.has(toISODate(d))) return true;
  }
  return false;
}

function BookingCalendar({ value, onChange, hardDays, softDays }) {
  const todayISO = toISODate(new Date());
  const initialMonth = value ? parseISODate(value) : new Date();
  const [cursorMonth, setCursorMonth] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));

  useEffect(() => {
    if (!value) return;
    const v = parseISODate(value);
    setCursorMonth(new Date(v.getFullYear(), v.getMonth(), 1));
  }, [value]);

  const monthLabel = cursorMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const year = cursorMonth.getFullYear();
  const month = cursorMonth.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDow = first.getDay(); // 0 Sun .. 6 Sat
  const daysInMonth = last.getDate();

  const cells = [];
  // leading blanks
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  // pad to full weeks (up to 42 cells)
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setCursorMonth(new Date(year, month - 1, 1))}
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-700"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-semibold text-gray-800">{monthLabel}</div>
        <button
          type="button"
          onClick={() => setCursorMonth(new Date(year, month + 1, 1))}
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-700"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 px-3 py-3">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-[11px] font-semibold text-gray-500 text-center py-1">
            {d}
          </div>
        ))}

        {cells.map((d, idx) => {
          if (!d) return <div key={idx} className="h-9" />;
          const iso = toISODate(d);
          const isPast = iso < todayISO;
          const isHard = hardDays.has(iso);
          const isSoft = softDays.has(iso);
          const isSelected = value === iso;

          const disabled = isPast || isHard;
          const title = isHard
            ? 'Unavailable – booking already exists'
            : isSoft
              ? 'Pending request exists (you can view, but cannot confirm overlapping dates)'
              : undefined;

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              title={title}
              onClick={() => onChange?.(iso)}
              className={[
                'h-9 w-full rounded-xl text-sm font-medium transition-all',
                disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-violet-50',
                isSelected ? 'bg-violet-600 text-white hover:bg-violet-600' : '',
                (!isSelected && isSoft) ? 'ring-2 ring-amber-300' : '',
              ].join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoomsPage({ user }) {
  const location = useLocation();
  const { roomsByFloor, loading, stats, refreshAll } = useData();
  const [bookingRoom, setBookingRoom] = useState(null);
  const [durationType, setDurationType] = useState('short'); // short | long
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [shortUnit, setShortUnit] = useState('days'); // days | weeks
  const [shortValue, setShortValue] = useState(7);
  const [longMonths, setLongMonths] = useState(6);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityBookings, setAvailabilityBookings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');

  // Simple Filter State
  const [floorFilter, setFloorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Available amenities
  const amenities = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'power', label: 'Power Backup', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'ac', label: 'AC', icon: Wind },
  ];

  // Get floor options with room counts
  const floorOptions = useMemo(() => {
    if (!roomsByFloor || Object.keys(roomsByFloor).length === 0) return [];
    return Object.keys(roomsByFloor)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(floor => ({
        value: floor,
        label: `Floor ${floor}`,
        count: roomsByFloor[floor].length
      }));
  }, [roomsByFloor]);

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'booked', label: 'Booked' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'cleaning', label: 'Cleaning' },
  ];

  const openBooking = (room) => {
    if (!user) {
      setFeedback('Please login or register to request a booking.');
      return;
    }

    setBookingRoom(room);
    setFeedback(null);
    setDurationType('short');
    setStartDate('');
    setShortUnit('days');
    setShortValue(7);
    setLongMonths(6);
    setAvailabilityBookings([]);
    setSelectedPaymentMethod('UPI');
  };

  useEffect(() => {
    if (location.state?.openBooking && roomsByFloor) {
      // Small delay to ensure data is processed
      const timer = setTimeout(() => {
        for (const floor in roomsByFloor) {
          const room = roomsByFloor[floor].find(r => r.id === location.state.openBooking);
          if (room) {
            openBooking(room);
            // Clear location state to prevent reopening on refresh
            window.history.replaceState({}, document.title);
            break;
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state, roomsByFloor]);

  // Scroll to top of form when feedback changes
  useEffect(() => {
    if (feedback) {
      const formContainer = document.getElementById('booking-form-container');
      if (formContainer) {
        formContainer.scrollTop = 0;
      }
    }
  }, [feedback]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!bookingRoom) return;
      setAvailabilityLoading(true);
      try {
        const res = await fetch(`/api/room_availability.php?room_id=${bookingRoom.id}`);

        // Check for authentication errors
        if (res.status === 401) {
          console.warn('Session expired while loading availability');
          setAvailabilityBookings([]);
          return;
        }

        // Only try to parse JSON if response is OK
        if (!res.ok) {
          console.warn('Failed to load availability:', res.status);
          setAvailabilityBookings([]);
          return;
        }

        const json = await res.json().catch(() => ({ success: false }));
        if (!json.success) {
          console.warn('Availability API returned error:', json.message);
          setAvailabilityBookings([]);
          return;
        }

        setAvailabilityBookings(Array.isArray(json.bookings) ? json.bookings : []);
      } catch (e) {
        console.error('Error loading availability:', e);
        // Non-fatal: booking can still be attempted; backend will enforce overlap rules.
        setAvailabilityBookings([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    loadAvailability();
  }, [bookingRoom]);

  const hardDays = useMemo(() => {
    const s = new Set();
    availabilityBookings.forEach((b) => {
      const status = String(b.status || '').toLowerCase();
      if (status === 'pending') return;
      const start = String(b.start || '');
      const end = String(b.end || '');
      if (!start || !end) return;
      const startDt = parseISODate(start);
      const endDt = parseISODate(end);
      for (let d = new Date(startDt); d < endDt; d.setDate(d.getDate() + 1)) {
        s.add(toISODate(d));
      }
    });
    return s;
  }, [availabilityBookings]);

  const softDays = useMemo(() => {
    const s = new Set();
    availabilityBookings.forEach((b) => {
      const status = String(b.status || '').toLowerCase();
      if (status !== 'pending') return;
      const start = String(b.start || '');
      const end = String(b.end || '');
      if (!start || !end) return;
      const startDt = parseISODate(start);
      const endDt = parseISODate(end);
      for (let d = new Date(startDt); d < endDt; d.setDate(d.getDate() + 1)) {
        s.add(toISODate(d));
      }
    });
    return s;
  }, [availabilityBookings]);

  const bookingCalc = useMemo(() => {
    if (!bookingRoom || !startDate) return null;

    const monthlyRate = parseFloat(bookingRoom.base_price_per_night || 0);
    const dailyRate = monthlyRate / 30;

    let durationUnit = 'days';
    let durationValue = 1;
    let durationLabel = '';

    if (durationType === 'short') {
      durationUnit = shortUnit;
      durationValue = Math.max(1, parseInt(shortValue, 10) || 1);
      durationLabel = durationUnit === 'weeks'
        ? `${durationValue} ${durationValue === 1 ? 'Week' : 'Weeks'}`
        : `${durationValue} ${durationValue === 1 ? 'Day' : 'Days'}`;
    } else {
      durationUnit = 'months';
      durationValue = Math.max(1, parseInt(longMonths, 10) || 1);
      durationLabel = `${durationValue} ${durationValue === 1 ? 'Month' : 'Months'}`;
    }

    const endDate = durationUnit === 'months'
      ? addMonthsISO(startDate, durationValue)
      : addDaysISO(startDate, durationUnit === 'weeks' ? durationValue * 7 : durationValue);

    const days = diffDays(startDate, endDate);
    const estimatedTotal = durationUnit === 'months'
      ? durationValue * monthlyRate
      : days * dailyRate;

    const overlapsHard = rangeOverlapsDaysSet(startDate, endDate, hardDays);
    const overlapsSoft = rangeOverlapsDaysSet(startDate, endDate, softDays);

    return {
      durationType,
      durationUnit,
      durationValue,
      durationLabel,
      startDate,
      endDate,
      days,
      monthlyRate,
      dailyRate,
      estimatedTotal,
      overlapsHard,
      overlapsSoft,
    };
  }, [bookingRoom, durationType, startDate, shortUnit, shortValue, longMonths, hardDays, softDays]);

  const submitBooking = async (e) => {
    e.preventDefault();

    if (!bookingRoom) {
      setFeedback('Please select a room first.');
      return;
    }

    if (!startDate) {
      setFeedback('Please select an arrival date.');
      // Scroll to top of form to show the date selector
      const formContainer = e.target.closest('.overflow-y-auto');
      if (formContainer) formContainer.scrollTop = 0;
      return;
    }

    if (!bookingCalc) {
      setFeedback('Please complete the booking details.');
      return;
    }

    if (bookingCalc.overlapsHard) {
      setFeedback('Selected dates overlap with confirmed bookings. Please choose different dates.');
      return;
    }

    if (bookingCalc.overlapsSoft) {
      setFeedback('Selected dates overlap with pending requests. Please choose different dates or wait for admin review.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData(e.target);
      const bookingData = {
        room_id: bookingRoom.id,
        start_date: bookingCalc.startDate,
        duration_months: bookingCalc.durationValue,
        duration_unit: bookingCalc.durationUnit,
        payment_method: formData.get('payment_method') || 'UPI',
        contact_phone: formData.get('contact_phone')
      };


      const res = await fetch('/api/booking_create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      // Check for authentication errors
      if (res.status === 401) {
        setFeedback('Your session has expired. Please log in again.');
        setTimeout(() => window.location.href = '/auth', 2000);
        return;
      }

      // Check if response is OK before parsing
      if (!res.ok) {
        let errorMsg = `Server error: ${res.status}`;
        try {
          const errorData = await res.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {
          // Fallback to generic status if not JSON
        }
        throw new Error(errorMsg);
      }

      const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));

      if (data.success) {
        setBookingRoom(null);
        setFeedback('Booking request sent. Waiting for admin approval.');
        if (refreshAll) await refreshAll();
      } else {
        throw new Error(data.message || 'Unable to create booking');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setFeedback(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-clear success messages
  useEffect(() => {
    if (feedback && (feedback.includes('sent') || feedback.includes('Waiting') || feedback.includes('successfully'))) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Filter Logic
  const filteredRoomsByFloor = useMemo(() => {
    if (!roomsByFloor || Object.keys(roomsByFloor).length === 0) return {};
    const filtered = {};

    Object.entries(roomsByFloor).forEach(([floor, rooms]) => {
      // Floor filter
      if (floorFilter !== 'all' && parseInt(floor) !== parseInt(floorFilter)) {
        return;
      }

      const matchingRooms = rooms.filter(room => {
        // Status filter
        const roomStatus = (room.status || '').toLowerCase();
        const matchesStatus = statusFilter === 'all' || roomStatus === statusFilter.toLowerCase();

        return matchesStatus;
      });

      if (matchingRooms.length > 0) {
        filtered[floor] = matchingRooms;
      }
    });
    return filtered;
  }, [roomsByFloor, floorFilter, statusFilter]);

  if (loading) {
    return (
      <section className="ns-section ns-container min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p className="ns-body-sm text-violet-600">Loading premium rooms...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="ns-section ns-container min-h-screen bg-gradient-to-br from-[#F5EFFF] via-[#E5D9F2] to-[#CDC1FF] pt-8 pb-12">

      {/* Page Header */}
      <header className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-4"
        >
          Our Luxurious Rooms
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-serif text-gray-600 max-w-2xl mx-auto"
        >
          Discover your perfect sanctuary with our curated selection of premium accommodations
        </motion.p>
      </header>

      {/* Simple Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 max-w-4xl mx-auto"
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-[20px] p-5 shadow-lg border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Floor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Floor</label>
              <div className="relative">
                <select
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-[16px] bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm font-medium text-gray-700 appearance-none cursor-pointer transition-all hover:border-violet-300"
                >
                  <option value="all">All Floors</option>
                  {floorOptions.map(floor => (
                    <option key={floor.value} value={floor.value}>
                      {floor.label} ({floor.count} {floor.count === 1 ? 'Room' : 'Rooms'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-[16px] bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm font-medium text-gray-700 appearance-none cursor-pointer transition-all hover:border-violet-300"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Floating Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100001] w-full max-w-md px-4"
          >
            <div className={`p-5 rounded-[24px] shadow-2xl backdrop-blur-xl border ${feedback.includes('sent') || feedback.includes('Waiting') || feedback.includes('success')
              ? 'bg-white/90 border-green-200 text-green-900 shadow-green-200/50'
              : 'bg-white/90 border-red-200 text-red-900 shadow-red-200/50'
              }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${feedback.includes('sent') || feedback.includes('Waiting') || feedback.includes('success')
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
                  }`}>
                  {feedback.includes('sent') || feedback.includes('Waiting') || feedback.includes('success')
                    ? <CheckCircle size={24} />
                    : <AlertTriangle size={24} />
                  }
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-tighter mb-0.5">
                    {feedback.includes('sent') || feedback.includes('Waiting') || feedback.includes('success')
                      ? 'Request Confirmed'
                      : 'Attention Required'
                    }
                  </h4>
                  <p className="text-sm font-bold opacity-80 leading-relaxed">
                    {feedback}
                  </p>
                </div>
                <button
                  onClick={() => setFeedback(null)}
                  className="w-8 h-8 rounded-xl hover:bg-black/5 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="opacity-40" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!roomsByFloor || Object.keys(roomsByFloor).length === 0 ? (
        <div className="text-center py-20 bg-white/70 backdrop-blur-lg rounded-[24px] border border-white/50 shadow-lg">
          <p className="text-gray-500 font-medium">No rooms available at the moment.</p>
        </div>
      ) : Object.keys(filteredRoomsByFloor).length === 0 ? (
        <div className="text-center py-20 bg-white/70 backdrop-blur-lg rounded-[24px] border border-white/50 shadow-lg">
          <p className="text-gray-500 font-medium mb-4">No rooms found matching your search.</p>
          <button
            onClick={() => {
              setFloorFilter('all');
              setStatusFilter('all');
            }}
            className="text-violet-600 hover:text-violet-700 font-medium underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(filteredRoomsByFloor).map(([floor, rooms]) => (
            <motion.div
              key={floor}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {/* Floor Header */}
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#A294F9]">Floor {floor}</h3>
                  <span className="px-4 py-1 bg-[#E5D9F2] text-[#A294F9] rounded-full text-sm font-semibold border border-[#A294F9]">
                    {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
                  </span>
                </div>
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#A294F9] to-transparent rounded-full"></div>
              </div>

              {/* Room Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto">
                {rooms.map((room) => {
                  const isAvailable = (room.status || 'available').toLowerCase() === 'available';
                  return (
                    <motion.article
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -6 }}
                      className="group bg-[#F5EFFF] rounded-[20px] overflow-hidden border border-[#A294F9]/80 shadow-md hover:shadow-xl transition-all duration-300 focus-within:outline-2 focus-within:outline-[#A294F9] focus-within:outline-offset-2 flex flex-col"
                    >
                      {/* Room Image */}
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={roomImage}
                          alt={`Room ${room.room_number}`}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                        {/* Availability Badge */}
                        <span
                          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/30 text-white shadow-lg ${isAvailable ? 'bg-green-500/90' : 'bg-gray-500/90'
                            }`}
                        >
                          {room.status ? (room.status.charAt(0).toUpperCase() + room.status.slice(1).toLowerCase()) : 'Available'}
                        </span>

                        {/* Room Number Overlay */}
                        <div className="absolute bottom-4 left-4">
                          <h4 className="text-3xl font-bold text-white tracking-tight mb-1">Room {room.room_number}</h4>
                          <p className="text-white/90 text-sm">Floor {room.floor_number}</p>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex flex-col flex-1">
                        {/* Amenities Icons */}
                        <div className="flex items-center gap-2 mb-3">
                          {amenities.map((amenity) => {
                            const Icon = amenity.icon;
                            return (
                              <div
                                key={amenity.id}
                                className="relative group/amenity"
                                title={amenity.label}
                              >
                                <div className="p-1.5 rounded-lg bg-[#E5D9F2] text-[#A294F9] group-hover/amenity:bg-[#CDC1FF] group-hover/amenity:text-white transition-colors">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/amenity:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                  {amenity.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Description */}
                        <p className="text-[#A294F9] text-sm mb-4 line-clamp-2 min-h-[2.5rem] flex-1">
                          {room.description || 'Comfortable furnished room with modern amenities. Perfect for flexible monthly stays.'}
                        </p>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>

                        {/* Price Section */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-[#A294F9]">
                              ₹{parseFloat(room.base_price_per_night || 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-[#A294F9] font-medium">per month</span>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex gap-3 mt-auto">
                          <Link
                            to={`/rooms/${room.id}`}
                            className="flex-1 px-4 py-2.5 rounded-[16px] text-sm font-semibold border-2 border-[#A294F9] text-[#A294F9] hover:bg-[#E5D9F2] transition-all text-center"
                          >
                            Details
                          </Link>
                          {!user ? (
                            <button
                              onClick={() => window.location.href = '/auth'}
                              className="flex-1 px-4 py-2.5 rounded-[16px] text-sm font-semibold bg-[#A294F9] text-white hover:bg-[#CDC1FF] shadow-md hover:shadow-lg transition-all"
                            >
                              Login to Book
                            </button>
                          ) : isAvailable ? (
                            <button
                              onClick={() => openBooking(room)}
                              className="flex-1 px-4 py-3 rounded-[16px] text-base font-semibold bg-gradient-to-r from-[#A294F9] to-[#CDC1FF] text-white hover:from-[#CDC1FF] hover:to-[#E5D9F2] shadow-md hover:shadow-lg transition-all transform active:scale-95"
                            >
                              Book Room
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex-1 px-4 py-2.5 rounded-[16px] text-sm font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                            >
                              Not Available
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal - SIMPLIFIED WITHOUT ANIMATIONS */}
      {bookingRoom && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >

          {/* Backdrop - Click to close */}
          <div
            onClick={() => {
              setBookingRoom(null);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
          />

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              zIndex: 100000,
              backgroundColor: '#F5EFFF',
              borderRadius: '2.5rem',
              width: '100%',
              maxWidth: '32rem',
              maxHeight: '85vh',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(162, 148, 249, 0.3)'
            }}
          >
            {/* Sticky Header */}
            <div className="flex justify-between items-center p-8 bg-white/40 border-b border-[#E5D9F2] backdrop-blur-md">
              <div>
                <h3 className="text-3xl font-black text-[#A294F9] tracking-tight">Request Booking</h3>
                <p className="text-[#A294F9]/60 font-bold text-sm mt-1 uppercase tracking-widest">
                  Room {bookingRoom.room_number}, Floor {bookingRoom.floor_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingRoom(null)}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 text-[#A294F9] transition-all shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div
              id="booking-form-container"
              className="p-8 max-h-[70vh] custom-scrollbar"
              style={{
                overflowY: 'scroll',
                scrollBehavior: 'auto',
                position: 'relative'
              }}
            >
              {/* Feedback Message */}
              {feedback && (
                <div className={`mb-8 p-5 rounded-[24px] border-2 flex items-start gap-4 ${feedback.includes('success') || feedback.includes('sent')
                  ? 'bg-green-50/50 border-green-100 text-green-800'
                  : 'bg-red-50/50 border-red-100 text-red-800'
                  }`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${feedback.includes('success') || feedback.includes('sent')
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                    }`}>
                    {feedback.includes('success') || feedback.includes('sent') ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <p className="text-sm font-bold leading-relaxed py-2">{feedback}</p>
                </div>
              )}

              <form id="booking-form" className="space-y-6" onSubmit={submitBooking}>
                {/* Section 1: Duration Type */}
                <div>
                  <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-[0.2em] mb-4 px-1">Duration Strategy</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDurationType('short')}
                      className={`px-6 py-5 rounded-[1.5rem] text-sm font-black transition-all ${durationType === 'short'
                        ? 'bg-gradient-to-br from-[#A294F9] to-[#CDC1FF] text-white shadow-xl scale-[1.02]'
                        : 'bg-white text-[#A294F9] border border-[#E5D9F2] hover:bg-[#F5EFFF]'
                        }`}
                    >
                      Short Stay
                      <div className={`text-[10px] mt-1 font-bold ${durationType === 'short' ? 'text-white/70' : 'text-gray-400'}`}>
                        DAYS / WEEKS
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationType('long')}
                      className={`px-6 py-5 rounded-[1.5rem] text-sm font-black transition-all ${durationType === 'long'
                        ? 'bg-gradient-to-br from-[#A294F9] to-[#CDC1FF] text-white shadow-xl scale-[1.02]'
                        : 'bg-white text-[#A294F9] border border-[#E5D9F2] hover:bg-[#F5EFFF]'
                        }`}
                    >
                      Long Stay
                      <div className={`text-[10px] mt-1 font-bold ${durationType === 'long' ? 'text-white/70' : 'text-gray-400'}`}>
                        MONTHLY BASE
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section 2: Date Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-[0.2em]">Select Arrival Date</label>
                    {availabilityLoading && (
                      <span className="text-[10px] font-black text-[#CDC1FF] animate-pulse">CHECKING SLOTS...</span>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-[2rem] border border-[#E5D9F2] shadow-sm">
                    <BookingCalendar
                      value={startDate}
                      onChange={(iso) => setStartDate(iso)}
                      hardDays={hardDays}
                      softDays={softDays}
                    />
                  </div>

                  {durationType === 'short' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-widest mb-2 px-1">Unit</label>
                        <div className="relative">
                          <select
                            value={shortUnit}
                            onChange={(e) => setShortUnit(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-[#E5D9F2] rounded-2xl focus:ring-4 focus:ring-[#CDC1FF]/20 outline-none text-sm font-bold text-gray-700 appearance-none"
                          >
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A294F9] pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-widest mb-2 px-1">
                          {shortUnit === 'weeks' ? 'Weeks' : 'Days'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={shortUnit === 'weeks' ? 12 : 90}
                          value={shortValue}
                          onChange={(e) => setShortValue(e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-[#E5D9F2] rounded-2xl focus:ring-4 focus:ring-[#CDC1FF]/20 outline-none text-sm font-bold text-gray-700"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-widest mb-2 px-1">Contract Duration</label>
                      <div className="relative">
                        <select
                          value={longMonths}
                          onChange={(e) => setLongMonths(e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-[#E5D9F2] rounded-2xl focus:ring-4 focus:ring-[#CDC1FF]/20 outline-none text-sm font-bold text-gray-700 appearance-none"
                        >
                          {Array.from({ length: 24 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>
                              {m} {m === 1 ? 'Month' : 'Months'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A294F9] pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Contact Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-widest mb-2 px-1">Contact Phone</label>
                    <input
                      type="tel"
                      name="contact_phone"
                      required
                      placeholder="+91 00000 00000"
                      className="w-full px-5 py-4 bg-white border border-[#E5D9F2] rounded-2xl focus:ring-4 focus:ring-[#CDC1FF]/20 outline-none text-sm font-bold text-gray-700"
                    />
                  </div>
                </div>

                {/* Section 4: Estimate Summary */}
                {bookingCalc && (
                  <div className="bg-[#A294F9]/10 rounded-[2rem] p-6 border border-[#A294F9]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CreditCard size={64} className="text-[#A294F9]" />
                    </div>
                    <div className="relative z-10 flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-[#A294F9] uppercase tracking-widest">Est. Rental Value</p>
                        <p className="text-sm font-bold text-gray-600">{bookingCalc.durationLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#A294F9]">₹{bookingCalc.estimatedTotal.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Wait for admin to approve final amount</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`flex gap-4 ${bookingCalc ? 'pt-4' : 'pt-0'}`}>
                  <button
                    className="flex-1 py-5 bg-white text-gray-500 font-black rounded-3xl hover:bg-gray-100 transition-all border border-[#E5D9F2]"
                    type="button"
                    onClick={() => setBookingRoom(null)}
                  >
                    CANCEL
                  </button>
                  <button
                    className="flex-1 py-5 bg-gradient-to-r from-[#A294F9] to-[#CDC1FF] text-white font-black rounded-3xl shadow-[0_10px_30px_rgba(162,148,249,0.4)] hover:shadow-[0_15px_40px_rgba(162,148,249,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'SENDING REQUEST...' : 'REQUEST BOOKING'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RoomsPage;

