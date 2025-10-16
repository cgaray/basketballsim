/**
 * Tests for Matches API route
 */

import { GET, POST } from '../route';
import { prisma } from '@/lib/database/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
  prisma: {
    match: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Matches API Routes', () => {
  const mockMatches = [
    {
      id: 1,
      team1Id: 1,
      team2Id: 2,
      team1Score: 108,
      team2Score: 102,
      winnerId: 1,
      playByPlay: JSON.stringify([
        { quarter: 1, team1Score: 27, team2Score: 25 },
        { quarter: 2, team1Score: 26, team2Score: 28 },
      ]),
      createdAt: new Date('2023-01-01'),
    },
    {
      id: 2,
      team1Id: 2,
      team2Id: 3,
      team1Score: 95,
      team2Score: 98,
      winnerId: 3,
      playByPlay: null,
      createdAt: new Date('2023-01-02'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/matches', () => {
    it('returns all matches', async () => {
      (prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost:3000/api/matches');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].team1Score).toBe(108);
    });

    it('filters matches by team1Id', async () => {
      const filteredMatches = [mockMatches[0]];
      (prisma.match.findMany as jest.Mock).mockResolvedValue(filteredMatches);

      const request = new NextRequest('http://localhost:3000/api/matches?team1Id=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(prisma.match.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { team1Id: 1 },
            { team2Id: 1 },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
    });

    it('filters matches by team2Id', async () => {
      const filteredMatches = [mockMatches[0]];
      (prisma.match.findMany as jest.Mock).mockResolvedValue(filteredMatches);

      const request = new NextRequest('http://localhost:3000/api/matches?team2Id=2');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(prisma.match.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { team1Id: 2 },
            { team2Id: 2 },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
    });

    it('filters matches by both teams', async () => {
      const filteredMatches = [mockMatches[0]];
      (prisma.match.findMany as jest.Mock).mockResolvedValue(filteredMatches);

      const request = new NextRequest('http://localhost:3000/api/matches?team1Id=1&team2Id=2');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.match.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { AND: [{ team1Id: 1 }, { team2Id: 2 }] },
            { AND: [{ team1Id: 2 }, { team2Id: 1 }] },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
    });

    it('applies limit parameter', async () => {
      (prisma.match.findMany as jest.Mock).mockResolvedValue([mockMatches[0]]);

      const request = new NextRequest('http://localhost:3000/api/matches?limit=5');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.match.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    });

    it('orders results by creation date descending', async () => {
      (prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches);

      const request = new NextRequest('http://localhost:3000/api/matches');
      await GET(request);

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('handles database errors gracefully', async () => {
      (prisma.match.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/matches');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch matches');
    });

    it('returns empty array when no matches found', async () => {
      (prisma.match.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/matches?team1Id=999');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('POST /api/matches', () => {
    const validMatchData = {
      team1Id: 1,
      team2Id: 2,
      team1Score: 108,
      team2Score: 102,
      winnerId: 1,
      playByPlay: JSON.stringify([
        { quarter: 1, team1Score: 27, team2Score: 25 },
      ]),
    };

    it('creates a new match successfully', async () => {
      const createdMatch = {
        id: 3,
        ...validMatchData,
        createdAt: new Date(),
      };

      (prisma.match.create as jest.Mock).mockResolvedValue(createdMatch);

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(validMatchData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.team1Score).toBe(108);
      expect(data.team2Score).toBe(102);
      expect(prisma.match.create).toHaveBeenCalledWith({
        data: {
          team1Id: 1,
          team2Id: 2,
          team1Score: 108,
          team2Score: 102,
          winnerId: 1,
          playByPlay: validMatchData.playByPlay,
        },
      });
    });

    it('validates required field - team1Id', async () => {
      const invalidData = {
        team2Id: 2,
        team1Score: 100,
        team2Score: 95,
      };

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('validates required field - team2Id', async () => {
      const invalidData = {
        team1Id: 1,
        team1Score: 100,
        team2Score: 95,
      };

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('validates required field - team1Score', async () => {
      const invalidData = {
        team1Id: 1,
        team2Id: 2,
        team2Score: 95,
      };

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('validates required field - team2Score', async () => {
      const invalidData = {
        team1Id: 1,
        team2Id: 2,
        team1Score: 100,
      };

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('allows score of 0', async () => {
      const dataWithZeroScore = {
        team1Id: 1,
        team2Id: 2,
        team1Score: 0,
        team2Score: 0,
      };

      const createdMatch = {
        id: 3,
        ...dataWithZeroScore,
        winnerId: null,
        playByPlay: null,
        createdAt: new Date(),
      };

      (prisma.match.create as jest.Mock).mockResolvedValue(createdMatch);

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(dataWithZeroScore),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.team1Score).toBe(0);
      expect(data.team2Score).toBe(0);
    });

    it('allows creating match without winnerId', async () => {
      const dataWithoutWinner = {
        team1Id: 1,
        team2Id: 2,
        team1Score: 100,
        team2Score: 100,
      };

      const createdMatch = {
        id: 3,
        ...dataWithoutWinner,
        winnerId: null,
        playByPlay: null,
        createdAt: new Date(),
      };

      (prisma.match.create as jest.Mock).mockResolvedValue(createdMatch);

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(dataWithoutWinner),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
    });

    it('allows creating match without playByPlay', async () => {
      const dataWithoutPlayByPlay = {
        team1Id: 1,
        team2Id: 2,
        team1Score: 100,
        team2Score: 95,
        winnerId: 1,
      };

      const createdMatch = {
        id: 3,
        ...dataWithoutPlayByPlay,
        playByPlay: null,
        createdAt: new Date(),
      };

      (prisma.match.create as jest.Mock).mockResolvedValue(createdMatch);

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(dataWithoutPlayByPlay),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(prisma.match.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          playByPlay: null,
        }),
      });
    });

    it('handles database errors during creation', async () => {
      (prisma.match.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(validMatchData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create match');
    });

    it('handles malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create match');
    });
  });
});
