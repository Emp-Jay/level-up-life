import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Character } from './Character';
import { computeSpirit, getGodTierTitle, getUnlockedSeasons, SEASONS } from '@/data/spirit';
import type { SpiritState } from '@/data/spirit';
import type { UserProgress } from '@/types';

interface SpiritCardProps {
  userProgress: UserProgress;
  spiritState: SpiritState;
  gamePowers: any[];
  onOpenCustomize?: () => void;
}

const STAGE_ICONS  = ['💤','🔮','👻','🌌','🌸','👑'];
const STAGE_NAMES  = ['DORMANT','ORB','WISP','GALAXY','DIVINE','ULTIMATE'];
const STAGE_DAYS   = ['Day 0','Day 3+','Day 7+','Day 14+','Day 21+','Day 30+'];

export function SpiritCard({ userProgress, spiritState, gamePowers, onOpenCustomize }: SpiritCardProps) {
  const { stage, stageInfo, nextStageInfo, progress, season } = useMemo(() =>
    computeSpirit(userProgress.xp, userProgress.currentStreak, userProgress.longestStreak, spiritState),
    [userProgress.xp, userProgress.currentStreak, userProgress.longestStreak, spiritState]
  );

  const godTier       = getGodTierTitle(userProgress.longestStreak);
  const unlockedSeasons = getUnlockedSeasons(userProgress.longestStreak);
  const isMaxStage    = stage === 5;
  const xpNeeded      = Math.max(0, (nextStageInfo?.xpRequired || 0) - userProgress.xp);
  const streakNeeded  = Math.max(0, (nextStageInfo?.streakRequired || 0) - userProgress.currentStreak);

  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{ background: 'var(--spirit-card-bg)', border: '1px solid var(--spirit-card-border)' }}>

      {/* Starfield bg (dark only) */}
      <div className="absolute inset-0 pointer-events-none starfield opacity-60"/>

      {/* God Tier badge */}
      {godTier && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', color: '#ffd700' }}>
          {godTier.badge} {godTier.title}
        </motion.div>
      )}

      {/* Season badge - top right when prestiged */}
      {spiritState.prestige > 0 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono"
          style={{ background: `${stageInfo.color}22`, border: `1px solid ${stageInfo.color}55`, color: stageInfo.color }}>
          {season.emoji} {season.name}
        </div>
      )}

      {/* ── TOP BAR: name left, streak right ── */}
      <div className={`flex items-center justify-between px-4 pt-4 pb-0 relative z-10 ${godTier ? 'mt-6' : ''}`}>
        <div>
          <p className="text-[9px] font-mono tracking-widest opacity-70" style={{ color: stageInfo.color }}>
            STAGE {stage}/5 // {stageInfo.name}
          </p>
          <p className="text-lg font-black" style={{ color: stageInfo.color, textShadow: `0 0 15px ${stageInfo.color}80` }}>
            EMBER
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-muted-foreground font-mono">STREAK</p>
          <p className="text-sm font-black text-yellow-400">🔥 {userProgress.currentStreak} DAYS</p>
        </div>
      </div>

      {/* ── STAGE PICKER ROW (exactly like HTML V10) ── */}
      <div className="flex gap-0 px-2 pt-2 overflow-x-auto no-scrollbar relative z-10">
        {STAGE_NAMES.map((name, i) => {
          const isActive = i === stage;
          const isGold   = i === 5 && isActive;
          return (
            <div key={i} className="flex-shrink-0 text-center px-1.5 py-1.5 rounded-xl min-w-[52px] transition-all"
              style={{
                border: isActive
                  ? `1px solid ${isGold ? '#ffd700' : 'var(--teal)'}`
                  : '1px solid transparent',
                background: isActive
                  ? isGold ? 'rgba(255,215,0,0.08)' : 'rgba(0,229,204,0.10)'
                  : 'transparent',
              }}>
              <div className="text-lg mb-0.5">{STAGE_ICONS[i]}</div>
              <div className="text-[7px] font-bold font-mono"
                style={{ color: isActive ? (isGold ? '#ffd700' : 'var(--teal)') : 'var(--muted-foreground)' }}>
                {name}
              </div>
              <div className="text-[6px]" style={{ color: 'var(--teal)' }}>{STAGE_DAYS[i]}</div>
            </div>
          );
        })}
      </div>

      {/* ── SPIRIT AVATAR ── */}
      <div className="flex justify-center py-2 relative z-10">
        <Character
          info={{
            state: stageInfo.canvasState,
            auraColor: stageInfo.auraColor,
            title: stageInfo.name,
            description: stageInfo.description,
            powerPercent: progress,
          }}
          season={spiritState.season}
          unlockedPowers={gamePowers.filter((p: any) => p.isUnlocked)}
        />
      </div>

      {/* ── SPIRIT NAME + DESCRIPTION ── */}
      <div className="px-4 pb-1 relative z-10 text-center">
        <p className="text-sm font-black font-mono tracking-widest" style={{ color: stageInfo.color }}>
          {stageInfo.name}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{stageInfo.description}</p>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="px-4 pb-4 relative z-10">
        {!isMaxStage ? (
          <>
            <div className="flex justify-between text-[9px] mb-1 font-mono" style={{ color: stageInfo.color }}>
              <span>POWER — TO {nextStageInfo?.name}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${stageInfo.color}20` }}>
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg,${stageInfo.color},#ffd700)` }}
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}/>
            </div>
            <div className="flex gap-4 mt-1.5">
              {xpNeeded > 0 && (
                <p className="text-[9px] text-muted-foreground">
                  <span className="text-yellow-400">⚡</span> {xpNeeded.toLocaleString()} XP needed
                </p>
              )}
              {streakNeeded > 0 && (
                <p className="text-[9px] text-muted-foreground">
                  <span className="text-orange-400">🔥</span> {streakNeeded} more days
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,215,0,0.15)' }}>
              <div className="h-full rounded-full w-full" style={{ background: 'linear-gradient(90deg,#ffd700,#ff9800)' }}/>
            </div>
            {spiritState.prestige === 0 ? (
              <motion.p animate={{ scale: [1,1.03,1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-[10px] font-bold text-yellow-400 font-mono">
                🌟 FULLY EVOLVED — PRESTIGE AVAILABLE! 🌟
              </motion.p>
            ) : (
              <p className="text-[10px] font-bold font-mono" style={{ color: stageInfo.color }}>
                👑 PRESTIGE {spiritState.prestige} — SEASON {spiritState.prestige + 2} COMING NEXT
              </p>
            )}
          </div>
        )}

        {/* Emojis */}
        <p className="text-center mt-2 text-lg tracking-widest">{stageInfo.emojis}</p>

        {/* Seasons unlocked + customize button */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1.5 items-center">
            {unlockedSeasons.map(sid => {
              const s = SEASONS.find(x => x.id === sid);
              return s ? <span key={sid} className="text-base">{s.emoji}</span> : null;
            })}
          </div>
          {onOpenCustomize && (
            <button onClick={onOpenCustomize}
              className="text-[9px] font-mono px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              style={{ background: `${stageInfo.color}15`, border: `1px solid ${stageInfo.color}40`, color: stageInfo.color }}>
              ✨ CUSTOMIZE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
