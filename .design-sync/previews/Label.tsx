import { Label, Input } from 'basketball';

export function FormField() {
  return (
    <div className="w-80 space-y-2">
      <Label htmlFor="jersey">Jersey number</Label>
      <Input id="jersey" type="number" placeholder="23" />
    </div>
  );
}

export function Standalone() {
  return <Label>Minutes per game</Label>;
}
