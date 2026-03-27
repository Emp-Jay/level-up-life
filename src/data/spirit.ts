// ─────────────────────────────────────────────
// SPIRIT EVOLUTION SYSTEM
// ─────────────────────────────────────────────

export type SpiritSeason = 'water' | 'fire' | 'cosmos' | 'shadow' | 'nature' | 'storm';

export interface SpiritStage {
  stage: number;          // 0-5
  name: string;
  xpRequired: number;     // cumulative XP to reach this stage
  streakRequired: number; // streak days required
  color: string;
  auraColor: string;
  description: string;
  emojis: string;
  canvasState: 'sleeping' | 'resting' | 'awake' | 'energized' | 'powered' | 'legendary';
}

export interface SeasonConfig {
  id: SpiritSeason;
  name: string;
  emoji: string;
  primaryColor: string;
  auraColor: string;
  unlockDays: number;     // total streak days to unlock season
  stages: Omit<SpiritStage, 'stage'>[];
}

export interface SpiritState {
  season: SpiritSeason;
  stage: number;          // 0-5 within current season
  prestige: number;       // how many full cycles completed
  isGodTier: boolean;     // 60+ days total
  unlockedSeasons: SpiritSeason[];
  unlockedAccessories: string[];
  activeAccessories: string[];
  totalEvolutions: number;
}

// ── BASE STAGES (Water - Season 1) ────────────────
export const WATER_STAGES: SpiritStage[] = [
  {
    stage: 0, name: 'DORMANT',
    xpRequired: 0, streakRequired: 0,
    color: '#555577', auraColor: '#333355',
    description: 'Your spirit sleeps... Complete missions to awaken it.',
    emojis: '💤', canvasState: 'sleeping',
  },
  {
    stage: 1, name: 'ENERGY ORB',
    xpRequired: 200, streakRequired: 3,
    color: '#9966ff', auraColor: '#7c4dff',
    description: 'Raw energy ignited. Soul stirs in the dark.',
    emojis: '🔮✨', canvasState: 'resting',
  },
  {
    stage: 2, name: 'SOUL WISP',
    xpRequired: 600, streakRequired: 7,
    color: '#29b6f6', auraColor: '#0288d1',
    description: 'Cute and alive. Your spirit takes its first true form.',
    emojis: '👻✨💫', canvasState: 'awake',
  },
  {
    stage: 3, name: 'GALAXY SPIRIT',
    xpRequired: 1400, streakRequired: 14,
    color: '#00e5cc', auraColor: '#00b8a4',
    description: 'Cosmic energy flows. Stars live inside you.',
    emojis: '🌌⚡💫✨', canvasState: 'energized',
  },
  {
    stage: 4, name: 'DIVINE SOUL',
    xpRequired: 2800, streakRequired: 21,
    color: '#cc99ff', auraColor: '#9c64ff',
    description: 'Halo unlocked. Soul sync 85%. You are rising.',
    emojis: '🌸⚡🌟💫✨', canvasState: 'powered',
  },
  {
    stage: 5, name: 'ULTIMATE DIVINE',
    xpRequired: 5000, streakRequired: 30,
    color: '#ffd700', auraColor: '#ff9800',
    description: 'SOUL SYNC 100%. You have become your future self.',
    emojis: '👑⚡🌟💫🔮✨🔥', canvasState: 'legendary',
  },
];

// ── SEASONS ────────────────────────────────────
export const SEASONS: SeasonConfig[] = [
  {
    id: 'water', name: 'Water Season', emoji: '💧', unlockDays: 0,
    primaryColor: '#00e5cc', auraColor: '#0288d1',
    stages: WATER_STAGES,
  },
  {
    id: 'fire', name: 'Fire Season', emoji: '🔥', unlockDays: 30,
    primaryColor: '#ff6b35', auraColor: '#ff3d00',
    stages: WATER_STAGES.map(s => ({
      ...s,
      color: ['#333','#ff9800','#ff6b35','#ff3d00','#ff1744','#ffeb3b'][s.stage],
      auraColor: ['#111','#e65100','#bf360c','#b71c1c','#ff6d00','#ffd600'][s.stage],
      description: s.description.replace('Soul', 'Flame').replace('spirit', 'flame'),
    })),
  },
  {
    id: 'cosmos', name: 'Cosmos Season', emoji: '🌌', unlockDays: 60,
    primaryColor: '#7c4dff', auraColor: '#4a148c',
    stages: WATER_STAGES.map(s => ({
      ...s,
      color: ['#333','#4a148c','#6a1b9a','#7c4dff','#aa00ff','#e040fb'][s.stage],
      auraColor: ['#111','#311b92','#4527a0','#6200ea','#aa00ff','#d500f9'][s.stage],
    })),
  },
  {
    id: 'shadow', name: 'Shadow Season', emoji: '🌑', unlockDays: 90,
    primaryColor: '#546e7a', auraColor: '#263238',
    stages: WATER_STAGES.map(s => ({
      ...s,
      color: ['#111','#37474f','#455a64','#546e7a','#78909c','#eceff1'][s.stage],
      auraColor: ['#000','#263238','#37474f','#455a64','#546e7a','#b0bec5'][s.stage],
    })),
  },
];

