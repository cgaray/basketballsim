import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from 'basketball';

export function PlayerCard() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>LeBron James</CardTitle>
        <CardDescription>Small Forward · #23</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold">27.4</div>
            <div className="text-xs text-muted-foreground">PPG</div>
          </div>
          <div>
            <div className="text-xl font-semibold">7.4</div>
            <div className="text-xs text-muted-foreground">RPG</div>
          </div>
          <div>
            <div className="text-xl font-semibold">8.3</div>
            <div className="text-xs text-muted-foreground">APG</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Badge>Active</Badge>
        <Button size="sm">View Profile</Button>
      </CardFooter>
    </Card>
  );
}

export function TeamSummary() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Los Angeles Lakers</CardTitle>
        <CardDescription>Western Conference · Pacific</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Record</span>
          <span className="text-lg font-semibold">52–30</span>
        </div>
      </CardContent>
    </Card>
  );
}
