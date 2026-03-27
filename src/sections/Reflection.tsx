import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles,
  Send,
  Smile,
  Frown,
  Meh,
  Zap,
  CloudRain,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { DailyReflection } from '@/types';

interface ReflectionProps {
  onSave: (content: string, mood: DailyReflection['mood']) => void;
  onBack: () => void;
  existingReflection?: DailyReflection | null;
  onViewHistory?: () => void;
}

const moods: { value: DailyReflection['mood']; icon: React.ElementType; label: string; color: string }[] = [
  { value: 'great', icon: Zap, label: 'Great', color: '#10B981' },
  { value: 'good', icon: Smile, label: 'Good', color: '#3B82F6' },
  { value: 'neutral', icon: Meh, label: 'Okay', color: '#6B7280' },
  { value: 'tired', icon: Frown, label: 'Tired', color: '#F59E0B' },
  { value: 'challenging', icon: CloudRain, label: 'Hard', color: '#EC4899' },
];

export function Reflection({ onSave, onBack, existingReflection, onViewHistory }: ReflectionProps) {
  const [content, setContent] = useState(existingReflection?.content || '');
  const [selectedMood, setSelectedMood] = useState<DailyReflection['mood']>(existingReflection?.mood || 'good');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      onSave(content, selectedMood);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="h-screen bg-background pb-28 flex flex-col overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-4 h-4"/>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-black">Daily Reflection</h1>
            <p className="text-[10px] text-[#00e5cc] font-mono">WRITE · REFLECT · GROW</p>
          </div>
          {onViewHistory && (
            <button onClick={onViewHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95"
              style={{ background: 'rgba(0,229,204,0.1)', color: '#00e5cc', border: '1px solid rgba(0,229,204,0.3)' }}>
              <BookOpen className="w-3.5 h-3.5"/>
              History
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-full gradient-purple flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">What small win did you accomplish today?</h1>
          <p className="text-muted-foreground">
            Reflect on your day and celebrate your progress
          </p>
        </motion.div>

        {/* Mood Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-sm font-medium mb-3">How are you feeling?</p>
          <div className="flex justify-center gap-3">
            {moods.map((mood, index) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.value;
              
              return (
                <motion.button
                  key={mood.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                    isSelected 
                      ? 'bg-card border-2' 
                      : 'bg-secondary/50 border-2 border-transparent hover:bg-secondary'
                  }`}
                  style={{ 
                    borderColor: isSelected ? mood.color : undefined 
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: isSelected ? `${mood.color}20` : 'transparent',
                    }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: isSelected ? mood.color : 'hsl(var(--muted-foreground))' }}
                    />
                  </div>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: isSelected ? mood.color : 'hsl(var(--muted-foreground))' }}
                  >
                    {mood.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Reflection Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <p className="text-sm font-medium mb-3">Your reflection</p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Today I..."
            className="flex-1 min-h-[150px] rounded-2xl bg-card border-border resize-none text-base leading-relaxed"
          />
          <p className="text-xs text-muted-foreground mt-2">
            This helps reinforce your habit formation
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="w-full rounded-xl h-14 text-lg gap-2"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Save Reflection
              </>
            )}
          </Button>
        </motion.div>

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-6 italic"
        >
          "Tiny actions quietly rewrite the story we tell about ourselves"
        </motion.p>
      </div>
    </div>
  );
}
