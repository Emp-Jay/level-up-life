import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BarChart2, BookOpen, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import type { DailyReflection } from '@/types';

interface ReflectionHistoryProps {
  reflections: DailyReflection[];
  onDelete: (date: string) => void;
  onBack: () => void;
}

type Period = 'week' | 'month' | 'all';

const MOOD_EMOJI: Record<string, string> = {
  great: '😊', good: '🙂', neutral: '😐', tired: '😴', challenging: '😤',
};
const MOOD_COLOR: Record<string, string> = {
  great: '#00e676', good: '#29b6f6', neutral: '#ffd700', tired: '#ff9800', challenging: '#ff4444',
};
const MOOD_LABEL: Record<string, string> = {
  great: 'Great', good: 'Good', neutral: 'Neutral', tired: 'Tired', challenging: 'Challenging',
};

export function ReflectionHistory({ reflections, onDelete, onBack }: ReflectionHistoryProps) {
  const [tab, setTab]         = useState<'entries' | 'analytics'>('entries');
  const [period, setPeriod]   = useState<Period>('week');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const now = new Date();

  const filtered = useMemo(() => {
    const sorted = [...reflections].sort((a, b) => b.date.localeCompare(a.date));
    if (period === 'week') {
      const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7);
      return sorted.filter(r => new Date(r.date) >= cutoff);
    }
    if (period === 'month') {
      const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
      return sorted.filter(r => new Date(r.date) >= cutoff);
    }
    return sorted;
  }, [reflections, period]);

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(r => { if (r.mood) counts[r.mood] = (counts[r.mood] || 0) + 1; });
    return counts;
  }, [filtered]);

  const topMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];

  const weekChart = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const ref = reflections.find(r => r.date === dateStr);
      days.push({ label: ['S','M','T','W','T','F','S'][d.getDay()], date: dateStr, ref });
    }
    return days;
  }, [reflections]);

  const refStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (reflections.some(r => r.date === ds)) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [reflections]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const handleDelete = (date: string) => {
    if (confirmDelete === date) {
      onDelete(date);
      setConfirmDelete(null);
      setExpanded(null);
    } else {
      setConfirmDelete(date);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="h-screen bg-background pb-8 overflow-y-auto no-scrollbar">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <div>
            <h1 className="text-base font-black">Reflection Journal</h1>
            <p className="text-[10px] text-[#00e5cc] font-mono">{reflections.length} ENTRIES · {refStreak}d STREAK</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-border">
          {[
            { key: 'entries',   icon: <BookOpen className="w-3.5 h-3.5"/>,  label: `Entries (${reflections.length})` },
            { key: 'analytics', icon: <BarChart2 className="w-3.5 h-3.5"/>, label: 'Analytics' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all
                ${tab === t.key ? 'border-[#00e5cc] text-[#00e5cc]' : 'border-transparent text-muted-foreground'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-3 pt-3 space-y-3">

        {/* Period filter */}
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: period === p ? 'rgba(0,229,204,0.15)' : 'var(--secondary)',
                border: period === p ? '1px solid #00e5cc' : '1px solid transparent',
                color: period === p ? '#00e5cc' : 'var(--muted-foreground)',
              }}>
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>

        {/* ── ENTRIES TAB ── */}
        {tab === 'entries' && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">📖</p>
                <p className="text-base font-black">No reflections yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {period !== 'all' ? `No entries this ${period}. Try "All Time".` : 'Start writing your first reflection!'}
                </p>
              </div>
            ) : (
              filtered.map((r, i) => {
                const isExpanded = expanded === r.date;
                const isConfirm = confirmDelete === r.date;
                return (
                  <motion.div key={r.date}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden">

                    {/* Card header - always visible */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#00e5cc]"/>
                          <p className="text-[10px] font-mono text-[#00e5cc]">{formatDate(r.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {r.mood && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: `${MOOD_COLOR[r.mood]}22`, color: MOOD_COLOR[r.mood] }}>
                              {MOOD_EMOJI[r.mood]} {MOOD_LABEL[r.mood]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Preview text */}
                      <p className={`text-sm text-foreground leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {r.content || <span className="text-muted-foreground italic">No content written</span>}
                      </p>

                      {/* Expand / collapse + delete */}
                      <div className="flex items-center justify-between mt-3">
                        <button onClick={() => setExpanded(isExpanded ? null : r.date)}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#00e5cc]">
                          {isExpanded ? <><ChevronUp className="w-3 h-3"/> Show less</> : <><ChevronDown className="w-3 h-3"/> Read more</>}
                        </button>

                        <button onClick={() => handleDelete(r.date)}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                          style={{
                            background: isConfirm ? 'rgba(255,68,68,0.2)' : 'var(--secondary)',
                            color: isConfirm ? '#ff4444' : 'var(--muted-foreground)',
                            border: isConfirm ? '1px solid #ff4444' : '1px solid transparent',
                          }}>
                          <Trash2 className="w-3 h-3"/>
                          {isConfirm ? 'Confirm?' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total Entries',  value: reflections.length,                  color: '#00e5cc' },
                { label: period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time', value: filtered.length, color: '#ffd700' },
                { label: 'Reflection Streak', value: `${refStreak} days`,              color: '#00e676' },
                { label: 'Top Mood',       value: topMood ? `${MOOD_EMOJI[topMood]} ${MOOD_LABEL[topMood]}` : '—', color: topMood ? MOOD_COLOR[topMood] : '#666' },
              ].map((s, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-4">
                  <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Weekly bar chart */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-[10px] font-bold font-mono text-[#00e5cc] mb-4">// MOOD LAST 7 DAYS</p>
              <div className="flex items-end gap-1.5 h-20 mb-2">
                {weekChart.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: d.ref ? '100%' : '8%',
                        background: d.ref?.mood ? MOOD_COLOR[d.ref.mood] : 'rgba(0,229,204,0.15)',
                        minHeight: 4,
                      }}/>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                {weekChart.map((d, i) => (
                  <div key={i} className="flex-1 text-center">
                    <p className="text-[9px] text-muted-foreground">{d.label}</p>
                    <p className="text-[10px]">{d.ref?.mood ? MOOD_EMOJI[d.ref.mood] : '·'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood breakdown */}
            {Object.keys(moodCounts).length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-[10px] font-bold font-mono text-[#00e5cc] mb-3">// MOOD BREAKDOWN</p>
                <div className="space-y-2.5">
                  {Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center">{MOOD_EMOJI[mood]}</span>
                      <span className="text-xs text-muted-foreground w-16">{MOOD_LABEL[mood]}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / filtered.length) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{ background: MOOD_COLOR[mood] }}/>
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right font-bold">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm font-bold">No data yet</p>
                <p className="text-xs text-muted-foreground mt-1">Write reflections to see your mood trends</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
