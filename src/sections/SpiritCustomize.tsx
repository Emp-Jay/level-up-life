import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ACCESSORIES, SEASONS, getUnlockedSeasons } from '@/data/spirit';
import type { SpiritState, SpiritSeason } from '@/data/spirit';
import type { UserProgress } from '@/types';

interface SpiritCustomizeProps {
  userProgress: UserProgress;
  spiritState: SpiritState;
  onUpdateSpirit: (s: Partial<SpiritState>) => void;
  onPrestige: () => void;
  onSpendXP: (amount: number) => Promise<boolean>;
  onClose: () => void;
}

export function SpiritCustomize({ userProgress, spiritState, onUpdateSpirit, onPrestige, onSpendXP, onClose }: SpiritCustomizeProps) {
  const [tab, setTab] = useState<'season'|'accessories'|'prestige'>('season');
  const unlockedSeasons = getUnlockedSeasons(userProgress.longestStreak);
  const canPrestige = userProgress.currentStreak >= 30 && userProgress.xp >= 5000;

  const toggleAccessory = (id: string) => {
    const current = spiritState.activeAccessories || [];
    const acc = ACCESSORIES.find(a => a.id === id);
    if (!acc || !spiritState.unlockedAccessories?.includes(id)) return;
    if (current.includes(id)) {
      onUpdateSpirit({ activeAccessories: current.filter(a => a !== id) });
    } else if (current.length < 3) {
      onUpdateSpirit({ activeAccessories: [...current, id] });
    }
  };

  const unlockAccessory = async (id: string) => {
    const acc = ACCESSORIES.find(a => a.id === id);
    if (!acc || userProgress.xp < acc.xpCost) return;
    const spent = await onSpendXP(acc.xpCost);
    if (!spent) return;
    const unlocked = [...(spiritState.unlockedAccessories || []), id];
    onUpdateSpirit({ unlockedAccessories: unlocked });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border safe-area-top">
        <div>
          <h2 className="text-base font-black">Spirit Customize</h2>
          <p className="text-[10px] text-[#00e5cc] font-mono">// MAKE IT YOURS //</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-secondary">
          <X className="w-5 h-5"/>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'season', label: '🌊 Season' },
          { id: 'accessories', label: '✨ Accessories' },
          { id: 'prestige', label: '👑 Prestige' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2
              ${tab === t.id ? 'border-[#00e5cc] text-[#00e5cc]' : 'border-transparent text-muted-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">

        {/* SEASON TAB */}
        {tab === 'season' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4">
              Seasons change your spirit's color and aura. Unlock by maintaining long streaks.
            </p>
            {SEASONS.map(s => {
              const isUnlocked = unlockedSeasons.includes(s.id);
              const isActive = spiritState.season === s.id;
              return (
                <motion.button key={s.id} whileTap={{ scale: 0.98 }}
                  onClick={() => isUnlocked && onUpdateSpirit({ season: s.id as SpiritSeason })}
                  className={`w-full p-4 rounded-2xl border text-left transition-all
                    ${isActive ? 'border-[#00e5cc]' : isUnlocked ? 'border-border' : 'border-border opacity-50'}
                    ${isActive ? 'bg-[rgba(0,229,204,0.08)]' : 'bg-card'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{s.emoji}</span>
                      <div>
                        <p className="text-sm font-bold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isUnlocked ? 'Unlocked ✅' : `Requires ${s.unlockDays} streak days`}
                        </p>
                      </div>
                    </div>
                    {isActive && <span className="text-[10px] text-[#00e5cc] font-mono">ACTIVE</span>}
                    {!isUnlocked && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">🔒 {s.unlockDays - userProgress.longestStreak} days away</p>
                      </div>
                    )}
                  </div>
                  {/* Color preview */}
                  <div className="flex gap-1 mt-2">
                    {(s.stages as any[]).map((st, i) => (
                      <div key={i} className="flex-1 h-2 rounded-full" style={{ background: st.color || '#333' }}/>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* ACCESSORIES TAB */}
        {tab === 'accessories' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">
              Buy accessories with XP. Equip up to 3 at a time. You have <span className="text-yellow-400 font-bold">{userProgress.xp.toLocaleString()} XP</span>.
            </p>
            {ACCESSORIES.map(acc => {
              const isUnlocked = spiritState.unlockedAccessories?.includes(acc.id);
              const isActive = spiritState.activeAccessories?.includes(acc.id);
              const canAfford = userProgress.xp >= acc.xpCost;
              return (
                <div key={acc.id} className={`bg-card rounded-2xl border p-4 ${isActive ? 'border-[#00e5cc]' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{acc.emoji}</span>
                      <div>
                        <p className="text-sm font-bold">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">{acc.description}</p>
                      </div>
                    </div>
                  </div>
                  {isUnlocked ? (
                    <button onClick={() => toggleAccessory(acc.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all
                        ${isActive ? 'bg-[rgba(0,229,204,0.15)] text-[#00e5cc] border border-[#00e5cc]' : 'bg-secondary text-muted-foreground'}`}>
                      {isActive ? '✓ Equipped' : 'Equip'}
                    </button>
                  ) : (
                    <button onClick={() => unlockAccessory(acc.id)} disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all
                        ${canAfford ? 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/40' : 'bg-secondary/40 text-muted-foreground/50'}`}>
                      {canAfford ? `🔓 Unlock for ${acc.xpCost.toLocaleString()} XP` : `🔒 Need ${(acc.xpCost - userProgress.xp).toLocaleString()} more XP`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PRESTIGE TAB */}
        {tab === 'prestige' && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-yellow-400/30 p-4">
              <p className="text-sm font-black text-yellow-400 mb-2">👑 What is Prestige?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When your spirit reaches Stage 5 and you have a 30-day streak, you can Prestige.
                Your spirit resets to Stage 0 but with a <b className="text-foreground">new season color</b>, 
                a <b className="text-foreground">Prestige badge</b>, and you keep all your XP history.
                Each prestige makes the next evolution feel even more epic.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <p className="text-xs font-bold font-mono text-[#00e5cc]">// YOUR STATUS //</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Prestige</span>
                <span className="font-bold">{spiritState.prestige}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Evolutions</span>
                <span className="font-bold text-yellow-400">{spiritState.totalEvolutions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Streak</span>
                <span className={`font-bold ${userProgress.currentStreak >= 30 ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {userProgress.currentStreak} / 30 days
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP Milestone</span>
                <span className={`font-bold ${userProgress.xp >= 5000 ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {userProgress.xp.toLocaleString()} / 5,000 XP
                </span>
              </div>
            </div>

            {canPrestige ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={onPrestige}
                className="w-full py-4 rounded-2xl font-black text-base text-black"
                style={{ background: 'linear-gradient(135deg,#ffd700,#ff9800)' }}
                animate={{ boxShadow: ['0 0 20px rgba(255,215,0,0.3)', '0 0 40px rgba(255,215,0,0.6)', '0 0 20px rgba(255,215,0,0.3)'] }}
                transition={{ repeat: Infinity, duration: 2 }}>
                ⚡ PRESTIGE NOW — START SEASON {spiritState.prestige + 2} ⚡
              </motion.button>
            ) : (
              <div className="w-full py-4 rounded-2xl bg-secondary/50 text-muted-foreground text-center text-sm">
                🔒 Reach Stage 5 + 30-day streak to Prestige
              </div>
            )}

            {/* Season preview */}
            {spiritState.prestige < SEASONS.length - 1 && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs font-bold mb-2">Next Season Preview:</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{SEASONS[spiritState.prestige + 1]?.emoji}</span>
                  <div>
                    <p className="text-sm font-bold">{SEASONS[spiritState.prestige + 1]?.name}</p>
                    <p className="text-xs text-muted-foreground">New colors, new aura, same you — evolved</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
