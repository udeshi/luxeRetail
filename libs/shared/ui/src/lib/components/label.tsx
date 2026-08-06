import { type LabelHTMLAttributes, forwardRef } from 'react';
import { cn } from '../cn';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('mb-1.5 block text-sm font-medium text-brand-800', className)} {...props} />
  ),
);
Label.displayName = 'Label';
