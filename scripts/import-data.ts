/**
 * Data Import Script
 * Populates the database with sample NBA player data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const samplePlayers = [
  {
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
    imageUrl: 'https://example.com/lebron.jpg',
  },
  {
    name: 'Stephen Curry',
    position: 'PG',
    team: 'Golden State Warriors',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 29.4,
    reboundsPerGame: 6.1,
    assistsPerGame: 6.3,
    stealsPerGame: 0.9,
    blocksPerGame: 0.4,
    fieldGoalPercentage: 0.49,
    threePointPercentage: 0.42,
    freeThrowPercentage: 0.91,
    imageUrl: 'https://example.com/curry.jpg',
  },
  {
    name: 'Kevin Durant',
    position: 'PF',
    team: 'Phoenix Suns',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 29.7,
    reboundsPerGame: 6.7,
    assistsPerGame: 5.0,
    stealsPerGame: 0.7,
    blocksPerGame: 1.4,
    fieldGoalPercentage: 0.56,
    threePointPercentage: 0.40,
    freeThrowPercentage: 0.91,
    imageUrl: 'https://example.com/durant.jpg',
  },
  {
    name: 'Giannis Antetokounmpo',
    position: 'PF',
    team: 'Milwaukee Bucks',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 31.1,
    reboundsPerGame: 11.8,
    assistsPerGame: 5.7,
    stealsPerGame: 0.8,
    blocksPerGame: 0.8,
    fieldGoalPercentage: 0.55,
    threePointPercentage: 0.28,
    freeThrowPercentage: 0.65,
    imageUrl: 'https://example.com/giannis.jpg',
  },
  {
    name: 'Nikola Jokic',
    position: 'C',
    team: 'Denver Nuggets',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 24.5,
    reboundsPerGame: 11.8,
    assistsPerGame: 9.8,
    stealsPerGame: 1.3,
    blocksPerGame: 0.7,
    fieldGoalPercentage: 0.63,
    threePointPercentage: 0.38,
    freeThrowPercentage: 0.82,
    imageUrl: 'https://example.com/jokic.jpg',
  },
  {
    name: 'Luka Doncic',
    position: 'PG',
    team: 'Dallas Mavericks',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 32.4,
    reboundsPerGame: 8.6,
    assistsPerGame: 8.0,
    stealsPerGame: 1.4,
    blocksPerGame: 0.5,
    fieldGoalPercentage: 0.49,
    threePointPercentage: 0.34,
    freeThrowPercentage: 0.74,
    imageUrl: 'https://example.com/luka.jpg',
  },
  {
    name: 'Joel Embiid',
    position: 'C',
    team: 'Philadelphia 76ers',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 33.1,
    reboundsPerGame: 10.2,
    assistsPerGame: 4.2,
    stealsPerGame: 1.0,
    blocksPerGame: 1.7,
    fieldGoalPercentage: 0.55,
    threePointPercentage: 0.33,
    freeThrowPercentage: 0.85,
    imageUrl: 'https://example.com/embiid.jpg',
  },
  {
    name: 'Damian Lillard',
    position: 'PG',
    team: 'Milwaukee Bucks',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 25.1,
    reboundsPerGame: 4.1,
    assistsPerGame: 6.7,
    stealsPerGame: 0.9,
    blocksPerGame: 0.2,
    fieldGoalPercentage: 0.42,
    threePointPercentage: 0.37,
    freeThrowPercentage: 0.91,
    imageUrl: 'https://example.com/lillard.jpg',
  },
  {
    name: 'Jayson Tatum',
    position: 'SF',
    team: 'Boston Celtics',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 30.1,
    reboundsPerGame: 8.8,
    assistsPerGame: 4.6,
    stealsPerGame: 1.1,
    blocksPerGame: 0.7,
    fieldGoalPercentage: 0.46,
    threePointPercentage: 0.35,
    freeThrowPercentage: 0.85,
    imageUrl: 'https://example.com/tatum.jpg',
  },
  {
    name: 'Devin Booker',
    position: 'SG',
    team: 'Phoenix Suns',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 27.8,
    reboundsPerGame: 4.5,
    assistsPerGame: 5.5,
    stealsPerGame: 0.9,
    blocksPerGame: 0.3,
    fieldGoalPercentage: 0.49,
    threePointPercentage: 0.35,
    freeThrowPercentage: 0.85,
    imageUrl: 'https://example.com/booker.jpg',
  },
  {
    name: 'Anthony Davis',
    position: 'C',
    team: 'Los Angeles Lakers',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 25.9,
    reboundsPerGame: 12.5,
    assistsPerGame: 2.6,
    stealsPerGame: 1.1,
    blocksPerGame: 2.0,
    fieldGoalPercentage: 0.56,
    threePointPercentage: 0.25,
    freeThrowPercentage: 0.78,
    imageUrl: 'https://example.com/davis.jpg',
  },
  {
    name: 'Kawhi Leonard',
    position: 'SF',
    team: 'Los Angeles Clippers',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 23.8,
    reboundsPerGame: 6.5,
    assistsPerGame: 3.9,
    stealsPerGame: 1.4,
    blocksPerGame: 0.5,
    fieldGoalPercentage: 0.51,
    threePointPercentage: 0.41,
    freeThrowPercentage: 0.87,
    imageUrl: 'https://example.com/leonard.jpg',
  },
  {
    name: 'Paul George',
    position: 'SG',
    team: 'Los Angeles Clippers',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 23.8,
    reboundsPerGame: 6.1,
    assistsPerGame: 5.1,
    stealsPerGame: 1.5,
    blocksPerGame: 0.4,
    fieldGoalPercentage: 0.46,
    threePointPercentage: 0.37,
    freeThrowPercentage: 0.87,
    imageUrl: 'https://example.com/george.jpg',
  },
  {
    name: 'Jimmy Butler',
    position: 'SF',
    team: 'Miami Heat',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 22.9,
    reboundsPerGame: 5.9,
    assistsPerGame: 5.3,
    stealsPerGame: 1.8,
    blocksPerGame: 0.3,
    fieldGoalPercentage: 0.54,
    threePointPercentage: 0.35,
    freeThrowPercentage: 0.85,
    imageUrl: 'https://example.com/butler.jpg',
  },
  {
    name: 'Bam Adebayo',
    position: 'C',
    team: 'Miami Heat',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 20.4,
    reboundsPerGame: 9.2,
    assistsPerGame: 3.2,
    stealsPerGame: 1.2,
    blocksPerGame: 0.8,
    fieldGoalPercentage: 0.54,
    threePointPercentage: 0.08,
    freeThrowPercentage: 0.80,
    imageUrl: 'https://example.com/adebayo.jpg',
  },
  {
    name: 'Tyrese Haliburton',
    position: 'PG',
    team: 'Indiana Pacers',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 20.1,
    reboundsPerGame: 3.7,
    assistsPerGame: 10.4,
    stealsPerGame: 1.6,
    blocksPerGame: 0.4,
    fieldGoalPercentage: 0.48,
    threePointPercentage: 0.40,
    freeThrowPercentage: 0.87,
    imageUrl: 'https://example.com/haliburton.jpg',
  },
  {
    name: 'Shai Gilgeous-Alexander',
    position: 'PG',
    team: 'Oklahoma City Thunder',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 31.4,
    reboundsPerGame: 4.8,
    assistsPerGame: 5.5,
    stealsPerGame: 1.6,
    blocksPerGame: 1.0,
    fieldGoalPercentage: 0.51,
    threePointPercentage: 0.35,
    freeThrowPercentage: 0.91,
    imageUrl: 'https://example.com/sga.jpg',
  },
  {
    name: 'Ja Morant',
    position: 'PG',
    team: 'Memphis Grizzlies',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 25.8,
    reboundsPerGame: 5.8,
    assistsPerGame: 8.1,
    stealsPerGame: 1.1,
    blocksPerGame: 0.3,
    fieldGoalPercentage: 0.46,
    threePointPercentage: 0.30,
    freeThrowPercentage: 0.74,
    imageUrl: 'https://example.com/morant.jpg',
  },
  {
    name: 'Zion Williamson',
    position: 'PF',
    team: 'New Orleans Pelicans',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 25.8,
    reboundsPerGame: 7.0,
    assistsPerGame: 3.6,
    stealsPerGame: 0.9,
    blocksPerGame: 0.6,
    fieldGoalPercentage: 0.61,
    threePointPercentage: 0.36,
    freeThrowPercentage: 0.71,
    imageUrl: 'https://example.com/zion.jpg',
  },
  {
    name: 'Trae Young',
    position: 'PG',
    team: 'Atlanta Hawks',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 26.2,
    reboundsPerGame: 3.0,
    assistsPerGame: 10.2,
    stealsPerGame: 1.1,
    blocksPerGame: 0.1,
    fieldGoalPercentage: 0.43,
    threePointPercentage: 0.34,
    freeThrowPercentage: 0.88,
    imageUrl: 'https://example.com/young.jpg',
  },
];

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

    console.log(`Successfully imported ${createdPlayers.count} players`);

    // Verify the import
    const playerCount = await prisma.player.count();
    console.log(`Total players in database: ${playerCount}`);

    // Show some sample data
    const sampleData = await prisma.player.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        position: true,
        team: true,
        pointsPerGame: true,
      },
    });

    console.log('\nSample imported data:');
    sampleData.forEach(player => {
      console.log(`${player.name} (${player.position}) - ${player.team} - ${player.pointsPerGame} PPG`);
    });

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
