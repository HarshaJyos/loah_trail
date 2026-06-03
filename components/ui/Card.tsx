import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow';
  accentColor?: string; // Optional accent color border/bar
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  accentColor,
  hoverable = true,
  className = '',
  style,
  ...props
}) => {
  const baseStyle =
    'rounded-3xl border transition-all duration-300 relative overflow-hidden bg-[var(--bg-surface)] border-[var(--border)]';

  const variants = {
    default: '',
    glass: 'backdrop-blur-xl bg-[var(--bg-glass)]',
    glow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]',
  };

  const hoverStyle = hoverable
    ? 'hover:border-[var(--border-active)] hover:scale-[1.005] hover:shadow-[var(--glow-purple)]'
    : '';

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${hoverStyle} ${className}`}
      style={{
        ...style,
        ...(accentColor && variant === 'glow'
          ? {
              boxShadow: `0 0 40px ${accentColor}1c`,
              borderColor: `${accentColor}33`,
            }
          : {}),
      }}
      {...props}
    >
      {accentColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-md shrink-0"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className={accentColor ? 'pl-4 h-full' : 'h-full'}>{children}</div>
    </div>
  );
};
export default Card;
