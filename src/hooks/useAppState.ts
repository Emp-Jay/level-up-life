import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { 
  UserProgress, DailyProgress, Mission, Badge, UserSettings,
  DailyReflection, TimeOfDay, CustomTask, Challenge, GamePower
} from '@/types';
import { MISSION_TEMPLATES, LEVELS, BADGES } from '@/data/missions';
import { DEFAULT_CHALLENGES, GAME_POWERS } from '@/data/challenges';

const STORAGE_KEYS = {
  USER_PROGRESS: 'lul_user_progress',
  DAILY_PROGRESS: 'lul_daily_progress',
  TODAY_MISSIONS: 'lul_today_missions',
  COMPLETED_MISSIONS: 'lul_completed_missions',
  BADGES: 'lul_badges',
  SETTINGS: 'lul_settings',
  REFLECTIONS: 'lul_reflections',
  CUSTOM_TASKS: 'lul_custom_tasks',
  CHALLENGES: 'lul_challenges',
  GAME_POWERS: 'lul_game_powers',
};

const DEFAULT_SETTINGS: UserSettings = {
  categories: ['productivity', 'social', 'mental', 'learning', 'organization', 'mindfulness'],
  notificationFrequency: 'medium', quietHoursStart: '22:00', quietHoursEnd: '07:00',
  missionIntensity: 'balanced', morningTime: '09:00', afternoonTime: '14:00', eveningTime: '19:00',
  soundEnabled: true, vibrationEnabled: true, notificationsEnabled: true,
  sundayResetMode: true, accentColor: '#00e5cc',
};

const DEFAULT_USER_PROGRESS: UserProgress = {
  level: 1, xp: 0, xpToNextLevel: 100, totalMissionsCompleted: 0,
  currentStreak: 0, longestStreak: 0, lastCompletedDate: null,
  graceDaysUsed: 0, graceDaysAvailable: 3,
  characterPower: 0, powersUnlocked: [], challengesCompleted: 0,
};

function getToday(): string { return new Date().toISOString().split('T')[0]; }

