require('dotenv').config({path:'./.env'});
const {Pool} = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}});

pool.query(`
SELECT
    u.uid,
    u.username,
    u.elo,
    (SELECT COUNT(*) FROM match_history WHERE winner_uid = u.uid) AS wins,
    (SELECT COUNT(*) FROM match_history WHERE players_json LIKE '%' || u.uid || '%') AS total_matches
FROM users u
WHERE u.deactivated_at IS NULL AND u.account_type != 'guest'
ORDER BY u.elo DESC, wins DESC
LIMIT 50
`)
  .then(res => {
    console.log("LEADERBOARD:", res.rows);
    pool.end();
  })
  .catch(console.error);
