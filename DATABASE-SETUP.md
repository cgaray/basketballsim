# 🗄️ Database Setup - FINAL SOLUTION

## The Problem (SOLVED!)

There were TWO database files causing confusion:
- `dev.db` (root directory) - DELETED ❌
- `prisma/dev.db` (prisma directory) - THE ONE WE USE ✅

## The Solution

**ONE database file**: `prisma/dev.db`

**Environment variable**:
```
DATABASE_URL="file:./prisma/dev.db"
```

## Why This Works

When Prisma runs, it resolves paths relative to where the Prisma client is generated. By using `./prisma/dev.db`, both:
1. **Scripts** (run from project root)
2. **Dev server** (run from project root)

...both point to the SAME file: `prisma/dev.db`

## Quick Verification

### Check database exists and has data:
```bash
ls -lh prisma/dev.db
# Should show: ~3.1M

sqlite3 prisma/dev.db "SELECT COUNT(*) FROM players;"
# Should show: 26461
```

### Check Max Garay exists:
```bash
sqlite3 prisma/dev.db "SELECT name, pointsPerGame FROM players WHERE name = 'Max Garay';"
# Should show: Max Garay|50.5
```

### Check all positions:
```bash
sqlite3 prisma/dev.db "SELECT position, COUNT(*) FROM players GROUP BY position;"
# Should show:
# C|5486
# PF|4085
# PG|4268
# SF|5044
# SG|7578
```

## If Database Gets Deleted

Just reimport:
```bash
node scripts/stream-import.ts
node scripts/add-max-garay.ts
```

The scripts will automatically create `prisma/dev.db`.

## Never Do This Again

❌ **DON'T**: Create `dev.db` in root directory
❌ **DON'T**: Use `DATABASE_URL="file:./dev.db"`
❌ **DON'T**: Copy database between locations

✅ **DO**: Use `prisma/dev.db` always
✅ **DO**: Keep `DATABASE_URL="file:./prisma/dev.db"`
✅ **DO**: Run scripts from project root

## File Structure

```
basketballsim/
├── .env                    # DATABASE_URL="file:./prisma/dev.db"
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── dev.db             # THE database (3.1 MB) ✅
└── scripts/
    ├── stream-import.ts    # Import NBA data
    └── add-max-garay.ts   # Add special player
```

## The Root Cause

Prisma was installed to look for `./dev.db`, which it resolves as:
- From project root: `./dev.db` → `dev.db`
- From Prisma context: `./dev.db` → `prisma/dev.db`

By changing to `./prisma/dev.db`, both contexts resolve to the same file!

## Verification Checklist

After any changes:
- [ ] Only ONE database file exists: `prisma/dev.db`
- [ ] `.env` contains: `DATABASE_URL="file:./prisma/dev.db"`
- [ ] Database has 26,461 players
- [ ] API returns data: `curl http://localhost:3000/api/players?limit=1`
- [ ] Max Garay exists with 50.5 PPG

## Quick Test

```bash
# Start dev server
bun run dev

# In another terminal:
curl -s 'http://localhost:3000/api/players?position=PG&limit=1' | grep "Max Garay"
# Should find Max Garay
```

## DONE! ✅

**The database path issue is FIXED FOREVER.**

No more duplicate files.
No more confusion.
One database. One truth.

`prisma/dev.db` - that's it!
