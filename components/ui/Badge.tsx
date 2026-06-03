import * as React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'pink' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold rounded-full border select-none';

  const variants = {
    purple: 'bg-violet-500/15 text-violet-300 border-violet-500/20 shadow-[0_0_15px_rgba(124,58,237,0.05)]',
    pink: 'bg-pink-500/15 text-pink-300 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.05)]',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]',
    neutral: 'bg-white/5 text-[var(--text-secondary)] border-white/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wide',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
};
export default Badge;
