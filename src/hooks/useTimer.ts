import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onComplete?: () => void;
  onTick?: (timeRemaining: number) => void;
}

export function useTimer({ initialTime, onComplete, onTick }: UseTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        if (onTick) {
          onTick(newTime);
        }
        
        if (newTime <= 0) {
          clearTimerInterval();
          setIsRunning(false);
          if (onComplete) {
            onComplete();
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  }, [isRunning, onComplete, onTick, clearTimerInterval]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    
    clearTimerInterval();
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  }, [isRunning, isPaused, clearTimerInterval]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    
    setIsPaused(false);
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        if (onTick) {
          onTick(newTime);
        }
        
        if (newTime <= 0) {
          clearTimerInterval();
          setIsRunning(false);
          if (onComplete) {
            onComplete();
          }
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  }, [isPaused, onComplete, onTick, clearTimerInterval]);

  const stop = useCallback(() => {
    clearTimerInterval();
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimerInterval]);

  const reset = useCallback(() => {
    clearTimerInterval();
    setTimeRemaining(initialTime);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
  }, [initialTime, clearTimerInterval]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    return ((initialTime - timeRemaining) / initialTime) * 100;
  }, [initialTime, timeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    formattedTime: formatTime(timeRemaining),
    progress: getProgress(),
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
