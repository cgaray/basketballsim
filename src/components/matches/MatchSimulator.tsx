'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SimulationEngine } from '@/lib/simulation/engine';
import { MatchResult, SimulationPlayer, SimulationTeam } from '@/lib/simulation/types';
import { Sparkles, TrendingUp, Trophy, Zap } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  players: any[]; // Now contains full player objects
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
  const [currentQuarter, setCurrentQuarter] = useState(0);
  const [showPlayByPlay, setShowPlayByPlay] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);

  const simulateMatch = async () => {
    setLoading(true);
    setError(null);
    setMatchResult(null);
    setCurrentQuarter(0);

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
      const result = await simulateWithAnimation(engine);

      setMatchResult(result);

      await saveMatchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const simulateWithAnimation = async (engine: SimulationEngine): Promise<MatchResult> => {
    return new Promise(async (resolve) => {
      // First simulate the match to get the result
      const result = await engine.simulateMatch();

      // Then animate the quarters display
      let quarterIndex = 0;
      const animateQuarters = () => {
        if (quarterIndex < result.quarters.length) {
          setCurrentQuarter(quarterIndex + 1);
          quarterIndex++;
          setTimeout(animateQuarters, 1000);
        } else {
          resolve(result);
        }
      };

      setTimeout(animateQuarters, 500);
    });
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
      const matchData = {
        team1Id: result.team1.id,
        team2Id: result.team2.id,
        team1Score: result.team1Score,
        team2Score: result.team2Score,
        winnerId: result.winner === 'team1' ? result.team1.id : result.team2.id,
        playByPlay: JSON.stringify({
          quarters: result.quarters,
          highlights: result.highlights
        })
      };

      await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
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
              <h2 className="text-2xl font-bold">Simulating Match...</h2>
              {currentQuarter > 0 && (
                <p className="text-lg text-gray-600">
                  {getQuarterLabel(currentQuarter)} in progress
                </p>
              )}
              <div className="flex space-x-2 justify-center">
                {[1, 2, 3, 4].map(q => (
                  <div
                    key={q}
                    className={`w-3 h-3 rounded-full ${
                      q <= currentQuarter ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
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
        <Button variant="outline" onClick={onBack}>
          Back to Team Selection
        </Button>
        <Button onClick={simulateMatch}>
          Simulate Again
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-3xl">Final Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center space-x-8">
            <div className={`text-center ${matchResult.winner === 'team1' ? 'text-green-600' : ''}`}>
              <h3 className="text-xl font-semibold">{matchResult.team1.name}</h3>
              <p className="text-5xl font-bold mt-2">{matchResult.team1Score}</p>
            </div>
            <div className="text-2xl text-gray-400">vs</div>
            <div className={`text-center ${matchResult.winner === 'team2' ? 'text-green-600' : ''}`}>
              <h3 className="text-xl font-semibold">{matchResult.team2.name}</h3>
              <p className="text-5xl font-bold mt-2">{matchResult.team2Score}</p>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>MVP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold">{matchResult.mvp.player}</p>
              <p className="text-sm text-gray-600">
                {matchResult.mvp.team === 'team1' ? matchResult.team1.name : matchResult.team2.name}
              </p>
            </div>
            <div className="flex space-x-4">
              <Badge variant="outline">
                {matchResult.mvp.points} PTS
              </Badge>
              <Badge variant="outline">
                {matchResult.mvp.rebounds} REB
              </Badge>
              <Badge variant="outline">
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

      {matchResult.highlights && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <CardTitle>Game Highlights</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHighlights(!showHighlights)}
              >
                {showHighlights ? 'Hide' : 'Show'} Highlights
              </Button>
            </div>
          </CardHeader>
          {showHighlights && (
            <CardContent>
              {/* Game Summary */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2">Game Summary</h4>
                <p className="text-gray-700 mb-2">{matchResult.highlights.narrative}</p>
                <p className="font-semibold text-purple-700">{matchResult.highlights.summary}</p>
              </div>

              {/* Key Moments */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Key Moments
                </h4>
                <div className="space-y-3">
                  {matchResult.highlights.moments.map((moment, index) => {
                    const iconMap = {
                      'clutch_shot': <Trophy className="w-4 h-4 text-yellow-500" />,
                      'momentum_swing': <TrendingUp className="w-4 h-4 text-green-500" />,
                      'run': <Zap className="w-4 h-4 text-orange-500" />,
                      'comeback': <TrendingUp className="w-4 h-4 text-blue-500" />,
                      'highlight_play': <Sparkles className="w-4 h-4 text-purple-500" />,
                      'milestone': <Trophy className="w-4 h-4 text-yellow-600" />
                    };

                    const bgColorMap = {
                      'high': 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300',
                      'medium': 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300',
                      'low': 'bg-gray-50 border-gray-200'
                    };

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${bgColorMap[moment.importance]}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {iconMap[moment.type] || <Sparkles className="w-4 h-4 text-gray-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Q{moment.quarter} - {moment.time}
                              </Badge>
                              {moment.importance === 'high' && (
                                <Badge variant="default" className="text-xs bg-orange-500">
                                  Critical
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-800">
                              {moment.description}
                            </p>
                            {moment.involvedPlayers.length > 0 && (
                              <p className="text-xs text-gray-600 mt-1">
                                Featuring: {moment.involvedPlayers.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}