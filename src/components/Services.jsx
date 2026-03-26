import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import LiquidEther from './LiquidEther';
import Navbar from './Navbar';
import GlassSurface from './GlassSurface';
import {
  Wrench, Droplets, Zap, Wind, Shirt, Shield,
  User, Phone, Truck, Utensils, HardHat, Clock,
  AlertCircle, CheckCircle, Upload, X, Search
} from 'lucide-react';

const serviceTypes = [
  { id: 'cleaner', label: 'Cleaner', icon: Shirt, category: 'Housekeeping' },
  { id: 'plumber', label: 'Plumber', icon: Droplets, category: 'Maintenance' },
  { id: 'electrician', label: 'Electrician', icon: Zap, category: 'Maintenance' },
  { id: 'ac_repair', label: 'AC Repair', icon: Wind, category: 'Maintenance' },
  { id: 'guard', label: 'Guard', icon: Shield, category: 'Staff' },
  { id: 'general_maintenance', label: 'General Maintenance', icon: Wrench, category: 'Maintenance' },
];

const categories = ['All', 'Housekeeping', 'Maintenance', 'Staff'];

const Services = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [myRequests, setMyRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [access, setAccess] = useState(true);
  const [bookingStatus, setBookingStatus] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/services_user.php');
      const data = await res.json();
      if (data.success) {
        setAccess(data.access);
        setBookingStatus(data.booking_status);
        setMyRequests((data.requests || []).filter(r =>
          r.status === 'pending' || r.status === 'in_progress' || r.status === 'assigned'
        ));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleServiceClick = (service) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!access) {
      setError('You need an Active booking to request services.');
      return;
    }
    setSelectedService(service);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a title for your request');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please describe your issue');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/service_create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: selectedService.id,
          title: formData.title,
          description: formData.description,
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setError('Failed to submit request');
        return;
      }

      if (data.success) {
        setSuccess('Service request submitted successfully!');
        setFormData({ title: '', description: '' });
        fetchMyRequests();
        setTimeout(() => {
          setShowModal(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit request');
      }
    } catch (error) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = selectedCategory === 'All'
    ? serviceTypes
    : serviceTypes.filter(s => s.category === selectedCategory);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
      assigned: 'bg-blue-100 text-blue-700 border-blue-300',
      completed: 'bg-green-100 text-green-700 border-green-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50">
      <LiquidEther />
      <div className="relative z-10">
        <section className="pt-8 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-[#A294F9] text-4xl md:text-5xl font-bold mb-4">
                SERVICES
              </h1>
              <p className="text-gray-600 text-lg">
                Request maintenance, housekeeping, or staff assistance
              </p>
            </motion.div>

            {/* Locked Content Overlay if not resident */}
            {!access && (
              <motion.div
                className="bg-white/80 backdrop-blur-xl border border-white p-12 rounded-[2.5rem] shadow-2xl text-center max-w-2xl mx-auto my-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-24 h-24 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Shield size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Resident Access Only</h2>
                <div className="text-gray-600 font-medium mb-10 leading-relaxed">
                  {bookingStatus === 'Pending' ? (
                    <p>Your booking is <span className="text-amber-600 font-bold">Pending Approval</span>. Please wait for admin to review your request.</p>
                  ) : bookingStatus === 'Approved' ? (
                    <p>Your booking is <span className="text-green-600 font-bold">Approved</span>! Please <span className="text-violet-600 font-bold">Pay Now</span> in your profile to activate your residency and access services.</p>
                  ) : (
                    <p>Our premium services are exclusively available to NexStay residents.
                      Book your room today and once your booking is <span className="text-violet-600 font-bold">Approved</span> and <span className="text-violet-600 font-bold">Paid</span>,
                      you'll get full access to maintenance, housekeeping, and priority staff assistance.</p>
                  )}
                </div>
                <button
                  onClick={() => navigate(bookingStatus === 'Approved' ? '/profile' : '/rooms')}
                  className="px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {bookingStatus === 'Approved' ? 'Go to Profile to Pay' : 'Browse Available Rooms'}
                </button>
              </motion.div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${!access ? 'opacity-20 pointer-events-none grayscale blur-sm' : ''}`}>
              {/* Services Grid */}
              <div className="lg:col-span-3">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedCategory === cat
                        ? 'bg-gradient-to-r from-[#A294F9] to-[#CDC1FF] text-white'
                        : 'bg-white/60 text-gray-700 border border-gray-300 hover:border-[#A294F9]'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredServices.map((service, index) => {
                    const Icon = service.icon;
                    return (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <GlassSurface
                          className="p-6 text-center cursor-pointer hover:border-[#A294F9]/50 transition-colors"
                          onClick={() => handleServiceClick(service)}
                        >
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#A294F9]/20 to-[#CDC1FF]/10 flex items-center justify-center">
                            <Icon className="text-[#A294F9]" size={32} />
                          </div>
                          <h3 className="text-gray-900 font-semibold text-sm">
                            {service.label}
                          </h3>
                          <p className="text-gray-500 text-xs mt-1">
                            {service.category}
                          </p>
                        </GlassSurface>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Active Requests Sidebar */}
              <div className="lg:col-span-1">
                <GlassSurface className="p-6 sticky top-24">
                  <h2 className="text-[#A294F9] text-lg font-bold mb-4">
                    My Active Requests
                  </h2>
                  {!user ? (
                    <p className="text-gray-600 text-sm text-center py-4">
                      <Link to="/auth" className="text-[#A294F9] hover:underline">Login</Link> to view your requests
                    </p>
                  ) : myRequests.length > 0 ? (
                    <div className="space-y-3">
                      {myRequests.map(req => (
                        <div key={req.id} className="p-3 bg-white/50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-900 font-semibold text-sm">
                              {req.title || req.service_type?.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(req.status)}`}>
                              {req.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs line-clamp-1">
                            {req.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No active requests
                    </p>
                  )}
                </GlassSurface>
              </div>
            </div>
          </div>
        </section>

        {/* Request Modal */}
        {showModal && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <GlassSurface className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A294F9]/20 to-[#CDC1FF]/10 flex items-center justify-center">
                      {(() => {
                        const Icon = selectedService.icon || Wrench;
                        return <Icon className="text-[#A294F9]" size={24} />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-[#A294F9] text-xl font-bold">
                        Request {selectedService.label}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {selectedService.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#A294F9]"
                      placeholder="e.g., Leaking tap in bathroom"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-2">
                      Describe your issue *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#A294F9] resize-none"
                      rows={4}
                      placeholder="Please describe the issue in detail..."
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle size={16} />
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-[#A294F9] to-[#CDC1FF] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </GlassSurface>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
