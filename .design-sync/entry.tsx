// design-sync bundle entry — re-exports only the src/components/ui primitives
// so esbuild bundles the design-system surface, not the Next.js app/DB code.
export * from '@/components/ui/button';
export * from '@/components/ui/card';
export * from '@/components/ui/input';
export * from '@/components/ui/label';
export * from '@/components/ui/select';
export * from '@/components/ui/separator';
export * from '@/components/ui/badge';
export * from '@/components/ui/alert';
export * from '@/components/ui/year-selector';
