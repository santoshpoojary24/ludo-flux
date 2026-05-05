const { Pool } = require('pg');
require('dotenv').config();

let poolInstance = null;
let dbInstance = null;

// Helper to convert SQLite ? to Postgres $1, $2, etc.
const convertParams = (sql) => {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
};

const getDb = async () => {
    if (dbInstance) return dbInstance;

    if (!poolInstance) {
      poolInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
    }

    dbInstance = {
      get: async (sql, params = []) => {
        const res = await poolInstance.query(convertParams(sql), params);
        return res.rows[0];
      },
      all: async (sql, params = []) => {
        const res = await poolInstance.query(convertParams(sql), params);
        return res.rows;
      },
      run: async (sql, params = []) => {
        let pgSql = convertParams(sql);
        let isInsert = false;
        if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
          isInsert = true;
          if (!pgSql.toUpperCase().includes('RETURNING')) {
             pgSql = pgSql + ' RETURNING id';
          }
        }
        const res = await poolInstance.query(pgSql, params);
        return {
          lastID: isInsert && res.rows.length > 0 ? res.rows[0].id : null,
          changes: res.rowCount
        };
      },
      exec: async (sql) => {
        // exec is usually for raw queries without params
        return await poolInstance.query(sql);
      }
    };
    
    return dbInstance;
};

module.exports = {
  getDb
};
