'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SimulationEngine } from '@/lib/simulation/engine';
import { MatchResult, SimulationPlayer, SimulationTeam } from '@/lib/simulation/types';
import type { Player } from '@/types';

interface Team {
  id: number;
  name: string;
  players: Player[]; // Now contains full player objects
}

interface MatchSimulatorProps {
  team1: Team;
  team2: Team;
  onBack: () => void;
}

export function MatchSimulator({ team1, team2, onBack }: MatchSimulatorProps) {
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayByPlay, setShowPlayByPlay] = useState(false);

  const simulateMatch = async () => {
    setLoading(true);
    setError(null);
    setMatchResult(null);

    try {
      const [team1Players, team2Players] = await Promise.all([
        fetchPlayersForTeam(team1),
        fetchPlayersForTeam(team2)
      ]);

      const simulationTeam1: SimulationTeam = {
        id: team1.id,
        name: team1.name,
        players: team1Players
      };

      const simulationTeam2: SimulationTeam = {
        id: team2.id,
        name: team2.name,
        players: team2Players
      };

      const engine = new SimulationEngine(simulationTeam1, simulationTeam2);
      const result = engine.simulateMatch();

      setMatchResult(result);

      await saveMatchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersForTeam = async (team: Team): Promise<SimulationPlayer[]> => {
    // Players are now already full objects with all their data
    const players: SimulationPlayer[] = team.players.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      pointsPerGame: player.pointsPerGame || 10,
      reboundsPerGame: player.reboundsPerGame || 5,
      assistsPerGame: player.assistsPerGame || 3,
      stealsPerGame: player.stealsPerGame || 1,
      blocksPerGame: player.blocksPerGame || 0.5,
      fieldGoalPercentage: player.fieldGoalPercentage || 0.45,
      threePointPercentage: player.threePointPercentage || 0.35,
      freeThrowPercentage: player.freeThrowPercentage || 0.75
    }));

    return players;
  };

  const saveMatchResult = async (result: MatchResult) => {
    try {
      await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1Id: result.team1.id,
          team2Id: result.team2.id,
          team1Score: result.team1Score,
          team2Score: result.team2Score,
          winnerId: result.winner === 'team1' ? result.team1.id : result.team2.id,
          playByPlay: JSON.stringify(result.quarters)
        })
      });
    } catch (err) {
      console.error('Failed to save match result:', err);
    }
  };

  useEffect(() => {
    simulateMatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getQuarterLabel = (quarterNum: number) => {
    if (quarterNum <= 4) return `Q${quarterNum}`;
    return `OT${quarterNum - 4}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-4 border-orange-500">
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center space-y-6">
              <div className="text-8xl animate-bounce">🏀</div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                The Game is Starting!
              </h2>
              <p className="text-2xl text-gray-600">Players are warming up...</p>
              <div className="animate-pulse text-6xl">⚡</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onBack}>Back to Team Selection</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!matchResult) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xl px-6 py-4 h-auto"
        >
          ⬅️ Pick Different Teams
        </Button>
        <Button
          onClick={simulateMatch}
          className="text-xl px-8 py-4 h-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          🔄 Battle Again!
        </Button>
      </div>

      <Card className="mb-6 border-4 border-orange-500 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="text-center text-5xl font-bold">
            🏆 GAME OVER! 🏆
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center space-x-8">
            <div className={`text-center p-6 rounded-lg ${matchResult.winner === 'team1' ? 'bg-green-100 border-4 border-green-500' : 'bg-gray-100'}`}>
              {matchResult.winner === 'team1' && <div className="text-6xl mb-2">👑</div>}
              <h3 className="text-2xl font-bold mb-2">{matchResult.team1.name}</h3>
              <p className="text-7xl font-bold">{matchResult.team1Score}</p>
              {matchResult.winner === 'team1' && <p className="text-2xl font-bold text-green-600 mt-2">WINNER!</p>}
            </div>
            <div className="text-4xl font-bold text-gray-400">VS</div>
            <div className={`text-center p-6 rounded-lg ${matchResult.winner === 'team2' ? 'bg-green-100 border-4 border-green-500' : 'bg-gray-100'}`}>
              {matchResult.winner === 'team2' && <div className="text-6xl mb-2">👑</div>}
              <h3 className="text-2xl font-bold mb-2">{matchResult.team2.name}</h3>
              <p className="text-7xl font-bold">{matchResult.team2Score}</p>
              {matchResult.winner === 'team2' && <p className="text-2xl font-bold text-green-600 mt-2">WINNER!</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quarter Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Team</th>
                  {matchResult.quarters.map((q, i) => (
                    <th key={i} className="text-center p-2">
                      {getQuarterLabel(q.quarter)}
                    </th>
                  ))}
                  <th className="text-center p-2 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-semibold">{matchResult.team1.name}</td>
                  {matchResult.quarters.map((q, i) => (
                    <td key={i} className="text-center p-2">
                      {q.team1Score}
                    </td>
                  ))}
                  <td className="text-center p-2 font-bold">{matchResult.team1Score}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">{matchResult.team2.name}</td>
                  {matchResult.quarters.map((q, i) => (
                    <td key={i} className="text-center p-2">
                      {q.team2Score}
                    </td>
                  ))}
                  <td className="text-center p-2 font-bold">{matchResult.team2Score}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">
            ⭐ GAME MVP ⭐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl">🏅</div>
            <div>
              <p className="text-3xl font-bold">{matchResult.mvp.player}</p>
              <p className="text-xl text-gray-600">
                {matchResult.mvp.team === 'team1' ? matchResult.team1.name : matchResult.team2.name}
              </p>
            </div>
            <div className="flex justify-center space-x-6 pt-4">
              <Badge className="text-2xl px-6 py-3 bg-orange-500">
                {matchResult.mvp.points} PTS
              </Badge>
              <Badge className="text-2xl px-6 py-3 bg-blue-500">
                {matchResult.mvp.rebounds} REB
              </Badge>
              <Badge className="text-2xl px-6 py-3 bg-green-500">
                {matchResult.mvp.assists} AST
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Play-by-Play</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlayByPlay(!showPlayByPlay)}
            >
              {showPlayByPlay ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </CardHeader>
        {showPlayByPlay && (
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {matchResult.quarters.map((quarter, qIndex) => (
                <div key={qIndex}>
                  <h4 className="font-semibold mb-2">
                    {getQuarterLabel(quarter.quarter)}
                  </h4>
                  <div className="space-y-1">
                    {quarter.possessions.slice(0, 10).map((possession, pIndex) => (
                      <div
                        key={pIndex}
                        className={`text-sm p-2 rounded ${
                          possession.team === 'team1'
                            ? 'bg-blue-50 text-blue-900'
                            : 'bg-red-50 text-red-900'
                        }`}
                      >
                        <span className="font-mono text-xs mr-2">{possession.time}</span>
                        <span className="font-semibold">{possession.player}:</span> {possession.action}
                        {possession.points > 0 && (
                          <Badge className="ml-2" variant="default">
                            +{possession.points}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {quarter.possessions.length > 10 && (
                      <p className="text-xs text-gray-500 text-center">
                        ... and {quarter.possessions.length - 10} more plays
                      </p>
                    )}
                  </div>
                  {qIndex < matchResult.quarters.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}