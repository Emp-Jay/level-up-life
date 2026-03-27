import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, Plus } from 'lucide-react';
import type { Challenge, GamePower, ChallengeCategory, PowerType } from '@/types';

interface ChallengesProps {
  challenges: Challenge[];
  gamePowers: GamePower[];
  onUpdateProgress: (id: string, progress: number) => void;
  onAddChallenge: (c: Omit<Challenge, 'id' | 'createdAt' | 'currentProgress' | 'status'>) => void;
  onBack: () => void;
}

const CATEGORY_EMOJI: Record<ChallengeCategory, string> = {
  physical: '💪', mental: '🧠', social: '🤝', learning: '📚', discipline: '🎯'
};

const POWER_COLORS: Record<PowerType, string> = {
  strength: 'text-red-400', wisdom: 'text-blue-400', focus: 'text-purple-400',
  charisma: 'text-pink-400', endurance: 'text-amber-400', speed: 'text-cyan-400'
};

export function Challenges({ challenges, gamePowers, onUpdateProgress, onAddChallenge, onBack }: ChallengesProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [inputProgress, setInputProgress] = useState('');
  const [showPowers, setShowPowers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newCategory, setNewCategory] = useState<ChallengeCategory>('physical');
  const [newPower, setNewPower] = useState<PowerType>('strength');

  const active = challenges.filter(c => c.status === 'active');
  const completed = challenges.filter(c => c.status === 'completed');
  const unlockedPowers = gamePowers.filter(p => p.isUnlocked);

  const handleUpdateProgress = () => {
    if (!selectedChallenge) return;
    const val = parseInt(inputProgress);
    if (isNaN(val) || val < 0) return;
    onUpdateProgress(selectedChallenge.id, val);
    setSelectedChallenge(null);
    setInputProgress('');
  };

  const handleAddChallenge = () => {
    if (!newTitle.trim() || !newTarget.trim()) return;
    onAddChallenge({
      title: newTitle.trim(), description: newDesc.trim(),
      category: newCategory, targetValue: parseInt(newTarget),
      unit: newUnit.trim() || 'units', xpReward: 150,
      powerReward: newPower, powerPoints: 15,
      emoji: CATEGORY_EMOJI[newCategory],
    });
    setNewTitle(''); setNewDesc(''); setNewTarget(''); setNewUnit('');
    setShowAddForm(false);
  };

  return (
    <div className="h-screen bg-background pb-24 overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-10 glass border-b border-border/50 safe-area-top">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Real-Life Challenges</h1>
            <p className="text-xs text-muted-foreground">{active.length} active · {unlockedPowers.length} powers unlocked</p>
          </div>
          <button onClick={() => setShowPowers(!showPowers)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-medium">
            <Zap className="w-3 h-3" /> Powers
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {/* Powers Panel */}
        <AnimatePresence>
          {showPowers && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl bg-card border border-border/50 p-4 overflow-hidden">
              <p className="text-sm font-semibold mb-3">⚡ Your Powers</p>
              {unlockedPowers.length === 0 ? (
                <p className="text-xs text-muted-foreground">Complete challenges to unlock powers for your character!</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {unlockedPowers.map(p => (
                    <div key={p.id} className="flex items-center gap-2 bg-secondary rounded-xl p-2.5">
                      <span className="text-xl">{p.emoji}</span>
                      <div>
                        <p className={`text-xs font-semibold ${POWER_COLORS[p.type]}`}>{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {unlockedPowers.length < gamePowers.length && (
                <p className="text-xs text-muted-foreground mt-2">{gamePowers.length - unlockedPowers.length} more powers to unlock...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Challenges */}
        <p className="text-sm font-semibold text-foreground">Active Challenges</p>
        {active.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No active challenges 🎉</p>}
        {active.map(challenge => {
          const pct = Math.min(100, Math.round((challenge.currentProgress / challenge.targetValue) * 100));
          return (
            <motion.div key={challenge.id} layout
              className="rounded-2xl bg-card border border-border/50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{challenge.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{challenge.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
                    </div>
                    <span className="text-xs text-amber-400 font-medium flex-shrink-0">+{challenge.xpReward} XP</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{challenge.currentProgress} / {challenge.targetValue} {challenge.unit}</span>
                      <span className={POWER_COLORS[challenge.powerReward]}>⚡ {challenge.powerReward}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}/>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pct}% complete</p>
                  </div>
                  <button onClick={() => { setSelectedChallenge(challenge); setInputProgress(String(challenge.currentProgress)); }}
                    className="mt-2.5 w-full py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-medium transition-colors">
                    Update Progress
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <p className="text-sm font-semibold text-emerald-400 mt-4">✅ Completed</p>
            {completed.map(c => (
              <div key={c.id} className="rounded-2xl bg-card border border-border/50 p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.emoji}</span>
                  <div>
                    <p className="font-medium text-sm line-through text-muted-foreground">{c.title}</p>
                    <p className="text-xs text-emerald-400">✓ Completed · +{c.xpReward} XP · ⚡ {c.powerReward} unlocked</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Add custom challenge */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
              <p className="text-sm font-semibold">Custom Challenge</p>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Challenge title"
                className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 ring-primary" />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description"
                className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 ring-primary" />
              <div className="grid grid-cols-2 gap-2">
                <input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="Target (e.g. 30)"
                  type="number" className="bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 ring-primary" />
                <input value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Unit (e.g. mins)"
                  className="bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={newCategory} onChange={e => setNewCategory(e.target.value as ChallengeCategory)}
                  className="bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none">
                  {(['physical','mental','social','learning','discipline'] as ChallengeCategory[]).map(c =>
                    <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
                </select>
                <select value={newPower} onChange={e => setNewPower(e.target.value as PowerType)}
                  className="bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none">
                  {(['strength','wisdom','focus','charisma','endurance','speed'] as PowerType[]).map(p =>
                    <option key={p} value={p}>⚡ {p}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 rounded-xl bg-secondary text-sm">Cancel</button>
                <button onClick={handleAddChallenge} disabled={!newTitle || !newTarget}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50">
                  Add Challenge
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)}
            className="w-full py-3.5 rounded-2xl border border-dashed border-primary/50 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
            <Plus className="w-4 h-4" /> Add Custom Challenge
          </button>
        )}
      </div>

      {/* Progress Update Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end"
            onClick={() => setSelectedChallenge(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl p-6 space-y-4">
              <div className="w-10 h-1 bg-border rounded-full mx-auto" />
              <p className="text-base font-semibold">{selectedChallenge.emoji} {selectedChallenge.title}</p>
              <p className="text-sm text-muted-foreground">
                Target: {selectedChallenge.targetValue} {selectedChallenge.unit}
              </p>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Current progress ({selectedChallenge.unit})</label>
                <input type="number" value={inputProgress} onChange={e => setInputProgress(e.target.value)}
                  min={0} max={selectedChallenge.targetValue}
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-lg font-semibold outline-none focus:ring-2 ring-primary text-center" />
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100,(parseInt(inputProgress)||0)/selectedChallenge.targetValue*100)}%` }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedChallenge(null)} className="flex-1 py-3 rounded-2xl bg-secondary text-sm">Cancel</button>
                <button onClick={handleUpdateProgress}
                  className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-medium">
                  Save Progress
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
