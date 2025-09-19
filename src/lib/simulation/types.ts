export interface SimulationPlayer {
  id: number;
  name: string;
  position: string;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
}

export interface SimulationTeam {
  id: number;
  name: string;
  players: SimulationPlayer[];
}

export interface Possession {
  team: 'team1' | 'team2';
  quarter: number;
  time: string;
  player: string;
  action: string;
  points: number;
  result: 'made' | 'missed' | 'turnover' | 'foul';
}

export interface QuarterStats {
  quarter: number;
  team1Score: number;
  team2Score: number;
  possessions: Possession[];
}

export interface MatchResult {
  team1: SimulationTeam;
  team2: SimulationTeam;
  team1Score: number;
  team2Score: number;
  quarters: QuarterStats[];
  winner: 'team1' | 'team2' | 'tie';
  mvp: {
    player: string;
    team: 'team1' | 'team2';
    points: number;
    rebounds: number;
    assists: number;
  };
}

export interface PlayerGameStats {
  playerId: number;
  name: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  turnovers: number;
  fouls: number;
  minutesPlayed: number;
}

export interface TeamGameStats {
  teamId: number;
  teamName: string;
  players: PlayerGameStats[];
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
}