import React, { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Circle, Volume2 } from 'lucide-react';
import { Recipe } from '../../types';
import { Button } from '../ui/Button';
import { extractTime } from '../../utils/parser';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [timers, setTimers] = useState<{ [key: string]: number }>({});
  const [runningTimers, setRunningTimers] = useState<{ [key: string]: boolean }>({});
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  // Wake Lock
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
        }
      } catch (err) {
        console.error('Wake Lock failed', err);
      }
    };
    requestWakeLock();
    return () => {
      wakeLock?.release();
    };
  }, []);

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const startTimer = (stepId: string, minutes: number) => {
    if (!timers[stepId]) {
      setTimers(prev => ({ ...prev, [stepId]: minutes * 60 }));
    }
    setRunningTimers(prev => ({ ...prev, [stepId]: true }));
  };

  const pauseTimer = (stepId: string) => {
    setRunningTimers(prev => ({ ...prev, [stepId]: false }));
  };

  const resetTimer = (stepId: string, minutes: number) => {
    setTimers(prev => ({ ...prev, [stepId]: minutes * 60 }));
    setRunningTimers(prev => ({ ...prev, [stepId]: false }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(runningTimers).forEach(id => {
          if (runningTimers[id] && next[id] > 0) {
            next[id] -= 1;
            changed = true;
            if (next[id] === 0) {
              setRunningTimers(p => ({ ...p, [id]: false }));
              // Notification
              if (Notification.permission === 'granted') {
                new Notification('烹饪提醒', { body: '计时结束啦！' });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('烹饪提醒', { body: '计时结束啦！' });
                  }
                });
              }
              // Simple alert as fallback
              alert('计时结束！');
            }
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [runningTimers]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-warmWhite flex flex-col">
      <header className="p-4 flex items-center justify-between border-b bg-white">
        <h2 className="font-bold text-gray-800 truncate flex-1 mr-4">烹饪模式: {recipe.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={24} />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Ingredients Checklist */}
        <section className="p-6 bg-white mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">食材准备</h3>
          <div className="grid grid-cols-2 gap-3">
            {recipe.ingredients.map(ing => (
              <button
                key={ing.id}
                onClick={() => toggleIngredient(ing.id)}
                className={`flex items-center gap-2 p-3 rounded-12 text-sm transition-all ${
                  checkedIngredients.includes(ing.id)
                    ? 'bg-gray-50 text-gray-300'
                    : 'bg-orange-50 text-gray-700'
                }`}
              >
                {checkedIngredients.includes(ing.id) ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                <span className={checkedIngredients.includes(ing.id) ? 'line-through' : ''}>
                  {ing.name} {ing.amount}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="p-6 space-y-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase">烹饪步骤</h3>
          {recipe.steps.map((step, index) => {
            const timeInMinutes = extractTime(step.description);
            const isCurrent = activeStepIndex === index;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStepIndex(index)}
                className={`p-5 rounded-24 transition-all border-2 ${
                  isCurrent ? 'bg-white border-primary shadow-lg scale-[1.02]' : 'bg-gray-50 border-transparent opacity-60'
                }`}
              >
                <div className="flex gap-4">
                  <span className={`text-2xl font-black ${isCurrent ? 'text-primary' : 'text-gray-300'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1 space-y-4">
                    <p className="text-gray-800 leading-relaxed">{step.description}</p>
                    
                    {step.image && (
                      <img src={step.image} alt="" className="w-full aspect-video object-cover rounded-12" />
                    )}

                    {timeInMinutes && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-16 border border-orange-100">
                        <div className="flex-1">
                          <div className="text-[10px] text-orange-400 font-bold uppercase">计时器</div>
                          <div className="text-xl font-mono font-bold text-primary">
                            {timers[step.id] !== undefined ? formatTime(timers[step.id]) : `${timeInMinutes}:00`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {runningTimers[step.id] ? (
                            <Button size="icon" variant="primary" onClick={(e) => { e.stopPropagation(); pauseTimer(step.id); }}>
                              <Pause size={18} />
                            </Button>
                          ) : (
                            <Button size="icon" variant="primary" onClick={(e) => { e.stopPropagation(); startTimer(step.id, timeInMinutes); }}>
                              <Play size={18} />
                            </Button>
                          )}
                          <Button size="icon" variant="secondary" onClick={(e) => { e.stopPropagation(); resetTimer(step.id, timeInMinutes); }}>
                            <RotateCcw size={18} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex justify-between items-center px-8">
        <div className="text-xs text-gray-400">
          <span className="font-bold text-primary">{activeStepIndex + 1}</span> / {recipe.steps.length} 步骤
        </div>
        <div className="flex gap-4">
          <Button
            variant="secondary"
            disabled={activeStepIndex === 0}
            onClick={() => setActiveStepIndex(prev => prev - 1)}
          >
            上一步
          </Button>
          <Button
            disabled={activeStepIndex === recipe.steps.length - 1}
            onClick={() => setActiveStepIndex(prev => prev + 1)}
          >
            下一步
          </Button>
        </div>
      </footer>
    </div>
  );
};
