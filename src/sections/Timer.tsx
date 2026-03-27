import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Play, Pause, Check, X } from 'lucide-react';
import type { Mission } from '@/types';
import { CATEGORIES } from '@/data/missions';
import { useTimer } from '@/hooks/useTimer';

interface TimerProps {
  mission: Mission;
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const DURATIONS = [
  { label: '2 min',  seconds: 120 },
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
  { label: '25 min', seconds: 1500 },
  { label: '30 min', seconds: 1800 },
  { label: '45 min', seconds: 2700 },
  { label: '1 hr',   seconds: 3600 },
  { label: '2 hr',   seconds: 7200 },
  { label: '3 hr',   seconds: 10800 },
  { label: '4 hr',   seconds: 14400 },
];

export function Timer({ mission, onComplete, onSkip, onBack }: TimerProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customHours,   setCustomHours]   = useState('0');
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustom,    setShowCustom]    = useState(false);
  const [started, setStarted] = useState(false);
  const [done,    setDone]    = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);

  const category = CATEGORIES.find(c => c.id === mission.category);

  const effectiveDuration = showCustom
    ? (parseInt(customHours || '0') * 3600) + (parseInt(customMinutes || '0') * 60)
    : (selectedDuration || 120);

  const { isRunning, formattedTime, progress, start, pause, resume, reset } = useTimer({
    initialTime: effectiveDuration,
    onComplete: () => setDone(true),
  });

  const handleStart = () => { setStarted(true); start(); };

  const fmtSecs = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // ── Phase 1: Duration picker ──
  if (!started) {
    return (
      <div className="h-screen bg-background flex flex-col safe-area-top overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4"/>
          </button>
          <div>
            <p className="text-sm font-black">{mission.title}</p>
            <p className="text-[10px] text-muted-foreground">Choose your duration</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-4">
          {/* Mission info */}
          <div className="text-center">
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: `${category?.color}22`, color: category?.color }}>
              {mission.category}
            </span>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{mission.description}</p>
          </div>

          {/* Duration grid */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black">⏱ Duration</p>
              <button onClick={() => { setShowCustom(!showCustom); setSelectedDuration(null); }}
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: showCustom ? 'rgba(0,229,204,0.15)' : 'var(--secondary)', color: showCustom ? '#00e5cc' : 'var(--muted-foreground)', border: showCustom ? '1px solid #00e5cc' : 'none' }}>
                Custom
              </button>
            </div>

            {!showCustom ? (
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map(d => (
                  <button key={d.seconds} onClick={() => setSelectedDuration(d.seconds)}
                    className="py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                    style={{
                      background: selectedDuration === d.seconds ? `${category?.color || '#00e5cc'}22` : 'var(--secondary)',
                      border: selectedDuration === d.seconds ? `1.5px solid ${category?.color || '#00e5cc'}` : '1.5px solid transparent',
                      color: selectedDuration === d.seconds ? (category?.color || '#00e5cc') : 'var(--muted-foreground)',
                    }}>
                    {d.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center">Set custom duration (max 24 hours)</p>
                <div className="flex gap-3 items-center justify-center">
                  <div className="text-center">
                    <input type="number" min="0" max="24" value={customHours}
                      onChange={e => setCustomHours(Math.min(24, Math.max(0, parseInt(e.target.value) || 0)).toString())}
                      className="w-20 text-center text-2xl font-black bg-secondary rounded-xl px-2 py-3 outline-none border border-transparent focus:border-[#00e5cc] text-foreground"/>
                    <p className="text-[10px] text-muted-foreground mt-1">Hours</p>
                  </div>
                  <p className="text-2xl font-black text-muted-foreground mt-0">:</p>
                  <div className="text-center">
                    <input type="number" min="0" max="59" value={customMinutes}
                      onChange={e => setCustomMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)).toString())}
                      placeholder="00"
                      className="w-20 text-center text-2xl font-black bg-secondary rounded-xl px-2 py-3 outline-none border border-transparent focus:border-[#00e5cc] text-foreground"/>
                    <p className="text-[10px] text-muted-foreground mt-1">Minutes</p>
                  </div>
                </div>
                {effectiveDuration > 0 && (
                  <p className="text-center text-xs text-[#00e5cc] font-bold">
                    = {fmtSecs(effectiveDuration)} total
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Skip option */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground text-center mb-2">Or skip the timer entirely</p>
            <button onClick={() => setDone(true)}
              className="w-full py-3 rounded-xl text-sm font-bold active:scale-95"
              style={{ background: 'rgba(0,229,204,0.1)', color: '#00e5cc', border: '1px solid rgba(0,229,204,0.3)' }}>
              <Check className="w-4 h-4 inline mr-2"/>Mark as Done Now
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={onSkip}
              className="flex-1 py-4 rounded-2xl bg-secondary text-muted-foreground text-sm font-bold active:scale-95">
              Skip Mission
            </button>
            <button onClick={handleStart}
              disabled={!showCustom ? !selectedDuration : effectiveDuration === 0}
              className="flex-1 py-4 rounded-2xl text-black text-sm font-black flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
              style={{ background: `linear-gradient(135deg,${category?.color || '#00e5cc'},#7c4dff)` }}>
              <Play className="w-4 h-4"/>
              {!showCustom
                ? selectedDuration ? `Start ${DURATIONS.find(d => d.seconds === selectedDuration)?.label}` : 'Select Duration'
                : effectiveDuration > 0 ? `Start ${fmtSecs(effectiveDuration)}` : 'Enter Duration'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 2: Done screen ──
  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 3, duration: 0.4 }}
          className="text-6xl mb-4">🎉</motion.div>
        <h2 className="text-2xl font-black mb-2">Mission Complete!</h2>
        <p className="text-muted-foreground mb-2">{mission.title}</p>
        <p className="text-2xl font-black text-yellow-400 mb-8">+{mission.xpReward} XP ⚡</p>
        <button onClick={onComplete}
          className="w-full py-4 rounded-2xl text-black font-black text-lg"
          style={{ background: 'linear-gradient(135deg,#00e5cc,#7c4dff)' }}>
          Claim XP & Continue
        </button>
      </motion.div>
    );
  }

  // ── Phase 3: Timer running ──
  const circumference = 2 * Math.PI * 90;
  const strokeDash    = circumference * (1 - progress / 100);

  return (
    <div className="h-screen bg-background flex flex-col safe-area-top">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4"/>
        </button>
        <span className="text-sm font-bold truncate">{mission.title}</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 py-6">
        <span className="text-xs font-bold mb-4 px-3 py-1 rounded-full"
          style={{ background: `${category?.color}22`, color: category?.color }}>
          {mission.category}
        </span>

        {/* Timer ring */}
        <div className="relative mb-6">
          <svg width={210} height={210} viewBox="0 0 210 210">
            <circle cx={105} cy={105} r={90} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10}/>
            <motion.circle cx={105} cy={105} r={90} fill="none"
              stroke={category?.color || '#00e5cc'} strokeWidth={10} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDash}
              transform="rotate(-90 105 105)"
              style={{ filter: `drop-shadow(0 0 8px ${category?.color || '#00e5cc'})` }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-black font-mono">{formattedTime}</p>
            <p className="text-xs text-muted-foreground mt-1">Remaining</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-2 text-center">{mission.description}</p>
        <p className="text-xs text-muted-foreground italic mb-6">Stay focused. You can do this!</p>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset}
            className="w-14 h-14 rounded-full flex items-center justify-center active:scale-95"
            style={{ background: `${category?.color || '#00e5cc'}22`, border: `1.5px solid ${category?.color || '#00e5cc'}` }}>
            <RotateCcw className="w-5 h-5" style={{ color: category?.color || '#00e5cc' }}/>
          </button>
          <button onClick={isRunning ? pause : resume}
            className="w-16 h-16 rounded-full flex items-center justify-center text-black active:scale-95"
            style={{ background: `linear-gradient(135deg,${category?.color || '#00e5cc'},#7c4dff)` }}>
            {isRunning ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}
          </button>
          <button onClick={() => confirmSkip ? onSkip() : setConfirmSkip(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center active:scale-95"
            style={{ background: confirmSkip ? 'rgba(255,68,68,0.2)' : 'var(--secondary)', border: confirmSkip ? '1.5px solid #ff4444' : 'none' }}>
            <X className="w-5 h-5" style={{ color: confirmSkip ? '#ff4444' : 'var(--muted-foreground)' }}/>
          </button>
        </div>

        <button onClick={() => setDone(true)}
          className="mt-6 text-sm font-bold py-3 px-8 rounded-2xl active:scale-95"
          style={{ background: `rgba(0,229,204,0.1)`, color: '#00e5cc', border: '1px solid rgba(0,229,204,0.3)' }}>
          <Check className="w-4 h-4 inline mr-1"/> Mark as Done
        </button>
      </div>
    </div>
  );
}
