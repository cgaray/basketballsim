import { SimulationEngine } from '../engine';
import { SimulationTeam, SimulationPlayer } from '../types';

describe('SimulationEngine', () => {
  const createMockPlayer = (
    id: number,
    name: string,
    position: string,
    overrides: Partial<SimulationPlayer> = {}
  ): SimulationPlayer => ({
    id,
    name,
    position,
    pointsPerGame: 15,
    reboundsPerGame: 5,
    assistsPerGame: 3,
    stealsPerGame: 1,
    blocksPerGame: 0.5,
    fieldGoalPercentage: 0.45,
    threePointPercentage: 0.35,
    freeThrowPercentage: 0.75,
    ...overrides
  });

  const createMockTeam = (id: number, name: string): SimulationTeam => {
    const players: SimulationPlayer[] = [
      createMockPlayer(1, 'Player 1', 'PG', { pointsPerGame: 20, assistsPerGame: 8 }),
      createMockPlayer(2, 'Player 2', 'SG', { pointsPerGame: 18, threePointPercentage: 0.4 }),
      createMockPlayer(3, 'Player 3', 'SF', { pointsPerGame: 15 }),
      createMockPlayer(4, 'Player 4', 'PF', { pointsPerGame: 12, reboundsPerGame: 8 }),
      createMockPlayer(5, 'Player 5', 'C', { pointsPerGame: 10, reboundsPerGame: 10, blocksPerGame: 2 }),
      createMockPlayer(6, 'Player 6', 'PG', { pointsPerGame: 8 }),
      createMockPlayer(7, 'Player 7', 'SG', { pointsPerGame: 9 }),
      createMockPlayer(8, 'Player 8', 'SF', { pointsPerGame: 7 }),
      createMockPlayer(9, 'Player 9', 'PF', { pointsPerGame: 6 }),
      createMockPlayer(10, 'Player 10', 'C', { pointsPerGame: 5 })
    ];

    return {
      id,
      name,
      players
    };
  };

  describe('constructor', () => {
    it('should initialize with two teams', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');

      const engine = new SimulationEngine(team1, team2);
      expect(engine).toBeDefined();
    });
  });

  describe('simulateMatch', () => {
    it('should return a valid match result', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      const result = engine.simulateMatch();

      expect(result).toBeDefined();
      expect(result.team1).toEqual(team1);
      expect(result.team2).toEqual(team2);
      expect(result.team1Score).toBeGreaterThanOrEqual(0);
      expect(result.team2Score).toBeGreaterThanOrEqual(0);
      expect(result.winner).toMatch(/^(team1|team2)$/);
      expect(result.quarters).toHaveLength(4);
    });

    it('should have four quarters by default', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      const result = engine.simulateMatch();

      const regularQuarters = result.quarters.filter(q => q.quarter <= 4);
      expect(regularQuarters).toHaveLength(4);
    });

    it('should calculate correct total scores', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      const result = engine.simulateMatch();

      const calculatedTeam1Score = result.quarters.reduce(
        (sum, q) => sum + q.team1Score,
        0
      );
      const calculatedTeam2Score = result.quarters.reduce(
        (sum, q) => sum + q.team2Score,
        0
      );

      expect(result.team1Score).toBe(calculatedTeam1Score);
      expect(result.team2Score).toBe(calculatedTeam2Score);
    });

    it('should determine the correct winner', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      const result = engine.simulateMatch();

      if (result.team1Score > result.team2Score) {
        expect(result.winner).toBe('team1');
      } else if (result.team2Score > result.team1Score) {
        expect(result.winner).toBe('team2');
      }
    });

    it('should have no tie games (overtime if needed)', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');

      for (let i = 0; i < 10; i++) {
        const engine = new SimulationEngine(team1, team2);
        const result = engine.simulateMatch();

        expect(result.team1Score).not.toBe(result.team2Score);
        expect(result.winner).not.toBe('tie');
      }
    });

    it('should select an MVP', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      const result = engine.simulateMatch();

      expect(result.mvp).toBeDefined();
      expect(result.mvp.player).toBeTruthy();
      expect(result.mvp.team).toMatch(/^(team1|team2)$/);
      expect(result.mvp.points).toBeGreaterThanOrEqual(0);
      expect(result.mvp.rebounds).toBeGreaterThanOrEqual(0);
      expect(result.mvp.assists).toBeGreaterThanOrEqual(0);
    });

    it('should generate possessions for each quarter', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      const result = engine.simulateMatch();

      result.quarters.forEach(quarter => {
        expect(quarter.possessions).toBeDefined();
        expect(quarter.possessions.length).toBeGreaterThan(0);

        quarter.possessions.forEach(possession => {
          expect(possession.team).toMatch(/^(team1|team2)$/);
          expect(possession.quarter).toBe(quarter.quarter);
          expect(possession.time).toBeTruthy();
          expect(possession.player).toBeTruthy();
          expect(possession.action).toBeTruthy();
          expect(possession.points).toBeGreaterThanOrEqual(0);
          expect(possession.result).toMatch(/^(made|missed|turnover|foul)$/);
        });
      });
    });
  });

  describe('getTeamStats', () => {
    it('should return team statistics', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      engine.simulateMatch();

      const team1Stats = engine.getTeamStats('team1');
      const team2Stats = engine.getTeamStats('team2');

      expect(team1Stats).toBeDefined();
      expect(team1Stats.teamId).toBe(team1.id);
      expect(team1Stats.teamName).toBe(team1.name);
      expect(team1Stats.players).toBeDefined();
      expect(team1Stats.totalPoints).toBeGreaterThanOrEqual(0);
      expect(team1Stats.totalRebounds).toBeGreaterThanOrEqual(0);
      expect(team1Stats.totalAssists).toBeGreaterThanOrEqual(0);

      expect(team2Stats).toBeDefined();
      expect(team2Stats.teamId).toBe(team2.id);
      expect(team2Stats.teamName).toBe(team2.name);
    });

    it('should calculate shooting percentages correctly', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      engine.simulateMatch();

      const stats = engine.getTeamStats('team1');

      expect(stats.fieldGoalPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.fieldGoalPercentage).toBeLessThanOrEqual(1);
      expect(stats.threePointPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.threePointPercentage).toBeLessThanOrEqual(1);
      expect(stats.freeThrowPercentage).toBeGreaterThanOrEqual(0);
      expect(stats.freeThrowPercentage).toBeLessThanOrEqual(1);
    });
  });

  describe('realistic game scores', () => {
    it('should generate realistic basketball scores', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');

      const scores: number[] = [];

      for (let i = 0; i < 10; i++) {
        const engine = new SimulationEngine(team1, team2);
        const result = engine.simulateMatch();
        scores.push(result.team1Score, result.team2Score);
      }

      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

      expect(avgScore).toBeGreaterThan(60);
      expect(avgScore).toBeLessThan(140);

      scores.forEach(score => {
        expect(score).toBeGreaterThan(40);
        expect(score).toBeLessThan(160);
      });
    });
  });

  describe('player statistics', () => {
    it('should track individual player statistics', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');
      const engine = new SimulationEngine(team1, team2);

      engine.simulateMatch();

      const team1Stats = engine.getTeamStats('team1');

      team1Stats.players.forEach(playerStats => {
        expect(playerStats.playerId).toBeDefined();
        expect(playerStats.name).toBeTruthy();
        expect(playerStats.points).toBeGreaterThanOrEqual(0);
        expect(playerStats.rebounds).toBeGreaterThanOrEqual(0);
        expect(playerStats.assists).toBeGreaterThanOrEqual(0);
        expect(playerStats.fieldGoalsAttempted).toBeGreaterThanOrEqual(playerStats.fieldGoalsMade);
        expect(playerStats.threePointersAttempted).toBeGreaterThanOrEqual(playerStats.threePointersMade);
        expect(playerStats.freeThrowsAttempted).toBeGreaterThanOrEqual(playerStats.freeThrowsMade);
      });
    });

    it('should have star players score more points on average', () => {
      const team1 = createMockTeam(1, 'Team A');
      const team2 = createMockTeam(2, 'Team B');

      const totalPointsByPlayer: Map<number, number> = new Map();

      for (let i = 0; i < 20; i++) {
        const engine = new SimulationEngine(team1, team2);
        engine.simulateMatch();

        const stats = engine.getTeamStats('team1');
        stats.players.forEach(playerStats => {
          totalPointsByPlayer.set(
            playerStats.playerId,
            (totalPointsByPlayer.get(playerStats.playerId) || 0) + playerStats.points
          );
        });
      }

      const player1AvgPoints = totalPointsByPlayer.get(1)! / 20;
      const player10AvgPoints = totalPointsByPlayer.get(10)! / 20;

      expect(player1AvgPoints).toBeGreaterThan(player10AvgPoints);
    });
  });
});