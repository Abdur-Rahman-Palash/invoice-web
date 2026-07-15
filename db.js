const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Poa0A7pcMbrQ@ep-calm-fire-atawpmol-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

module.exports = pool;
