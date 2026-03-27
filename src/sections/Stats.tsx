import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target,
  Zap,
  Flame,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';
import type { UserProgress, Mission, Badge } from '@/types';
import { CATEGORIES } from '@/data/missions';

interface StatsProps {
  userProgress: UserProgress;
  completedMissions: Mission[];
  badges: Badge[];
  onBack: () => void;
}

export function Stats({ userProgress, completedMissions, badges, onBack }: StatsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories'>('overview');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMissions = completedMissions.length;
    const thisWeek = completedMissions.filter(m => {
      const date = new Date(m.completedAt || '');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length;

    const thisMonth = completedMissions.filter(m => {
      const date = new Date(m.completedAt || '');
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return date >= monthAgo;
    }).length;

    // Category breakdown
    const categoryStats = CATEGORIES.map(cat => ({
      ...cat,
      count: completedMissions.filter(m => m.category === cat.id).length,
    })).sort((a, b) => b.count - a.count);

    const favoriteCategory = categoryStats[0];

    // Average missions per day
    const uniqueDays = new Set(completedMissions.map(m => m.completedAt?.split('T')[0])).size;
    const avgPerDay = uniqueDays > 0 ? (totalMissions / uniqueDays).toFixed(1) : '0';

    // Completion rate (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    const daysWithMissions = last30Days.filter(date => 
      completedMissions.some(m => m.completedAt?.startsWith(date))
    ).length;
    const completionRate = Math.round((daysWithMissions / 30) * 100);

    return {
      totalMissions,
      thisWeek,
      thisMonth,
      categoryStats,
      favoriteCategory,
      avgPerDay,
      completionRate,
      uniqueDays,
    };
  }, [completedMissions]);

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
          <h1 className="text-lg font-semibold">Statistics</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl gradient-purple p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Missions</p>
              <h2 className="text-4xl font-bold">{stats.totalMissions}</h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.avgPerDay}</p>
              <p className="text-xs text-muted-foreground">Avg/Day</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Categories
          </button>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg gradient-amber flex items-center justify-center">
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                </div>
                <p className="text-2xl font-bold">{userProgress.currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Completion</span>
                </div>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">last 30 days</p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total XP</span>
                </div>
                <p className="text-2xl font-bold">{userProgress.xp}</p>
                <p className="text-xs text-muted-foreground">points earned</p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg gradient-rose flex items-center justify-center">
                    <Award className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Badges</span>
                </div>
                <p className="text-2xl font-bold">{badges.filter(b => b.unlockedAt).length}</p>
                <p className="text-xs text-muted-foreground">of {badges.length} unlocked</p>
              </div>
            </div>

            {/* Favorite Category */}
            {stats.favoriteCategory && stats.favoriteCategory.count > 0 && (
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="text-sm text-muted-foreground mb-3">Favorite Category</p>
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-14 h-14 rounded-xl ${stats.favoriteCategory.gradient} flex items-center justify-center`}
                  >
                    <span className="text-2xl">{stats.favoriteCategory.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{stats.favoriteCategory.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.favoriteCategory.count} missions completed
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Missions by Category
            </h3>
            {stats.categoryStats.map((cat, index) => {
              const percentage = stats.totalMissions > 0 
                ? Math.round((cat.count / stats.totalMissions) * 100) 
                : 0;
              
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="rounded-2xl bg-card border border-border p-4"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div 
                      className={`w-10 h-10 rounded-lg ${cat.gradient} flex items-center justify-center`}
                    >
                      <span style={{ color: cat.color }}>{cat.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{cat.name}</h4>
                        <span className="text-sm font-semibold">{cat.count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {percentage}% of all missions
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-gradient-to-br from-background to-cyan-500/20 p-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Keep building momentum!</p>
          <p className="text-lg font-semibold">
            "Small actions compound into big changes"
          </p>
        </motion.div>
      </div>
    </div>
  );
}
