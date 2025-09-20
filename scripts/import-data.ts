/**
 * Data Import Script
 * Populates the database with sample NBA player data across multiple seasons
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate player stats for different years
function generatePlayerStats(baseStats: BasePlayer['baseStats'], year: number, variation: number = 0.1) {
  return {
    ...baseStats,
    season: year,
    pointsPerGame: baseStats.pointsPerGame * (1 + (Math.random() - 0.5) * variation),
    reboundsPerGame: baseStats.reboundsPerGame * (1 + (Math.random() - 0.5) * variation),
    assistsPerGame: baseStats.assistsPerGame * (1 + (Math.random() - 0.5) * variation),
    stealsPerGame: baseStats.stealsPerGame * (1 + (Math.random() - 0.5) * variation),
    blocksPerGame: baseStats.blocksPerGame * (1 + (Math.random() - 0.5) * variation),
    fieldGoalPercentage: Math.max(0.3, Math.min(0.7, baseStats.fieldGoalPercentage * (1 + (Math.random() - 0.5) * variation))),
    threePointPercentage: Math.max(0.2, Math.min(0.5, baseStats.threePointPercentage * (1 + (Math.random() - 0.5) * variation))),
    freeThrowPercentage: Math.max(0.6, Math.min(0.95, baseStats.freeThrowPercentage * (1 + (Math.random() - 0.5) * variation))),
    gamesPlayed: Math.floor(baseStats.gamesPlayed * (0.8 + Math.random() * 0.4)), // 60-100 games
  };
}

// Define the base player type
interface BasePlayer {
  name: string;
  position: string;
  team: string;
  peakYear: number;
  baseStats: {
    pointsPerGame: number;
    reboundsPerGame: number;
    assistsPerGame: number;
    stealsPerGame: number;
    blocksPerGame: number;
    fieldGoalPercentage: number;
    threePointPercentage: number;
    freeThrowPercentage: number;
    gamesPlayed: number;
  };
}

// Base player data with their peak years
const basePlayers: BasePlayer[] = [
  {
    name: 'LeBron James',
    position: 'SF',
    team: 'Los Angeles Lakers',
    peakYear: 2013,
    baseStats: {
      pointsPerGame: 25.0,
      reboundsPerGame: 7.5,
      assistsPerGame: 8.0,
      stealsPerGame: 1.2,
      blocksPerGame: 0.6,
      fieldGoalPercentage: 0.52,
      threePointPercentage: 0.35,
      freeThrowPercentage: 0.85,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Stephen Curry',
    position: 'PG',
    team: 'Golden State Warriors',
    peakYear: 2016,
    baseStats: {
      pointsPerGame: 29.4,
      reboundsPerGame: 6.1,
      assistsPerGame: 6.3,
      stealsPerGame: 0.9,
      blocksPerGame: 0.4,
      fieldGoalPercentage: 0.49,
      threePointPercentage: 0.42,
      freeThrowPercentage: 0.91,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Kevin Durant',
    position: 'PF',
    team: 'Phoenix Suns',
    peakYear: 2014,
    baseStats: {
      pointsPerGame: 29.7,
      reboundsPerGame: 6.7,
      assistsPerGame: 5.0,
      stealsPerGame: 0.7,
      blocksPerGame: 1.4,
      fieldGoalPercentage: 0.56,
      threePointPercentage: 0.40,
      freeThrowPercentage: 0.91,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Giannis Antetokounmpo',
    position: 'PF',
    team: 'Milwaukee Bucks',
    peakYear: 2020,
    baseStats: {
      pointsPerGame: 31.1,
      reboundsPerGame: 11.8,
      assistsPerGame: 5.7,
      stealsPerGame: 0.8,
      blocksPerGame: 0.8,
      fieldGoalPercentage: 0.55,
      threePointPercentage: 0.28,
      freeThrowPercentage: 0.65,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Nikola Jokic',
    position: 'C',
    team: 'Denver Nuggets',
    peakYear: 2022,
    baseStats: {
      pointsPerGame: 24.5,
      reboundsPerGame: 11.8,
      assistsPerGame: 9.8,
      stealsPerGame: 1.3,
      blocksPerGame: 0.7,
      fieldGoalPercentage: 0.63,
      threePointPercentage: 0.38,
      freeThrowPercentage: 0.82,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Luka Doncic',
    position: 'PG',
    team: 'Dallas Mavericks',
    peakYear: 2023,
    baseStats: {
      pointsPerGame: 32.4,
      reboundsPerGame: 8.6,
      assistsPerGame: 8.0,
      stealsPerGame: 1.4,
      blocksPerGame: 0.5,
      fieldGoalPercentage: 0.49,
      threePointPercentage: 0.34,
      freeThrowPercentage: 0.74,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Joel Embiid',
    position: 'C',
    team: 'Philadelphia 76ers',
    peakYear: 2023,
    baseStats: {
      pointsPerGame: 33.1,
      reboundsPerGame: 10.2,
      assistsPerGame: 4.2,
      stealsPerGame: 1.0,
      blocksPerGame: 1.7,
      fieldGoalPercentage: 0.55,
      threePointPercentage: 0.33,
      freeThrowPercentage: 0.85,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Damian Lillard',
    position: 'PG',
    team: 'Milwaukee Bucks',
    peakYear: 2020,
    baseStats: {
      pointsPerGame: 25.1,
      reboundsPerGame: 4.1,
      assistsPerGame: 6.7,
      stealsPerGame: 0.9,
      blocksPerGame: 0.2,
      fieldGoalPercentage: 0.42,
      threePointPercentage: 0.37,
      freeThrowPercentage: 0.91,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Jayson Tatum',
    position: 'SF',
    team: 'Boston Celtics',
    peakYear: 2023,
    baseStats: {
      pointsPerGame: 30.1,
      reboundsPerGame: 8.8,
      assistsPerGame: 4.6,
      stealsPerGame: 1.1,
      blocksPerGame: 0.7,
      fieldGoalPercentage: 0.46,
      threePointPercentage: 0.35,
      freeThrowPercentage: 0.85,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Devin Booker',
    position: 'SG',
    team: 'Phoenix Suns',
    peakYear: 2022,
    baseStats: {
      pointsPerGame: 27.8,
      reboundsPerGame: 4.5,
      assistsPerGame: 5.5,
      stealsPerGame: 0.9,
      blocksPerGame: 0.3,
      fieldGoalPercentage: 0.49,
      threePointPercentage: 0.35,
      freeThrowPercentage: 0.85,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Anthony Davis',
    position: 'C',
    team: 'Los Angeles Lakers',
    peakYear: 2018,
    baseStats: {
      pointsPerGame: 25.9,
      reboundsPerGame: 12.5,
      assistsPerGame: 2.6,
      stealsPerGame: 1.1,
      blocksPerGame: 2.0,
      fieldGoalPercentage: 0.56,
      threePointPercentage: 0.25,
      freeThrowPercentage: 0.78,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Kawhi Leonard',
    position: 'SF',
    team: 'Los Angeles Clippers',
    peakYear: 2017,
    baseStats: {
      pointsPerGame: 23.8,
      reboundsPerGame: 6.5,
      assistsPerGame: 3.9,
      stealsPerGame: 1.4,
      blocksPerGame: 0.5,
      fieldGoalPercentage: 0.51,
      threePointPercentage: 0.41,
      freeThrowPercentage: 0.87,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Paul George',
    position: 'SG',
    team: 'Los Angeles Clippers',
    peakYear: 2019,
    baseStats: {
      pointsPerGame: 23.8,
      reboundsPerGame: 6.1,
      assistsPerGame: 5.1,
      stealsPerGame: 1.5,
      blocksPerGame: 0.4,
      fieldGoalPercentage: 0.46,
      threePointPercentage: 0.37,
      freeThrowPercentage: 0.87,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Jimmy Butler',
    position: 'SF',
    team: 'Miami Heat',
    peakYear: 2020,
    baseStats: {
      pointsPerGame: 22.9,
      reboundsPerGame: 5.9,
      assistsPerGame: 5.3,
      stealsPerGame: 1.8,
      blocksPerGame: 0.3,
      fieldGoalPercentage: 0.54,
      threePointPercentage: 0.35,
      freeThrowPercentage: 0.85,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Bam Adebayo',
    position: 'C',
    team: 'Miami Heat',
    peakYear: 2022,
    baseStats: {
      pointsPerGame: 20.4,
      reboundsPerGame: 9.2,
      assistsPerGame: 3.2,
      stealsPerGame: 1.2,
      blocksPerGame: 0.8,
      fieldGoalPercentage: 0.54,
      threePointPercentage: 0.08,
      freeThrowPercentage: 0.80,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Tyrese Haliburton',
    position: 'PG',
    team: 'Indiana Pacers',
    peakYear: 2023,
    baseStats: {
      pointsPerGame: 20.1,
      reboundsPerGame: 3.7,
      assistsPerGame: 10.4,
      stealsPerGame: 1.6,
      blocksPerGame: 0.4,
      fieldGoalPercentage: 0.48,
      threePointPercentage: 0.40,
      freeThrowPercentage: 0.87,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Shai Gilgeous-Alexander',
    position: 'PG',
    team: 'Oklahoma City Thunder',
    peakYear: 2023,
    baseStats: {
      pointsPerGame: 31.4,
      reboundsPerGame: 4.8,
      assistsPerGame: 5.5,
      stealsPerGame: 1.6,
      blocksPerGame: 1.0,
      fieldGoalPercentage: 0.51,
      threePointPercentage: 0.35,
      freeThrowPercentage: 0.91,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Ja Morant',
    position: 'PG',
    team: 'Memphis Grizzlies',
    peakYear: 2022,
    baseStats: {
      pointsPerGame: 25.8,
      reboundsPerGame: 5.8,
      assistsPerGame: 8.1,
      stealsPerGame: 1.1,
      blocksPerGame: 0.3,
      fieldGoalPercentage: 0.46,
      threePointPercentage: 0.30,
      freeThrowPercentage: 0.74,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Zion Williamson',
    position: 'PF',
    team: 'New Orleans Pelicans',
    peakYear: 2021,
    baseStats: {
      pointsPerGame: 25.8,
      reboundsPerGame: 7.0,
      assistsPerGame: 3.6,
      stealsPerGame: 0.9,
      blocksPerGame: 0.6,
      fieldGoalPercentage: 0.61,
      threePointPercentage: 0.36,
      freeThrowPercentage: 0.71,
      gamesPlayed: 82,
    }
  },
  {
    name: 'Trae Young',
    position: 'PG',
    team: 'Atlanta Hawks',
    peakYear: 2022,
    baseStats: {
      pointsPerGame: 26.2,
      reboundsPerGame: 3.0,
      assistsPerGame: 10.2,
      stealsPerGame: 1.1,
      blocksPerGame: 0.1,
      fieldGoalPercentage: 0.43,
      threePointPercentage: 0.34,
      freeThrowPercentage: 0.88,
      gamesPlayed: 82,
    }
  },
];

// Generate multi-year data for each player
const samplePlayers: Prisma.PlayerCreateManyInput[] = [];

basePlayers.forEach((player: BasePlayer) => {
  // Generate data for 5 years around their peak
  const startYear = player.peakYear - 2;
  const endYear = player.peakYear + 2;
  
  for (let year = startYear; year <= endYear; year++) {
    if (year >= 2015 && year <= 2024) { // Reasonable year range
      const stats = generatePlayerStats(player.baseStats, year);
      
      // Boost stats in peak year
      if (year === player.peakYear) {
        stats.pointsPerGame *= 1.1;
        stats.reboundsPerGame *= 1.05;
        stats.assistsPerGame *= 1.05;
      }
      
      samplePlayers.push({
        name: player.name,
        position: player.position,
        team: player.team,
        imageUrl: null, // Will be fetched dynamically
        ...stats
      });
    }
  }
});

async function importData() {
  try {
    console.log('Starting data import...');

    // Clear existing data
    await prisma.player.deleteMany();
    console.log('Cleared existing player data');

    // Import sample players
    const createdPlayers = await prisma.player.createMany({
      data: samplePlayers,
    });

    console.log(`Successfully imported ${createdPlayers.count} player seasons`);

    // Verify the import
    const playerCount = await prisma.player.count();
    console.log(`Total player seasons in database: ${playerCount}`);

    // Show some sample data
    const sampleData = await prisma.player.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        position: true,
        team: true,
        season: true,
        pointsPerGame: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('\nSample imported data:');
    sampleData.forEach(player => {
      console.log(`${player.name} (${player.position}) - ${player.team} - ${player.season} - ${player.pointsPerGame} PPG`);
    });

    // Show players with multiple seasons
    const playersWithMultipleSeasons = await prisma.player.groupBy({
      by: ['name'],
      _count: {
        season: true
      },
      having: {
        season: {
          _count: {
            gt: 1
          }
        }
      }
    });

    console.log(`\nPlayers with multiple seasons: ${playersWithMultipleSeasons.length}`);

  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importData()
  .then(() => {
    console.log('\nData import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Data import failed:', error);
    process.exit(1);
  });
