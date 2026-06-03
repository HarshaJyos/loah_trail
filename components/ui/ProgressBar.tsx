import * as React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  animate?: boolean;
  gradient?: boolean;
  color?: string; // Optional custom solid color override
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  animate = true,
  gradient = true,
  color,
  className = '',
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={`w-full h-2 bg-white/5 rounded-full overflow-hidden shrink-0 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out relative
          ${
            gradient
              ? 'bg-gradient-to-r from-violet-600 to-pink-500'
              : color || 'bg-violet-600'
          }
        `}
        style={{ width: `${percentage}%` }}
      >
        {animate && percentage > 0 && percentage < 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        )}
      </div>
    </div>
  );
};
export default ProgressBar;
