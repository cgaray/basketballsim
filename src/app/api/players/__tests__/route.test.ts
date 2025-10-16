/**
 * Tests for Players API route
 */

import { GET } from '../route';
import { prisma } from '@/lib/database/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    player: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('GET /api/players', () => {
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
    {
      id: 2,
      name: 'Stephen Curry',
      position: 'PG',
      team: 'Golden State Warriors',
      season: 2023,
      gamesPlayed: 75,
      pointsPerGame: 29.0,
      reboundsPerGame: 5.0,
      assistsPerGame: 6.5,
      stealsPerGame: 1.5,
      blocksPerGame: 0.3,
      fieldGoalPercentage: 0.48,
      threePointPercentage: 0.42,
      freeThrowPercentage: 0.91,
      imageUrl: null,
      createdAt: new Date('2023-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all players when no filters provided', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(2);

    const request = new NextRequest('http://localhost:3000/api/players');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.pagination.total).toBe(2);
  });

  it('filters players by name', async () => {
    const filteredPlayers = [mockPlayers[0]];
    (prisma.player.findMany as jest.Mock).mockResolvedValue(filteredPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/players?name=LeBron');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: expect.objectContaining({
            contains: 'LeBron',
          }),
        }),
      })
    );
  });

  it('filters players by position', async () => {
    const filteredPlayers = [mockPlayers[1]];
    (prisma.player.findMany as jest.Mock).mockResolvedValue(filteredPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/players?position=PG');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          position: 'PG',
        }),
      })
    );
  });

  it('filters players by team', async () => {
    const filteredPlayers = [mockPlayers[0]];
    (prisma.player.findMany as jest.Mock).mockResolvedValue(filteredPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/players?team=Lakers');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          team: expect.objectContaining({
            contains: 'Lakers',
          }),
        }),
      })
    );
  });

  it('filters players by season', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(2);

    const request = new NextRequest('http://localhost:3000/api/players?season=2023');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          season: 2023,
        }),
      })
    );
  });

  it('applies pagination correctly', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([mockPlayers[0]]);
    (prisma.player.count as jest.Mock).mockResolvedValue(100);

    const request = new NextRequest('http://localhost:3000/api/players?page=2&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.total).toBe(100);
    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it('handles database errors gracefully', async () => {
    (prisma.player.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/players');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('combines multiple filters', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([mockPlayers[0]]);
    (prisma.player.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/players?name=LeBron&position=SF&season=2023');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: expect.objectContaining({ contains: 'LeBron' }),
          position: 'SF',
          season: 2023,
        }),
      })
    );
  });

  it('orders results by season descending by default', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(2);

    const request = new NextRequest('http://localhost:3000/api/players');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { season: 'desc' },
      })
    );
  });

  it('returns empty array when no players found', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.player.count as jest.Mock).mockResolvedValue(0);

    const request = new NextRequest('http://localhost:3000/api/players?name=NonExistent');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });
});
