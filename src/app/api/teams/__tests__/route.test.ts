import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    team: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('/api/teams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTeam = {
    id: 1,
    name: 'Dream Team',
    players: [
      { id: 1, name: 'Player 1', position: 'PG' },
      { id: 2, name: 'Player 2', position: 'SG' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('GET', () => {
    it('returns all teams', async () => {
      (prisma.team.findMany as jest.Mock).mockResolvedValue([mockTeam]);

      const request = new NextRequest('http://localhost:3000/api/teams');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toEqual(mockTeam);

      expect(prisma.team.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
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

    it('handles database errors gracefully', async () => {
      (prisma.team.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/teams');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch teams');
    });
  });

  describe('POST', () => {
    it('creates a new team successfully', async () => {
      const newTeam = {
        name: 'New Team',
        players: [
          { id: 1, name: 'Player 1', position: 'PG' },
          { id: 2, name: 'Player 2', position: 'SG' },
        ],
      };

      (prisma.team.create as jest.Mock).mockResolvedValue({
        ...newTeam,
        id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(newTeam),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Team');
      expect(data.data.players).toEqual(newTeam.players);

      expect(prisma.team.create).toHaveBeenCalledWith({
        data: {
          name: 'New Team',
          players: newTeam.players,
        },
      });
    });

    it('validates required name field', async () => {
      const invalidTeam = {
        players: [
          { id: 1, name: 'Player 1', position: 'PG' },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidTeam),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Team name and players are required');
      expect(prisma.team.create).not.toHaveBeenCalled();
    });

    it('validates required players field', async () => {
      const invalidTeam = {
        name: 'Team Without Players',
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidTeam),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Team name and players are required');
      expect(prisma.team.create).not.toHaveBeenCalled();
    });

    it('validates empty players array', async () => {
      const invalidTeam = {
        name: 'Empty Team',
        players: [],
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidTeam),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Team must have at least one player');
      expect(prisma.team.create).not.toHaveBeenCalled();
    });

    it('validates maximum team size', async () => {
      const tooManyPlayers = Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        name: `Player ${i + 1}`,
        position: 'PG',
      }));

      const invalidTeam = {
        name: 'Oversized Team',
        players: tooManyPlayers,
      };

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(invalidTeam),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Team cannot have more than 15 players');
      expect(prisma.team.create).not.toHaveBeenCalled();
    });

    it('handles database errors during creation', async () => {
      const newTeam = {
        name: 'New Team',
        players: [
          { id: 1, name: 'Player 1', position: 'PG' },
        ],
      };

      (prisma.team.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(newTeam),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create team');
    });

    it('handles invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request body');
      expect(prisma.team.create).not.toHaveBeenCalled();
    });

    it('creates team with full roster', async () => {
      const fullRoster = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Player ${i + 1}`,
        position: ['PG', 'SG', 'SF', 'PF', 'C'][i % 5],
      }));

      const newTeam = {
        name: 'Full Roster Team',
        players: fullRoster,
      };

      (prisma.team.create as jest.Mock).mockResolvedValue({
        ...newTeam,
        id: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/teams', {
        method: 'POST',
        body: JSON.stringify(newTeam),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.players).toHaveLength(15);
    });
  });
});