import type { Challenge, GamePower } from '@/types';

export const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'Walk 500 Steps', description: 'Take a 500-step walk today. Stand up and move your body.', category: 'physical', targetValue: 500, unit: 'steps', currentProgress: 0, status: 'active', xpReward: 150, powerReward: 'strength', powerPoints: 15, createdAt: new Date().toISOString(), emoji: '🚶' },
  { id: 'c2', title: 'Study 20 Minutes', description: 'Study or read for 20 uninterrupted minutes.', category: 'learning', targetValue: 20, unit: 'minutes', currentProgress: 0, status: 'active', xpReward: 180, powerReward: 'wisdom', powerPoints: 18, createdAt: new Date().toISOString(), emoji: '📚' },
  { id: 'c3', title: 'Drink 8 Glasses of Water', description: 'Stay fully hydrated today.', category: 'physical', targetValue: 8, unit: 'glasses', currentProgress: 0, status: 'active', xpReward: 120, powerReward: 'endurance', powerPoints: 12, createdAt: new Date().toISOString(), emoji: '💧' },
  { id: 'c4', title: 'Complete 3 Real Tasks', description: 'Finish 3 tasks from your timetable today.', category: 'discipline', targetValue: 3, unit: 'tasks', currentProgress: 0, status: 'active', xpReward: 200, powerReward: 'focus', powerPoints: 20, createdAt: new Date().toISOString(), emoji: '✅' },
  { id: 'c5', title: 'No Social Media 2 Hours', description: 'Stay off social media for a 2-hour focused block.', category: 'mental', targetValue: 120, unit: 'minutes', currentProgress: 0, status: 'active', xpReward: 160, powerReward: 'focus', powerPoints: 16, createdAt: new Date().toISOString(), emoji: '🎯' },
  { id: 'c6', title: 'Talk to 2 People', description: 'Have a genuine conversation with 2 different people.', category: 'social', targetValue: 2, unit: 'conversations', currentProgress: 0, status: 'active', xpReward: 130, powerReward: 'charisma', powerPoints: 13, createdAt: new Date().toISOString(), emoji: '🤝' },
];

export const GAME_POWERS: GamePower[] = [
  { id: 'strength_1', name: 'Iron Will', description: 'Your focus is unbreakable', type: 'strength', level: 1, isUnlocked: false, emoji: '💪' },
  { id: 'strength_2', name: 'Steel Mind', description: 'You push through any obstacle', type: 'strength', level: 2, isUnlocked: false, emoji: '🦾' },
  { id: 'strength_3', name: 'Titan Force', description: 'Nothing can stop your momentum', type: 'strength', level: 3, isUnlocked: false, emoji: '⚡' },
  { id: 'wisdom_1', name: 'Sharp Mind', description: 'Learning accelerates your growth', type: 'wisdom', level: 1, isUnlocked: false, emoji: '🧠' },
  { id: 'wisdom_2', name: 'Deep Knowledge', description: 'Every page adds to your power', type: 'wisdom', level: 2, isUnlocked: false, emoji: '📖' },
  { id: 'wisdom_3', name: 'Enlightened', description: 'You see what others cannot', type: 'wisdom', level: 3, isUnlocked: false, emoji: '🔮' },
  { id: 'focus_1', name: 'Laser Focus', description: 'Distractions fade away', type: 'focus', level: 1, isUnlocked: false, emoji: '🎯' },
  { id: 'focus_2', name: 'Deep Work', description: 'You enter flow state with ease', type: 'focus', level: 2, isUnlocked: false, emoji: '🌊' },
  { id: 'focus_3', name: 'Zero State', description: 'Pure undistracted presence', type: 'focus', level: 3, isUnlocked: false, emoji: '🧘' },
  { id: 'charisma_1', name: 'Social Spark', description: 'People feel your energy', type: 'charisma', level: 1, isUnlocked: false, emoji: '✨' },
  { id: 'charisma_2', name: 'Magnetic', description: 'You draw positivity to you', type: 'charisma', level: 2, isUnlocked: false, emoji: '🌟' },
  { id: 'endurance_1', name: 'Iron Routine', description: 'Your habits are unbreakable', type: 'endurance', level: 1, isUnlocked: false, emoji: '🔥' },
  { id: 'endurance_2', name: 'Marathon Mind', description: 'You outlast every challenge', type: 'endurance', level: 2, isUnlocked: false, emoji: '🏆' },
  { id: 'speed_1', name: 'Quick Strike', description: 'You act before doubt arrives', type: 'speed', level: 1, isUnlocked: false, emoji: '⚡' },
  { id: 'speed_2', name: 'Lightning Reflex', description: 'Two minutes feels like nothing', type: 'speed', level: 2, isUnlocked: false, emoji: '🚀' },
];
