import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface EvaluationTimerProps {
  defaultMinutes?: number;
  evaluationType: 'GD' | 'PI';
}

export const EvaluationTimer: React.FC<EvaluationTimerProps> = ({
  defaultMinutes = 20,
  evaluationType,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(defaultMinutes * 60);
    setIsRunning(false);
  }, [evaluationType, defaultMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = secondsLeft <= 180 && secondsLeft > 0; // <= 3 mins
  const isTimeUp = secondsLeft === 0;

  return (
    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
      <Clock size={13} className={isRunning ? 'text-blue-600 animate-spin' : 'text-slate-400'} />
      <span className="text-[11px] font-semibold text-slate-600">
        {evaluationType} Round Timer:
      </span>

      <span
        className={`font-mono font-bold text-sm px-2 py-0.5 rounded-lg border transition-colors ${
          isTimeUp
            ? 'bg-red-600 text-white border-red-700 animate-pulse'
            : isLowTime
            ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
            : 'bg-white text-slate-800 border-slate-200'
        }`}
      >
        {formattedTime}
      </span>

      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className={`p-1 rounded-lg text-white font-bold transition-colors ${
            isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft(defaultMinutes * 60);
          }}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
};
