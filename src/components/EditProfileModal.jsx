import React, { useState } from 'react';
import { X, Upload, User, Phone, IdCard, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function EditProfileModal({ user, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto pt-28">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#F5EFFF] rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden relative z-10 border border-white"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-[#E5D9F2] bg-white/40">
                            <h3 className="text-2xl font-black text-[#A294F9]">Edit Profile</h3>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-2xl hover:bg-white flex items-center justify-center transition-all text-[#A294F9] shadow-sm bg-white/50"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form Wrapper for Scroll */}
                        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Avatar Display */}
                                <div className="flex flex-col items-center mb-10">
                                    <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-[#CDC1FF] to-[#A294F9] flex items-center justify-center text-white shadow-xl border-4 border-white">
                                        <User size={48} />
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-widest mb-2 px-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CDC1FF]">
                                                <IdCard size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5D9F2] rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#CDC1FF]/20 focus:border-[#A294F9] transition-all text-gray-900 font-bold placeholder:text-gray-300"
                                                placeholder="Your beautiful name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email (Read-only) */}
                                    <div>
                                        <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-widest mb-2 px-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="w-full px-6 py-4 bg-[#E5D9F2]/30 border border-[#E5D9F2] rounded-[1.25rem] text-[#A294F9] cursor-not-allowed font-bold opacity-70"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-[10px] font-black text-[#A294F9] uppercase tracking-widest mb-2 px-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CDC1FF]">
                                                <Phone size={20} />
                                            </div>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5D9F2] rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#CDC1FF]/20 focus:border-[#A294F9] transition-all text-gray-900 font-bold placeholder:text-gray-300"
                                                placeholder="+91 00000 00000"
                                                required
                                            />
                                        </div>
                                    </div>


                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-4 px-4 bg-white text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-black border border-[#E5D9F2]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-4 px-4 bg-gradient-to-r from-[#A294F9] to-[#CDC1FF] text-white rounded-2xl hover:shadow-2xl hover:scale-[1.05] active:scale-95 transition-all font-black shadow-lg shadow-[#A294F9]/20"
                                    >
                                        {submitting ? 'Updating...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
