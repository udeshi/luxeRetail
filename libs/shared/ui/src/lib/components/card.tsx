import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../cn';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-2xl border border-brand-100/60 bg-white shadow-sm shadow-brand-900/5', className)}
    {...props}
  />
));
Card.displayName = 'Card';
