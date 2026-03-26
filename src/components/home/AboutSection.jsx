import { motion } from 'motion/react';
import { useInView } from '../../hooks/useInView';
import { Building2, Shield, Zap, Users } from 'lucide-react';

export function AboutSection() {
    const [ref, isInView] = useInView({ threshold: 0.3 });

    const stats = [
        { icon: Building2, label: '5 Floors', color: '#A294F9' },
        { icon: Shield, label: '15 Rooms', color: '#CDC1FF' },
        { icon: Zap, label: 'Quick Services', color: '#A294F9' },
        { icon: Users, label: 'Community', color: '#CDC1FF' },
    ];

    return (
        <section ref={ref} className="py-24 px-6 relative">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, filter: 'blur(10px)', y: 50 }}
                    animate={isInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-white/40 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/50"
                    style={{
                        animation: isInView ? 'float 6s ease-in-out infinite' : 'none',
                    }}
                >
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-4xl md:text-5xl text-center mb-6 text-[#A294F9]"
                    >
                        About NexStay
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        NexStay is a apartment building designed for comfort and convenience.
                        With 5 floors and 15 beautifully designed rooms, we offer secure living spaces with
                        an integrated service request system. Perfect for both short and long stays.
                    </motion.p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm"
                            >
                                <stat.icon className="w-10 h-10" style={{ color: stat.color }} />
                                <span className="text-gray-700 text-center text-sm md:text-base font-medium">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </section>
    );
}
