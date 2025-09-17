/**
 * Navbar Component
 * Consistent navigation bar across all pages
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Search, Trophy, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, children, icon, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Basketball Team Builder
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            <NavLink
              href="/"
              icon={<Home className="w-4 h-4" />}
              isActive={pathname === '/'}
            >
              Home
            </NavLink>
            <NavLink
              href="/players"
              icon={<Search className="w-4 h-4" />}
              isActive={pathname === '/players'}
            >
              Browse Players
            </NavLink>
            <NavLink
              href="/teams"
              icon={<Trophy className="w-4 h-4" />}
              isActive={pathname === '/teams'}
            >
              Build Teams
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}