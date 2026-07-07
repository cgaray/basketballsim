# Basketball Sim UI — conventions

A shadcn/ui-based React design system (New York style) styled with **Tailwind CSS
v4** and semantic CSS-variable tokens. All components are on `window.BasketballUI`
(import them from the bundle). Icons in examples come from `lucide-react`.

## Setup / wrapping

No provider or theme wrapper is required — tokens are plain CSS custom properties
defined on `:root` in `styles.css`, so any component renders styled on its own.
Light/dark is driven by the `--*` variables (a `.dark` class on an ancestor, or the
OS `prefers-color-scheme`, flips them). `Select` uses Radix portals internally; no
setup needed for that either.

## Styling idiom — Tailwind utility classes

Style with **Tailwind utility classes via the `className` prop** (every component
merges `className` through `cn()` / tailwind-merge, so your classes override the
defaults). Do NOT invent hex colors — use the semantic token utilities below, which
map to the DS tokens and adapt to light/dark automatically.

Color roles (each `bg-<role>` pairs with `text-<role>-foreground`):

| Utility | Use |
|---|---|
| `bg-background` / `text-foreground` | page surface + body text |
| `bg-card` / `text-card-foreground` | card/panel surface |
| `bg-popover` / `text-popover-foreground` | menus, dropdowns |
| `bg-primary` / `text-primary-foreground` | primary actions, emphasis |
| `bg-secondary` / `text-secondary-foreground` | secondary surfaces/actions |
| `bg-muted` / `text-muted-foreground` | subtle fills, captions, labels |
| `bg-accent` / `text-accent-foreground` | hover/active highlights |
| `bg-destructive`, `text-destructive` | errors, destructive actions (no `-foreground` token in this theme; the destructive variants set their own text) |
| `border`, `border-input` | default borders / input borders |

Radius: `rounded-md`, `rounded-lg` (from `--radius`). Layout is standard Tailwind
(`flex`, `grid`, `gap-*`, `space-y-*`, `p-*`, `w-full`, `h-10`, `text-sm`, …).

## Where the truth lives

- `styles.css` → `@import`s `_ds_bundle.css` (component styles + the compiled utility
  classes + the `:root` token definitions). Read it before styling.
- Each component's `<Name>.d.ts` is its prop contract; `<Name>.prompt.md` is its usage
  note. Compound parts (`CardHeader`, `SelectItem`, `AlertTitle`, …) are all on
  `window.BasketballUI`.

## Idiomatic example

```tsx
const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button } = window.BasketballUI;

<Card className="w-80">
  <CardHeader>
    <CardTitle>LeBron James</CardTitle>
    <CardDescription>Small Forward · #23</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div><div className="text-xl font-semibold">27.4</div><div className="text-xs text-muted-foreground">PPG</div></div>
      <div><div className="text-xl font-semibold">7.4</div><div className="text-xs text-muted-foreground">RPG</div></div>
      <div><div className="text-xl font-semibold">8.3</div><div className="text-xs text-muted-foreground">APG</div></div>
    </div>
  </CardContent>
  <CardFooter className="justify-between">
    <Badge>Active</Badge>
    <Button size="sm">View Profile</Button>
  </CardFooter>
</Card>
```
