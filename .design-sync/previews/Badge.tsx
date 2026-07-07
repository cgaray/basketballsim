import { Badge } from 'basketball';

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Active</Badge>
      <Badge variant="secondary">Bench</Badge>
      <Badge variant="destructive">Injured</Badge>
      <Badge variant="outline">Free Agent</Badge>
    </div>
  );
}

export function InlineUsage() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium">Stephen Curry</span>
      <Badge variant="secondary">PG</Badge>
      <Badge>All-Star</Badge>
    </div>
  );
}
