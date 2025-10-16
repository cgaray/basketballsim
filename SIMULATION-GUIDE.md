# 🏀 Basketball Simulation Guide

## Overview
The basketball simulation engine creates realistic game simulations based on actual player statistics. Games are broken down possession-by-possession with quarter-by-quarter scoring.

## How It Works

### Simulation Engine
Location: [src/lib/simulation/engine.ts](src/lib/simulation/engine.ts)

The `SimulationEngine` class handles all game logic:

#### Game Structure
- **4 Quarters** (12 minutes each)
- **~25 possessions per quarter**
- **Overtime** if tied (10 possessions)
- **Continues until winner** is decided

#### Player-Based Simulation
Each possession is driven by real player stats:

**Shot Selection**:
- **Point Guards** get 1.5x more possessions
- **Shooting Guards** get 1.2x more possessions
- Players with higher PPG and APG get more ball-handling opportunities

**Shot Types & Success Rates**:
- **Three-Pointers**: Based on player's 3P%
- **Layups**: FG% + 15% (max 75%)
- **Mid-Range**: Player's FG%
- **Free Throws**: Player's FT%

**Rebounds**:
- **Centers** get 1.5x weighting
- **Power Forwards** get 1.3x weighting
- Based on player's RPG

**Turnovers**:
- 15% chance per possession
- Tracked as steals for defensive player

### Stats Tracked Per Player

During simulation, the engine tracks:
- Points, Rebounds, Assists
- Steals, Blocks, Turnovers
- Field Goals Made/Attempted
- Three-Pointers Made/Attempted
- Free Throws Made/Attempted
- Minutes Played

### MVP Calculation

MVP is determined by a weighted score:
```
MVP Score = Points + (Rebounds × 1.2) + (Assists × 1.5) + (Steals × 2) + (Blocks × 2)
```

The player with the highest score across both teams wins MVP.

## User Interface

### Match Selection Page
Location: [src/app/matches/page.tsx](src/app/matches/page.tsx)

**Kid-Friendly Features**:
- 🏀 Big emojis and fun colors
- ⚡ Giant "START BATTLE!" button
- Orange gradient theme
- Simple language ("Battle Time!")

### Match Simulator
Location: [src/components/matches/MatchSimulator.tsx](src/components/matches/MatchSimulator.tsx)

**Loading Screen**:
- 🏀 Bouncing basketball emoji
- ⚡ Pulsing lightning bolt
- "Players are warming up..." message

**Results Display**:
- 🏆 **GAME OVER!** header
- 👑 Crown emoji on winner
- Giant 7xl font for scores
- Green highlight for winning team

**MVP Card**:
- ⭐ Star emojis
- 🏅 Medal emoji
- Huge badges with stats (PTS, REB, AST)
- Yellow/orange gradient background

**Quarter Breakdown**:
- Shows each quarter score
- Handles overtime (OT1, OT2, etc.)
- Running totals

**Play-by-Play**:
- Collapsible detail view
- Color-coded by team (blue/red)
- Shows first 10 plays per quarter
- Time stamps for each possession

## API Integration

### Save Match Results
Endpoint: `POST /api/matches`

After simulation, results are saved to database:
```typescript
{
  team1Id: number,
  team2Id: number,
  team1Score: number,
  team2Score: number,
  winnerId: number,
  playByPlay: JSON (quarters data)
}
```

### Database Schema
Model: `Match` (see [prisma/schema.prisma](prisma/schema.prisma))

Fields:
- Teams involved
- Final scores
- Winner
- Play-by-play JSON data
- Timestamp

## How to Use

### For Kids:
1. Go to **Battle Time!** page
2. Pick **Team 1** from dropdown
3. Pick **Team 2** from dropdown
4. Click **⚡ START BATTLE! ⚡**
5. Watch the game simulate!
6. See who wins! 👑
7. Check out the MVP! ⭐
8. Click **🔄 Battle Again!** to rematch

### For Developers:

**Run a simulation**:
```typescript
import { SimulationEngine } from '@/lib/simulation/engine';

const team1 = { id: 1, name: "Lakers", players: [...] };
const team2 = { id: 2, name: "Bulls", players: [...] };

const engine = new SimulationEngine(team1, team2);
const result = engine.simulateMatch();

console.log(`Winner: ${result.winner}`);
console.log(`Score: ${result.team1Score} - ${result.team2Score}`);
console.log(`MVP: ${result.mvp.player} (${result.mvp.points} pts)`);
```

**Get team stats**:
```typescript
const team1Stats = engine.getTeamStats('team1');
console.log(`Team FG%: ${team1Stats.fieldGoalPercentage}`);
```

## Key Features

✅ **Realistic Statistics** - Based on actual NBA player performance
✅ **Position-Based Logic** - Guards handle ball more, centers rebound more
✅ **Overtime Support** - Games continue until there's a winner
✅ **Detailed Play-by-Play** - Every possession is tracked
✅ **MVP Selection** - Automatic best player detection
✅ **Kid-Friendly UI** - Big text, emojis, fun colors
✅ **Instant Results** - No slow animations, get results fast!

## Future Enhancements

Ideas for later:
- 🎤 AI-generated play-by-play commentary (OpenAI integration)
- 📊 Advanced analytics dashboard
- 🎮 Interactive simulation (pause, play, rewind)
- 📱 Mobile-optimized controls
- 🏆 Season mode with playoffs
- 📈 Player performance trends over multiple games

## Technical Details

**Performance**:
- Simulates full game in milliseconds
- No blocking animations
- Efficient stat tracking with Map objects

**Randomness & Variance**:
- Base success rates from player stats
- ±10% variance per shot for realism
- Weighted random selection for ball handlers

**TypeScript Types**:
See [src/lib/simulation/types.ts](src/lib/simulation/types.ts) for all interfaces:
- `SimulationPlayer`
- `SimulationTeam`
- `Possession`
- `QuarterStats`
- `MatchResult`
- `PlayerGameStats`
- `TeamGameStats`

## Testing

Run simulation tests:
```bash
bun test src/lib/simulation/__tests__/engine.test.ts
```

The test suite covers:
- Basic game flow
- Score calculation
- MVP selection
- Overtime logic
- Player stat tracking

---

**The simulation is ready to go! Your kid can start battling teams right now!** 🏀⚡
