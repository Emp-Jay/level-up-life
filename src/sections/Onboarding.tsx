import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: (name: string, wakeTime: string, goals: string[]) => void;
}

const WAKE_TIMES = [
  ['05:00','5:00 AM'], ['05:30','5:30 AM'], ['06:00','6:00 AM'],
  ['06:30','6:30 AM'], ['07:00','7:00 AM'], ['07:30','7:30 AM'],
  ['08:00','8:00 AM'], ['08:30','8:30 AM'], ['09:00','9:00 AM'],
];

const GOALS = [
  { id: 'discipline', emoji: '⚡', label: 'Discipline' },
  { id: 'fitness',    emoji: '💪', label: 'Fitness' },
  { id: 'study',      emoji: '📚', label: 'Study / Career' },
  { id: 'mindset',    emoji: '🧠', label: 'Mindset' },
  { id: 'health',     emoji: '🥗', label: 'Health' },
  { id: 'social',     emoji: '❤️', label: 'Relationships' },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [goals, setGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    if (goals.includes(id)) setGoals(goals.filter(g => g !== id));
    else if (goals.length < 3) setGoals([...goals, id]);
  };

  const steps = [
    // Step 0 — Welcome
    <motion.div key="s0" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 shadow-[0_0_30px_rgba(0,229,204,0.3)]">
        <img src="/logo.png" alt="LUL" className="w-full h-full object-cover"/>
      </div>
      <p className="text-xs text-[#00e5cc] font-mono tracking-widest mb-3">// SELF GROWTH. GAMIFIED. //</p>
      <h1 className="text-3xl font-black text-foreground mb-4 leading-tight">Welcome to<br/>Level Up Life</h1>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-xs">
        Build daily habits. Evolve your spirit.<br/>Become who you were meant to be.
      </p>
      <div className="flex gap-2 mb-10">
        {[0,1,2,3].map(i => <div key={i} className={`ob-dot ${i===step?'active':''}`}/>)}
      </div>
      <button onClick={() => setStep(1)}
        className="w-full py-4 rounded-2xl bg-[#00e5cc] text-black font-bold text-base">
        Let's Begin →
      </button>
    </motion.div>,

    // Step 1 — Name
    <motion.div key="s1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center w-full">
      <p className="text-xs text-[#00e5cc] font-mono mb-4">STEP 1 OF 3</p>
      <h2 className="text-2xl font-black mb-2">What's your name?</h2>
      <p className="text-sm text-muted-foreground mb-8">This is how your spirit will know you.</p>
      <div className="flex gap-2 mb-8">
        {[0,1,2,3].map(i => <div key={i} className={`ob-dot ${i===step?'active':''}`}/>)}
      </div>
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="Enter your name..."
        maxLength={20}
        className="w-full bg-card border-2 border-border focus:border-[#00e5cc] rounded-2xl py-4 px-5 text-center text-xl font-bold outline-none mb-4 transition-colors"/>
      <button onClick={() => setStep(2)}
        className="w-full py-4 rounded-2xl bg-[#00e5cc] text-black font-bold text-base mb-3">
        Continue →
      </button>
      <button onClick={() => setStep(2)} className="text-sm text-muted-foreground">Skip for now</button>
    </motion.div>,

    // Step 2 — Wake Time
    <motion.div key="s2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center w-full">
      <p className="text-xs text-[#00e5cc] font-mono mb-4">STEP 2 OF 3</p>
      <h2 className="text-2xl font-black mb-2">When do you wake up?</h2>
      <p className="text-sm text-muted-foreground mb-6">We'll send your morning reminder at this time.</p>
      <div className="flex gap-2 mb-6">
        {[0,1,2,3].map(i => <div key={i} className={`ob-dot ${i===step?'active':''}`}/>)}
      </div>
      <div className="grid grid-cols-3 gap-2 w-full mb-6">
        {WAKE_TIMES.map(([val, label]) => (
          <button key={val} onClick={() => setWakeTime(val)}
            className={`py-3 rounded-xl text-sm font-semibold border transition-all
              ${wakeTime === val
                ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.12)] text-[#00e5cc]'
                : 'border-border bg-card text-foreground'}`}>
            {label}
          </button>
        ))}
      </div>
      <button onClick={() => setStep(3)}
        className="w-full py-4 rounded-2xl bg-[#00e5cc] text-black font-bold text-base">
        Continue →
      </button>
    </motion.div>,

    // Step 3 — Goals
    <motion.div key="s3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center w-full">
      <p className="text-xs text-[#00e5cc] font-mono mb-4">STEP 3 OF 3</p>
      <h2 className="text-2xl font-black mb-2">Pick your top goals</h2>
      <p className="text-sm text-muted-foreground mb-6">Choose up to 3 that matter most to you.</p>
      <div className="flex gap-2 mb-6">
        {[0,1,2,3].map(i => <div key={i} className={`ob-dot ${i===step?'active':''}`}/>)}
      </div>
      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        {GOALS.map(g => (
          <button key={g.id} onClick={() => toggleGoal(g.id)}
            className={`py-4 rounded-2xl border transition-all
              ${goals.includes(g.id)
                ? 'border-[#00e5cc] bg-[rgba(0,229,204,0.12)]'
                : 'border-border bg-card'}`}>
            <div className="text-3xl mb-1">{g.emoji}</div>
            <div className="text-xs font-semibold">{g.label}</div>
          </button>
        ))}
      </div>
      <button onClick={() => onComplete(name || 'J.J', wakeTime, goals)}
        className="w-full py-4 rounded-2xl bg-[#00e5cc] text-black font-bold text-base">
        Start My Journey 🚀
      </button>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
    </div>
  );
}
