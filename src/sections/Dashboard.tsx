
import { motion } from 'framer-motion';
import { TrendingUp, Sword, CalendarClock, ChevronRight } from 'lucide-react';
import type { UserProgress, Mission, Badge, GamePower } from '@/types';
import { LEVELS } from '@/data/missions';
import { SpiritCard } from './SpiritCard';
import type { SpiritState } from '@/data/spirit';

const CHECKS = [
  { e:'⏰', t:'Wake without snooze', xp:100 },
  { e:'🏃', t:'Move body',           xp:80  },
  { e:'📚', t:'Focus work / study',  xp:120 },
  { e:'🍽️', t:'Eat on time',         xp:60  },
  { e:'💧', t:'Drink water (8 glasses)', xp:50 },
  { e:'👥', t:'Connect with someone', xp:70 },
  { e:'❌', t:'No doom scrolling',   xp:100 },
  { e:'😴', t:'Sleep on time',       xp:60  },
];

const WEEK_DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

interface DashboardProps {
  userProgress: UserProgress;
  todayMissions: Mission[];
  badges: Badge[];
  gamePowers: GamePower[];
  onStartMission: (mission: Mission) => void;
  onViewAllMissions: () => void;
  onViewBadges?: () => void;
  onViewStats?: () => void;
  onViewChallenges: () => void;
  onViewTimetable: () => void;
  getLevelProgress: () => number;
  getCurrentLevel: () => typeof LEVELS[0];
  getDailyStatus: () => { completed: number; total: number; percentage: number; streakTargetMet: boolean };
  onCompleteCheck?: (id: string, xp: number) => void;
  completedChecks?: string[];
  userName?: string;
  spiritState?: SpiritState;
  onOpenSpiritCustomize?: () => void;
  getScore?: () => number;
}

