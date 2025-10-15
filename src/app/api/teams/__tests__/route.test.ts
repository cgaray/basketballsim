/**
 * Tests for Teams API route
 */

import { GET, POST } from '../route';
import { prisma } from '@/lib/database/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    team: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    player: {
      findMany: jest.fn(),
    },
  },
}));

describe('Teams API Routes', () => {
  const mockTeams = [
    {
      id: 1,
      name: 'Lakers Dream Team',
      userId: 'user123',
      players: JSON.stringify([1, 2, 3, 4, 5]),
      createdAt: new Date('2023-01-01'),
    },
    {
      id: 2,
      name: 'Warriors Squad',
      userId: 'user123',
      players: JSON.stringify([6, 7, 8, 9, 10]),
      createdAt: new Date('2023-01-02'),
    },
  ];

  const mockPlayers = [
    {
      id: 1,
      name: 'LeBron James',
      position: 'SF',
      team: 'Los Angeles Lakers',
      season: 2023,
      gamesPlayed: 82,
      pointsPerGame: 25.0,
      reboundsPerGame: 7.5,
      assistsPerGame: 8.0,
      stealsPerGame: 1.2,
      blocksPerGame: 0.6,
      fieldGoalPercentage: 0.52,
      threePointPercentage: 0.35,
      freeThrowPercentage: 0.85,
      imageUrl: null,
      createdAt: new Date('2023-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/teams', () => {
    it('returns all teams with player data', async () => {
      (prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams);
      (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);

      const request = new NextRequest('http://localhost:3000/api/teams');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].players).toBeInstanceOf(Array);
    });

    it('parses player IDs from JSON string', async () => {
      (prisma.team.findMany as jest.Mock).mockResolvedValue([mockTeams[0]]);
      (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);

      const request = new NextRequest('http://localhost:3000/api/teams');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data[0].players).toEqual(mockPlayers);
      expect(prisma.player.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: [1, 2, 3, 4, 5],
          },
        },
      });
    });

    it('handles teams with no players', async () => {
      const emptyTeam = {
        ...mockTeams[0],
        players: JSON.stringify([]),
      };
      (prisma.team.findMany as jest.Mock).mockResolvedValue([emptyTeam]);
      (prisma.player.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/teams');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].players).toEqual([]);
    });

    it('handles database errors gracefully', async () => {
      (prisma.team.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/teams');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch teams');
    });

    it('orders teams by creation date descending', async () => {
      (prisma.team.findMany as jest.Mock).mockResolvedValue(mockTeams);
      (prisma.player.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/teams');
      await GET(request);

      expect(prisma.team.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns empty array when no teams exist', async () => {
      (prisma.team.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/teams');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });
  });

  describe('POST /api/teams', () => {
    const validTeamData = {
      name: 'New Team',
      userId: 'user123',
      players: [1, 2, 3, 4, 5],
    };

    it('creates a new team successfully', async () => {
      const createdTeam = {
        id: 3,
        name: validTeamData.name,
        userId: validTeamData.userId,
        players: JSON.stringify(validTeamData.players),
        createdAt: new Date(),
      };

      (prisma.team.create as jest.Mock).mockResolvedValue(createdTeam);

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(validTeamData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(validTeamData.name);
      expect(prisma.team.create).toHaveBeenCalledWith({
        data: {
          name: validTeamData.name,
          userId: validTeamData.userId,
          players: JSON.stringify(validTeamData.players),
        },
      });
    });

    it('validates required fields - name', async () => {
      const invalidData = {
        userId: 'user123',
        players: [1, 2, 3],
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('name');
    });

    it('validates required fields - players', async () => {
      const invalidData = {
        name: 'Test Team',
        userId: 'user123',
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('players');
    });

    it('validates players is an array', async () => {
      const invalidData = {
        name: 'Test Team',
        userId: 'user123',
        players: 'not an array',
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('array');
    });

    it('validates team has at least 5 players', async () => {
      const invalidData = {
        name: 'Test Team',
        userId: 'user123',
        players: [1, 2, 3], // Only 3 players
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('at least 5');
    });

    it('validates team does not exceed 15 players', async () => {
      const invalidData = {
        name: 'Test Team',
        userId: 'user123',
        players: Array(16).fill(1).map((_, i) => i + 1), // 16 players
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('exceed');
    });

    it('handles database errors during creation', async () => {
      (prisma.team.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(validTeamData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create team');
    });

    it('allows creating team without userId', async () => {
      const dataWithoutUser = {
        name: 'Test Team',
        players: [1, 2, 3, 4, 5],
      };

      const createdTeam = {
        id: 3,
        name: dataWithoutUser.name,
        userId: null,
        players: JSON.stringify(dataWithoutUser.players),
        createdAt: new Date(),
      };

      (prisma.team.create as jest.Mock).mockResolvedValue(createdTeam);

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(dataWithoutUser),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('handles malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
