import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Clock, ChevronLeft } from 'lucide-react';
import type { CustomTask, TaskRepeat, TaskPriority } from '@/types';

interface TimetableProps {
  tasks: CustomTask[];
  onAdd: (task: Omit<CustomTask, 'id' | 'createdAt' | 'completedDates'>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onComplete: (id: string) => void;
  isCompletedToday: (id: string) => boolean;
  onBack: () => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; dot: string; label: string }> = {
  high:   { color: '#ff4444', dot: 'bg-red-500',    label: '🔴 High' },
  medium: { color: '#7c4dff', dot: 'bg-purple-500', label: '🟣 Medium' },
  low:    { color: '#546e7a', dot: 'bg-slate-500',  label: '⚪ Low' },
};

const REPEAT_OPTIONS: { value: TaskRepeat; label: string; emoji: string }[] = [
  { value: 'daily',    label: 'Every Day',  emoji: '📅' },
  { value: 'weekdays', label: 'Weekdays',   emoji: '💼' },
  { value: 'weekends', label: 'Weekends',   emoji: '🌅' },
  { value: 'once',     label: 'One Time',   emoji: '1️⃣' },
];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const QUICK_EMOJIS = ['🏃','📚','💪','🧘','💧','🍎','😴','✍️','🎯','🔥','⚡','🌟','🎵','🧠','💻','🚶','🍵','🏋️','📝','🎨'];

const XP_OPTIONS = [40, 60, 80, 100, 120, 150];

export function Timetable({ tasks, onAdd, onDelete, onToggle, onComplete, isCompletedToday, onBack }: TimetableProps) {
  const [showForm, setShowForm] = useState(false);
  const [emoji, setEmoji]     = useState('🎯');
  const [title, setTitle]     = useState('');
  const [desc, setDesc]       = useState('');
  const [time, setTime]       = useState('09:00');
  const [repeat, setRepeat]   = useState<TaskRepeat>('daily');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [days, setDays]       = useState<number[]>([1,2,3,4,5]); // Mon-Fri default
  const [date, setDate]       = useState('');
  const [xp, setXp]           = useState(80);
  const [showEmojis, setShowEmojis] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const sorted = [...tasks].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h < 12 ? 'AM' : 'PM';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: desc.trim(),
      scheduledTime: time,
      repeat,
      priority,
      isEnabled: true,
      xpReward: xp,
      emoji,
      days: repeat === 'once' ? undefined : days,
      specificDate: repeat === 'once' ? (date || today) : undefined,
    });
    // Reset form
    setEmoji('🎯'); setTitle(''); setDesc(''); setTime('09:00');
    setRepeat('daily'); setPriority('medium'); setDays([1,2,3,4,5]);
    setDate(''); setXp(80); setShowForm(false); setShowEmojis(false);
  };

  const repeatLabel = (r: TaskRepeat, t: CustomTask) => {
    if (r === 'once') return t.specificDate ? `Once · ${t.specificDate}` : 'One Time';
    if (r === 'weekdays') return 'Mon–Fri';
    if (r === 'weekends') return 'Sat–Sun';
    if (r === 'daily') return 'Every Day';
    if (t.days?.length) return t.days.map(d => DAYS_SHORT[d]).join(', ');
    return r;
  };

  return (
    <div className="h-screen bg-background pb-28 overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ChevronLeft className="w-5 h-5"/>
          </button>
          <div>
            <h1 className="text-base font-black">My Timetable</h1>
            <p className="text-[10px] text-[#00e5cc] font-mono">{tasks.length} TASKS · COMPLETE FOR XP</p>
          </div>
          <button onClick={() => { setShowForm(true); setTimeout(() => window.scrollTo(0,0),50); }}
            className="ml-auto w-9 h-9 rounded-full flex items-center justify-center text-black"
            style={{ background: 'linear-gradient(135deg,#00e5cc,#7c4dff)' }}>
            <Plus className="w-5 h-5"/>
          </button>
        </div>
      </header>

      <div className="px-3 pt-3 space-y-3">

        {/* Add Task Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-2xl border border-[rgba(0,229,204,0.3)] p-4 space-y-3">

              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-black">➕ New Task</p>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground text-sm">✕</button>
              </div>

              {/* Emoji picker */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Emoji</p>
                <button onClick={() => setShowEmojis(!showEmojis)}
                  className="w-12 h-12 rounded-xl bg-secondary text-2xl flex items-center justify-center border border-[rgba(0,229,204,0.3)]">
                  {emoji}
                </button>
                {showEmojis && (
                  <div className="grid grid-cols-10 gap-1.5 mt-2 p-2 bg-secondary rounded-xl">
                    {QUICK_EMOJIS.map(e => (
                      <button key={e} onClick={() => { setEmoji(e); setShowEmojis(false); }}
                        className={`text-xl w-8 h-8 rounded-lg flex items-center justify-center ${emoji === e ? 'bg-[rgba(0,229,204,0.2)] border border-[#00e5cc]' : ''}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Task title e.g. Morning Run 🏃"
                className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-[#00e5cc]"/>

              {/* Description */}
              <input value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-[#00e5cc]"/>

              {/* Time + Repeat */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">⏰ Time</p>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)}
                    className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-[#00e5cc] text-foreground"/>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">🔁 Repeat</p>
                  <select value={repeat} onChange={e => setRepeat(e.target.value as TaskRepeat)}
                    className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none text-foreground">
                    {REPEAT_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day selector (show for daily/weekdays/weekends or custom) */}
              {repeat !== 'once' && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">📆 Days</p>
                  <div className="flex gap-1.5">
                    {DAYS_SHORT.map((d, i) => {
                      const autoSelected = (repeat === 'weekdays' && i >= 1 && i <= 5) || (repeat === 'weekends' && (i === 0 || i === 6)) || repeat === 'daily';
                      const isOn = repeat === 'daily' ? true : repeat === 'weekdays' ? (i >= 1 && i <= 5) : repeat === 'weekends' ? (i === 0 || i === 6) : days.includes(i);
                      return (
                        <button key={d} onClick={() => { if (repeat === 'daily' || repeat === 'weekdays' || repeat === 'weekends') return; toggleDay(i); }}
                          className="flex-1 py-2 rounded-lg text-[10px] font-bold transition-all"
                          style={{
                            background: isOn ? 'rgba(0,229,204,0.2)' : 'var(--secondary)',
                            border: isOn ? '1px solid #00e5cc' : '1px solid transparent',
                            color: isOn ? '#00e5cc' : 'var(--muted-foreground)',
                            opacity: (repeat !== 'daily' && !autoSelected && !days.includes(i)) || autoSelected ? 1 : 0.5,
                          }}>
                          {d[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date picker for one-time */}
              {repeat === 'once' && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">📅 Date</p>
                  <input type="date" value={date || today} min={today}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm outline-none border border-transparent focus:border-[#00e5cc] text-foreground"/>
                </div>
              )}

              {/* Priority */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">⚡ Priority</p>
                <div className="flex gap-2">
                  {(['low','medium','high'] as TaskPriority[]).map(p => (
                    <button key={p} onClick={() => setPriority(p)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: priority === p ? `${PRIORITY_CONFIG[p].color}22` : 'var(--secondary)',
                        border: priority === p ? `1.5px solid ${PRIORITY_CONFIG[p].color}` : '1.5px solid transparent',
                        color: priority === p ? PRIORITY_CONFIG[p].color : 'var(--muted-foreground)',
                      }}>
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* XP reward */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">🌟 XP Reward</p>
                <div className="flex gap-1.5 flex-wrap">
                  {XP_OPTIONS.map(x => (
                    <button key={x} onClick={() => setXp(x)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: xp === x ? 'rgba(255,215,0,0.2)' : 'var(--secondary)',
                        border: xp === x ? '1.5px solid #ffd700' : '1.5px solid transparent',
                        color: xp === x ? '#ffd700' : 'var(--muted-foreground)',
                      }}>
                      +{x} XP
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl bg-secondary text-sm font-bold">Cancel</button>
                <button onClick={handleSubmit} disabled={!title.trim()}
                  className="flex-1 py-3 rounded-xl text-black text-sm font-black disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#00e5cc,#7c4dff)' }}>
                  Add Task ✅
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {sorted.length === 0 && !showForm && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-base font-black">No tasks yet</p>
            <p className="text-sm text-muted-foreground mt-1">Tap + to add your daily goals</p>
          </div>
        )}

        {/* Task list */}
        {sorted.map(task => {
          const done = isCompletedToday(task.id);
          const pc = PRIORITY_CONFIG[task.priority];
          return (
            <motion.div key={task.id} layout
              className={`bg-card rounded-2xl border border-border p-4 transition-opacity ${!task.isEnabled ? 'opacity-40' : ''}`}>
              <div className="flex items-start gap-3">
                {/* Priority bar */}
                <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${pc.dot}`}/>

                {/* Emoji */}
                <div className="text-2xl flex-shrink-0 mt-0.5">{task.emoji || '🎯'}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${done ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                  {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-[#00e5cc]">
                      <Clock className="w-3 h-3"/>{formatTime(task.scheduledTime)}
                    </span>
                    <span className="text-xs text-muted-foreground">{repeatLabel(task.repeat, task)}</span>
                    <span className="text-xs text-yellow-400 font-bold">+{task.xpReward} XP</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex gap-1">
                    {!done ? (
                      <button onClick={() => onComplete(task.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center bg-green-500/20 active:scale-95">
                        <Check className="w-4 h-4 text-green-400"/>
                      </button>
                    ) : (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-green-500/30">
                        <Check className="w-4 h-4 text-green-400"/>
                      </div>
                    )}
                    <button onClick={() => onDelete(task.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center bg-secondary active:scale-95">
                      <Trash2 className="w-4 h-4 text-muted-foreground"/>
                    </button>
                  </div>
                  {done && <span className="text-[10px] text-green-400 font-bold">✅ Done</span>}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add button at bottom */}
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-98"
            style={{ border: '2px dashed rgba(0,229,204,0.35)', color: '#00e5cc' }}>
            <Plus className="w-4 h-4"/> Add Your Own Task
          </button>
        )}

      </div>
    </div>
  );
}
