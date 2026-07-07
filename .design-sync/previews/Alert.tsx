import { Alert, AlertTitle, AlertDescription } from 'basketball';
import { Info, AlertTriangle } from 'lucide-react';

export function Default() {
  return (
    <Alert className="w-96">
      <Info className="h-4 w-4" />
      <AlertTitle>Season starts soon</AlertTitle>
      <AlertDescription>
        Set your starting lineup before the first tip-off on October 22.
      </AlertDescription>
    </Alert>
  );
}

export function Destructive() {
  return (
    <Alert variant="destructive" className="w-96">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Roster over the cap</AlertTitle>
      <AlertDescription>
        Your payroll exceeds the salary cap. Trade or waive a player to
        continue.
      </AlertDescription>
    </Alert>
  );
}
