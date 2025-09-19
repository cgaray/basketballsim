'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MatchSimulator } from '@/components/matches/MatchSimulator';
import { Navbar } from '@/components/layout/Navbar';

interface Team {
  id: number;
  name: string;
  players: any[]; // Now contains full player objects
}

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationStarted, setSimulationStarted] = useState(false);

  const team1Id = searchParams.get('team1');
  const team2Id = searchParams.get('team2');

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (teams.length > 0 && team1Id && team2Id) {
      const t1 = teams.find(t => t.id === parseInt(team1Id));
      const t2 = teams.find(t => t.id === parseInt(team2Id));
      if (t1) setSelectedTeam1(t1);
      if (t2) setSelectedTeam2(t2);
    }
  }, [teams, team1Id, team2Id]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data.success ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (team: Team, slot: 1 | 2) => {
    if (slot === 1) {
      setSelectedTeam1(team);
    } else {
      setSelectedTeam2(team);
    }
  };

  const startSimulation = () => {
    if (selectedTeam1 && selectedTeam2) {
      setSimulationStarted(true);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[600px]">
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  if (simulationStarted && selectedTeam1 && selectedTeam2) {
    return (
      <>
        <Navbar />
        <MatchSimulator
          team1={selectedTeam1}
          team2={selectedTeam2}
          onBack={() => setSimulationStarted(false)}
        />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Match Simulation</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className={selectedTeam1 ? 'border-blue-500' : ''}>
            <CardHeader>
              <CardTitle>Team 1</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTeam1 ? (
                <div>
                  <p className="font-semibold text-lg">{selectedTeam1.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedTeam1.players.length} players
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSelectedTeam1(null)}
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
                      onClick={() => handleTeamSelect(team, 1)}
                      disabled={selectedTeam2?.id === team.id}
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

          <Card className={selectedTeam2 ? 'border-red-500' : ''}>
            <CardHeader>
              <CardTitle>Team 2</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTeam2 ? (
                <div>
                  <p className="font-semibold text-lg">{selectedTeam2.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedTeam2.players.length} players
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSelectedTeam2(null)}
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
                      onClick={() => handleTeamSelect(team, 2)}
                      disabled={selectedTeam1?.id === team.id}
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
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={startSimulation}
            disabled={!selectedTeam1 || !selectedTeam2}
            className="px-8"
          >
            Start Simulation
          </Button>
        </div>

        {teams.length === 0 && (
          <Alert className="mt-8">
            <AlertDescription>
              No teams available. Please create teams first in the Teams section.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
}