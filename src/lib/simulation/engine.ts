import {
  SimulationPlayer,
  SimulationTeam,
  Possession,
  QuarterStats,
  MatchResult,
  PlayerGameStats,
  TeamGameStats
} from './types';
import { HighlightDetector, CommentaryGenerator } from '../llm/highlights';

const QUARTER_LENGTH_MINUTES = 12;
const POSSESSIONS_PER_QUARTER = 25;

export class SimulationEngine {
  private team1Stats: Map<number, PlayerGameStats> = new Map();
  private team2Stats: Map<number, PlayerGameStats> = new Map();
  private currentQuarter = 1;
  private possessionCount = 0;

  constructor(
    private team1: SimulationTeam,
    private team2: SimulationTeam
  ) {
    this.initializePlayerStats();
  }

  private initializePlayerStats(): void {
    this.team1.players.forEach(player => {
      this.team1Stats.set(player.id, this.createEmptyPlayerStats(player));
    });
    this.team2.players.forEach(player => {
      this.team2Stats.set(player.id, this.createEmptyPlayerStats(player));
    });
  }

  private createEmptyPlayerStats(player: SimulationPlayer): PlayerGameStats {
    return {
      playerId: player.id,
      name: player.name,
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      threePointersMade: 0,
      threePointersAttempted: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      turnovers: 0,
      fouls: 0,
      minutesPlayed: 0
    };
  }

  public async simulateMatch(): Promise<MatchResult> {
    const quarters: QuarterStats[] = [];
    let team1TotalScore = 0;
    let team2TotalScore = 0;

    for (let quarter = 1; quarter <= 4; quarter++) {
      this.currentQuarter = quarter;
      const quarterResult = this.simulateQuarter();
      quarters.push(quarterResult);
      team1TotalScore += quarterResult.team1Score;
      team2TotalScore += quarterResult.team2Score;
    }

    while (team1TotalScore === team2TotalScore) {
      const overtimeQuarter = this.simulateOvertime(quarters.length);
      quarters.push(overtimeQuarter);
      team1TotalScore += overtimeQuarter.team1Score;
      team2TotalScore += overtimeQuarter.team2Score;
    }

    const mvp = this.calculateMVP();

    const baseResult: MatchResult = {
      team1: this.team1,
      team2: this.team2,
      team1Score: team1TotalScore,
      team2Score: team2TotalScore,
      quarters,
      winner: team1TotalScore > team2TotalScore ? 'team1' : 'team2',
      mvp
    };

    // Generate highlights using LLM
    try {
      const highlightDetector = new HighlightDetector();
      const keyMoments = highlightDetector.detectKeyMoments(baseResult);

      const commentaryGenerator = new CommentaryGenerator();
      const highlights = await commentaryGenerator.generateHighlights(baseResult, keyMoments);

      return {
        ...baseResult,
        highlights
      };
    } catch (error) {
      console.error('Error generating highlights:', error);
      // Return result without highlights if generation fails
      return baseResult;
    }
  }

  private simulateQuarter(): QuarterStats {
    const possessions: Possession[] = [];
    let team1Score = 0;
    let team2Score = 0;
    let currentPossession: 'team1' | 'team2' = Math.random() > 0.5 ? 'team1' : 'team2';

    for (let i = 0; i < POSSESSIONS_PER_QUARTER; i++) {
      const possession = this.simulatePossession(currentPossession);
      possessions.push(possession);

      if (possession.team === 'team1') {
        team1Score += possession.points;
      } else {
        team2Score += possession.points;
      }

      currentPossession = currentPossession === 'team1' ? 'team2' : 'team1';
      this.possessionCount++;
    }

    return {
      quarter: this.currentQuarter,
      team1Score,
      team2Score,
      possessions
    };
  }

  private simulateOvertime(overtimeNumber: number): QuarterStats {
    const possessions: Possession[] = [];
    let team1Score = 0;
    let team2Score = 0;
    let currentPossession: 'team1' | 'team2' = Math.random() > 0.5 ? 'team1' : 'team2';
    const overtimePossessions = 10;

    for (let i = 0; i < overtimePossessions; i++) {
      const possession = this.simulatePossession(currentPossession);
      possessions.push(possession);

      if (possession.team === 'team1') {
        team1Score += possession.points;
      } else {
        team2Score += possession.points;
      }

      currentPossession = currentPossession === 'team1' ? 'team2' : 'team1';
      this.possessionCount++;
    }

    return {
      quarter: overtimeNumber,
      team1Score,
      team2Score,
      possessions
    };
  }

