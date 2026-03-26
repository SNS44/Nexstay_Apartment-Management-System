import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Navbar({ user, onLogout, loadingUser }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activePage = location.pathname.substring(1) || 'home';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Services only shows when user is logged in
  const navLinks = [
    { id: '', label: 'Home' }, // id is empty string for root path
    { id: 'rooms', label: 'Rooms' },
    ...(user ? [{ id: 'services', label: 'Services' }] : []), // Only show Services if user is logged in
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-[#E5D9F2]/80 backdrop-blur-lg shadow-lg'
        : 'bg-[#E5D9F2]/60 backdrop-blur-md'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CDC1FF] to-[#A294F9] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">NS</span>
          </div>
          <span className="text-xl font-bold text-[#A294F9]">NexStay</span>
        </motion.button>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = link.id === ''
              ? location.pathname === '/'
              : location.pathname.startsWith('/' + link.id);

            return (
              <motion.button
                key={link.id || 'home'}
                onClick={() => navigate('/' + link.id)}
                className={`relative text-base font-medium transition-colors cursor-pointer bg-transparent border-none ${isActive ? 'text-[#A294F9]' : 'text-gray-700 hover:text-[#A294F9]'
                  }`}
                whileHover={{ y: -2 }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeLink"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#CDC1FF] to-[#A294F9]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {loadingUser ? (
            <div className="w-20 h-9 bg-gray-200 rounded-full animate-pulse" />
          ) : !user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#CDC1FF] to-[#A294F9] text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-none font-medium"
            >
              Sign In
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#CDC1FF] to-[#A294F9] flex items-center justify-center text-white cursor-pointer border-none shadow-md"
              >
                {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="text-gray-600 hover:text-[#A294F9] transition-colors cursor-pointer bg-transparent border-none font-medium"
              >
                Logout
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
