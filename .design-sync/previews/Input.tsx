import { Input, Label } from 'basketball';

export function Default() {
  return (
    <div className="w-80">
      <Input placeholder="Search players…" />
    </div>
  );
}

export function WithLabel() {
  return (
    <div className="w-80 space-y-2">
      <Label htmlFor="team">Team name</Label>
      <Input id="team" defaultValue="Golden State Warriors" />
    </div>
  );
}

export function Disabled() {
  return (
    <div className="w-80">
      <Input disabled placeholder="Locked during simulation" />
    </div>
  );
}
