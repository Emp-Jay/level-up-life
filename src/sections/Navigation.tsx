import { motion } from 'framer-motion';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const TABS = [
  { id: 'dashboard',  icon: '🏠', label: 'Home'     },
  { id: 'missions',   icon: '🎯', label: 'Missions'  },
  { id: 'badges',     icon: '🏆', label: 'Badges'    },
  { id: 'reflection', icon: '✨', label: 'Reflect'   },
  { id: 'settings',   icon: '⚙️', label: 'Settings'  },
];

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/97 backdrop-blur border-t border-border safe-area-bottom">
      <div className="flex justify-around px-2 py-2">
        {TABS.map(tab => {
          const active = currentView === tab.id;
          return (
            <motion.button key={tab.id} whileTap={{ scale: 0.88 }}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl min-w-[54px]">
              <span className={`text-xl transition-all ${active ? 'scale-110' : 'opacity-50'}`}>
                {tab.icon}
              </span>
              <span className={`text-[9px] font-semibold transition-all
                ${active ? 'text-[#00e5cc]' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
              {active && (
                <motion.div layoutId="navDot"
                  className="w-1 h-1 rounded-full bg-[#00e5cc] shadow-[0_0_6px_rgba(0,229,204,0.8)]"/>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
