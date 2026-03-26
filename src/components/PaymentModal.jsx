import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X, CreditCard, Smartphone, Building, Wallet, Banknote,
    CheckCircle, AlertCircle, Loader, ArrowRight, Shield
} from 'lucide-react';

const paymentMethods = [
    { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'debit_card', label: 'Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
    { id: 'credit_card', label: 'Credit Card', icon: CreditCard, desc: 'All major cards accepted' },
    { id: 'net_banking', label: 'Net Banking', icon: Building, desc: 'All banks supported' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Paytm, MobiKwik, Amazon Pay' },
    { id: 'cash', label: 'Cash/Offline', icon: Banknote, desc: 'Pay at office' },
];

const PaymentModal = ({
    isOpen,
    onClose,
    booking,
    onSuccess,
    onError
}) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [step, setStep] = useState('method'); // method, details, processing, result
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [paymentDetails, setPaymentDetails] = useState({
        upiId: '',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: '',
        bankName: '',
        accountNumber: '',
        walletProvider: '',
        walletNumber: ''
    });

    if (!isOpen || !booking) return null;

    // Use monthly_amount from backend (which is the first month's rent)
    const paymentAmount = parseFloat(booking.monthly_amount || booking.monthly_price || 0);

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setError(null);
        // Reset payment details when method changes
        setPaymentDetails({
            upiId: '',
            cardNumber: '',
            cardName: '',
            cardExpiry: '',
            cardCvv: '',
            bankName: '',
            accountNumber: '',
            walletProvider: '',
            walletNumber: ''
        });
    };

    const handleDetailsNext = () => {
        if (!selectedMethod) {
            setError('Please select a payment method');
            return;
        }

        // For cash/offline, skip details and go directly to payment
        if (selectedMethod.id === 'cash' || selectedMethod.id === 'offline') {
            initiatePayment();
            return;
        }

        // For other methods, go to details form
        setError(null);
        setStep('details');
    };

    const handleDetailsChange = (field, value) => {
        setPaymentDetails(prev => ({
            ...prev,
            [field]: value
        }));
        setError(null);
    };

    const initiatePayment = async () => {
        if (!selectedMethod) {
            setError('Please select a payment method');
            return;
        }

        // Validate payment details if not cash/offline
        const methodId = selectedMethod.id;
        if (methodId !== 'cash' && methodId !== 'offline') {
            let isValid = true;
            let errorMsg = '';

            if (methodId === 'upi') {
                if (!paymentDetails.upiId || !paymentDetails.upiId.includes('@')) {
                    isValid = false;
                    errorMsg = 'Please enter a valid UPI ID (e.g., name@paytm)';
                }
            } else if (methodId === 'debit_card' || methodId === 'credit_card') {
                if (!paymentDetails.cardNumber || paymentDetails.cardNumber.replace(/\s/g, '').length < 16) {
                    isValid = false;
                    errorMsg = 'Please enter a valid 16-digit card number';
                } else if (!paymentDetails.cardName) {
                    isValid = false;
                    errorMsg = 'Please enter cardholder name';
                } else if (!paymentDetails.cardExpiry || !/^\d{2}\/\d{2}$/.test(paymentDetails.cardExpiry)) {
                    isValid = false;
                    errorMsg = 'Please enter expiry date (MM/YY)';
                } else if (!paymentDetails.cardCvv || paymentDetails.cardCvv.length < 3) {
                    isValid = false;
                    errorMsg = 'Please enter CVV';
                }
            } else if (methodId === 'net_banking') {
                if (!paymentDetails.bankName) {
                    isValid = false;
                    errorMsg = 'Please select a bank';
                }
            } else if (methodId === 'wallet') {
                if (!paymentDetails.walletProvider) {
                    isValid = false;
                    errorMsg = 'Please select a wallet provider';
                } else if (!paymentDetails.walletNumber) {
                    isValid = false;
                    errorMsg = 'Please enter wallet number';
                }
            }

            if (!isValid) {
                setError(errorMsg);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            // Step 1: Initiate payment
            const initRes = await fetch('/api/payment_initiate.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: booking.id,
                    payment_method: selectedMethod.id,
                    payment_type: 'First_Month',
                    amount: paymentAmount
                })
            });

            const initData = await initRes.json();
            if (!initRes.ok || !initData.success) {
                throw new Error(initData.message || 'Failed to initiate payment');
            }

            setStep('processing');

            // For cash/offline, mark as pending verification
            if (selectedMethod.id === 'cash') {
                setPaymentResult({
                    success: true,
                    message: 'Payment request submitted. Please pay at the office and admin will verify.',
                    paymentId: initData.payment_id
                });
                setStep('result');
                setLoading(false);
                return;
            }

            // Simulate payment processing (in real app, redirect to payment gateway)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 2: Update payment status (simulate success)
            const updateRes = await fetch('/api/payment_update.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_id: initData.payment_id,
                    status: 'success',
                    transaction_id: 'TXN' + Date.now()
                })
            });

            const updateData = await updateRes.json();
            if (!updateRes.ok || !updateData.success) {
                throw new Error(updateData.message || 'Payment failed');
            }

            setPaymentResult({
                success: true,
                message: updateData.message || 'Payment successful! Your booking is now Active and your room is assigned.',
                paymentId: initData.payment_id
            });
            setStep('result');

        } catch (err) {
            setError(err.message);
            setStep('method');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset all state
        setStep('method');
        setSelectedMethod(null);
        setError(null);
        setPaymentResult(null);
        setPaymentDetails({
            upiId: '',
            cardNumber: '',
            cardName: '',
            cardExpiry: '',
            cardCvv: '',
            bankName: '',
            accountNumber: '',
            walletProvider: '',
            walletNumber: ''
        });
        onClose();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto relative z-10 shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between rounded-t-2xl">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Make Payment</h3>
                            <p className="text-xs text-gray-500">Room {booking.room_number}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4">
                        {/* Amount Summary */}
                        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">First Month Rent</span>
                                <span className="text-lg font-bold text-violet-700">{formatPrice(paymentAmount)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                                Payment will be verified by admin after completion
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Step: Method Selection */}
                        {step === 'method' && (
                            <>
                                <div className="mb-3">
                                    <label className="text-sm font-medium text-gray-700">Select Payment Method</label>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {paymentMethods.map((method) => {
                                        const Icon = method.icon;
                                        const isSelected = selectedMethod?.id === method.id;
                                        return (
                                            <button
                                                key={method.id}
                                                onClick={() => handleMethodSelect(method)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? 'border-violet-500 bg-violet-50'
                                                    : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold text-gray-900">{method.label}</div>
                                                    <div className="text-xs text-gray-500">{method.desc}</div>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle className="w-5 h-5 text-violet-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={handleDetailsNext}
                                    disabled={!selectedMethod || loading}
                                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                                    <Shield className="w-3 h-3" />
                                    Secure payment processed safely
                                </div>
                            </>
                        )}

                        {/* Step: Payment Details Form */}
                        {step === 'details' && (
                            <>
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <button
                                            onClick={() => setStep('method')}
                                            className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                                        >
                                            ← Back
                                        </button>
                                        <span className="text-gray-400">|</span>
                                        <span className="text-sm text-gray-600">Enter Payment Details</span>
                                    </div>
                                </div>

                                {selectedMethod?.id === 'upi' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                UPI ID
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.upiId}
                                                onChange={(e) => handleDetailsChange('upiId', e.target.value)}
                                                placeholder="yourname@paytm"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedMethod?.id === 'debit_card' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.cardNumber}
                                                onChange={(e) => handleDetailsChange('cardNumber', e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Cardholder Name
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.cardName}
                                                onChange={(e) => handleDetailsChange('cardName', e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expiry
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentDetails.cardExpiry}
                                                    onChange={(e) => handleDetailsChange('cardExpiry', e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').substring(0, 5))}
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    CVV
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentDetails.cardCvv}
                                                    onChange={(e) => handleDetailsChange('cardCvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                                                    placeholder="123"
                                                    maxLength={4}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod?.id === 'credit_card' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.cardNumber}
                                                onChange={(e) => handleDetailsChange('cardNumber', e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Cardholder Name
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.cardName}
                                                onChange={(e) => handleDetailsChange('cardName', e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expiry
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentDetails.cardExpiry}
                                                    onChange={(e) => handleDetailsChange('cardExpiry', e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').substring(0, 5))}
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    CVV
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentDetails.cardCvv}
                                                    onChange={(e) => handleDetailsChange('cardCvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                                                    placeholder="123"
                                                    maxLength={4}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod?.id === 'net_banking' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Bank
                                            </label>
                                            <select
                                                value={paymentDetails.bankName}
                                                onChange={(e) => handleDetailsChange('bankName', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            >
                                                <option value="">Select a bank</option>
                                                <option value="SBI">State Bank of India</option>
                                                <option value="HDFC">HDFC Bank</option>
                                                <option value="ICICI">ICICI Bank</option>
                                                <option value="Axis">Axis Bank</option>
                                                <option value="Kotak">Kotak Mahindra Bank</option>
                                                <option value="PNB">Punjab National Bank</option>
                                                <option value="BOI">Bank of India</option>
                                                <option value="Other">Other Bank</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod?.id === 'wallet' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Wallet Provider
                                            </label>
                                            <select
                                                value={paymentDetails.walletProvider}
                                                onChange={(e) => handleDetailsChange('walletProvider', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            >
                                                <option value="">Select wallet</option>
                                                <option value="Paytm">Paytm</option>
                                                <option value="PhonePe">PhonePe</option>
                                                <option value="MobiKwik">MobiKwik</option>
                                                <option value="Amazon Pay">Amazon Pay</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mobile Number
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentDetails.walletNumber}
                                                onChange={(e) => handleDetailsChange('walletNumber', e.target.value.replace(/\D/g, '').substring(0, 10))}
                                                placeholder="10-digit mobile number"
                                                maxLength={10}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                {(selectedMethod?.id === 'cash' || selectedMethod?.id === 'offline') && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                        <p className="text-sm text-blue-800">
                                            Please visit the office to complete your payment. Our staff will assist you with the payment process.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setStep('method')}
                                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={initiatePayment}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Confirm & Pay {formatPrice(paymentAmount)}
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step: Processing */}
                        {step === 'processing' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 bg-violet-100 rounded-full flex items-center justify-center">
                                    <Loader className="w-8 h-8 text-violet-600 animate-spin" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h4>
                                <p className="text-sm text-gray-500">Please wait while we process your payment...</p>
                            </div>
                        )}

                        {/* Step: Result */}
                        {step === 'result' && paymentResult && (
                            <div className="text-center py-6">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${paymentResult.success ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    {paymentResult.success ? (
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-8 h-8 text-red-600" />
                                    )}
                                </div>
                                <h4 className={`text-lg font-semibold mb-2 ${paymentResult.success ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                    {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">{paymentResult.message}</p>
                                <button
                                    onClick={() => {
                                        onSuccess?.();
                                        handleClose();
                                    }}
                                    className="px-6 py-2 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