  private simulatePossession(team: 'team1' | 'team2'): Possession {
    const teamPlayers = team === 'team1' ? this.team1.players : this.team2.players;
    const teamStats = team === 'team1' ? this.team1Stats : this.team2Stats;

    const lineup = this.getLineup(teamPlayers);
    const ballHandler = this.selectBallHandler(lineup);
    const timeInQuarter = this.getTimeString();

    const turnoverChance = 0.15;
    if (Math.random() < turnoverChance) {
      const playerStats = teamStats.get(ballHandler.id)!;
      playerStats.turnovers++;

      const stealPlayer = this.getRandomPlayer(team === 'team1' ? this.team2.players : this.team1.players);
      const stealStats = (team === 'team1' ? this.team2Stats : this.team1Stats).get(stealPlayer.id)!;
      stealStats.steals++;

      return {
        team,
        quarter: this.currentQuarter,
        time: timeInQuarter,
        player: ballHandler.name,
        action: `Turnover, stolen by ${stealPlayer.name}`,
        points: 0,
        result: 'turnover'
      };
    }

    const shotType = this.determineShotType(ballHandler);
    const { made, points, action } = this.simulateShot(ballHandler, shotType);

    const playerStats = teamStats.get(ballHandler.id)!;

    if (made) {
      playerStats.points += points;

      if (shotType === 'three') {
        playerStats.threePointersMade++;
        playerStats.threePointersAttempted++;
      } else if (shotType === 'free-throw') {
        playerStats.freeThrowsMade++;
        playerStats.freeThrowsAttempted++;
      } else {
        playerStats.fieldGoalsMade++;
        playerStats.fieldGoalsAttempted++;
      }

      if (Math.random() < 0.4) {
        const assistant = lineup.find(p => p.id !== ballHandler.id);
        if (assistant) {
          const assistStats = teamStats.get(assistant.id)!;
          assistStats.assists++;
        }
      }
    } else {
      if (shotType === 'three') {
        playerStats.threePointersAttempted++;
      } else if (shotType === 'free-throw') {
        playerStats.freeThrowsAttempted++;
      } else {
        playerStats.fieldGoalsAttempted++;
      }

      const reboundTeam = Math.random() < 0.7 ? (team === 'team1' ? 'team2' : 'team1') : team;
      const reboundPlayers = reboundTeam === team ? teamPlayers : (team === 'team1' ? this.team2.players : this.team1.players);
      const rebounder = this.selectRebounder(reboundPlayers);
      const reboundStats = (reboundTeam === team ? teamStats : (team === 'team1' ? this.team2Stats : this.team1Stats)).get(rebounder.id)!;
      reboundStats.rebounds++;
    }

    return {
      team,
      quarter: this.currentQuarter,
      time: timeInQuarter,
      player: ballHandler.name,
      action,
      points,
      result: made ? 'made' : 'missed'
    };
  }

