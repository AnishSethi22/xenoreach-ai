const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_2jpBqVFwcY0D@ep-crimson-violet-aqm73kvw.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require' });

async function getCounts() {
  await client.connect();
  const tables = ['customers', 'orders', 'campaigns', 'communication_events'];
  for (const t of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
    console.log(`${t}: ${res.rows[0].count}`);
  }
  await client.end();
}

getCounts().catch(console.error);
