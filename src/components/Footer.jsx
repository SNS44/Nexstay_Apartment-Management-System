import { motion } from 'motion/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'Services', path: '/services' }
  ];

  const services = [
    { name: 'Room Booking', path: '/rooms' },
    { name: 'Maintenance', path: '/services' },
    { name: 'Housekeeping', path: '/services' },
    { name: 'Security', path: '/services' },
    { name: 'Support', path: '/services' }
  ];

  return (
    <footer className="bg-gradient-to-br from-[#A294F9] to-[#CDC1FF] text-white py-16 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <span className="text-white font-bold text-lg">NS</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">NEXSTAY</h3>
                <p className="text-sm text-white/80">Modern Living · Premium Comfort</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Your peaceful corner of modern residential living in the heart of Kerala.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      to={link.path}
                      className="text-white/80 hover:text-white transition-colors text-sm inline-block"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 font-semibold text-lg">Services</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      to={service.path}
                      className="text-white/80 hover:text-white transition-colors text-sm inline-block"
                    >
                      {service.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <p className="text-white/80 text-sm">
                  NexStay Apartments.<br />
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <p className="text-white/80 text-sm">+91 97472 91356</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <p className="text-white/80 text-sm">ssn@nexstay.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-8 flex justify-center items-center">
          <p className="text-white/80 text-sm">
            NexStay Apartments
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
