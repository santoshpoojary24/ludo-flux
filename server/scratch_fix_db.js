const { getDb } = require('./src/config/db');

async function fix() {
  try {
    const db = await getDb();
    console.log('Checking match_history columns...');
    const columns = await db.all('PRAGMA table_info(match_history)');
    const hasWinner = columns.some(c => c.name === 'winner');
    
    if (!hasWinner) {
      console.log('Adding winner column...');
      await db.exec('ALTER TABLE match_history ADD COLUMN winner TEXT');
    } else {
      console.log('Winner column already exists.');
    }

    const hasPlayersJson = columns.some(c => c.name === 'players_json');
    if (!hasPlayersJson) {
      console.log('Adding players_json column...');
      await db.exec('ALTER TABLE match_history ADD COLUMN players_json TEXT DEFAULT "[]"');
    }

    console.log('Database fix complete.');
    process.exit(0);
  } catch (err) {
    console.error('Fix failed:', err);
    process.exit(1);
  }
}

fix();
