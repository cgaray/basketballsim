/**
 * Script to add sample player image URLs to the database
 * Uses Wikipedia/Wikimedia Commons images where available
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample mapping of player names to Wikipedia image URLs
// These are placeholders - in production, you'd want to verify licensing
const playerImageMapping = {
  'LeBron James': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/220px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg',
  'Stephen Curry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Stephen_Curry_Shooting_%28cropped%29.jpg/220px-Stephen_Curry_Shooting_%28cropped%29.jpg',
  'Kevin Durant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Kevin_Durant_%28Wizards_v._Nets%2C_1-16-2022%29_%28cropped%29_%28cropped%29.jpg/220px-Kevin_Durant_%28Wizards_v._Nets%2C_1-16-2022%29_%28cropped%29_%28cropped%29.jpg',
  'Giannis Antetokounmpo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Giannis_Antetokounmpo_%28cropped%29.jpg/220px-Giannis_Antetokounmpo_%28cropped%29.jpg',
  'Joel Embiid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Joel_Embiid_%28cropped%29.jpg/220px-Joel_Embiid_%28cropped%29.jpg',
  'Luka Dončić': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Luka_Doncic_%28cropped%29.jpg/220px-Luka_Doncic_%28cropped%29.jpg',
  'Kawhi Leonard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Kawhi_Leonard_2019_%28cropped%29.jpg/220px-Kawhi_Leonard_2019_%28cropped%29.jpg',
  'James Harden': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/James_Harden_1.jpg/220px-James_Harden_1.jpg',
  'Damian Lillard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Damian_Lillard_2022.jpg/220px-Damian_Lillard_2022.jpg',
  'Anthony Davis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Anthony_Davis_pre-game_%28cropped%29.jpg/220px-Anthony_Davis_pre-game_%28cropped%29.jpg',
  'Jayson Tatum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Jayson_Tatum_%2852074053865%29_%28cropped%29.jpg/220px-Jayson_Tatum_%2852074053865%29_%28cropped%29.jpg',
  'Devin Booker': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Devin_Booker_2022.jpg/220px-Devin_Booker_2022.jpg',
  'Nikola Jokić': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Nikola_Joki%C4%87_%282018_cropped%29.jpg/220px-Nikola_Joki%C4%87_%282018_cropped%29.jpg',
  'Paul George': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Paul_George_%28cropped%29.jpg/220px-Paul_George_%28cropped%29.jpg',
  'Jimmy Butler': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Jimmy_Butler_%28cropped%29.jpg/220px-Jimmy_Butler_%28cropped%29.jpg'
};

async function addSampleImages() {
  try {
    console.log('Adding sample player images...');

    for (const [playerName, imageUrl] of Object.entries(playerImageMapping)) {
      // Update all records with this player name (might have multiple seasons)
      const result = await prisma.player.updateMany({
        where: {
          name: {
            contains: playerName
          }
        },
        data: {
          imageUrl: imageUrl
        }
      });

      if (result.count > 0) {
        console.log(`✓ Updated ${result.count} record(s) for ${playerName}`);
      } else {
        console.log(`✗ No records found for ${playerName}`);
      }
    }

    console.log('\nSample images added successfully!');
    console.log('Note: These are demonstration images from Wikipedia.');
    console.log('For production use, ensure proper image licensing and attribution.');
  } catch (error) {
    console.error('Error adding sample images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleImages();