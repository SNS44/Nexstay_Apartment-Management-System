import React from 'react';
import { IndianRupee, CreditCard, Download, CheckCircle, XCircle, Calendar, Wallet, Clock } from 'lucide-react';

export function PaymentHistory({ payments = [], activeBooking }) {
    const monthlyDue = activeBooking ? parseFloat(activeBooking.monthly_amount || 0) : 0;

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <h3 className="text-[#A294F9] font-bold text-lg mb-6">Payment Overview</h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-[#E5D9F2] to-[#F5EFFF] rounded-2xl p-5 shadow-sm border border-white/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <IndianRupee size={20} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Total Paid</p>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                        ₹{(payments.filter(p => ['success', 'completed', 'verified'].includes(p.status?.toLowerCase())).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)).toLocaleString()}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-[#CDC1FF] to-[#E5D9F2] rounded-2xl p-5 shadow-sm border border-white/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-[#A294F9]">
                            <Wallet size={20} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Monthly Rent</p>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                        ₹{monthlyDue.toLocaleString()}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-[#F5EFFF] to-white rounded-2xl p-5 shadow-sm border border-white/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <Calendar size={20} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Next Due Date</p>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                        1st of Next Month
                    </p>
                </div>
            </div>

            {/* Payment List */}
            <h4 className="text-md font-bold text-gray-800 mb-4 px-1">Recent Transactions</h4>
            <div className="space-y-3">
                {payments.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <CreditCard size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No payment history found</p>
                    </div>
                ) : (
                    payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-white/50 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${['success', 'completed', 'verified'].includes(payment.status?.toLowerCase())
                                    ? 'bg-green-100 text-green-600'
                                    : ['pending', 'initiated'].includes(payment.status?.toLowerCase())
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : ['cancelled', 'expired'].includes(payment.status?.toLowerCase())
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                    {['success', 'completed', 'verified'].includes(payment.status?.toLowerCase()) ? (
                                        <CheckCircle size={24} />
                                    ) : ['pending', 'initiated'].includes(payment.status?.toLowerCase()) ? (
                                        <Clock size={24} />
                                    ) : (
                                        <XCircle size={24} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        {payment.payment_type || 'Monthly Rent'}
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${payment.payment_method?.toLowerCase() === 'pending'
                                            ? 'bg-gray-100 text-gray-400 border border-gray-200'
                                            : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                            }`}>
                                            {payment.payment_method?.toLowerCase() === 'pending' ? 'Not Selected' : payment.payment_method}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {new Date(payment.created_at || payment.date).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-black text-gray-900">₹{parseFloat(payment.amount).toLocaleString()}</p>
                                <div className="flex items-center gap-1 justify-end">
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${['success', 'completed', 'verified'].includes(payment.status?.toLowerCase())
                                        ? 'text-green-600'
                                        : ['pending', 'initiated'].includes(payment.status?.toLowerCase())
                                            ? 'text-yellow-600'
                                            : ['cancelled', 'expired'].includes(payment.status?.toLowerCase())
                                                ? 'text-gray-400'
                                                : 'text-red-600'
                                        }`}>
                                        {payment.status?.toLowerCase() === 'pending' ? 'Waiting' : payment.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
