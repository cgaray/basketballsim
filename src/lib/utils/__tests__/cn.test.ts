/**
 * Tests for cn utility function
 */

import { cn } from '../cn';

describe('cn', () => {
  it('should combine multiple class strings', () => {
    expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('should handle objects with boolean values', () => {
    expect(cn('base', { conditional: true, hidden: false })).toBe('base conditional');
  });

  it('should handle mixed input types', () => {
    expect(cn('base', ['class1', 'class2'], { conditional: true }, 'class3')).toBe('base class1 class2 conditional class3');
  });

  it('should filter out falsy values', () => {
    expect(cn('base', null, undefined, false, 0, '', 'valid')).toBe('base valid');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn(null, undefined)).toBe('');
  });

  it('should handle Tailwind CSS classes correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500'); // Last class wins
    expect(cn('p-4', 'p-2')).toBe('p-2'); // Last class wins
  });

  it('should handle complex conditional logic', () => {
    const isActive = true;
    const isDisabled = false;
    const size = 'large';
    
    expect(cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled',
      size === 'large' && 'text-lg',
      size === 'small' && 'text-sm'
    )).toBe('base-class active text-lg');
  });
});
