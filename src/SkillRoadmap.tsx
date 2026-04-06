import { motion } from 'motion/react';
import { X, Lightbulb, Hexagon, Cpu, ShieldCheck, Rocket, ChevronRight } from 'lucide-react';

interface SkillRoadmapProps {
    onClose: () => void;
    isLight: boolean;
}

const ROADMAP_STEPS = [
    {
        id: 1,
        title: "Concept & Strategy",
        icon: <Lightbulb className="w-6 h-6" />,
        skills: ["@brainstorming", "@competitive-landscape"],
        description: "Define the vision, map competitive territory, and structure the mental model of the product.",
        color: "bg-blue-500"
    },
    {
        id: 2,
        title: "Foundation & Architecture",
        icon: <Hexagon className="w-6 h-6" />,
        skills: ["@api-design-principles", "@database-design"],
        description: "Establish robust interfaces, scalable schemas, and solid architectural patterns.",
        color: "bg-emerald-500"
    },
    {
        id: 3,
        title: "Development & Iteration",
        icon: <Cpu className="w-6 h-6" />,
        skills: ["@test-driven-development", "@frontend-design"],
        description: "Execute with quality-first cycles, polishing UI/UX as you build new features.",
        color: "bg-amber-500"
    },
    {
        id: 4,
        title: "Hardening & Delivery",
        icon: <ShieldCheck className="w-6 h-6" />,
        skills: ["@security-auditor", "@create-pr"],
        description: "Rigorous security auditing, final verification, and shipping a production-ready product.",
        color: "bg-purple-500"
    }
];

export function SkillRoadmap({ onClose, isLight }: SkillRoadmapProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 ${isLight ? 'bg-stone-100/90' : 'bg-stone-950/90'} backdrop-blur-2xl`}
        >
            <div className="relative w-full max-w-5xl h-full max-h-[85vh] flex flex-col items-center">
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-10 px-4">
                    <div className="flex flex-col">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            <span className={`p-2 ${isLight ? 'bg-amber-600' : 'bg-amber-500'} rounded-lg text-white`}>
                                <Rocket className="w-6 h-6" />
                            </span>
                            Agentic Roadmap
                        </h2>
                        <p className={`text-sm font-medium mt-1 uppercase tracking-widest opacity-60 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                            The 4-Step Skill Integration Guide
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-3 rounded-2xl ${isLight ? 'bg-stone-200 text-stone-900' : 'bg-stone-800 text-stone-100'} hover:scale-110 transition-transform shadow-lg`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Roadmap Grid */}
                <div className="flex-1 w-full overflow-y-auto custom-scrollbar px-4 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                        {/* Visual connector for Desktop */}
                        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-current opacity-10 -translate-x-1/2" />

                        {ROADMAP_STEPS.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative group p-8 rounded-[2.5rem] border ${isLight ? 'bg-white/40 border-stone-200' : 'bg-stone-900/40 border-stone-800'} backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-amber-500/10 hover:border-amber-500/20`}
                            >
                                {/* Step Number Badge */}
                                <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center text-white font-black text-xl shadow-xl z-20`}>
                                    {step.id}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl bg-opacity-20 ${step.color.replace('bg-', 'bg-opacity-10 text-')}`}>
                                            {step.icon}
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight">{step.title}</h3>
                                    </div>

                                    <p className={`text-sm leading-relaxed opacity-80 ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                                        {step.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {step.skills.map(skill => (
                                            <span
                                                key={skill}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border ${isLight ? 'bg-stone-100 border-stone-200 text-stone-600' : 'bg-stone-800 border-stone-700 text-stone-400'}`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-current opacity-10 flex items-center justify-between group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Phase {step.id} Status: Optimized</span>
                                        <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Layered Background Element */}
                                <div className={`absolute inset-0 -z-10 rounded-[2.5rem] ${isLight ? 'bg-stone-100/30' : 'bg-stone-800/30'} translate-x-2 translate-y-2 opacity-50 blur-sm`} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom Ambient Glow */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />
            </div>
        </motion.div>
    );
}
