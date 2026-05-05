require('dotenv').config({path:'./.env'});
const {Pool} = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}});

pool.query("INSERT INTO user_badges (user_uid, badge_key, progress, is_pinned) VALUES ('a', 'b', 0, 0) ON CONFLICT DO NOTHING")
  .then(res => {
    console.log("INSERT SUCCESS");
    pool.end();
  })
  .catch(err => {
    console.error("INSERT ERROR", err.message);
    pool.end();
  });
