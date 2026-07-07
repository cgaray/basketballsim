# design-sync notes — Basketball Sim UI

This repo is a **Next.js app** (not a published component library), so the sync is
set up specially. Read this before re-syncing.

## How the build is wired

- **Entry**: `.design-sync/entry.tsx` re-exports only the 9 `src/components/ui`
  primitives. This keeps esbuild from pulling in the Next.js app/API/Prisma/DuckDB
  code (which would break the bundle). `cfg.entry` points at it. If you add a new
  primitive to `src/components/ui`, add an `export * from '@/components/ui/<file>'`
  line here AND a `componentSrcMap` entry in config.
- **CSS is compiled manually**. shadcn/Tailwind v4 generates CSS on demand, so there
  is no shipped stylesheet. `.design-sync/tw-input.css` (mirrors `src/app/globals.css`
  theme + `@source` globs + a semantic-token safelist) is compiled with the Tailwind
  CLI into `.design-sync/compiled.css`, which `cfg.cssEntry` points at.
  **Re-sync step (run before the converter):**
  `node_modules/.bin/tailwindcss -i .design-sync/tw-input.css -o .design-sync/compiled.css`
  Recompile whenever component classes OR preview classes change, else new utility
  classes won't be in the shipped CSS.
- **Props are hand-written** in `cfg.dtsPropsFor` because there's no dist `.d.ts` to
  extract from. If a component's props change in source, update its `dtsPropsFor`
  body. The `extends` clause is dropped for these, so common HTML attributes are
  enumerated inline.

## Install

- No `node_modules` on a fresh clone. Repo uses `bun` (bun.lock) but a
  `package-lock.json` is also present. Install with
  `npm ci --ignore-scripts --no-audit --no-fund` — `--ignore-scripts` skips the
  native `duckdb`/`sqlite3` builds, which the UI bundle doesn't need.
- Tailwind CLI: `npm install --no-save --ignore-scripts @tailwindcss/cli@<tailwind version>`.
- Playwright/Chromium needs OS libs on WSL: run (in a real terminal, needs sudo)
  `sudo env "PATH=$PATH" .ds-sync/node_modules/.bin/playwright install-deps chromium`.

## Known render warns

- `[GRID_OVERFLOW]` on Alert was resolved with `cfg.overrides.Alert.cardMode: column`.
- `tokens: 1 missing (below threshold)` — a `var(--*)` referenced with no definition;
  benign, from the repo's own half-migrated theme.

## Preview / styling gotchas

- `Select` renders its open dropdown via `defaultOpen` + `cfg.overrides.Select`
  (`cardMode: single`). Radix portals render inside the card fine.
- `YearSelector` uses a native `<select>` and references `basketball-orange`
  (an undefined Tailwind color) for focus rings — a no-op in this repo, kept faithful.
- The repo's theme mixes `oklch(...)` (light mode) and raw HSL triplets (dark mode);
  `--destructive-foreground` is an HSL triplet with no `--color-destructive-foreground`
  theme token, so `text-destructive-foreground` does not resolve. Faithful to repo.

## Re-sync risks (what can silently go stale)

- **conventions.md example** uses real component/class names; re-validate them against
  the fresh build (the base skill's conventions step does this).
- **compiled.css** is a manual step — forgetting to recompile ships stale utilities.
- **dtsPropsFor** can drift from source if a component's props change.
- **entry.tsx / componentSrcMap** must be updated when primitives are added/removed.
- The safelist in `tw-input.css` only covers tokens with `--color-*` definitions; if
  the theme adds new token colors, extend the safelist so the agent can use them.
