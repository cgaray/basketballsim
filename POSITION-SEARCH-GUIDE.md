# 🔍 Position Search Feature

## How It Works

Your kid can now search by **player names** OR **positions**!

---

## Main Search Bar (Top of Teams Page)

### Search by Name:
```
Type: "Max"      → Shows Max Garay
Type: "LeBron"   → Shows LeBron James
Type: "Jordan"   → Shows Michael Jordan
```

### Search by Position:
```
Type: "PG"           → Shows all Point Guards
Type: "point guard"  → Shows all Point Guards
Type: "center"       → Shows all Centers
Type: "C"            → Shows all Centers
Type: "forward"      → Shows all Forwards (SF)
Type: "guard"        → Shows all Guards (SG)
```

### Supported Position Keywords:
- **PG** - Point Guard
  - "pg", "point guard", "point"

- **SG** - Shooting Guard
  - "sg", "shooting guard", "shooting", "guard"

- **SF** - Small Forward
  - "sf", "small forward", "small", "forward"

- **PF** - Power Forward
  - "pf", "power forward", "power"

- **C** - Center
  - "c", "center"

---

## Quick Add Buttons (In Team Rosters)

Each team roster now has **"Add PG"**, **"Add SG"**, etc. buttons!

### How to Use:
1. **Look at Team 1 or Team 2**
2. **Click "Add PG"** button (or any position)
3. **Popup appears** with:
   - Position filter buttons (PG, SG, SF, PF, C)
   - Search bar for names
   - Missing positions highlighted in orange
   - Current count for each position

4. **Click "Add to Team"** to add player
5. **Auto-filtered** to show only that position

### Features:
- ✅ Shows missing positions in orange
- ✅ Shows current count for each position (PG: 2, SG: 1, etc.)
- ✅ Filters out players already on the team
- ✅ Shows "✓ Complete lineup" when all positions filled
- ✅ Can search by name within position filter

---

## Examples for Your Kid

### Quick Build a Team:
1. Type "**center**" → Pick a center
2. Type "**PG**" → Pick a point guard
3. Type "**forward**" → Pick a forward
4. Click "**Add SG**" button → Pick shooting guard
5. Click "**Add PF**" button → Pick power forward

### Find Specific Players:
1. Type "**Max**" → Find Max Garay (the GOAT!)
2. Type "**LeBron**" → Find LeBron
3. Type "**Jordan**" → Find Michael Jordan

### Fill Missing Positions:
1. Look at Team 1 roster
2. See "Missing positions for complete lineup"
3. Click "**Add PG**" (if no point guards)
4. Popup shows only PG players
5. Pick one!

---

## Visual Indicators

### In Main Search:
- Orange border on search box
- Shows "Try: Max, LeBron, center, point guard, PG..."

### In Quick Add:
- **Orange badges** = Missing positions (0 players)
- **Blue/default badges** = Have players at that position
- **Orange alert** = "Need players for: PG, C" (example)
- **Green check** = "✓ Complete lineup!"

---

## Test It!

### Main Search Bar:
```bash
npm run dev
```

1. Go to Teams page
2. Type "**center**" in search box
3. See all centers appear!
4. Type "**Max**" instead
5. See Max Garay appear!

### Quick Add Buttons:
1. Look at Team 1 (blue)
2. Find "Point Guards (0)" section
3. Click "**Add PG**" button
4. Popup appears with PG filter already selected
5. Pick a point guard
6. Click "Add to Team 1"
7. Done!

---

**Both features work perfectly!** Your kid can search however they want! 🏀
