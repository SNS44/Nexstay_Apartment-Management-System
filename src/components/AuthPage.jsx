import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AuthPage({ onSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);

  const isRegister = mode === 'register';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  // Handle redirect after user state is set
  useEffect(() => {
    if (pendingUser) {
      const userRole = pendingUser.role || 'user';

      console.log('Redirecting user with role:', userRole);

      // Small delay to ensure state propagation
      setTimeout(() => {
        if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'staff') {
          console.log('Navigating to /admin');
          navigate('/admin', { replace: true });
        } else {
          console.log('Navigating to /profile');
          navigate('/profile', { replace: true });
        }
      }, 100);
    }
  }, [pendingUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'login' ? '/api/login.php' : '/api/register.php';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server Response Error:", text);
        throw new Error(`Server error: ${text.substring(0, 100)}... (Check console)`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Request failed');
      }

      console.log('Login successful, user data:', data.user);

      // Update parent component state first
      onSuccess?.(data.user);

      // Set pending user to trigger redirect in useEffect
      setPendingUser(data.user);

    } catch (err) {
      console.warn("API Error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-violet-50">
      {/* Background with animated gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-200/50 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative z-10 flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Visuals */}
        <div className="hidden md:flex flex-col justify-center items-center w-5/12 bg-gradient-to-br from-violet-600 to-indigo-600 p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/Upload/Home.png')] bg-cover bg-center opacity-20 mix-blend-overlay" />

          <div className="relative z-10 text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-6 border border-white/30">
                <span className="text-4xl font-bold text-white">NS</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Welcome to NexStay</h2>
              <p className="text-violet-100/90 text-lg">Experience premium living with our modern apartment management system.</p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white/50">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8 text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-gray-500">
                {isRegister
                  ? 'Start your journey with us today'
                  : 'Please enter your details to sign in'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                      <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        required={isRegister}
                        value={form.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900"
                      />
                    </div>

                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 text-center break-words"
                >
                  {/* Display error cleanly, limiting length if it's a giant stack trace */}
                  {error.length > 150 ? error.substring(0, 150) + '...' : error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isRegister ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => setMode(isRegister ? 'login' : 'register')}
                  className="ml-2 font-bold text-violet-600 hover:text-violet-700 hover:underline transition-all"
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
