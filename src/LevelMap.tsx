import { motion } from 'motion/react';
import { X, Lock, Star, Play, MapIcon } from 'lucide-react';
import { LEVELS } from './levels';

interface LevelMapProps {
    onClose: () => void;
    isLight: boolean;
    completedLevelIds: number[];
    currentLevelIndex: number;
    onSelectLevel: (index: number) => void;
}

export function LevelMap({ onClose, isLight, completedLevelIds, currentLevelIndex, onSelectLevel }: LevelMapProps) {
    const isUnlocked = (index: number) => {
        if (index === 0) return true;
        const previousId = LEVELS[index - 1].id;
        return completedLevelIds.includes(previousId);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: isLight ? 'linear-gradient(to top, rgb(231 229 228 / 0.95), transparent)' : 'linear-gradient(to top, rgba(12,12,12,0.95), transparent)' }}
            className={`fixed inset-0 z-[110] flex items-center justify-center px-4 pt-4 pb-0 sm:p-6 ${isLight ? 'bg-stone-200/80' : 'bg-stone-950/80'} backdrop-blur-3xl`}
        >
            <div className="relative w-full h-full max-w-5xl max-h-[100vh] pt-20 pb-0 flex flex-col items-center">

                {/* Header */}
                <div className="w-full flex justify-between items-center mb-6 sm:mb-10 px-2 sm:px-6 z-20">
                    <div className="flex flex-col">
                        <motion.h2
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3"
                        >
                            <span className={`p-2.5 ${isLight ? 'bg-amber-500' : 'bg-amber-600'} rounded-xl text-white shadow-lg shadow-amber-500/20`}>
                                <MapIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                            </span>
                            Level Map
                        </motion.h2>
                        <p className={`text-xs sm:text-sm font-bold mt-1.5 uppercase tracking-widest opacity-50 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                            Select your next challenge
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className={`p-3.5 rounded-2xl ${isLight ? 'bg-white text-stone-900 border border-stone-200 shadow-xl' : 'bg-stone-800 text-stone-100 border border-stone-700 shadow-2xl'} hover:scale-105 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-amber-500/20`}
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Level Grid Container */}
                <div className="flex-1 w-full h-full overflow-y-auto px-2 sm:px-6 pb-24 custom-scrollbar z-10 relative">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 md:gap-5">
                        {LEVELS.map((level, index) => {
                            const completed = completedLevelIds.includes(level.id);
                            const unlocked = isUnlocked(index);
                            const locked = !unlocked;
                            const isActive = index === currentLevelIndex;

                            // Dynamic Styling based on state
                            let baseStyle = "";
                            let icon = null;
                            let glow = "";

                            if (locked) {
                                // Locked Level State
                                baseStyle = `${isLight ? 'bg-stone-300/40 border-stone-300/50 text-stone-400' : 'bg-stone-800/40 border-stone-700/50 text-stone-500'} cursor-not-allowed opacity-60`;
                                icon = <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40" />;
                            } else if (completed) {
                                // Completed Level State
                                baseStyle = `${isLight ? 'bg-stone-50 border-amber-300 text-amber-700' : 'bg-stone-800 border-amber-500/40 text-amber-400'} cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95 transition-all shadow-amber-500/10`;
                                icon = <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current opacity-80" />;
                                if (isActive) glow = "shadow-amber-500/30 shadow-2xl ring-2 ring-amber-500/50";
                            } else {
                                // Unlocked But Unplayed State
                                baseStyle = `${isLight ? 'bg-white border-stone-200 text-stone-900 shadow-xl' : 'bg-stone-700 border-stone-600 text-white shadow-2xl'} cursor-pointer hover:scale-105 active:scale-95 transition-all`;
                                icon = isActive ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current opacity-80" /> : null;
                                if (isActive) glow = "ring-[3px] ring-sky-500/80 bg-sky-500/10 border-sky-500 text-sky-500 shadow-sky-500/40 pulse-glow";
                            }

                            return (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: (index % 16) * 0.02 }}
                                    key={level.id}
                                    disabled={locked}
                                    onClick={() => {
                                        if (unlocked) {
                                            onSelectLevel(index);
                                        }
                                    }}
                                    className={`relative aspect-square flex flex-col items-center justify-center rounded-[1.25rem] sm:rounded-2xl border-2 backdrop-blur-lg overflow-hidden group ${baseStyle} ${glow}`}
                                >
                                    {/* Level Number */}
                                    <span className="text-xl sm:text-2xl font-black tabular-nums tracking-tighter z-10 w-full text-center">
                                        {level.id}
                                    </span>

                                    {/* Icon Container */}
                                    <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 transition-transform group-hover:scale-110">
                                        {icon}
                                    </div>

                                    {/* Subtle Overlay Gradient for Depth */}
                                    {!locked && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Visual Depth Masks */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 pointer-events-none z-20"
                    style={{ background: isLight ? 'linear-gradient(to top, rgb(231 229 228 / 0.95), transparent)' : 'linear-gradient(to top, rgba(12,12,12,0.95), transparent)' }}
                />
                <div className="absolute inset-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-sky-500/10 blur-[120px] pointer-events-none rounded-full" />
                <div style={{ background: isLight ? 'linear-gradient(to top, rgb(231 229 228 / 1.95), transparent)' : 'linear-gradient(to top, rgba(12,12,12,0.95), transparent)' }} />
            </div>
        </motion.div>
    );
}

// Ensure the pulse glow is available globally without needing to edit index.css directly for portability
if (typeof document !== 'undefined') {
    if (!document.getElementById('levelmap-styles')) {
        const styleNode = document.createElement('style');
        styleNode.id = 'levelmap-styles';
        styleNode.innerHTML = `;
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px 0px rgba(14, 165, 233, 0.4); }
          50% { box-shadow: 0 0 25px 5px rgba(14, 165, 233, 0.7); }
        }
        .pulse-glow {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        `;
        document.head.appendChild(styleNode);
    }
}
