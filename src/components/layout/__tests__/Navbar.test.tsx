/**
 * Tests for Navbar component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Navbar } from '../Navbar';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navbar', () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the brand/logo', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navbar />);

    expect(screen.getByText('Basketball Team Builder')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navbar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Browse Players')).toBeInTheDocument();
    expect(screen.getByText('Build Teams')).toBeInTheDocument();
    expect(screen.getByText('Simulate Match')).toBeInTheDocument();
  });

  it('highlights active link for home page', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navbar />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('bg-primary');
    expect(homeLink).toHaveClass('text-primary-foreground');
  });

  it('highlights active link for players page', () => {
    mockUsePathname.mockReturnValue('/players');
    render(<Navbar />);

    const playersLink = screen.getByText('Browse Players').closest('a');
    expect(playersLink).toHaveClass('bg-primary');
    expect(playersLink).toHaveClass('text-primary-foreground');
  });

  it('highlights active link for teams page', () => {
    mockUsePathname.mockReturnValue('/teams');
    render(<Navbar />);

    const teamsLink = screen.getByText('Build Teams').closest('a');
    expect(teamsLink).toHaveClass('bg-primary');
    expect(teamsLink).toHaveClass('text-primary-foreground');
  });

  it('highlights active link for matches page', () => {
    mockUsePathname.mockReturnValue('/matches');
    render(<Navbar />);

    const matchesLink = screen.getByText('Simulate Match').closest('a');
    expect(matchesLink).toHaveClass('bg-primary');
    expect(matchesLink).toHaveClass('text-primary-foreground');
  });

  it('applies inactive styling to non-active links', () => {
    mockUsePathname.mockReturnValue('/players');
    render(<Navbar />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveClass('bg-primary');
    expect(homeLink).toHaveClass('text-muted-foreground');
  });

  it('has correct href attributes for all links', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navbar />);

    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Browse Players').closest('a')).toHaveAttribute('href', '/players');
    expect(screen.getByText('Build Teams').closest('a')).toHaveAttribute('href', '/teams');
    expect(screen.getByText('Simulate Match').closest('a')).toHaveAttribute('href', '/matches');
  });

  it('renders with sticky positioning', () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Navbar />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
    expect(header).toHaveClass('z-50');
  });

  it('has border bottom styling', () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Navbar />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-border');
  });

  it('renders icons for each navigation item', () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Navbar />);

    // Check for lucide-react icon classes (rendered as SVGs)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(4); // At least one icon per nav item + logo
  });

  it('logo links to home page', () => {
    mockUsePathname.mockReturnValue('/players');
    render(<Navbar />);

    const logoLink = screen.getByText('Basketball Team Builder').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('applies responsive container styling', () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Navbar />);

    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toHaveClass('mx-auto');
    expect(containerDiv).toHaveClass('px-4');
  });

  it('navigation items have hover effects', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Navbar />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('transition-colors');
  });

  it('uses semantic HTML with header and nav elements', () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Navbar />);

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('nav')).toBeInTheDocument();
  });
});
