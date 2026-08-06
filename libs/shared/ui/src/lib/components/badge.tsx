import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', {
  variants: {
    variant: {
      brand: 'bg-brand-800 text-white',
      subtle: 'bg-brand-50 text-brand-700',
      sale: 'bg-red-600 text-white',
      status: 'bg-brand-100 text-brand-800',
    },
  },
  defaultVariants: { variant: 'subtle' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
