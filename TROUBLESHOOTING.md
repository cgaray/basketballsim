# 🔧 Troubleshooting Guide

## "No Players Found" in Quick Add

### Problem
When clicking position buttons in Quick Add, you see "No players found" message.

### Cause
The dev server isn't running, so the API can't fetch players from the database.

### Solution

**Step 1: Start the Dev Server**
```bash
bun run dev
```

Wait until you see:
```
✓ Ready in 3s
○ Local:   http://localhost:3000
```

**Step 2: Open the App**
Go to: **http://localhost:3000**

**Step 3: Test Quick Add**
1. Go to Teams page
2. Click any position button (PG, SG, SF, PF, C)
3. You should now see players!

---

## Database Has No Players

### Check Player Count
```bash
sqlite3 dev.db "SELECT COUNT(*) FROM players;"
```

**Expected**: `26461`

**If 0 or error**, reimport:
```bash
node scripts/stream-import.ts
node scripts/add-max-garay.ts
```

---

## Prisma Client Errors

### Error: "Table does not exist"

**Solution**:
```bash
# Push schema to database
node_modules/.bin/prisma db push

# Regenerate Prisma client
node_modules/.bin/prisma generate
```

---

## API Returns 500 Error

### Check the Dev Server Logs

Look for errors in the terminal where you ran `bun run dev`.

Common issues:

#### 1. Database File Not Found
**Error**: `Error code 14: Unable to open the database file`

**Fix**:
```bash
# Check if dev.db exists
ls -lh dev.db

# If missing, check .env
cat .env
# Should show: DATABASE_URL="file:./dev.db"

# Recreate schema
node_modules/.bin/prisma db push
```

#### 2. Prisma Client Not Generated
**Error**: `Cannot find module '@prisma/client'`

**Fix**:
```bash
node_modules/.bin/prisma generate
```

---

## Position Filter Not Working

### Test Positions Exist

```bash
sqlite3 dev.db "SELECT position, COUNT(*) FROM players GROUP BY position;"
```

**Expected**:
```
C|5486
PF|4085
PG|4268
SF|5044
SG|7578
```

**If any position has 0**, reimport:
```bash
node scripts/stream-import.ts
```

---

## Search Not Finding Players

### Test Database Has Players

```bash
sqlite3 dev.db "SELECT name, pointsPerGame FROM players WHERE name LIKE '%LeBron%';"
```

**Expected**: Should show LeBron James entries

**If empty**, reimport data:
```bash
node scripts/stream-import.ts
node scripts/add-max-garay.ts
```

---

## Max Garay Not Showing

### Check if Max Garay Exists

```bash
sqlite3 dev.db "SELECT name, pointsPerGame, position FROM players WHERE name LIKE '%Max Garay%';"
```

**Expected**: `Max Garay|50.5|PG`

**If missing**, add him:
```bash
node scripts/add-max-garay.ts
```

---

## Dev Server Won't Start

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Fix**:
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 bun run dev
```

### Bun Not Found

**Error**: `bash: bun: command not found`

**Fix**: Install bun
```bash
curl -fsSL https://bun.sh/install | bash
```

Or use npm:
```bash
npm run dev
```

---

## Quick Fix Checklist

When Quick Add shows "No players found":

- [ ] 1. Dev server is running (`bun run dev`)
- [ ] 2. Can access http://localhost:3000
- [ ] 3. Database has players (`sqlite3 dev.db "SELECT COUNT(*) FROM players;"`)
- [ ] 4. Prisma client generated (`node_modules/.bin/prisma generate`)
- [ ] 5. All positions have players (see Position Filter section)
- [ ] 6. No errors in dev server terminal

---

## Test the Full Stack

### 1. Test Database
```bash
sqlite3 dev.db "SELECT name, position, pointsPerGame FROM players WHERE position = 'PG' ORDER BY pointsPerGame DESC LIMIT 5;"
```

**Expected**: Should show Max Garay (50.5 PPG) at top

### 2. Test Prisma
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.player.count().then(c => console.log('Players:', c)).then(() => p.\$disconnect());"
```

**Expected**: `Players: 26461`

### 3. Test API (dev server must be running!)
```bash
curl http://localhost:3000/api/players?position=PG&limit=3
```

**Expected**: JSON with 3 PG players

---

## Still Not Working?

### Complete Reset

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Delete database
rm dev.db

# 3. Recreate schema
node_modules/.bin/prisma db push

# 4. Import data
node scripts/stream-import.ts
node scripts/add-max-garay.ts

# 5. Regenerate Prisma client
node_modules/.bin/prisma generate

# 6. Start dev server
bun run dev
```

---

## Need More Help?

Check these files for details:
- **[START-HERE.md](START-HERE.md)** - Quick start guide
- **[SIMULATION-GUIDE.md](SIMULATION-GUIDE.md)** - Technical docs
- **[READY-FOR-KIDS.md](READY-FOR-KIDS.md)** - Setup checklist

---

## Common Dev Server Startup Errors

### Error: "Prisma schema file not found"
**Location**: You're in the wrong directory
**Fix**: `cd /home/cgaray/Documents/basketballsim`

### Error: "node_modules not found"
**Fix**: Install dependencies first
```bash
bun install
# or
npm install
```

### Error: "Environment variable DATABASE_URL is not set"
**Fix**: Create .env file
```bash
echo 'DATABASE_URL="file:./dev.db"' > .env
```

---

**Most Common Issue**: Dev server not running!

**Quick Fix**:
1. Open terminal
2. `cd /home/cgaray/Documents/basketballsim`
3. `bun run dev`
4. Open http://localhost:3000
5. Try Quick Add again!
