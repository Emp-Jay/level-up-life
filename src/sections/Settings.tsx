import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Database, Palette, Volume2, Smartphone, RefreshCw } from 'lucide-react';
import type { UserSettings, UserProgress } from '@/types';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

interface SettingsProps {
  settings: UserSettings;
  userProgress: UserProgress;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
  isDark: boolean;
  onToggleDark: () => void;
  userName: string;
  onUpdateName: (name: string) => void;
}

const ACCENT_COLORS = [
  { name: 'teal',   color: '#00e5cc' },
  { name: 'purple', color: '#7c4dff' },
  { name: 'pink',   color: '#ff6eb4' },
  { name: 'green',  color: '#00e676' },
  { name: 'gold',   color: '#ffd700' },
];

const NOTIF_TIMES = [
  { key: 'morningTime',   label: 'Morning Mission',  icon: '🌅' },
  { key: 'afternoonTime', label: 'Focus Reminder',   icon: '🎯' },
  { key: 'eveningTime',   label: 'Evening Reset',    icon: '🌇' },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`w-12 h-7 rounded-full relative transition-all duration-300 flex-shrink-0 ${on ? 'bg-[#00e5cc]' : 'bg-muted'}`}>
      <motion.div
        animate={{ left: on ? '22px' : '3px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-[3px] w-5 h-5 bg-white rounded-full shadow"
        style={{ position: 'absolute' }}
      />
    </button>
  );
}

