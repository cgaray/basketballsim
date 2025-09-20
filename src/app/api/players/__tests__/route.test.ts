import { GET } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    player: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('/api/players', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPlayers = [
    {
      id: 1,
      name: 'LeBron James',
      position: 'SF',
      team: 'LAL',
      pointsPerGame: 27.1,
      reboundsPerGame: 7.5,
      assistsPerGame: 7.3,
      stealsPerGame: 1.2,
      blocksPerGame: 0.6,
      fieldGoalPercentage: 50.6,
      threePointPercentage: 37.4,
      freeThrowPercentage: 73.2,
      turnoversPerGame: 3.5,
      season: '2023-24',
      gamesPlayed: 71,
      playerEfficiencyRating: 26.1,
    },
    {
      id: 2,
      name: 'Stephen Curry',
      position: 'PG',
      team: 'GSW',
      pointsPerGame: 26.4,
      reboundsPerGame: 4.5,
      assistsPerGame: 5.1,
      stealsPerGame: 0.7,
      blocksPerGame: 0.4,
      fieldGoalPercentage: 45.0,
      threePointPercentage: 40.8,
      freeThrowPercentage: 92.3,
      turnoversPerGame: 2.8,
      season: '2023-24',
      gamesPlayed: 74,
      playerEfficiencyRating: 24.5,
    },
  ];

  it('returns players with default pagination', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(2);

    const request = new NextRequest('http://localhost:3000/api/players');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.players).toEqual(mockPlayers);
    expect(data.data.total).toBe(2);
    expect(data.data.page).toBe(1);
    expect(data.data.limit).toBe(50);

    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 50,
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });

  it('filters players by search term', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([mockPlayers[0]]);
    (prisma.player.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/players?search=LeBron');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.players).toHaveLength(1);
    expect(data.data.players[0].name).toBe('LeBron James');

    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {
        name: {
          contains: 'LeBron',
          mode: 'insensitive',
        },
      },
      skip: 0,
      take: 50,
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });

  it('filters players by position', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([mockPlayers[1]]);
    (prisma.player.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/players?position=PG');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.players).toHaveLength(1);
    expect(data.data.players[0].position).toBe('PG');

    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {
        position: 'PG',
      },
      skip: 0,
      take: 50,
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });

  it('filters players by team', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([mockPlayers[0]]);
    (prisma.player.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/players?team=LAL');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.players[0].team).toBe('LAL');

    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {
        team: 'LAL',
      },
      skip: 0,
      take: 50,
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });

  it('filters players by season', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(2);

    const request = new NextRequest('http://localhost:3000/api/players?season=2023-24');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {
        season: '2023-24',
      },
      skip: 0,
      take: 50,
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });

  it('applies pagination correctly', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(100);

    const request = new NextRequest('http://localhost:3000/api/players?page=3&limit=20');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.page).toBe(3);
    expect(data.data.limit).toBe(20);
    expect(data.data.total).toBe(100);

    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 40, // (page - 1) * limit = (3 - 1) * 20
      take: 20,
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });

  it('combines multiple filters', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([mockPlayers[1]]);
    (prisma.player.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/players?search=Curry&position=PG&team=GSW');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            name: {
              contains: 'Curry',
              mode: 'insensitive',
            },
          },
          {
            position: 'PG',
          },
          {
            team: 'GSW',
          },
        ],
      },
      skip: 0,
      take: 50,
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });

  it('handles database errors gracefully', async () => {
    const errorMessage = 'Database connection failed';
    (prisma.player.findMany as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const request = new NextRequest('http://localhost:3000/api/players');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch players');
  });

  it('returns empty array when no players match', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.player.count as jest.Mock).mockResolvedValue(0);

    const request = new NextRequest('http://localhost:3000/api/players?search=NonExistent');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.players).toEqual([]);
    expect(data.data.total).toBe(0);
  });

  it('handles invalid pagination parameters', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(2);

    const request = new NextRequest('http://localhost:3000/api/players?page=0&limit=0');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Should use default values for invalid parameters
    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 50, // Default limit
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });

  it('limits maximum page size', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue(mockPlayers);
    (prisma.player.count as jest.Mock).mockResolvedValue(2);

    const request = new NextRequest('http://localhost:3000/api/players?limit=1000');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Should cap at maximum limit (100)
    expect(prisma.player.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 100, // Maximum allowed
      orderBy: {
        playerEfficiencyRating: 'desc',
      },
    });
  });
});