  private getLineup(players: SimulationPlayer[]): SimulationPlayer[] {
    const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
    const lineup: SimulationPlayer[] = [];

    for (const position of positions) {
      const positionPlayers = players.filter(p => p.position === position);
      if (positionPlayers.length > 0) {
        lineup.push(positionPlayers[Math.floor(Math.random() * positionPlayers.length)]);
      }
    }

    while (lineup.length < 5 && players.length > lineup.length) {
      const remainingPlayers = players.filter(p => !lineup.includes(p));
      if (remainingPlayers.length > 0) {
        lineup.push(remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)]);
      }
    }

    return lineup;
  }

  private selectBallHandler(lineup: SimulationPlayer[]): SimulationPlayer {
    const weights = lineup.map(player => {
      let weight = player.pointsPerGame + (player.assistsPerGame * 2);
      if (player.position === 'PG') weight *= 1.5;
      if (player.position === 'SG') weight *= 1.2;
      return weight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < lineup.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return lineup[i];
      }
    }

    return lineup[0];
  }

  private selectRebounder(players: SimulationPlayer[]): SimulationPlayer {
    const weights = players.map(player => {
      let weight = player.reboundsPerGame;
      if (player.position === 'C') weight *= 1.5;
      if (player.position === 'PF') weight *= 1.3;
      return weight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < players.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return players[i];
      }
    }

    return players[0];
  }

  private determineShotType(player: SimulationPlayer): 'three' | 'mid-range' | 'layup' | 'free-throw' {
    const random = Math.random();

    if (random < 0.05) return 'free-throw';

    const threePointTendency = player.threePointPercentage > 0.35 ? 0.35 : 0.2;
    if (random < threePointTendency) return 'three';

    const layupTendency = player.position === 'C' || player.position === 'PF' ? 0.5 : 0.3;
    if (random < threePointTendency + layupTendency) return 'layup';

    return 'mid-range';
  }

  private simulateShot(player: SimulationPlayer, shotType: string): { made: boolean; points: number; action: string } {
    let successRate: number;
    let points: number;
    let action: string;

    switch (shotType) {
      case 'three':
        successRate = player.threePointPercentage || 0.33;
        points = 3;
        action = 'Three-pointer';
        break;
      case 'layup':
        successRate = Math.min(player.fieldGoalPercentage + 0.15, 0.75) || 0.6;
        points = 2;
        action = 'Layup';
        break;
      case 'mid-range':
        successRate = player.fieldGoalPercentage || 0.45;
        points = 2;
        action = 'Jump shot';
        break;
      case 'free-throw':
        successRate = player.freeThrowPercentage || 0.75;
        points = 1;
        action = 'Free throw';
        break;
      default:
        successRate = 0.45;
        points = 2;
        action = 'Field goal';
    }

    const variance = (Math.random() - 0.5) * 0.1;
    const adjustedRate = Math.max(0.1, Math.min(0.95, successRate + variance));
    const made = Math.random() < adjustedRate;

    if (shotType === 'free-throw' && made) {
      const secondFTMade = Math.random() < adjustedRate;
      points = secondFTMade ? 2 : 1;
      action = secondFTMade ? 'Both free throws' : '1 of 2 free throws';
    }

    return { made, points, action: made ? `${action} made` : `${action} missed` };
  }

  private getTimeString(): string {
    const possessionTime = (QUARTER_LENGTH_MINUTES * 60) / POSSESSIONS_PER_QUARTER;
    const elapsedInQuarter = (this.possessionCount % POSSESSIONS_PER_QUARTER) * possessionTime;
    const remainingInQuarter = (QUARTER_LENGTH_MINUTES * 60) - elapsedInQuarter;

    const minutes = Math.floor(remainingInQuarter / 60);
    const seconds = Math.floor(remainingInQuarter % 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private getRandomPlayer(players: SimulationPlayer[]): SimulationPlayer {
    return players[Math.floor(Math.random() * players.length)];
  }

  private calculateMVP(): MatchResult['mvp'] {
    let mvp: MatchResult['mvp'] = {
      player: '',
      team: 'team1',
      points: 0,
      rebounds: 0,
      assists: 0
    };

    const evaluatePlayer = (stats: PlayerGameStats, team: 'team1' | 'team2') => {
      const score = stats.points + (stats.rebounds * 1.2) + (stats.assists * 1.5) + (stats.steals * 2) + (stats.blocks * 2);
      if (score > (mvp.points + mvp.rebounds * 1.2 + mvp.assists * 1.5)) {
        mvp = {
          player: stats.name,
          team,
          points: stats.points,
          rebounds: stats.rebounds,
          assists: stats.assists
        };
      }
    };

    this.team1Stats.forEach(stats => evaluatePlayer(stats, 'team1'));
    this.team2Stats.forEach(stats => evaluatePlayer(stats, 'team2'));

    return mvp;
  }

  public getTeamStats(team: 'team1' | 'team2'): TeamGameStats {
    const teamData = team === 'team1' ? this.team1 : this.team2;
    const teamStats = team === 'team1' ? this.team1Stats : this.team2Stats;
    const players = Array.from(teamStats.values());

    const totalFieldGoalsMade = players.reduce((sum, p) => sum + p.fieldGoalsMade, 0);
    const totalFieldGoalsAttempted = players.reduce((sum, p) => sum + p.fieldGoalsAttempted, 0);
    const totalThreePointersMade = players.reduce((sum, p) => sum + p.threePointersMade, 0);
    const totalThreePointersAttempted = players.reduce((sum, p) => sum + p.threePointersAttempted, 0);
    const totalFreeThrowsMade = players.reduce((sum, p) => sum + p.freeThrowsMade, 0);
    const totalFreeThrowsAttempted = players.reduce((sum, p) => sum + p.freeThrowsAttempted, 0);

    return {
      teamId: teamData.id,
      teamName: teamData.name,
      players,
      totalPoints: players.reduce((sum, p) => sum + p.points, 0),
      totalRebounds: players.reduce((sum, p) => sum + p.rebounds, 0),
      totalAssists: players.reduce((sum, p) => sum + p.assists, 0),
      totalSteals: players.reduce((sum, p) => sum + p.steals, 0),
      totalBlocks: players.reduce((sum, p) => sum + p.blocks, 0),
      totalTurnovers: players.reduce((sum, p) => sum + p.turnovers, 0),
      fieldGoalPercentage: totalFieldGoalsAttempted > 0 ? totalFieldGoalsMade / totalFieldGoalsAttempted : 0,
      threePointPercentage: totalThreePointersAttempted > 0 ? totalThreePointersMade / totalThreePointersAttempted : 0,
      freeThrowPercentage: totalFreeThrowsAttempted > 0 ? totalFreeThrowsMade / totalFreeThrowsAttempted : 0
    };
  }
}