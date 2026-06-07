const url = "https://gwuikypvutxlssfvurya.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dWlreXB2dXR4bHNzZnZ1cnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA3MDYsImV4cCI6MjA5NjMwNjcwNn0.kBaxXy6ioM8djUiXseoTB5bOc1iW3dR5uqBMhUfwtTs";

async function queryTable(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  if (res.status === 401 || res.status === 403) {
    console.log(`\n=== TABLE: ${table} === [Forbidden/Unauthorized - status ${res.status}]`);
    return;
  }
  const json = await res.json();
  console.log(`\n=== TABLE: ${table} ===`);
  console.log(JSON.stringify(json, null, 2));
}

async function run() {
  await queryTable("profiles");
  await queryTable("donor_details");
  await queryTable("donation_history");
  await queryTable("screenings");
  await queryTable("matches");
}

run().catch(console.error);
