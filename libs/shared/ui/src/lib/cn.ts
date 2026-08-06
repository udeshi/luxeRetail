import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** clsx for conditional classes + tailwind-merge to resolve conflicting
 *  utility classes (e.g. a caller's `p-4` overriding a component's `p-2`). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
