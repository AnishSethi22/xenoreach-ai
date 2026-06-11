async function test() {
  const health = await fetch('http://localhost:4000/health').then(r => r.json());
  console.log('GET /health =>', JSON.stringify(health, null, 2));

  const customers = await fetch('http://localhost:4000/api/v1/customers').then(r => r.json());
  console.log('GET /api/v1/customers =>', JSON.stringify({ ...customers, data: { ...customers.data, data: "Array[" + (customers.data?.data?.length || 0) + "]" } }, null, 2));

  const campaigns = await fetch('http://localhost:4000/api/v1/campaigns').then(r => r.json());
  console.log('GET /api/v1/campaigns =>', JSON.stringify({ ...campaigns, data: { ...campaigns.data, data: "Array[" + (campaigns.data?.data?.length || 0) + "]" } }, null, 2));

  const analytics = await fetch('http://localhost:4000/api/v1/analytics/overview').then(r => r.json());
  console.log('GET /api/v1/analytics/overview =>', JSON.stringify(analytics, null, 2));
}

test().catch(console.error);
