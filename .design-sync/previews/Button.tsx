import { Button } from 'basketball';

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Start Game</Button>
      <Button variant="secondary">View Roster</Button>
      <Button variant="destructive">End Season</Button>
      <Button variant="outline">Trade Player</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="link">Box Score</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add player">+</Button>
    </div>
  );
}

export function Disabled() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Simulating…</Button>
      <Button variant="outline" disabled>
        Locked
      </Button>
    </div>
  );
}
