'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SimulationEngine } from '@/lib/simulation/engine';
import { MatchResult, SimulationPlayer, SimulationTeam } from '@/lib/simulation/types';
import { Player } from '@/types';
import { Trophy, ArrowLeft, RotateCcw, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Team {
  id: number;
  name: string;
  players: Player[];
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Simulating Match...
              </h2>
              <p className="text-muted-foreground">
                {team1.name} vs {team2.name}
              </p>
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

  const team1Won = matchResult.winner === 'team1';
  const team2Won = matchResult.winner === 'team2';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={simulateMatch} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Rematch
        </Button>
      </div>

      {/* Main Score Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Team 1 */}
            <div className={cn(
              'text-center p-4 rounded-lg',
              team1Won ? 'bg-blue-50' : 'bg-gray-50'
            )}>
              {team1Won && (
                <div className="flex justify-center mb-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
              )}
              <h3 className="font-bold text-lg mb-2 truncate">{matchResult.team1.name}</h3>
              <p className={cn(
                'text-5xl font-black',
                team1Won ? 'text-blue-600' : 'text-gray-600'
              )}>
                {matchResult.team1Score}
              </p>
              {team1Won && (
                <Badge className="mt-2 bg-blue-500">Winner</Badge>
              )}
            </div>

            {/* VS */}
            <div className="text-center">
              <span className="text-2xl font-bold text-muted-foreground">VS</span>
            </div>

            {/* Team 2 */}
            <div className={cn(
              'text-center p-4 rounded-lg',
              team2Won ? 'bg-red-50' : 'bg-gray-50'
            )}>
              {team2Won && (
                <div className="flex justify-center mb-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
              )}
              <h3 className="font-bold text-lg mb-2 truncate">{matchResult.team2.name}</h3>
              <p className={cn(
                'text-5xl font-black',
                team2Won ? 'text-red-600' : 'text-gray-600'
              )}>
                {matchResult.team2Score}
              </p>
              {team2Won && (
                <Badge className="mt-2 bg-red-500">Winner</Badge>
              )}
            </div>
          </div>

          {/* Quarter Breakdown */}
          <div className="mt-6 pt-6 border-t">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-2 font-medium">Team</th>
                    {matchResult.quarters.map((q, i) => (
                      <th key={i} className="text-center py-2 font-medium w-12">
                        {getQuarterLabel(q.quarter)}
                      </th>
                    ))}
                    <th className="text-center py-2 font-bold w-16">Final</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={team1Won ? 'font-semibold' : ''}>
                    <td className="py-2 text-blue-600">{matchResult.team1.name}</td>
                    {matchResult.quarters.map((q, i) => (
                      <td key={i} className="text-center py-2">{q.team1Score}</td>
                    ))}
                    <td className="text-center py-2 font-bold">{matchResult.team1Score}</td>
                  </tr>
                  <tr className={team2Won ? 'font-semibold' : ''}>
                    <td className="py-2 text-red-600">{matchResult.team2.name}</td>
                    {matchResult.quarters.map((q, i) => (
                      <td key={i} className="text-center py-2">{q.team2Score}</td>
                    ))}
                    <td className="text-center py-2 font-bold">{matchResult.team2Score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MVP Card - Compact */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Game MVP</div>
              <div className="font-bold text-lg">{matchResult.mvp.player}</div>
              <div className="text-sm text-muted-foreground">
                {matchResult.mvp.team === 'team1' ? matchResult.team1.name : matchResult.team2.name}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-xl font-bold">{matchResult.mvp.points}</div>
                <div className="text-xs text-muted-foreground">PTS</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{matchResult.mvp.rebounds}</div>
                <div className="text-xs text-muted-foreground">REB</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{matchResult.mvp.assists}</div>
                <div className="text-xs text-muted-foreground">AST</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Play-by-Play - Collapsible */}
      <Card>
        <CardHeader className="pb-0">
          <button
            onClick={() => setShowPlayByPlay(!showPlayByPlay)}
            className="flex items-center justify-between w-full"
          >
            <CardTitle className="text-lg">Play-by-Play</CardTitle>
            {showPlayByPlay ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        {showPlayByPlay && (
          <CardContent className="pt-4">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {matchResult.quarters.map((quarter, qIndex) => (
                <div key={qIndex}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{getQuarterLabel(quarter.quarter)}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {quarter.team1Score} - {quarter.team2Score}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {quarter.possessions.slice(0, 10).map((possession, pIndex) => (
                      <div
                        key={pIndex}
                        className={cn(
                          'text-sm p-2 rounded',
                          possession.team === 'team1'
                            ? 'bg-blue-50 border-l-2 border-blue-400'
                            : 'bg-red-50 border-l-2 border-red-400'
                        )}
                      >
                        <span className="font-mono text-xs text-muted-foreground mr-2">
                          {possession.time}
                        </span>
                        <span className="font-medium">{possession.player}</span>
                        <span className="text-muted-foreground"> - {possession.action}</span>
                        {possession.points > 0 && (
                          <Badge className="ml-2 h-5" variant="secondary">
                            +{possession.points}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {quarter.possessions.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{quarter.possessions.length - 10} more plays
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
