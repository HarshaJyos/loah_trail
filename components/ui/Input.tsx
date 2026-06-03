import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-[var(--bg-elevated)] border rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors duration-200
          ${
            error
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
              : 'border-[var(--border)] focus:border-[var(--purple)] focus:ring-1 focus:ring-violet-500/30'
          }
          ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
export default Input;
