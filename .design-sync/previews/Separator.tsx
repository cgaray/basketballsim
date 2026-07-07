import { Separator } from 'basketball';

export function Horizontal() {
  return (
    <div className="w-80">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Team Roster</h4>
        <p className="text-sm text-muted-foreground">15 players signed</p>
      </div>
      <Separator className="my-4" />
      <p className="text-sm text-muted-foreground">Salary cap: $136.0M</p>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="flex h-5 items-center gap-4 text-sm">
      <span>Starters</span>
      <Separator orientation="vertical" />
      <span>Bench</span>
      <Separator orientation="vertical" />
      <span>Injured</span>
    </div>
  );
}
