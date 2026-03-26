import { motion } from 'motion/react';

export function HeroSection({ onExploreClick, onLoginClick }) {
    return (
        <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
            {/* Background with overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/Upload/Home.png')` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
            </div>

            <div className="relative z-10 text-center max-w-4xl px-6 mt-12">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block py-1 px-3 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 text-primary text-sm font-medium mb-6"
                >
                    Welcome to NexStay
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold text-primary mb-6 tracking-tight leading-tight"
                >
                    Your peaceful <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-extrabold">APARTMENT</span>.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    A place where comfort flows naturally, services come effortlessly, and every detail helps you feel at home.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={onExploreClick}
                        className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-xl"
                    >
                        Explore Rooms
                    </button>
                    <button
                        onClick={onLoginClick}
                        className="px-8 py-4 rounded-full bg-transparent border-2 border-primary text-primary font-bold text-lg hover:bg-primary/10 transition-all backdrop-blur-sm"
                    >
                        Login to Book
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
