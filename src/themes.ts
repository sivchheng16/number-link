export interface Theme {
  name: string;
  containerBg: string;
  boardBg: string;
  cellBg: string;
  nodeShape: string;
  accentColor: string;
  uiBg: string;
  uiBorder: string;
  pathOpacity: string;
  glowBlur: string;
  glassOpacity: string;
  shadowColor: string;
}

export const THEMES: Record<string, Theme> = {
  'Starter Pack': {
    name: 'Liquid Stone',
    containerBg: 'bg-stone-50',
    boardBg: 'bg-stone-200/20',
    cellBg: 'bg-white/40',
    nodeShape: 'rounded-full',
    accentColor: 'text-stone-900',
    uiBg: 'bg-stone-100/80',
    uiBorder: 'border-stone-200',
    pathOpacity: 'opacity-90',
    glowBlur: 'blur-[1px]',
    glassOpacity: '0.6',
    shadowColor: 'rgba(28, 25, 23, 0.1)',
  },
  'The Grid Rises': {
    name: 'Emerald Glass',
    containerBg: 'bg-emerald-50',
    boardBg: 'bg-emerald-200/10',
    cellBg: 'bg-white/50',
    nodeShape: 'rounded-2xl',
    accentColor: 'text-emerald-900',
    uiBg: 'bg-emerald-100/70',
    uiBorder: 'border-emerald-200/50',
    pathOpacity: 'opacity-85',
    glowBlur: 'blur-[2px]',
    glassOpacity: '0.7',
    shadowColor: 'rgba(6, 78, 59, 0.08)',
  },
  'Multi-Hue Master': {
    name: 'Obsidian Night',
    containerBg: 'bg-stone-950',
    boardBg: 'bg-stone-900/40',
    cellBg: 'bg-stone-800/30',
    nodeShape: 'rounded-lg rotate-45',
    accentColor: 'text-amber-500',
    uiBg: 'bg-stone-900/80',
    uiBorder: 'border-stone-800',
    pathOpacity: 'opacity-80',
    glowBlur: 'blur-[4px]',
    glassOpacity: '0.4',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
  },
  'Complex Conduits': {
    name: 'Royal Gold',
    containerBg: 'bg-slate-50',
    boardBg: 'bg-white/5',
    cellBg: 'bg-white/60',
    nodeShape: 'rounded-none',
    accentColor: 'text-amber-600',
    uiBg: 'bg-white/80',
    uiBorder: 'border-amber-200',
    pathOpacity: 'opacity-100',
    glowBlur: 'blur-[0px]',
    glassOpacity: '0.8',
    shadowColor: 'rgba(180, 83, 9, 0.1)',
  },
  'The Flow Grandmaster': {
    name: 'Azure Ethereal',
    containerBg: 'bg-slate-900',
    boardBg: 'bg-slate-800/20',
    cellBg: 'bg-white/5',
    nodeShape: 'rounded-full',
    accentColor: 'text-sky-400',
    uiBg: 'bg-slate-800/60',
    uiBorder: 'border-slate-700',
    pathOpacity: 'opacity-70',
    glowBlur: 'blur-[8px]',
    glassOpacity: '0.3',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  'Master Concept': {
    name: 'Logic Master',
    containerBg: 'bg-slate-950',
    boardBg: 'bg-white/5',
    cellBg: 'bg-white/5',
    nodeShape: 'rounded-2xl',
    accentColor: 'text-amber-500',
    uiBg: 'bg-slate-900/80',
    uiBorder: 'border-slate-800',
    pathOpacity: 'opacity-100',
    glowBlur: 'blur-[2px]',
    glassOpacity: '0.9',
    shadowColor: 'rgba(0, 0, 0, 0.6)',
  },
};
