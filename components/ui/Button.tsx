import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const BASE_CLASSES = [
  'group relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
  'tracking-wide transition-all duration-150 ease-out select-none',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:pointer-events-none',
].join(' ');

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md shadow-blue-600/25',
    'hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-600/30',
    'active:from-blue-700 active:to-blue-800 active:shadow-sm',
    'focus-visible:ring-blue-500',
    'disabled:from-blue-400 disabled:to-blue-400 disabled:shadow-none',
  ),
  secondary: cn(
    'bg-gradient-to-b from-slate-600 to-slate-700 text-white shadow-md shadow-slate-700/25',
    'hover:from-slate-700 hover:to-slate-800 hover:shadow-lg hover:shadow-slate-700/30',
    'active:from-slate-800 active:to-slate-900 active:shadow-sm',
    'focus-visible:ring-slate-500',
    'disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none',
  ),
  outline: cn(
    'border-2 border-slate-300 bg-white text-slate-700 shadow-sm',
    'hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900',
    'active:bg-slate-100 active:shadow-none',
    'focus-visible:ring-slate-400',
    'disabled:border-slate-200 disabled:text-slate-400',
  ),
  ghost: cn(
    'text-slate-600',
    'hover:bg-slate-100 hover:text-slate-900',
    'active:bg-slate-200',
    'focus-visible:ring-slate-400',
    'disabled:text-slate-400',
  ),
  danger: cn(
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-600/25',
    'hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-600/30',
    'active:from-red-700 active:to-red-800 active:shadow-sm',
    'focus-visible:ring-red-500',
    'disabled:from-red-400 disabled:to-red-400 disabled:shadow-none',
  ),
} as const;

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
} as const;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        className={cn(
          BASE_CLASSES,
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          loading && 'cursor-wait',
          className,
        )}
        {...props}
      >
        {loading && (
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin"
            aria-hidden="true"
            focusable="false"
          />
        )}
        <span className={cn('inline-flex items-center gap-2', loading && 'opacity-70')}>
          {children}
        </span>
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
export type { ButtonProps, ButtonVariant, ButtonSize };