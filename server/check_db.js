const { getDb } = require('./src/config/db');
const path = require('path');

async function checkMigrations() {
  const db = await getDb();
  try {
    const migrations = await db.all('SELECT filename FROM schema_migrations;');
    console.log('Applied migrations:', migrations.map(m => m.filename));
  } catch (e) {
    console.log('Error or table not found:', e.message);
  }
}

checkMigrations();
