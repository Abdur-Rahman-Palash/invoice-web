const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Poa0A7pcMbrQ@ep-calm-fire-atawpmol.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full'
});

module.exports = pool;
