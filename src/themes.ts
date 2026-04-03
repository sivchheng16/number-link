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
}

export const THEMES: Record<string, Theme> = {
  'Starter Pack': {
    name: 'Neon City',
    containerBg: 'bg-slate-950',
    boardBg: 'bg-slate-900',
    cellBg: 'bg-slate-800/40',
    nodeShape: 'rounded-full',
    accentColor: 'text-indigo-400',
    uiBg: 'bg-slate-900',
    uiBorder: 'border-slate-800',
    pathOpacity: 'opacity-80',
    glowBlur: 'blur-[2px]',
  },
  'The Grid Rises': {
    name: 'Forest Quest',
    containerBg: 'bg-emerald-950',
    boardBg: 'bg-emerald-900/40',
    cellBg: 'bg-emerald-800/30',
    nodeShape: 'rounded-lg',
    accentColor: 'text-emerald-400',
    uiBg: 'bg-emerald-900/60',
    uiBorder: 'border-emerald-800',
    pathOpacity: 'opacity-90',
    glowBlur: 'blur-[1px]',
  },
  'Multi-Hue Master': {
    name: 'Cyberpunk',
    containerBg: 'bg-fuchsia-950',
    boardBg: 'bg-fuchsia-900/30',
    cellBg: 'bg-fuchsia-800/20',
    nodeShape: 'rounded-sm rotate-45',
    accentColor: 'text-fuchsia-400',
    uiBg: 'bg-fuchsia-900/50',
    uiBorder: 'border-fuchsia-800',
    pathOpacity: 'opacity-70',
    glowBlur: 'blur-[4px]',
  },
  'Complex Conduits': {
    name: 'Volcano',
    containerBg: 'bg-orange-950',
    boardBg: 'bg-orange-900/20',
    cellBg: 'bg-orange-800/20',
    nodeShape: 'rounded-none',
    accentColor: 'text-orange-500',
    uiBg: 'bg-orange-900/40',
    uiBorder: 'border-orange-800',
    pathOpacity: 'opacity-100',
    glowBlur: 'blur-[0px]',
  },
  'The Flow Grandmaster': {
    name: 'Cloud Realm',
    containerBg: 'bg-sky-950',
    boardBg: 'bg-white/5',
    cellBg: 'bg-white/5',
    nodeShape: 'rounded-3xl',
    accentColor: 'text-sky-300',
    uiBg: 'bg-sky-900/30',
    uiBorder: 'border-sky-800/50',
    pathOpacity: 'opacity-60',
    glowBlur: 'blur-[6px]',
  },
};
