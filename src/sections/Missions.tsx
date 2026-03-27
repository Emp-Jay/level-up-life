import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Clock, 
  Filter,
  Zap,
  Sparkles
} from 'lucide-react';
import type { Mission, MissionCategory } from '@/types';
import { CATEGORIES } from '@/data/missions';

interface MissionsProps {
  missions: Mission[];
  onStartMission: (mission: Mission) => void;
  onBack: () => void;
}

export function Missions({ missions, onStartMission, onBack }: MissionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<MissionCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMissions = selectedCategory === 'all' 
    ? missions 
    : missions.filter(m => m.category === selectedCategory);

  const pendingMissions = filteredMissions.filter(m => !m.completed && !m.skipped);
  const completedMissions = filteredMissions.filter(m => m.completed);
  const skippedMissions = filteredMissions.filter(m => m.skipped);

  return (
    <div className="h-screen bg-background pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-4 h-4"/>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-black">Today's Missions</h1>
            <p className="text-[10px] text-[#00e5cc] font-mono">{pendingMissions.length} PENDING · {completedMissions.length} DONE</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${showFilters ? 'bg-[rgba(0,229,204,0.15)] text-[#00e5cc]' : 'bg-secondary text-muted-foreground'}`}>
            <Filter className="w-4 h-4"/>
          </button>
        </div>

        {/* Category Filter */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="p-4 flex gap-2 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'text-white'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : undefined,
                    }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="rounded-2xl bg-card border border-border p-3 text-center">
            <p className="text-2xl font-bold text-primary">{pendingMissions.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-3 text-center">
            <p className="text-2xl font-bold text-emerald-500">{completedMissions.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-3 text-center">
            <p className="text-2xl font-bold text-rose-500">{skippedMissions.length}</p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
        </motion.div>

        {/* Pending Missions */}
        {pendingMissions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Pending ({pendingMissions.length})
            </h2>
            <div className="space-y-3">
              {pendingMissions.map((mission, index) => {
                const category = CATEGORIES.find(c => c.id === mission.category);
                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => onStartMission(mission)}
                    className="group cursor-pointer rounded-2xl bg-card border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className={`w-12 h-12 rounded-xl ${category?.gradient} flex items-center justify-center flex-shrink-0`}
                      >
                        <Zap className="w-5 h-5" style={{ color: category?.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                            {mission.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {mission.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: `${category?.color}20`,
                              color: category?.color 
                            }}
                          >
                            {category?.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            2 min
                          </span>
                          <span className="text-xs text-primary font-medium">
                            +{mission.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Completed ({completedMissions.length})
            </h2>
            <div className="space-y-3">
              {completedMissions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="rounded-2xl bg-card/50 border border-border/50 p-4 opacity-75"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate line-through text-muted-foreground">
                        {mission.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {mission.description}
                      </p>
                      <span className="text-xs text-emerald-500 font-medium mt-1 inline-block">
                        +{mission.xpReward} XP earned
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Skipped Missions */}
        {skippedMissions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Skipped ({skippedMissions.length})
            </h2>
            <div className="space-y-3">
              {skippedMissions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="rounded-2xl bg-card/30 border border-border/30 p-4 opacity-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate text-muted-foreground">
                        {mission.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {mission.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {filteredMissions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No missions found</h3>
            <p className="text-sm text-muted-foreground">
              Try selecting a different category
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
