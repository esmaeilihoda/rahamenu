import { useEffect, useState } from 'react';

interface PrepTimerProps {
  startTime: Date;
  targetMinutes: number;
}

export const PrepTimer = ({ startTime, targetMinutes }: PrepTimerProps) => {
  const [elapsed, setElapsed] = useState(0); // seconds

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      setElapsed(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const targetSeconds = targetMinutes * 60;
  const pct = Math.min(100, Math.floor((elapsed / targetSeconds) * 100));
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  let color = 'text-green-500';
  if (elapsed >= targetSeconds * 0.8 && elapsed < targetSeconds) color = 'text-yellow-500';
  if (elapsed >= targetSeconds) color = 'text-red-500';

  return (
    <div className="flex items-center gap-3">
      <div className={`text-2xl font-mono ${color}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="w-10 h-10 rounded-full bg-muted relative">
        <svg className="w-10 h-10 rotate-[-90deg]" viewBox="0 0 36 36">
          <path
            d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <path
            d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
            fill="none"
            stroke={color === 'text-red-500' ? '#ef4444' : color === 'text-yellow-500' ? '#f59e0b' : '#22c55e'}
            strokeWidth="4"
            strokeDasharray={`${pct}, 100`}
          />
        </svg>
      </div>
    </div>
  );
};
