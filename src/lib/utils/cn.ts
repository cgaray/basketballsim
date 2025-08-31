/**
 * Utility function for combining CSS classes with Tailwind CSS
 * Uses clsx and tailwind-merge for optimal class combination
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class values and merges Tailwind CSS classes efficiently
 * @param inputs - Class values to combine
 * @returns string - Combined and merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
