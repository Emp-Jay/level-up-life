// Mission Types
export type MissionCategory = 'productivity' | 'social' | 'mental' | 'learning' | 'organization' | 'mindfulness';

export interface Mission {
  id: string; title: string; description: string; category: MissionCategory;
  duration: number; xpReward: number; completed: boolean; skipped: boolean;
  completedAt?: string; scheduledFor?: string; icon?: string; emoji?: string;
}

export interface MissionTemplate {
  id: string; title: string; description: string; category: MissionCategory;
  xpReward: number; timeOfDay: TimeOfDay[];
}

export interface UserProgress {
  level: number; xp: number; xpToNextLevel: number; totalMissionsCompleted: number;
  currentStreak: number; longestStreak: number; lastCompletedDate: string | null;
  graceDaysUsed: number; graceDaysAvailable: number;
  characterPower: number; powersUnlocked: string[]; challengesCompleted: number;
}

export interface DailyProgress {
  date: string; missionsCompleted: number; xpEarned: number; checklistDone: string[];
}

export interface Level {
  level: number; name: string; xpRequired: number; color: string;
}

export interface Badge {
  id: string; name: string; description: string; icon: string; unlockedAt: string | null;
  requirement: { type: 'missions' | 'streak' | 'level' | 'category' | 'challenge' | 'power'; value: number; category?: MissionCategory; };
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'any';

export interface UserSettings {
  categories: MissionCategory[];
  notificationFrequency: 'low' | 'medium' | 'high';
  quietHoursStart: string; quietHoursEnd: string;
  missionIntensity: 'gentle' | 'balanced' | 'challenging';
  morningTime: string; afternoonTime: string; eveningTime: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  sundayResetMode: boolean;
  accentColor: string;
}

export interface DailyReflection { date: string; content: string; mood: 'great' | 'good' | 'neutral' | 'tired' | 'challenging'; }

// Custom Tasks
export type TaskRepeat = 'daily' | 'weekdays' | 'weekends' | 'once';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface CustomTask {
  id: string; title: string; description: string; scheduledTime: string;
  repeat: TaskRepeat; priority: TaskPriority; isEnabled: boolean;
  createdAt: string; completedDates: string[];
  xpReward: number;
  emoji: string;
  days?: number[]; // 0=Sun,1=Mon...6=Sat (for weekly repeat)
  specificDate?: string; // YYYY-MM-DD for once
}

export type ChallengeCategory = 'physical' | 'mental' | 'social' | 'learning' | 'discipline';
export type PowerType = 'strength' | 'wisdom' | 'focus' | 'charisma' | 'endurance' | 'speed';

export interface Challenge {
  id: string; title: string; description: string; emoji: string;
  category: ChallengeCategory;
  targetValue: number; currentValue?: number; currentProgress: number; unit: string;
  xpReward: number; isCompleted?: boolean; isCustom?: boolean;
  status: 'active' | 'completed' | 'failed';
  powerReward?: string; powerPoints?: number;
  createdAt: string;
}

export interface GamePower {
  id: string; name: string; description: string; emoji: string;
  type: PowerType;
  level: number; isUnlocked: boolean; unlockedAt?: string;
}

export interface CharacterInfo {
  state: 'sleeping' | 'resting' | 'awake' | 'energized' | 'powered' | 'legendary';
  powerPercent: number; title: string; auraColor: string; description: string;
}

export function getCharacterInfo(power: number): CharacterInfo {
  if (power === 0) return { state: 'sleeping', powerPercent: 0, title: 'DORMANT', auraColor: '#333355', description: 'Your spirit sleeps...' };
  if (power <= 20) return { state: 'resting', powerPercent: power, title: 'AWAKENING', auraColor: '#7766AA', description: "You're building momentum..." };
  if (power <= 40) return { state: 'awake', powerPercent: power, title: 'FOCUSED', auraColor: '#00e5cc', description: 'Your spirit stirs.' };
  if (power <= 60) return { state: 'energized', powerPercent: power, title: 'CHARGED', auraColor: '#29b6f6', description: 'Energy flows through you.' };
  if (power <= 80) return { state: 'powered', powerPercent: power, title: 'POWERED', auraColor: '#9c64ff', description: 'Unstoppable force.' };
  return { state: 'legendary', powerPercent: power, title: 'LEGENDARY', auraColor: '#FF6B35', description: 'UNSTOPPABLE. Pure momentum!' };
}

export interface CategoryConfig { id: MissionCategory; name: string; icon: string; color: string; gradient: string; }
