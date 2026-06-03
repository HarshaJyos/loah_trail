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
    purple: 'bg-violet-50 text-violet-600 border-violet-200/60 shadow-sm',
    pink: 'bg-pink-50 text-pink-600 border-pink-200/60 shadow-sm',
    cyan: 'bg-sky-50 text-sky-600 border-sky-200/60 shadow-sm',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm',
    amber: 'bg-amber-50 text-amber-850 text-amber-800 border-amber-200/60 shadow-sm',
    rose: 'bg-rose-50 text-rose-600 border-rose-200/60 shadow-sm',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/60',
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
