
import { GET } from './route';
import { prisma } from '@/lib/database/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
jest.mock('@/lib/database/prisma', () => ({
    prisma: {
        match: {
            findMany: jest.fn(),
        },
    },
}));

describe('GET /api/teams/[id]/stats', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns correct stats for a team', async () => {
        const mockMatches = [
            {
                id: 1,
                team1Id: 1,
                team2Id: 2,
                team1Score: 100,
                team2Score: 90,
                winnerId: 1,
                createdAt: new Date(),
            },
            {
                id: 2,
                team1Id: 2,
                team2Id: 1,
                team1Score: 80,
                team2Score: 85,
                winnerId: 1,
                createdAt: new Date(),
            },
            {
                id: 3,
                team1Id: 1,
                team2Id: 3,
                team1Score: 95,
                team2Score: 105,
                winnerId: 3,
                createdAt: new Date(),
            },
        ];

        (prisma.match.findMany as jest.Mock).mockResolvedValue(mockMatches);

        const request = new NextRequest('http://localhost:3000/api/teams/1/stats');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.totalGames).toBe(3);
        expect(data.data.wins).toBe(2); // Won match 1 and 2
        expect(data.data.losses).toBe(1); // Lost match 3

        // Points calculation
        // Match 1: Scored 100, Allowed 90
        // Match 2: Scored 85 (as team 2), Allowed 80
        // Match 3: Scored 95, Allowed 105
        // Total Scored: 100 + 85 + 95 = 280
        // Total Allowed: 90 + 80 + 105 = 275
        // Avg Scored: 280 / 3 = 93.33
        // Avg Allowed: 275 / 3 = 91.66

        expect(data.data.avgPointsScored).toBeCloseTo(93.33, 1);
        expect(data.data.avgPointsAllowed).toBeCloseTo(91.67, 1);
    });

    it('handles invalid team ID', async () => {
        const request = new NextRequest('http://localhost:3000/api/teams/invalid/stats');
        const params = Promise.resolve({ id: 'invalid' });
        const response = await GET(request, { params });

        expect(response.status).toBe(400);
    });

    it('handles empty match history', async () => {
        (prisma.match.findMany as jest.Mock).mockResolvedValue([]);

        const request = new NextRequest('http://localhost:3000/api/teams/1/stats');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const data = await response.json();

        expect(data.data.totalGames).toBe(0);
        expect(data.data.wins).toBe(0);
        expect(data.data.winPercentage).toBe(0);
    });
});
