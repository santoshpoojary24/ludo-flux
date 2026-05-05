const fs = require('fs/promises');
const path = require('path');
const { getDb } = require('../config/db');

const MIGRATIONS_DIR = path.join(__dirname, '../../db/migrations');

const migrate = async () => {
  try {
    console.log('Running SQLite migrations...');
    const db = await getDb();

    await db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter((filename) => filename.endsWith('.sql'))
      .sort();

    for (const filename of files) {
      const existing = await db.get(
        'SELECT filename FROM schema_migrations WHERE filename = ?',
        [filename]
      );

      if (existing) {
        continue;
      }

      const fullPath = path.join(MIGRATIONS_DIR, filename);
      const sql = await fs.readFile(fullPath, 'utf8');

      await db.exec('BEGIN');
      try {
        await db.exec(sql);
        await db.run(
          'INSERT INTO schema_migrations (filename) VALUES (?)',
          [filename]
        );
        await db.exec('COMMIT');
        console.log(`Applied migration: ${filename}`);
      } catch (error) {
        await db.exec('ROLLBACK');
        throw error;
      }
    }

    console.log('SQLite migrations completed successfully.');
  } catch (err) {
    console.error('Error running migrations:', err);
    throw err;
  }
};

module.exports = migrate;