// ── ACCESSORIES ────────────────────────────────
export const ACCESSORIES = [
  { id: 'halo',     name: 'Golden Halo',   emoji: '✨', xpCost: 500,  description: 'A radiant halo floating above your spirit' },
  { id: 'wings',    name: 'Spirit Wings',  emoji: '🦋', xpCost: 800,  description: 'Ethereal wings that shimmer with your aura' },
  { id: 'crown',    name: 'Galaxy Crown',  emoji: '👑', xpCost: 1200, description: 'A crown made of compressed stardust' },
  { id: 'cape',     name: 'Void Cape',     emoji: '🌌', xpCost: 1000, description: 'A cape that absorbs the cosmos' },
  { id: 'aura_ext', name: 'Extended Aura', emoji: '💫', xpCost: 600,  description: 'Doubles your spirit aura size' },
  { id: 'sparks',   name: 'Gold Sparks',   emoji: '✴️', xpCost: 400,  description: 'Constant gold particle trail' },
];

// ── GOD TIER TITLES ────────────────────────────
export const GOD_TIER_TITLES = [
  { daysRequired: 60,  title: 'Awakened One',    badge: '⭐' },
  { daysRequired: 90,  title: 'Soul Master',     badge: '🌟' },
  { daysRequired: 120, title: 'Cosmic Being',    badge: '💫' },
  { daysRequired: 180, title: 'Divine Entity',   badge: '🌸' },
  { daysRequired: 365, title: 'LEGENDARY',       badge: '👑' },
];

// ── COMPUTE SPIRIT FROM PROGRESS ──────────────
export function computeSpirit(
  totalXP: number,
  currentStreak: number,
  _longestStreak: number,
  spiritState: SpiritState,
): { stage: number; stageInfo: SpiritStage; nextStageInfo: SpiritStage | null; progress: number; season: SeasonConfig } {
  const season = SEASONS.find(s => s.id === spiritState.season) || SEASONS[0];

  // Determine stage from XP AND streak (both required)
  let stage = 0;
  for (let i = WATER_STAGES.length - 1; i >= 0; i--) {
    const req = WATER_STAGES[i];
    if (totalXP >= req.xpRequired && currentStreak >= req.streakRequired) {
      stage = i;
      break;
    }
  }

  const stageInfo = { ...WATER_STAGES[stage], color: (season.stages[stage] as any)?.color || WATER_STAGES[stage].color, auraColor: (season.stages[stage] as any)?.auraColor || WATER_STAGES[stage].auraColor };
  const nextStageInfo = stage < 5 ? WATER_STAGES[stage + 1] : null;

  // Progress to next stage (0-100)
  let progress = 100;
  if (nextStageInfo) {
    const curXP = WATER_STAGES[stage].xpRequired;
    const nextXP = nextStageInfo.xpRequired;
    const xpProgress = Math.min(1, (totalXP - curXP) / (nextXP - curXP));
    const curStreak = WATER_STAGES[stage].streakRequired;
    const nextStreak = nextStageInfo.streakRequired;
    const streakProgress = nextStreak > curStreak ? Math.min(1, (currentStreak - curStreak) / (nextStreak - curStreak)) : 1;
    progress = Math.round(Math.min(xpProgress, streakProgress) * 100);
  }

  return { stage, stageInfo, nextStageInfo, progress, season };
}

export function getGodTierTitle(longestStreak: number) {
  let title = null;
  for (const t of GOD_TIER_TITLES) {
    if (longestStreak >= t.daysRequired) title = t;
  }
  return title;
}

export function getUnlockedSeasons(longestStreak: number): SpiritSeason[] {
  return SEASONS.filter(s => longestStreak >= s.unlockDays).map(s => s.id);
}
