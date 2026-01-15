'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { MatchSimulator } from '@/components/matches/MatchSimulator';
import { TeamSelector } from '@/components/matches/TeamSelector';
import { Navbar } from '@/components/layout/Navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Player } from '@/types';
import { Play, Users } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  players: Player[]; // Now contains full player objects
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Simulate Match
          </h1>
          <p className="text-muted-foreground">
            Select two teams to simulate a head-to-head match
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <TeamSelector
            teamNumber={1}
            selectedTeam={selectedTeam1}
            onSelect={(team) => handleTeamSelect(team, 1)}
            onDeselect={() => setSelectedTeam1(null)}
            teams={teams}
            otherTeamId={selectedTeam2?.id}
          />

          <TeamSelector
            teamNumber={2}
            selectedTeam={selectedTeam2}
            onSelect={(team) => handleTeamSelect(team, 2)}
            onDeselect={() => setSelectedTeam2(null)}
            teams={teams}
            otherTeamId={selectedTeam1?.id}
          />
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={startSimulation}
            disabled={!selectedTeam1 || !selectedTeam2}
            className="px-8 py-6 text-lg font-semibold"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Simulation
          </Button>
        </div>

        {teams.length === 0 && (
          <Card className="max-w-md mx-auto mt-8">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Teams Available</h3>
              <p className="text-sm text-muted-foreground">
                Build at least two teams to start simulating matches.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}