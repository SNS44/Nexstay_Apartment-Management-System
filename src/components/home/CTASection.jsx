import { motion } from "motion/react";
import { useInView } from "../../hooks/useInView";

export function CTASection({
    onBrowseClick,
    onLoginClick,
}) {
    const [ref, isInView] = useInView({ threshold: 0.3 });

    return (
        <section
            ref={ref}
            className="py-24 px-6 bg-gradient-to-br from-[#E5D9F2] to-[#F5EFFF]"
        >
            <div className="max-w-4xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl mb-6 text-[#A294F9]"
                >
                    Ready to Make Your APARTMENT Your Home?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-gray-600 mb-12"
                >
                    Discover your perfect space and experience APARTMENT living at its finest.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <motion.button
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 0 30px rgba(162, 148, 249, 0.6)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            y: [0, -5, 0],
                        }}
                        transition={{
                            y: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                        onClick={onBrowseClick}
                        className="px-10 py-4 rounded-full bg-gradient-to-r from-[#CDC1FF] to-[#A294F9] text-white text-lg shadow-xl cursor-pointer"
                    >
                        Browse All Rooms
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLoginClick}
                        className="px-10 py-4 rounded-full bg-white/60 backdrop-blur-md border-2 border-[#A294F9] text-[#A294F9] text-lg hover:bg-white/80 transition-colors cursor-pointer"
                    >
                        Login to Book
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}
