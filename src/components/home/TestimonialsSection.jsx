import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInView } from '../../hooks/useInView';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export function TestimonialsSection() {
    const [ref, isInView] = useInView({ threshold: 0.3 });
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            rating: 5,
            quote: "NexStay has been the perfect home for me. The service is exceptional, and the community feel is exactly what I was looking for.",
            name: "Priya Menon",
            role: "Resident, Floor 3"
        },
        {
            rating: 5,
            quote: "The integrated service system makes life so easy. I can request maintenance or services right from my phone. Truly modern living!",
            name: "Arjun Kumar",
            role: "Resident, Floor 2"
        },
        {
            rating: 5,
            quote: "Safe, secure, and beautifully maintained. NexStay feels like home from day one. The staff is incredibly responsive and caring.",
            name: "Sarah Thomas",
            role: "Resident, Floor 4"
        },
    ];

    // Auto-advance
    useEffect(() => {
        if (!isInView) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isInView, testimonials.length]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    return (
        <section ref={ref} className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl text-center mb-16 text-[#A294F9]"
                >
                    What Our Residents Say
                </motion.h2>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white/50 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/60"
                        >
                            {/* Stars */}
                            <div className="flex justify-center gap-1 mb-6">
                                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 fill-[#A294F9] text-[#A294F9]" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-xl text-gray-700 text-center mb-8 leading-relaxed italic">
                                "{testimonials[currentIndex].quote}"
                            </p>

                            {/* Author */}
                            <div className="text-center">
                                <p className="text-gray-800 mb-1 font-semibold">{testimonials[currentIndex].name}</p>
                                <p className="text-sm text-gray-600">{testimonials[currentIndex].role}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePrev}
                            className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-[#A294F9]/30 flex items-center justify-center hover:bg-[#A294F9]/20 transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-6 h-6 text-[#A294F9]" />
                        </motion.button>

                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${index === currentIndex
                                            ? 'w-8 bg-[#A294F9]'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-[#A294F9]/30 flex items-center justify-center hover:bg-[#A294F9]/20 transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-6 h-6 text-[#A294F9]" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
}