export function useAppState() {
  const [userProgress, setUserProgress] = useState<UserProgress>(DEFAULT_USER_PROGRESS);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [todayMissions, setTodayMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Mission[]>([]);
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  const [gamePowers, setGamePowers] = useState<GamePower[]>(GAME_POWERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all data
  useEffect(() => {
    const load = async () => {
      try {
        const keys = Object.values(STORAGE_KEYS);
        const results = await Promise.all(keys.map(k => Preferences.get({ key: k })));
        const [up, dp, tm, cm, bg, st, rf, ct, ch, gp] = results;

        if (up.value) setUserProgress({ ...DEFAULT_USER_PROGRESS, ...JSON.parse(up.value) });
        if (dp.value) setDailyProgress(JSON.parse(dp.value));
        if (tm.value) setTodayMissions(JSON.parse(tm.value));
        if (cm.value) setCompletedMissions(JSON.parse(cm.value));
        if (bg.value) setBadges(JSON.parse(bg.value));
        if (st.value) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(st.value) });
        if (rf.value) setReflections(JSON.parse(rf.value));
        if (ct.value) setCustomTasks(JSON.parse(ct.value));
        if (ch.value) setChallenges(JSON.parse(ch.value));
        else setChallenges(DEFAULT_CHALLENGES);
        if (gp.value) setGamePowers(JSON.parse(gp.value));
        else setGamePowers(GAME_POWERS);
      } catch (e) { console.error('Load error:', e); }
      setIsLoaded(true);
    };
    load();
  }, []);

  // Generate daily missions
  useEffect(() => {
    if (!isLoaded) return;
    const today = getToday();
    const needsNew = !todayMissions.length || !todayMissions[0]?.scheduledFor?.startsWith(today);
    if (needsNew) generateDailyMissions();
  }, [isLoaded]);

  const save = useCallback(async (key: string, value: unknown) => {
    await Preferences.set({ key, value: JSON.stringify(value) });
  }, []);

  const generateDailyMissions = useCallback(() => {
    const hour = new Date().getHours();
    const timeOfDay: TimeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const today = getToday();
    const enabled = settings.categories;

    const filtered = MISSION_TEMPLATES.filter(m =>
      enabled.includes(m.category) && (m.timeOfDay.includes(timeOfDay) || m.timeOfDay.includes('any'))
    );
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 6);
    const missions: Mission[] = shuffled.map(t => ({
      id: `${t.id}_${today}`, title: t.title, description: t.description,
      category: t.category, duration: 120, xpReward: t.xpReward,
      completed: false, skipped: false, scheduledFor: today,
    }));
    setTodayMissions(missions);
    save(STORAGE_KEYS.TODAY_MISSIONS, missions);
  }, [settings.categories, save]);

  // ─── Character Power Calculator ───────────────────────────────────
  const recalcCharacterPower = useCallback((progress: UserProgress, todayDone: number, tasksDone: number, challengesDone: number) => {
    const missionPower = Math.min(30, todayDone * 5);
    const taskPower = Math.min(30, tasksDone * 6);
    const challengePower = Math.min(30, challengesDone * 5);
    const streakBonus = Math.min(10, progress.currentStreak);
    return Math.min(100, missionPower + taskPower + challengePower + streakBonus);
  }, []);

  // ─── Complete Mission ─────────────────────────────────────────────
  const completeMission = useCallback(async (missionId: string) => {
    const mission = todayMissions.find(m => m.id === missionId);
    if (!mission) return;

    const now = new Date().toISOString();
    const today = getToday();
    const updatedMissions = todayMissions.map(m =>
      m.id === missionId ? { ...m, completed: true, completedAt: now } : m
    );
    const newCompleted = [...completedMissions, { ...mission, completed: true, completedAt: now }];

    // XP & level
    let newXP = userProgress.xp + mission.xpReward;
    let newLevel = userProgress.level;
    const currentLevelData = LEVELS.find(l => l.level === newLevel);
    if (currentLevelData && newXP >= currentLevelData.xpRequired + (LEVELS.find(l => l.level === newLevel + 1)?.xpRequired ?? Infinity) - currentLevelData.xpRequired) {
      newLevel += 1;
    }
    // Simple level calc
    const nextLevel = LEVELS.find(l => l.xpRequired > newXP);
    if (nextLevel) newLevel = Math.max(newLevel, nextLevel.level - 1);

    // Streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastDate = userProgress.lastCompletedDate;
    let newStreak = userProgress.currentStreak;
    if (lastDate === today) {
      newStreak = userProgress.currentStreak;
    } else if (lastDate === yesterday) {
      newStreak = userProgress.currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const todayCount = updatedMissions.filter(m => m.completed).length;
    const newPower = recalcCharacterPower(
      { ...userProgress, currentStreak: newStreak },
      todayCount,
      customTasks.filter(t => t.completedDates.includes(today)).length,
      userProgress.challengesCompleted
    );

    const newProgress: UserProgress = {
      ...userProgress,
      xp: newXP,
      level: newLevel,
      totalMissionsCompleted: userProgress.totalMissionsCompleted + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(userProgress.longestStreak, newStreak),
      lastCompletedDate: today,
      characterPower: newPower,
    };

    setUserProgress(newProgress);
    setTodayMissions(updatedMissions);
    setCompletedMissions(newCompleted);

    await save(STORAGE_KEYS.USER_PROGRESS, newProgress);
    await save(STORAGE_KEYS.TODAY_MISSIONS, updatedMissions);
    await save(STORAGE_KEYS.COMPLETED_MISSIONS, newCompleted);

    checkBadges(newProgress, updatedMissions);
  }, [todayMissions, completedMissions, userProgress, customTasks, save, recalcCharacterPower]);

  const skipMission = useCallback(async (missionId: string) => {
    const updated = todayMissions.map(m => m.id === missionId ? { ...m, skipped: true } : m);
    setTodayMissions(updated);
    await save(STORAGE_KEYS.TODAY_MISSIONS, updated);
  }, [todayMissions, save]);

  // ─── Custom Tasks ─────────────────────────────────────────────────
  const addCustomTask = useCallback(async (task: Omit<CustomTask, 'id' | 'createdAt' | 'completedDates'>) => {
    const newTask: CustomTask = {
      ...task, id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(), completedDates: [],
      xpReward: task.xpReward ?? 80,
      emoji: task.emoji ?? '🎯',
    };
    const updated = [...customTasks, newTask];
    setCustomTasks(updated);
    await save(STORAGE_KEYS.CUSTOM_TASKS, updated);
    return newTask;
  }, [customTasks, save]);

  const deleteCustomTask = useCallback(async (taskId: string) => {
    const updated = customTasks.filter(t => t.id !== taskId);
    setCustomTasks(updated);
    await save(STORAGE_KEYS.CUSTOM_TASKS, updated);
  }, [customTasks, save]);

  const toggleCustomTask = useCallback(async (taskId: string) => {
    const updated = customTasks.map(t => t.id === taskId ? { ...t, isEnabled: !t.isEnabled } : t);
    setCustomTasks(updated);
    await save(STORAGE_KEYS.CUSTOM_TASKS, updated);
  }, [customTasks, save]);

  const completeCustomTask = useCallback(async (taskId: string) => {
    const today = getToday();
    const task = customTasks.find(t => t.id === taskId);
    if (!task || task.completedDates.includes(today)) return 0;

    const updated = customTasks.map(t =>
      t.id === taskId ? { ...t, completedDates: [...t.completedDates, today] } : t
    );
    setCustomTasks(updated);
    await save(STORAGE_KEYS.CUSTOM_TASKS, updated);

    // Award XP
    const todayDone = todayMissions.filter(m => m.completed).length;
    const tasksDone = updated.filter(t => t.completedDates.includes(today)).length;
    const newPower = recalcCharacterPower(userProgress, todayDone, tasksDone, userProgress.challengesCompleted);
    const newProgress = { ...userProgress, xp: userProgress.xp + task.xpReward, characterPower: newPower };
    setUserProgress(newProgress);
    await save(STORAGE_KEYS.USER_PROGRESS, newProgress);
    return task.xpReward;
  }, [customTasks, save, userProgress, todayMissions, recalcCharacterPower]);

  const isTaskCompletedToday = useCallback((taskId: string) => {
    const task = customTasks.find(t => t.id === taskId);
    return task?.completedDates.includes(getToday()) ?? false;
  }, [customTasks]);

  // ─── Challenges ───────────────────────────────────────────────────
  const updateChallengeProgress = useCallback(async (challengeId: string, progress: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.status === 'completed') return false;

    const newProgress = Math.min(progress, challenge.targetValue);
    const completed = newProgress >= challenge.targetValue;
    const updated = challenges.map(c =>
      c.id === challengeId ? {
        ...c, currentProgress: newProgress,
        status: completed ? 'completed' as const : 'active' as const,
        completedAt: completed ? new Date().toISOString() : undefined,
      } : c
    );
    setChallenges(updated);
    await save(STORAGE_KEYS.CHALLENGES, updated);

    if (completed) {
      // Unlock power
      const powerType = challenge.powerReward;
      const nextPower = gamePowers.find(p => p.type === powerType && !p.isUnlocked);
      let updatedPowers = gamePowers;
      if (nextPower) {
        updatedPowers = gamePowers.map(p =>
          p.id === nextPower.id ? { ...p, isUnlocked: true, unlockedAt: new Date().toISOString() } : p
        );
        setGamePowers(updatedPowers);
        await save(STORAGE_KEYS.GAME_POWERS, updatedPowers);
      }

      const today = getToday();
      const todayDone = todayMissions.filter(m => m.completed).length;
      const tasksDone = customTasks.filter(t => t.completedDates.includes(today)).length;
      const newChallengesCompleted = userProgress.challengesCompleted + 1;
      const newPower = recalcCharacterPower(userProgress, todayDone, tasksDone, newChallengesCompleted);
      const newXP = userProgress.xp + challenge.xpReward;
      const newUnlocked = nextPower ? [...(userProgress.powersUnlocked || []), nextPower.id] : userProgress.powersUnlocked;
      
      const newProgress: UserProgress = {
        ...userProgress, xp: newXP, challengesCompleted: newChallengesCompleted,
        characterPower: newPower, powersUnlocked: newUnlocked,
      };
      setUserProgress(newProgress);
      await save(STORAGE_KEYS.USER_PROGRESS, newProgress);
    }
    return completed;
  }, [challenges, gamePowers, userProgress, save, todayMissions, customTasks, recalcCharacterPower]);

  const addCustomChallenge = useCallback(async (challenge: Omit<Challenge, 'id' | 'createdAt' | 'currentProgress' | 'status'>) => {
    const newChallenge: Challenge = {
      ...challenge, id: `ch_${Date.now()}`, createdAt: new Date().toISOString(),
      currentProgress: 0, status: 'active',
    };
    const updated = [...challenges, newChallenge];
    setChallenges(updated);
    await save(STORAGE_KEYS.CHALLENGES, updated);
  }, [challenges, save]);

  // ─── Settings ─────────────────────────────────────────────────────
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await save(STORAGE_KEYS.SETTINGS, updated);
  }, [settings, save]);

  // ─── Reflection ───────────────────────────────────────────────────
  const addReflection = useCallback(async (content: string, mood: DailyReflection['mood']) => {
    const reflection: DailyReflection = { date: getToday(), content, mood };
    const updated = [reflection, ...reflections.filter(r => r.date !== getToday())];
    setReflections(updated);
    await save(STORAGE_KEYS.REFLECTIONS, updated);
  }, [reflections, save]);

  // ─── Daily Checklist ─────────────────────────────────────────────
  const completeCheckItem = useCallback(async (itemId: string, xp: number) => {
    const today = getToday();
    const current = dailyProgress || { date: today, missionsCompleted: 0, xpEarned: 0, checklistDone: [] };
    if (current.checklistDone.includes(itemId)) return;
    const updated = { ...current, date: today, checklistDone: [...current.checklistDone, itemId], xpEarned: current.xpEarned + xp };
    setDailyProgress(updated);
    await save(STORAGE_KEYS.DAILY_PROGRESS, updated);
    // Inline XP update (avoid circular dependency with addXP)
    const newProgress = { ...userProgress, xp: userProgress.xp + xp, totalMissionsCompleted: userProgress.totalMissionsCompleted + 1, lastCompletedDate: today };
    for (let i = LEVELS.length - 1; i >= 0; i--) { if (newProgress.xp >= LEVELS[i].xpRequired) { newProgress.level = i + 1; break; } }
    setUserProgress(newProgress);
    await save(STORAGE_KEYS.USER_PROGRESS, newProgress);
  }, [dailyProgress, userProgress, save]);

  const getTodayChecklist = useCallback(() => {
    const today = getToday();
    if (!dailyProgress || dailyProgress.date !== today) return [];
    return dailyProgress.checklistDone;
  }, [dailyProgress]);

  // ─── Delete Reflection ───────────────────────────────────────────
  const deleteReflection = useCallback(async (date: string) => {
    const updated = reflections.filter(r => r.date !== date);
    setReflections(updated);
    await save(STORAGE_KEYS.REFLECTIONS, updated);
  }, [reflections, save]);

  // ─── Badge Check ──────────────────────────────────────────────────
  const checkBadges = useCallback((progress: UserProgress, missions: Mission[]) => {
    const _todayCompleted = missions.filter(m => m.completed).length; void _todayCompleted;
    const updated = badges.map(badge => {
      if (badge.unlockedAt) return badge;
      let unlocked = false;
      if (badge.requirement.type === 'missions' && progress.totalMissionsCompleted >= badge.requirement.value) unlocked = true;
      if (badge.requirement.type === 'streak' && progress.currentStreak >= badge.requirement.value) unlocked = true;
      if (badge.requirement.type === 'level' && progress.level >= badge.requirement.value) unlocked = true;
      if (badge.requirement.type === 'challenge' && progress.challengesCompleted >= badge.requirement.value) unlocked = true;
      return unlocked ? { ...badge, unlockedAt: new Date().toISOString() } : badge;
    });
    setBadges(updated);
    save(STORAGE_KEYS.BADGES, updated);
  }, [badges, save]);

  // ─── Computed Helpers ─────────────────────────────────────────────
  const getCurrentLevel = useCallback(() => {
    const level = LEVELS.slice().reverse().find(l => userProgress.xp >= l.xpRequired);
    return level || LEVELS[0];
  }, [userProgress.xp]);

  const getLevelProgress = useCallback(() => {
    const current = getCurrentLevel();
    const idx = LEVELS.indexOf(current);
    const next = LEVELS[idx + 1];
    if (!next) return 100;
    const range = next.xpRequired - current.xpRequired;
    const progress = userProgress.xp - current.xpRequired;
    return Math.min(100, Math.round((progress / range) * 100));
  }, [userProgress.xp, getCurrentLevel]);

  const getDailyStatus = useCallback(() => {
    const completed = todayMissions.filter(m => m.completed).length;
    const total = todayMissions.length;
    return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0, streakTargetMet: completed >= 3 };
  }, [todayMissions]);

  const getScore = useCallback(() => {
    const today = getToday();
    const todayCompleted = todayMissions.filter(m => m.completed).length;
    const tasksDone = customTasks.filter(t => t.completedDates.includes(today)).length;
    const score = Math.min(100, (todayCompleted * 12) + (tasksDone * 10) + (userProgress.currentStreak * 2));
    return score;
  }, [todayMissions, customTasks, userProgress.currentStreak]);

  // ─── Spend XP (accessories, etc.) ────────────────────────────────
  const spendXP = useCallback(async (amount: number): Promise<boolean> => {
    if (userProgress.xp < amount) return false;
    const newProgress = { ...userProgress, xp: userProgress.xp - amount };
    setUserProgress(newProgress);
    await save(STORAGE_KEYS.USER_PROGRESS, newProgress);
    return true;
  }, [userProgress, save]);


  // ─── Add XP directly (for checklist items) ───────────────────────
  const addXP = useCallback(async (amount: number) => {
    const today = getToday();
    const lastDate = userProgress.lastCompletedDate;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    let newStreak = userProgress.currentStreak;
    if (lastDate !== today) {
      newStreak = (lastDate === yStr) ? userProgress.currentStreak + 1 : 1;
    }
    const newProgress = {
      ...userProgress,
      xp: userProgress.xp + amount,
      totalMissionsCompleted: userProgress.totalMissionsCompleted + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(userProgress.longestStreak, newStreak),
      lastCompletedDate: today,
    };
    // Level up check
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (newProgress.xp >= LEVELS[i].xpRequired) { newProgress.level = i + 1; break; }
    }
    setUserProgress(newProgress);
    await save(STORAGE_KEYS.USER_PROGRESS, newProgress);
    checkBadges(newProgress, todayMissions);
  }, [userProgress, todayMissions, save, checkBadges]);

  return {
    userProgress, dailyProgress, todayMissions, completedMissions,
    badges, settings, reflections, isLoaded,
    customTasks, challenges, gamePowers,
    completeMission, skipMission, updateSettings, addReflection, deleteReflection, completeCheckItem, getTodayChecklist,
    generateDailyMissions, getCurrentLevel, getLevelProgress,
    getDailyStatus, getScore, spendXP,
    addCustomTask, deleteCustomTask, toggleCustomTask, completeCustomTask, isTaskCompletedToday,
    updateChallengeProgress, addCustomChallenge, addXP,
  };
}
