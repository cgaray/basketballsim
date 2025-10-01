# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a Basketball Team Builder & Simulator web application that allows users to:
- Build basketball teams from NBA player cards (500+ players in database)
- Simulate matches with stats-based calculations
- Generate AI-powered play-by-play commentary (planned)

### Current Implementation Status
**✅ Completed (Phase 1-2):**
- Player database with search/filter functionality
- Player cards with stats, rarity system, and multi-season support
- Drag-and-drop team builder with position validation
- Team management (save/load teams)

**⏳ Next Priority (Phase 3):**
- Match simulation engine with stats-based outcomes
- Quarter-by-quarter game flow
- Score tracking and performance metrics

**📋 Future (Phase 4-5):**
- OpenAI integration for play-by-play commentary
- Match history and replay system
- Advanced analytics and mobile optimization

## Development Workflow

**🚨 IMPORTANT: Always use feature branches for development work! 🚨**

The user prefers working in feature branches with a test-first development approach. **NEVER work directly on main branch.**

### Required Workflow for ALL features:
1. **Create a feature branch** before making any changes:
   ```bash
   git checkout -b feature/descriptive-feature-name
   ```
2. **Write tests FIRST** - Use Test-Driven Development (TDD):
   - Write failing tests that define expected behavior
   - Run tests to confirm they fail for the right reason
   - Only then implement functionality to make tests pass
   - Refactor while keeping tests green
3. **Implement the functionality** to satisfy test requirements
4. **Run all tests and linting** before committing:
   ```bash
   npm run test         # Ensure all tests pass
   npm run lint         # Ensure code quality
   ```
5. **Commit changes** with descriptive commit messages
6. **Test thoroughly** before merging

### Commit Message Format:
Use conventional commits with the Claude Code footer:
```
feat: Brief description of the feature

Detailed description of changes made.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**⚠️ REMINDER: If you start working and realize you're on main, immediately create a feature branch and move your changes there before continuing.**

## Essential Commands

### Development
```bash
npm run dev          # Start Next.js development server with Turbopack
npm run build        # Build production bundle with Turbopack
npm run start        # Start production server
```

### Testing
```bash
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ci      # CI-optimized test run

# Run a single test file
npx jest path/to/test.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="PlayerCard"
```

### Code Quality
```bash
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio GUI

# Import real NBA data (DuckDB + SQLite hybrid)
npx bun run scripts/import-nba-data.ts  # Import from Kaggle dataset
```

### Data Source
The app uses **real NBA historical data** from the Kaggle dataset "Historical NBA Data and Player Box Scores":
- **1000 player-seasons** (2018-2024)
- **294 unique players** with actual game statistics
- Data processed using DuckDB for aggregation, stored in SQLite
- CSV files located in `data/` directory

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.5 with App Router and Turbopack
- **Language**: TypeScript with strict mode enabled
- **Database**: SQLite with Prisma ORM
- **Testing**: Jest with React Testing Library, 70% coverage thresholds
- **Styling**: Tailwind CSS v4 with custom basketball theme
- **UI Components**: Radix UI primitives with custom shadcn/ui components

### Project Structure

The application follows Next.js App Router conventions:

- **`src/app/`**: Next.js app router pages and API routes
  - API routes use Route Handlers pattern (`route.ts` files)
  - Pages include `players/`, `teams/` for main features

- **`src/components/`**: React components organized by feature
  - `cards/`: Player and team card components
  - `ui/`: Reusable UI primitives from shadcn/ui

- **`src/lib/`**: Core utilities and business logic
  - `database/prisma.ts`: Prisma client singleton with transaction helpers
  - `utils/`: Format utilities, class name helpers

- **`src/hooks/`**: Custom React hooks for state management

### Database Schema

Using Prisma with SQLite, three main models:

1. **Player**: NBA player stats with multiple seasons support
2. **Team**: User-created teams storing player IDs as JSON
3. **Match**: Game simulation results with play-by-play data

Database URL configured via `DATABASE_URL` environment variable (defaults to `file:./dev.db`).

### Testing Patterns

**🔴 Test-Driven Development (TDD) is REQUIRED:**
- **ALWAYS write tests BEFORE implementation**
- Red-Green-Refactor cycle:
  1. RED: Write a failing test
  2. GREEN: Write minimal code to pass
  3. REFACTOR: Improve code while keeping tests green

Tests follow React Testing Library best practices:
- Mock external dependencies at module level
- Test user interactions over implementation details
- Maintain test files adjacent to components in `__tests__/` directories
- Coverage requirements: 70% for branches, functions, lines, and statements

**Test Organization:**
- Component tests: `src/components/[feature]/__tests__/[Component].test.tsx`
- Hook tests: `src/hooks/__tests__/[hookName].test.ts`
- Utility tests: `src/lib/[module]/__tests__/[utility].test.ts`
- API route tests: `src/app/api/[route]/__tests__/route.test.ts`

**Testing Checklist for New Features:**
- [ ] Unit tests for all new functions/utilities
- [ ] Component tests with user interaction scenarios
- [ ] Integration tests for API routes
- [ ] Edge cases and error handling
- [ ] Accessibility requirements (WCAG 2.1 AA)

### Import Aliases

TypeScript path alias configured: `@/*` maps to `src/*`

Example: `import { PlayerCard } from '@/components/cards/PlayerCard'`

### Key Implementation Patterns

**Player Card System:**
- Efficiency-based rarity with color-coded borders
- Position-specific colors: PG=blue, SG=green, SF=purple, PF=orange, C=red
- Multi-season support with year selector

**Team Builder:**
- Maximum 15 players per team
- Position validation requirements
- Drag-and-drop using react-beautiful-dnd

**Performance Targets:**
- Load time < 2 seconds
- 60fps animations
- Mobile-responsive
- WCAG 2.1 AA compliance
- Use bun