export function Dashboard({
  userProgress, todayMissions, badges, gamePowers,
  onStartMission, onViewAllMissions, onViewBadges, onViewStats,
  onViewChallenges, onViewTimetable,
  getLevelProgress, getCurrentLevel, getDailyStatus, onCompleteCheck, completedChecks, userName = 'J.J', spiritState, onOpenSpiritCustomize,
}: DashboardProps) {
  const completedSet = new Set(completedChecks || []);
  const currentLevel = getCurrentLevel();
  const dailyStatus = getDailyStatus();
  const unlockedBadges = badges.filter(b => b.unlockedAt);
  const pendingMissions = todayMissions.filter(m => !m.completed && !m.skipped);

  // auto stage from streak
  const autoStage = userProgress.currentStreak >= 30 ? 5
    : userProgress.currentStreak >= 21 ? 4
    : userProgress.currentStreak >= 14 ? 3
    : userProgress.currentStreak >= 7  ? 2
    : userProgress.currentStreak >= 3  ? 1 : 0;

  const tapCheck = (i: number) => {
    const id = `check_${i}`;
    if (completedSet.has(id)) return;
    onCompleteCheck?.(id, CHECKS[i].xp);
  };

  // Week progress
  const today = new Date().getDay();
  const weekDone = Array.from({ length: 7 }, (_, i) => {
    const dayIdx = (i + 1) % 7;
    return dayIdx < today || (dayIdx === today && dailyStatus.streakTargetMet);
  });

  return (
    <div className="h-screen bg-background pb-24 overflow-y-auto no-scrollbar" style={{WebkitOverflowScrolling:"touch"}}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_12px_rgba(0,229,204,0.3)]">
              <img src="/logo.png" alt="" className="w-full h-full object-cover"/>
            </div>
            <div>
              <h1 className="text-base font-black text-foreground">Level Up Life</h1>
              <p className="text-[10px] text-[#00e5cc] font-mono">SELF GROWTH. GAMIFIED.</p>
            </div>
          </div>
          <button onClick={onViewStats} className="p-2 rounded-xl bg-secondary/60">
            <TrendingUp className="w-4 h-4 text-muted-foreground"/>
          </button>
        </div>
      </header>

      <div className="px-3 pt-3 space-y-3">

        {/* ── SPIRIT CARD ── */}
        {spiritState && (
          <SpiritCard
            userProgress={userProgress}
            spiritState={spiritState}
            gamePowers={gamePowers}
            onOpenCustomize={onOpenSpiritCustomize}
          />
        )}

                {/* ── STATS ROW ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: userProgress.xp.toLocaleString(), l: 'Total XP', c: '#ffd700' },
            { v: userProgress.currentStreak, l: 'Streak 🔥', c: '#00e5cc' },
            { v: userProgress.totalMissionsCompleted, l: 'Done ✅', c: '#00e676' },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-3 text-center">
              <p className="text-xl font-black" style={{ color: s.c }}>{s.v}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* ── PHILOSOPHY ── */}
        <div className="philosophy-card rounded-2xl p-4 text-center">
          <p className="text-sm font-bold italic leading-relaxed text-foreground">
            "Day by day… you are becoming someone.<br/>Choose who."
          </p>
          <p className="text-[10px] text-[#00e5cc] font-mono mt-2 tracking-wider">
            // GROW OR DECAY — YOU DECIDE DAILY //
          </p>
        </div>

        {/* ── DAILY CHECKLIST ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-black">Daily Checklist</p>
            <button onClick={onViewAllMissions} className="text-xs text-[#00e5cc] font-semibold">All Missions →</button>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {CHECKS.map((c, i) => (
              <button key={i} onClick={() => tapCheck(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 text-left transition-all active:bg-secondary/50 ${completedSet.has('check_'+i) ? 'opacity-50' : ''}`}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs flex-shrink-0 transition-all
                  ${completedSet.has('check_'+i) ? 'bg-green-500/20 border-green-400 text-green-400' : 'border-muted-foreground/40'}`}>
                  {completedSet.has('check_'+i) ? '✓' : ''}
                </div>
                <span className={`text-sm flex-1 ${completedSet.has('check_'+i) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {c.e} {c.t}
                </span>
                <span className={`text-xs font-bold ${completedSet.has('check_'+i) ? 'text-green-400' : 'text-yellow-400'}`}>
                  {completedSet.has('check_'+i) ? '✓' : `+${c.xp}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale:0.97 }} onClick={onViewChallenges}
            className="bg-card rounded-2xl border border-border p-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Sword className="w-4 h-4 text-red-400"/>
              <span className="text-xs font-bold text-red-400">⚔️ Challenges</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Real-life missions → unlock powers</p>
          </motion.button>
          <motion.button whileTap={{ scale:0.97 }} onClick={onViewTimetable}
            className="bg-card rounded-2xl border border-border p-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 text-[#00e5cc]"/>
              <span className="text-xs font-bold text-[#00e5cc]">📋 Timetable</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Your daily goals & schedule</p>
          </motion.button>
        </div>

        {/* ── TODAY'S MISSIONS ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-black">Today's Missions</p>
            <button onClick={onViewAllMissions} className="text-xs text-[#00e5cc] font-semibold flex items-center gap-1">
              All <ChevronRight className="w-3 h-3"/>
            </button>
          </div>
          <div className="space-y-2">
            {pendingMissions.slice(0, 3).map(m => (
              <motion.button key={m.id} whileTap={{ scale:0.98 }} onClick={() => onStartMission(m)}
                className="w-full bg-card rounded-2xl border border-border p-4 text-left flex items-center gap-3">
                <div className="text-2xl flex-shrink-0">{m.icon || '🎯'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-yellow-400">+{m.xpReward} XP</p>
                  <p className="text-[10px] text-muted-foreground">tap to set</p>
                </div>
              </motion.button>
            ))}
            {pendingMissions.length === 0 && (
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                <p className="text-3xl mb-2">✨</p>
                <p className="text-sm font-bold">All missions complete!</p>
                <p className="text-xs text-muted-foreground mt-1">Check back tomorrow</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RECENT BADGES ── */}
        {unlockedBadges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-black">Recent Badges</p>
              <button onClick={onViewBadges} className="text-xs text-[#00e5cc] font-semibold">All →</button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {unlockedBadges.slice(-5).reverse().map(b => (
                <div key={b.id} className="flex-shrink-0 bg-card rounded-2xl border border-[rgba(0,229,204,0.25)] p-3 w-20 text-center">
                  <p className="text-2xl mb-1">{b.icon}</p>
                  <p className="text-[9px] font-semibold leading-tight">{b.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WEEK PROGRESS ── */}
        <div className="bg-card rounded-2xl border border-yellow-400/20 p-4">
          <p className="text-[11px] font-bold text-yellow-400 font-mono mb-3">// WEEK PROGRESS //</p>
          <div className="flex gap-1.5">
            {WEEK_DAYS.map((d, i) => {
              const isToday = i === (new Date().getDay() + 6) % 7;
              const isDone = weekDone[i];
              return (
                <div key={d} className="flex-1 text-center">
                  <div className={`w-full aspect-square rounded-lg border flex items-center justify-center text-xs mb-1 transition-all
                    ${isDone ? 'bg-green-500/15 border-green-400 text-green-400' :
                      isToday ? 'bg-[rgba(0,229,204,0.15)] border-[#00e5cc] text-[#00e5cc] shadow-[0_0_8px_rgba(0,229,204,0.3)]' :
                      'bg-secondary border-border text-muted-foreground'}`}>
                    {isDone ? '✓' : isToday ? '●' : '○'}
                  </div>
                  <p className="text-[7px] text-muted-foreground">{d}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
