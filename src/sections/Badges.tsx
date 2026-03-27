import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Lock, 
  Trophy,
  Footprints,
  Rocket,
  Zap,
  Target,
  Crown,
  Flame,
  Calendar,
  Award,
  Hammer,
  Wind,
  Waves,
  Building2,
  Briefcase,
  Heart,
  Brain,
  BookOpen,
  FolderOpen,
  Sparkles,
  Check
} from 'lucide-react';
import type { Badge } from '@/types';

interface BadgesProps {
  badges: Badge[];
  onBack: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Footprints,
  Rocket,
  Zap,
  Target,
  Crown,
  Flame,
  Calendar,
  Award,
  Trophy,
  Hammer,
  Wind,
  Waves,
  Building2,
  Briefcase,
  Heart,
  Brain,
  BookOpen,
  FolderOpen,
  Sparkles,
};

export function Badges({ badges, onBack }: BadgesProps) {
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');

  const unlockedBadges = badges.filter(b => b.unlockedAt);
  const lockedBadges = badges.filter(b => !b.unlockedAt);

  return (
    <div className="h-screen bg-background pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Badges</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl gradient-purple p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Collection Progress</p>
              <h2 className="text-3xl font-bold">
                {unlockedBadges.length}<span className="text-lg text-muted-foreground">/{badges.length}</span>
              </h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {lockedBadges.length} more badges to unlock
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'unlocked'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Unlocked ({unlockedBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'locked'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Locked ({lockedBadges.length})
          </button>
        </motion.div>

        {/* Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {(activeTab === 'unlocked' ? unlockedBadges : lockedBadges).map((badge, index) => {
            const Icon = iconMap[badge.icon] || Trophy;
            const isUnlocked = !!badge.unlockedAt;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                className={`rounded-2xl p-4 ${
                  isUnlocked 
                    ? 'bg-card border border-border' 
                    : 'bg-card/50 border border-border/50'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                  isUnlocked 
                    ? 'gradient-purple' 
                    : 'bg-secondary/50'
                }`}>
                  {isUnlocked ? (
                    <Icon className="w-7 h-7 text-primary" />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                <h3 className={`font-semibold mb-1 ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {badge.description}
                </p>

                {isUnlocked && badge.unlockedAt && (
                  <div className="flex items-center gap-1 text-xs text-emerald-500">
                    <Check className="w-3 h-3" />
                    <span>
                      Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {!isUnlocked && (
                  <p className="text-xs text-muted-foreground">
                    Requirement: {badge.requirement.type === 'missions' && `${badge.requirement.value} missions`}
                    {badge.requirement.type === 'streak' && `${badge.requirement.value}-day streak`}
                    {badge.requirement.type === 'level' && `Level ${badge.requirement.value}`}
                    {badge.requirement.type === 'category' && `${badge.requirement.value} ${badge.requirement.category} missions`}
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {activeTab === 'unlocked' && unlockedBadges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete missions to unlock your first badge!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
