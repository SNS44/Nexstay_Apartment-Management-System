import { motion } from 'motion/react';
import { useInView } from '../../hooks/useInView';
import { House, ShieldCheck, Zap, Building2, Heart, Award } from 'lucide-react';

export function FeaturesSection() {
    const [ref, isInView] = useInView({ threshold: 0.2 });

    const features = [
        {
            icon: House,
            title: 'Modern Living',
            description: 'Contemporary spaces designed for comfort and style.',
        },
        {
            icon: ShieldCheck,
            title: 'Secure & Safe',
            description: '24/7 security with controlled access systems.',
        },
        {
            icon: Zap,
            title: 'Quick Services',
            description: 'Integrated service requests at your fingertips.',
        },
        {
            icon: Building2,
            title: '15 Rooms',
            description: 'Thoughtfully designed spaces across 5 floors.',
        },
        {
            icon: Heart,
            title: 'Community',
            description: 'A welcoming residential environment.',
        },
        {
            icon: Award,
            title: 'Premium Quality',
            description: 'High-end finishes and attention to detail.',
        },
    ];

    return (
        <section ref={ref} className="py-24 px-6 bg-gradient-to-b from-[#F5EFFF] to-[#E5D9F2]/50">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl text-center mb-4 text-[#A294F9]"
                >
                    Why Choose NexStay
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg text-gray-600 text-center mb-16 max-w-2xl mx-auto"
                >
                    Experience the perfect blend of comfort, security, and modern convenience
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{
                                y: -10,
                                boxShadow: '0 25px 50px rgba(162, 148, 249, 0.4), 0 0 40px rgba(162, 148, 249, 0.3)',
                                scale: 1.02
                            }}
                            className="bg-white/50 backdrop-blur-md rounded-2xl p-8 border border-white/60 shadow-[0_10px_30px_rgba(162,148,249,0.25)] transition-all"
                        >
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#CDC1FF] to-[#A294F9] flex items-center justify-center mb-6 shadow-[0_8px_20px_rgba(162,148,249,0.35)]"
                            >
                                <feature.icon className="w-7 h-7 text-white" />
                            </motion.div>

                            <h3 className="text-xl mb-3 text-gray-800 font-semibold">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
