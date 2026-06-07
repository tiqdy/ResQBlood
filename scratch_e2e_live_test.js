const url = "https://gwuikypvutxlssfvurya.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dWlreXB2dXR4bHNzZnZ1cnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzA3MDYsImV4cCI6MjA5NjMwNjcwNn0.kBaxXy6ioM8djUiXseoTB5bOc1iW3dR5uqBMhUfwtTs";

async function post(path, body, token) {
  const headers = {
    "apikey": anonKey,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${url}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }
  return res.status === 204 ? null : await res.json();
}

async function get(path, token) {
  const headers = {
    "apikey": anonKey,
    "Authorization": `Bearer ${token}`
  };
  const res = await fetch(`${url}${path}`, {
    headers
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed (${res.status}): ${text}`);
  }
  return await res.json();
}

async function patch(path, body, token) {
  const headers = {
    "apikey": anonKey,
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "Prefer": "return=representation"
  };
  const res = await fetch(`${url}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${path} failed (${res.status}): ${text}`);
  }
  return await res.json();
}

async function registerUser(email, password, role) {
  console.log(`Registering ${role}: ${email}`);
  const body = {
    email,
    password,
    data: { role }
  };
  const res = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "apikey": anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Auth signup failed: ${JSON.stringify(json)}`);
  }
  return json;
}

async function run() {
  const suffix = Math.random().toString(36).substr(2, 5);
  const donorEmail = `donor_${suffix}@test.com`;
  const requesterEmail = `req_${suffix}@test.com`;
  const pmiEmail = `pmi_${suffix}@test.com`;
  const password = "password123";

  // 1. Sign up users
  const donorRes = await registerUser(donorEmail, password, "donor");
  const reqRes = await registerUser(requesterEmail, password, "requester");
  const pmiRes = await registerUser(pmiEmail, password, "pmi");

  const donorToken = donorRes.access_token;
  const reqToken = reqRes.access_token;
  const pmiToken = pmiRes.access_token;

  const donorId = donorRes.user.id;
  const reqId = reqRes.user.id;
  const pmiId = pmiRes.user.id;

  console.log("Users registered successfully!");

  // Complete profile setups
  await patch(`/rest/v1/profiles?id=eq.${donorId}`, {
    full_name: "Test Donor",
    blood_type: "O+",
    city: "Jakarta",
    province: "D.K.I. Jakarta",
    is_profile_complete: true
  }, donorToken);

  await post(`/rest/v1/donor_details`, {
    id: donorId,
    age: 25,
    weight: 60,
    is_available: true
  }, donorToken);

  await patch(`/rest/v1/profiles?id=eq.${reqId}`, {
    full_name: "Test Requester",
    blood_type: "O+",
    city: "Jakarta",
    province: "D.K.I. Jakarta",
    is_profile_complete: true
  }, reqToken);

  await patch(`/rest/v1/profiles?id=eq.${pmiId}`, {
    full_name: "Test PMI",
    city: "Jakarta",
    province: "D.K.I. Jakarta",
    is_profile_complete: true
  }, pmiToken);

  console.log("Profiles complete!");

  // 2. Requester creates request
  const [request] = await post("/rest/v1/blood_requests?select=*", {
    requester_id: reqId,
    patient_name: "Patient Test",
    blood_type: "O+",
    bags_needed: 1,
    urgency: "critical",
    hospital_name: "Test Hospital",
    pmi_branch: "Jakarta Pusat Branch",
    city: "Jakarta",
    province: "D.K.I. Jakarta"
  }, reqToken);

  console.log("Request created:", request.id);

  // 3. Donor volunteers (creates match)
  const [match] = await post("/rest/v1/matches?select=*", {
    request_id: request.id,
    donor_id: donorId,
    status: "pending"
  }, donorToken);

  console.log("Match created:", match.id);

  // 4. PMI submits passed screening
  console.log("Submitting screening from PMI...");
  const screeningResultsObj = {
    syphilis: 'non-reactive',
    hbv: 'non-reactive',
    hiv: 'non-reactive',
    hcv: 'non-reactive',
    hev: 'non-reactive',
    htlv: 'non-reactive',
    hav: 'non-reactive',
    parvovirus: 'non-reactive',
    malaria: 'not-tested',
    t_cruzi: 'not-tested',
    wnv: 'not-tested',
    cmv: 'not-tested',
    admin_notes: 'Passed'
  };

  try {
    const screening = await post("/rest/v1/screenings?select=*", {
      match_id: match.id,
      pmi_admin_id: pmiId,
      pmi_branch: "Jakarta Pusat Branch",
      blood_pressure: "120/80",
      hemoglobin: 14.5,
      pulse: 80,
      weight: 60,
      status: "passed",
      notes: JSON.stringify(screeningResultsObj)
    }, pmiToken);
    console.log("Screening upsert success:", screening);
  } catch (err) {
    console.error("Screening upsert failed:", err.message);
  }

  // 5. Query donor_details to see if count is updated
  const details = await get(`/rest/v1/donor_details?id=eq.${donorId}`, donorToken);
  console.log("\nDonor details after screening:", details);

  // 6. Check donation history
  const history = await get(`/rest/v1/donation_history?donor_id=eq.${donorId}`, donorToken);
  console.log("\nDonation history after screening:", history);
}

run().catch(console.error);
