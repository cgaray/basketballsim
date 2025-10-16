'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Player } from '@/types';

interface Team {
  id: number;
  name: string;
  players: Player[];
}

interface TeamSelectorProps {
  teamNumber: 1 | 2;
  selectedTeam: Team | null;
  onSelect: (team: Team) => void;
  onDeselect: () => void;
  teams: Team[];
  otherTeamId?: number;
}

export function TeamSelector({
  teamNumber,
  selectedTeam,
  onSelect,
  onDeselect,
  teams,
  otherTeamId,
}: TeamSelectorProps) {
  const borderColor = teamNumber === 1 ? 'border-blue-500' : 'border-red-500';

  return (
    <Card className={selectedTeam ? borderColor : ''}>
      <CardHeader>
        <CardTitle>Team {teamNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedTeam ? (
          <div>
            <p className="font-semibold text-lg">{selectedTeam.name}</p>
            <p className="text-sm text-gray-600">
              {selectedTeam.players.length} players
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={onDeselect}
            >
              Change Team
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-4">Select a team</p>
            {teams.map(team => (
              <Button
                key={team.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onSelect(team)}
                disabled={otherTeamId === team.id}
              >
                {team.name}
                <Badge variant="outline" className="ml-auto">
                  {team.players.length} players
                </Badge>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
