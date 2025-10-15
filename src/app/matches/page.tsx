'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MatchSimulator } from '@/components/matches/MatchSimulator';
import { TeamSelector } from '@/components/matches/TeamSelector';
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
        <h1 className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          🏀 Battle Time! 🏀
        </h1>
        <p className="text-center text-xl mb-8 text-gray-600">
          Pick two teams and watch them battle!
        </p>

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
            className="px-12 py-8 text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            ⚡ START BATTLE! ⚡
          </Button>
        </div>

        {teams.length === 0 && (
          <Alert className="mt-8 bg-orange-50 border-orange-200">
            <AlertDescription className="text-lg">
              No teams yet! Go to Teams and build your squad first!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
}