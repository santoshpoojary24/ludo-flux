require('dotenv').config({path:'./.env'});
const {Pool} = require('pg');
const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}});

pool.query("INSERT INTO friends (user_uid, friend_uid) VALUES ('ADMIN', 'FLUX-NTSAHE') ON CONFLICT DO NOTHING")
  .then(res => {
    console.log("INSERT SUCCESS");
    pool.end();
  })
  .catch(err => {
    console.error("INSERT ERROR", err.message);
    pool.end();
  });
