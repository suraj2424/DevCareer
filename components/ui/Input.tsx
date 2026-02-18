import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, id: externalId, 'aria-describedby': externalDescribedBy, ...props }, ref) => {
    const autoId = useId();
    const inputId = externalId ?? autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const labelId = label ? `${inputId}-label` : undefined;

    const describedBy = cn(externalDescribedBy, errorId, helperId) || undefined;

    const hasError = Boolean(error);

    return (
      <div className="relative">
        {label && (
          <label
            id={labelId}
            htmlFor={inputId}
            className={cn(
              'mb-2 block text-xs font-bold uppercase tracking-widest transition-colors',
              hasError ? 'text-red-600' : 'text-slate-500',
            )}
          >
            {label}
            {props.required && (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-labelledby={labelId}
            className={cn(
              'h-11 w-full rounded-lg border bg-white text-sm text-slate-900 shadow-sm outline-none',
              'transition-all duration-150 ease-out',
              'placeholder:text-slate-400',
              'hover:border-slate-400',
              'focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon ? 'pl-10 pr-3' : 'px-3',
              hasError
                ? 'border-red-300 bg-red-50/50 hover:border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/30'
                : 'border-slate-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/30',
              className,
            )}
            {...props}
          />

          {hasError && (
            <div
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-red-400"
              aria-hidden="true"
            >
              <AlertCircle className="h-4 w-4" focusable="false" />
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600"
          >
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-2 text-sm text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;