import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <div className="w-full">
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-brand-100 bg-white px-4 text-sm text-brand-900 placeholder:text-brand-400',
        'focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
        className,
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Input.displayName = 'Input';
