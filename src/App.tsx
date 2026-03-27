import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Onboarding } from '@/sections/Onboarding';
import { Dashboard } from '@/sections/Dashboard';
import { Missions } from '@/sections/Missions';
import { Timer } from '@/sections/Timer';
import { Badges } from '@/sections/Badges';
import { Reflection } from '@/sections/Reflection';
import { ReflectionHistory } from '@/sections/ReflectionHistory';
import { Settings } from '@/sections/Settings';
import { Stats } from '@/sections/Stats';
import { Challenges } from '@/sections/Challenges';
import { Timetable } from '@/sections/Timetable';
import { SpiritCustomize } from '@/sections/SpiritCustomize';
import { Navigation } from '@/sections/Navigation';
import type { Mission } from '@/types';
import type { SpiritState } from '@/data/spirit';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';

type View = 'dashboard'|'missions'|'timer'|'badges'|'reflection'|'reflection-history'
           |'settings'|'stats'|'challenges'|'timetable'|'spirit-customize';
const BOTTOM_TABS: View[] = ['dashboard','missions','badges','reflection','settings'];

const DEFAULT_SPIRIT: SpiritState = {
  season: 'water', stage: 0, prestige: 0, isGodTier: false,
  unlockedSeasons: ['water'], unlockedAccessories: [], activeAccessories: [], totalEvolutions: 0,
};

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [prevView, setPrevView] = useState<View>('dashboard');
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('J.J');
  const [spiritState, setSpiritState] = useState<SpiritState>(DEFAULT_SPIRIT);
  const [xpPopup, setXpPopup] = useState<{msg:string;key:number} | null>(null);
  const xpTimer = useRef<any>(null);

  const momentum = useAppState();

  // ── Load saved prefs on mount ──
  useEffect(() => {
    async function load() {
      try {
        const [ob, nm, dm, ss, st] = await Promise.all([
          Preferences.get({ key: 'lul_onboarded' }),
          Preferences.get({ key: 'lul_username' }),
          Preferences.get({ key: 'lul_darkmode' }),
          Preferences.get({ key: 'lul_spirit' }),
          Preferences.get({ key: 'lul_settings' }),
        ]);
        setOnboarded(ob.value === '1');
        if (nm.value) setUserName(nm.value);
        const dark = dm.value !== '0';
        setIsDark(dark);
        if (!dark) document.documentElement.classList.add('light');
        if (ss.value) setSpiritState({ ...DEFAULT_SPIRIT, ...JSON.parse(ss.value) });
        // Apply saved accent color
        try {
          const savedSettings = JSON.parse(st?.value || '{}');
          if (savedSettings.accentColor) {
            document.documentElement.style.setProperty('--teal', savedSettings.accentColor);
            document.documentElement.style.setProperty('--teal2', savedSettings.accentColor + 'bb');
          }
        } catch {}
      } catch { setOnboarded(false); }
    }
    load();
  }, []);

  // ── Dark mode sync ──
  useEffect(() => {
    if (isDark) document.documentElement.classList.remove('light');
    else document.documentElement.classList.add('light');
  }, [isDark]);

  // ── Schedule notifications ──
  useEffect(() => {
    if (!momentum.settings) return;
    scheduleNotifications(momentum.settings, momentum.customTasks);
  }, [momentum.settings, momentum.customTasks]);

  const scheduleNotifications = async (settings: any, tasks?: any[]) => {
    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') return;

      // Create channel
      try {
        await (LocalNotifications as any).createChannel({
          id: 'lul_main', name: 'Level Up Life',
          description: 'Daily reminders', importance: 4, vibration: true,
        });
      } catch {}

      // Cancel all existing notifications (ids 1-50)
      const allIds = Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }));
      await LocalNotifications.cancel({ notifications: allIds });

      const toSchedule: any[] = [];

      // Helper: get next occurrence of a given HH:MM time
      const nextAt = (timeStr: string): Date => {
        const [h, m] = timeStr.split(':').map(Number);
        const now = new Date();
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
        // If time has already passed today, schedule for tomorrow
        if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
        return d;
      };

      // Daily system notifications
      const dailyNotifs = [
        { id: 1, title: '🌅 Morning Mission', body: 'Time to wake up — no snooze! Start strong.', time: settings.morningTime || '06:00' },
        { id: 2, title: '🎯 Focus Block', body: 'What is your #1 task today? Start it now.', time: settings.afternoonTime || '14:00' },
        { id: 3, title: '🌇 Evening Reset', body: 'Go for that walk. Reconnect. You earned it.', time: settings.eveningTime || '19:00' },
        { id: 4, title: '🌙 Reflect', body: 'Reflect on today before you sleep. Grow from it.', time: '21:30' },
      ];

      for (const n of dailyNotifs) {
        toSchedule.push({
          id: n.id, title: n.title, body: n.body,
          schedule: { at: nextAt(n.time), repeats: true, every: 'day' as const },
          channelId: 'lul_main', smallIcon: 'ic_stat_icon_config_sample',
          sound: undefined, attachments: undefined, actionTypeId: '', extra: null,
        });
      }

      // Custom task notifications
      if (tasks && tasks.length > 0) {
        const today = new Date().getDay(); // 0=Sun
        tasks.forEach((task: any, idx: number) => {
          if (!task.isEnabled || !task.scheduledTime) return;

          // Check if task runs today
          const runs = task.repeat === 'daily' ||
            (task.repeat === 'weekdays' && today >= 1 && today <= 5) ||
            (task.repeat === 'weekends' && (today === 0 || today === 6)) ||
            (task.repeat === 'once' && task.specificDate === new Date().toISOString().split('T')[0]);

          if (!runs) return;

          toSchedule.push({
            id: 10 + idx,
            title: `${task.emoji || '🎯'} ${task.title}`,
            body: task.description || 'Time for your scheduled task!',
            schedule: {
              at: nextAt(task.scheduledTime),
              repeats: task.repeat !== 'once',
              every: task.repeat !== 'once' ? 'day' as const : undefined,
            },
            channelId: 'lul_main', smallIcon: 'ic_stat_icon_config_sample',
            sound: undefined, attachments: undefined, actionTypeId: '', extra: null,
          });
        });
      }

      if (toSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: toSchedule });
        console.log(`Scheduled ${toSchedule.length} notifications`);
      }
    } catch (e) { console.log('Notification error:', e); }
  };

  const showXP = (msg: string) => {
    setXpPopup({ msg, key: Date.now() });
    if (xpTimer.current) clearTimeout(xpTimer.current);
    xpTimer.current = setTimeout(() => setXpPopup(null), 2200);
  };

  const navTo = (v: View) => { setPrevView(view); setView(v); };

  const startMission = (m: Mission) => { setActiveMission(m); setPrevView(view); setView('timer'); };

  const finishOnboarding = async (name: string, wakeTime: string, _goals: string[]) => {
    setUserName(name);
    setOnboarded(true);
    try {
      await Promise.all([
        Preferences.set({ key: 'lul_onboarded', value: '1' }),
        Preferences.set({ key: 'lul_username', value: name }),
        Preferences.set({ key: 'lul_waketime', value: wakeTime }),
      ]);
    } catch {}
    showXP('Welcome! Your journey begins 🚀');
  };

  const saveSpiritState = async (s: SpiritState) => {
    setSpiritState(s);
    try { await Preferences.set({ key: 'lul_spirit', value: JSON.stringify(s) }); } catch {}
  };

  const updateSpirit = (partial: Partial<SpiritState>) => {
    saveSpiritState({ ...spiritState, ...partial });
  };

  const handlePrestige = async () => {
    const nextSeasonIdx = Math.min(spiritState.prestige + 1, 3);
    const seasons = ['water','fire','cosmos','shadow'] as const;
    const newState: SpiritState = {
      ...spiritState,
      season: seasons[nextSeasonIdx],
      stage: 0,
      prestige: spiritState.prestige + 1,
      isGodTier: momentum.userProgress.longestStreak >= 60,
      totalEvolutions: (spiritState.totalEvolutions || 0) + 1,
      unlockedSeasons: [...new Set([...spiritState.unlockedSeasons, seasons[nextSeasonIdx]])],
    };
    saveSpiritState(newState);
    showXP(`🌟 PRESTIGE! Season ${spiritState.prestige + 2} begins!`);
  };

  const toggleDark = async () => {
    const next = !isDark; setIsDark(next);
    try { await Preferences.set({ key: 'lul_darkmode', value: next ? '1' : '0' }); } catch {}
  };

  // Loading
  if (onboarded === null) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Zap className="w-8 h-8 text-[#00e5cc]"/>
      </motion.div>
    </div>
  );

  if (!onboarded) return <Onboarding onComplete={finishOnboarding}/>;

  return (
    <div className="relative h-screen overflow-hidden bg-background">

      {/* XP Popup */}
      <AnimatePresence>
        {xpPopup && (
          <motion.div key={xpPopup.key}
            initial={{ opacity: 1, y: 0, scale: 0.7, x: '-50%' }}
            animate={{ opacity: 1, y: -30, scale: 1.2, x: '-50%' }}
            exit={{ opacity: 0, y: -80, scale: 1, x: '-50%' }}
            className="fixed top-1/4 left-1/2 z-50 text-xl font-black text-yellow-400 pointer-events-none whitespace-nowrap"
            style={{ fontFamily:"'Courier New',monospace", textShadow:'0 0 20px rgba(255,215,0,0.7)' }}>
            {xpPopup.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Views */}
      <AnimatePresence mode="wait">

        {view === 'dashboard' && (
          <motion.div key="v-dash" {...fade} className="absolute inset-0">
            <Dashboard
              userProgress={momentum.userProgress}
              todayMissions={momentum.todayMissions}
              badges={momentum.badges}
              spiritState={spiritState}
              gamePowers={momentum.gamePowers}
              onStartMission={startMission}
              onViewAllMissions={() => navTo('missions')}
              onViewBadges={() => navTo('badges')}
              onViewStats={() => navTo('stats')}
              onViewChallenges={() => navTo('challenges')}
              onViewTimetable={() => navTo('timetable')}
              onOpenSpiritCustomize={() => navTo('spirit-customize')}
              getLevelProgress={momentum.getLevelProgress}
              getCurrentLevel={momentum.getCurrentLevel}
              getDailyStatus={momentum.getDailyStatus}
              getScore={momentum.getScore}
              onCompleteCheck={(id, xp) => { momentum.completeCheckItem(id, xp); showXP(`+${xp} XP ✅`); }}
              completedChecks={momentum.getTodayChecklist()}
              userName={userName}
            />
          </motion.div>
        )}

        {view === 'missions' && (
          <motion.div key="v-miss" {...fade} className="absolute inset-0">
            <Missions missions={momentum.todayMissions} onStartMission={startMission} onBack={() => navTo('dashboard')}/>
          </motion.div>
        )}

        {view === 'timer' && activeMission && (
          <motion.div key="v-timer" {...fade} className="absolute inset-0">
            <Timer
              mission={activeMission}
              onComplete={() => {
                if (activeMission) { momentum.completeMission(activeMission.id); showXP(`+${activeMission.xpReward} XP ⚡`); }
                navTo(prevView);
              }}
              onBack={() => navTo(prevView)}
              onSkip={() => { if(activeMission) momentum.skipMission(activeMission.id); navTo(prevView); }}
            />
          </motion.div>
        )}

        {view === 'badges' && (
          <motion.div key="v-badges" {...fade} className="absolute inset-0">
            <Badges badges={momentum.badges} onBack={() => navTo('dashboard')}/>
          </motion.div>
        )}

        {view === 'reflection' && (
          <motion.div key="v-ref" {...fade} className="absolute inset-0">
            <Reflection
              onSave={(content, mood) => { momentum.addReflection(content, mood); showXP('Reflection saved! ✨'); navTo('dashboard'); }}
              onBack={() => navTo('dashboard')}
              existingReflection={momentum.reflections?.[0] || null}
              onViewHistory={() => navTo('reflection-history')}
            />
          </motion.div>
        )}

        {view === 'reflection-history' && (
          <motion.div key="v-refh" {...fade} className="absolute inset-0">
            <ReflectionHistory reflections={momentum.reflections || []} onDelete={momentum.deleteReflection} onBack={() => navTo('reflection')}/>
          </motion.div>
        )}

        {view === 'settings' && (
          <motion.div key="v-set" {...fade} className="absolute inset-0">
            <Settings
              settings={momentum.settings}
              userProgress={momentum.userProgress}
              onUpdateSettings={momentum.updateSettings}
              isDark={isDark}
              onToggleDark={toggleDark}
              userName={userName}
              onUpdateName={async n => { setUserName(n); try { await Preferences.set({ key:'lul_username', value:n }); } catch {} }}
            />
          </motion.div>
        )}

        {view === 'stats' && (
          <motion.div key="v-stats" {...fade} className="absolute inset-0">
            <Stats userProgress={momentum.userProgress} completedMissions={momentum.completedMissions} badges={momentum.badges} onBack={() => navTo('dashboard')}/>
          </motion.div>
        )}

        {view === 'challenges' && (
          <motion.div key="v-chal" {...fade} className="absolute inset-0">
            <Challenges
              challenges={momentum.challenges}
              gamePowers={momentum.gamePowers}
              onUpdateProgress={(id, prog) => momentum.updateChallengeProgress(id, prog)}
              onAddChallenge={c => momentum.addCustomChallenge(c)}
              onBack={() => navTo('dashboard')}
            />
          </motion.div>
        )}

        {view === 'timetable' && (
          <motion.div key="v-tt" {...fade} className="absolute inset-0">
            <Timetable
              tasks={momentum.customTasks}
              onAdd={t => momentum.addCustomTask(t)}
              onDelete={id => momentum.deleteCustomTask(id)}
              onToggle={() => {}}
              onComplete={id => { momentum.completeCustomTask(id); showXP('+80 XP ✅'); }}
              isCompletedToday={id => momentum.isTaskCompletedToday(id)}
              onBack={() => navTo('dashboard')}
            />
          </motion.div>
        )}

        {view === 'spirit-customize' && (
          <motion.div key="v-spirit" {...fade} className="absolute inset-0">
            <SpiritCustomize
              userProgress={momentum.userProgress}
              spiritState={spiritState}
              onUpdateSpirit={updateSpirit}
              onPrestige={handlePrestige}
              onSpendXP={momentum.spendXP}
              onClose={() => navTo('dashboard')}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Bottom Nav */}
      {BOTTOM_TABS.includes(view) && (
        <Navigation currentView={view} onNavigate={v => navTo(v as View)}/>
      )}
    </div>
  );
}

const fade = { initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}, transition:{duration:0.15} };