export function Settings({ settings, userProgress, onUpdateSettings, isDark, onToggleDark, userName, onUpdateName }: SettingsProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [accent, setAccent] = useState(settings.accentColor || '#00e5cc');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => { setNameInput(userName); }, [userName]);

  const saveName = () => {
    if (nameInput.trim()) onUpdateName(nameInput.trim());
    setEditingName(false);
  };

  const setTheme = (color: string) => {
    setAccent(color);
    document.documentElement.style.setProperty('--teal', color);
    document.documentElement.style.setProperty('--teal2', color + 'bb');
    onUpdateSettings({ accentColor: color });
  };

  const handleReset = async () => {
    if (!showResetConfirm) { setShowResetConfirm(true); return; }
    try {
      const keys = ['lul_onboarded','lul_username','lul_darkmode','lul_spirit',
        'lul_user_progress','lul_daily_progress','lul_today_missions','lul_completed_missions',
        'lul_badges','lul_settings','lul_reflections','lul_custom_tasks','lul_challenges','lul_game_powers'];
      await Promise.all(keys.map(k => Preferences.remove({ key: k })));
      window.location.reload();
    } catch {}
  };

  const currentLevel = userProgress.level;
  const accentColor = accent;

  return (
    <div className="h-screen bg-background pb-28 overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="" className="w-full h-full object-cover"/>
          </div>
          <div>
            <h1 className="text-base font-black">Settings</h1>
            <p className="text-[10px] font-mono" style={{ color: accentColor }}>CUSTOMIZE YOUR SYSTEM</p>
          </div>
        </div>
      </header>

      <div className="px-3 pt-3 space-y-3">

        {/* Profile */}
        <div className="bg-card rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: accentColor + '40' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${accentColor},#7c4dff)` }}>⚡</div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                onBlur={saveName} onKeyDown={e => e.key === 'Enter' && saveName()}
                className="bg-secondary rounded-lg px-3 py-1 text-base font-black outline-none w-full"
                style={{ border: `1px solid ${accentColor}` }} autoFocus/>
            ) : (
              <p className="text-base font-black truncate">{userName}</p>
            )}
            <p className="text-[10px] font-mono" style={{ color: accentColor }}>LEVEL {currentLevel} // EMBER</p>
            <p className="text-[10px] text-muted-foreground">🔥 {userProgress.currentStreak}-day streak</p>
          </div>
          <button onClick={() => setEditingName(true)} className="text-xl p-1 flex-shrink-0">✏️</button>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-bold font-mono tracking-widest" style={{ color: accentColor }}>// APPEARANCE</p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4" style={{ color: accentColor }}/> : <Sun className="w-4 h-4 text-yellow-400"/>}
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <Toggle on={isDark} onToggle={onToggleDark}/>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" style={{ color: accentColor }}/>
              <span className="text-sm font-medium">Accent Color</span>
            </div>
            <div className="flex gap-2">
              {ACCENT_COLORS.map(c => (
                <button key={c.name} onClick={() => setTheme(c.color)}
                  className="w-6 h-6 rounded-full transition-all"
                  style={{ background: c.color, border: accent === c.color ? '2.5px solid white' : '2px solid transparent', transform: accent === c.color ? 'scale(1.2)' : 'scale(1)' }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-bold font-mono tracking-widest" style={{ color: accentColor }}>// NOTIFICATIONS</p>
          </div>
          {NOTIF_TIMES.map((n, i) => {
            const timeVal = (settings as any)[n.key] || '09:00';
            return (
              <div key={n.key} className={`px-4 py-3 flex items-center justify-between ${i < NOTIF_TIMES.length - 1 ? 'border-b border-border/40' : 'border-b border-border/40'}`}>
                <div>
                  <p className="text-sm font-medium">{n.icon} {n.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: accentColor }}>{timeVal}</p>
                </div>
                <input type="time" value={timeVal}
                  onChange={e => onUpdateSettings({ [n.key]: e.target.value } as any)}
                  className="bg-secondary rounded-lg px-2 py-1 text-xs outline-none border border-border focus:border-[#00e5cc] text-foreground"/>
              </div>
            );
          })}
          <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: accentColor }}/>
              <span className="text-sm font-medium">Notifications On</span>
            </div>
            <Toggle on={settings.notificationsEnabled ?? true} onToggle={() => onUpdateSettings({ notificationsEnabled: !(settings.notificationsEnabled ?? true) })}/>
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" style={{ color: accentColor }}/>
              <span className="text-sm font-medium">Sound</span>
            </div>
            <Toggle on={settings.soundEnabled ?? true} onToggle={() => onUpdateSettings({ soundEnabled: !(settings.soundEnabled ?? true) })}/>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" style={{ color: accentColor }}/>
              <span className="text-sm font-medium">Vibration</span>
            </div>
            <Toggle on={settings.vibrationEnabled ?? true} onToggle={() => onUpdateSettings({ vibrationEnabled: !(settings.vibrationEnabled ?? true) })}/>
          </div>
        </div>

        {/* Missions */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-bold font-mono tracking-widest" style={{ color: accentColor }}>// MISSIONS</p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
            <div>
              <p className="text-sm font-medium">Sunday Reset Mode</p>
              <p className="text-xs text-muted-foreground">Lighter missions on Sunday</p>
            </div>
            <Toggle on={settings.sundayResetMode ?? true} onToggle={() => onUpdateSettings({ sundayResetMode: !(settings.sundayResetMode ?? true) })}/>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Grace Days</p>
              <p className="text-xs text-muted-foreground">Protect your streak</p>
            </div>
            <span className="text-sm font-bold" style={{ color: accentColor }}>{userProgress.graceDaysAvailable} left</span>
          </div>
        </div>

        {/* Data */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-bold font-mono tracking-widest" style={{ color: accentColor }}>// DATA</p>
          </div>
          <button className="w-full px-4 py-3 flex items-center justify-between border-b border-border/40 active:bg-secondary/50"
            onClick={async () => {
              try {
                const keys = Object.keys(await Preferences.keys().then(r => r.keys.reduce((a: any, k: string) => ({...a, [k]: k}), {})));
                const allKeys = ['lul_user_progress','lul_today_missions','lul_completed_missions',
                  'lul_badges','lul_settings','lul_reflections','lul_custom_tasks',
                  'lul_challenges','lul_game_powers','lul_spirit'];
                const vals = await Promise.all(allKeys.map(k => Preferences.get({ key: k })));
                const exportData: any = { exported: new Date().toISOString() };
                allKeys.forEach((k, i) => { try { exportData[k] = JSON.parse(vals[i].value || 'null'); } catch { exportData[k] = vals[i].value; } });
                const jsonStr = JSON.stringify(exportData, null, 2);
                const filename = `leveluplife_export_${new Date().toISOString().split('T')[0]}.json`;
                try {
                  // Try Capacitor Filesystem (works on Android)
                  await Filesystem.writeFile({ path: filename, data: jsonStr, directory: Directory.Documents, encoding: Encoding.UTF8 });
                  alert('Data exported to Documents folder: ' + filename);
                } catch {
                  // Fallback for browser
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
                  URL.revokeObjectURL(url);
                }
              } catch(e) { alert('Export failed: ' + e); }
            }}>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" style={{ color: accentColor }}/>
              <span className="text-sm font-medium">Export My Data</span>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </button>
          <button className="w-full px-4 py-3 flex items-center justify-between active:bg-red-900/10"
            onClick={handleReset}>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-red-400"/> 
                {showResetConfirm ? '⚠️ Tap again to confirm reset' : 'Reset App'}
              </p>
              <p className="text-xs text-red-400">Clear all data and start over</p>
            </div>
          </button>
        </div>

        {/* About */}
        <div className="bg-card rounded-2xl border border-border p-5 text-center mb-4">
          <p className="text-3xl mb-2">⚡</p>
          <p className="text-base font-black">Level Up Life</p>
          <p className="text-xs text-muted-foreground">Self Growth. Gamified.</p>
          <p className="text-xs italic mt-3 leading-relaxed" style={{ color: accentColor }}>
            "Day by day… you are becoming someone.<br/>Choose who."
          </p>
          <p className="text-[10px] text-muted-foreground/40 mt-3">© J.J — All Rights Reserved · v1.0.0</p>
        </div>

      </div>
    </div>
  );
}
