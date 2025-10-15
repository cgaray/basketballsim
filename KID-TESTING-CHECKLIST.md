# Kid Testing Checklist 🏀

## Before Testing
```bash
npm run dev
```
Then open: http://localhost:3000

---

## 1. Home Page
- [ ] See big basketball emoji
- [ ] See "Build Your Team!" title
- [ ] Click **"Start Building!"** button → Goes to Teams page
- [ ] Click **"Play Match"** button → Goes to Matches page

---

## 2. Teams Page (Build Teams)
- [ ] Type "Max" in search box
- [ ] See **Max Garay** appear (best stats!)
- [ ] Click **"Team 1"** button under Max → He joins Team 1
- [ ] Type "LeBron" in search box
- [ ] Click **"Team 2"** button under LeBron → He joins Team 2
- [ ] See Team 1 roster on left (has Max)
- [ ] See Team 2 roster on right (has LeBron)
- [ ] Add more players to each team (need 5 per team minimum)

---

## 3. Matches Page (Play Match)
- [ ] Select a team for "Team 1"
- [ ] Select a team for "Team 2"
- [ ] Click **"Start Simulation"** button
- [ ] See loading spinner
- [ ] See final score
- [ ] See who won (in green)
- [ ] Click **"Simulate Again"** to replay
- [ ] Click **"Back"** to select different teams

---

## Database Check
```bash
# Count players
echo "SELECT COUNT(*) FROM players;" | sqlite3 dev.db

# Find Max Garay
echo "SELECT name, pointsPerGame FROM players WHERE name LIKE '%Max%';" | sqlite3 dev.db
```

Should show:
- 26,461 total players
- Max Garay with 50.5 PPG

---

## Features for Kids

### Home Page
- Giant 🏀 emoji
- Orange gradient background
- HUGE buttons
- Simple 1-2-3 steps

### Teams Page
- BIG search box
- "⭐ TEAM 1 ⭐" in blue
- "🔥 TEAM 2 🔥" in red
- Player cards with Team 1/Team 2 buttons

### Matches Page
- Simple team selection
- Big "Start Simulation" button
- Instant results

---

## Max Garay Stats (Easter Egg!)
- 50.5 PPG (better than Wilt!)
- 18 RPG
- 15.5 APG
- 65% FG
- 55% 3P
- Position: PG
- Team: Garay All-Stars

Tell your kid to search for "Max" first!

---

## If Something Doesn't Work

### No players showing up?
```bash
node scripts/stream-import.ts
node scripts/add-max-garay.ts
```

### Database error?
```bash
node_modules/.bin/prisma db push
node scripts/stream-import.ts
```

### App won't start?
```bash
npm install
npm run dev
```

---

## Quick Test Flow (2 minutes)
1. Open home page
2. Click "Start Building!"
3. Type "Max" → Add to Team 1
4. Type "Jordan" → Add to Team 2
5. Add 4 more to each team
6. Click "Matches" in nav
7. Select teams
8. Click "Start Simulation"
9. See Max Garay destroy everyone! 🔥

**App is ready for your kid!** 🎉
