import { motion } from 'motion/react';
import { useInView } from '../../hooks/useInView';
import { Wifi, MoveVertical, ShieldAlert, Zap, Car, Wrench } from 'lucide-react';

export function AmenitiesSection() {
    const [ref, isInView] = useInView({ threshold: 0.2 });

    const amenities = [
        { icon: Wifi, label: 'High-Speed WiFi', color: '#A294F9' },
        { icon: MoveVertical, label: 'Elevator', color: '#CDC1FF' },
        { icon: ShieldAlert, label: '24/7 Security', color: '#A294F9' },
        { icon: Zap, label: 'Power Backup', color: '#CDC1FF' },
        { icon: Car, label: 'Parking', color: '#A294F9' },
        { icon: Wrench, label: 'Maintenance', color: '#CDC1FF' },
    ];

    return (
        <section ref={ref} className="py-24 px-6 bg-gradient-to-b from-[#E5D9F2]/50 to-[#F5EFFF]">
            <div className="max-w-6xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl text-center mb-4 text-[#A294F9]"
                >
                    Building Amenities
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg text-gray-600 text-center mb-16"
                >
                    Everything you need for comfortable living
                </motion.p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {amenities.map((amenity, index) => (
                        <motion.div
                            key={amenity.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                                scale: 1.1,
                                y: -8,
                                boxShadow: '0 25px 50px rgba(162, 148, 249, 0.5), 0 0 40px rgba(162, 148, 249, 0.4)'
                            }}
                            className="bg-white/60 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center gap-4 border border-white/60 shadow-[0_10px_30px_rgba(162,148,249,0.3)] transition-all hover:border-[#A294F9]/60"
                            style={{
                                animation: isInView ? `pulse-glow 3s ease-in-out infinite ${index * 0.2}s` : 'none',
                            }}
                        >
                            <motion.div
                                whileHover={{
                                    rotate: [0, -10, 10, -10, 0],
                                    scale: 1.2
                                }}
                                transition={{ duration: 0.5 }}
                                className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/80 to-white/40 flex items-center justify-center shadow-[0_5px_15px_rgba(162,148,249,0.25)]"
                            >
                                <amenity.icon className="w-7 h-7" style={{ color: amenity.color }} />
                            </motion.div>
                            <span className="text-sm text-center text-gray-700 font-medium">{amenity.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 rgba(162, 148, 249, 0); }
          50% { box-shadow: 0 0 20px rgba(162, 148, 249, 0.2); }
        }
      `}</style>
        </section>
    );
}
