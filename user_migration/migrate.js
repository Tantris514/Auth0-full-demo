require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.CC_CLIENT_ID;
const CLIENT_SECRET = process.env.CC_CLIENT_SECRET;
const API_AUDIENCE = process.env.API_AUDIENCE;
const API_URL = process.env.API_URL;

async function getAccessToken(audience) {
  const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    audience: audience,
    grant_type: 'client_credentials'
  });

  return response.data.access_token;
}

async function createAuth0User(token, email, name, password) {
  await axios.post(
    `https://${AUTH0_DOMAIN}/api/v2/users`,
    {
      email,
      name,
      password,
      connection: 'Username-Password-Authentication'
    },
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  console.log('Auth0 user created:', email);
}

async function createCitizen(token, citizen) {
  await axios.post(
    `${API_URL}/api/citizens`,
    citizen,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  console.log('Citizen created:', citizen.email);
}

async function migrateUsers() {
  console.log('Getting tokens');
  const auth0Token = await getAccessToken(`https://${AUTH0_DOMAIN}/api/v2/`);
  const apiToken = await getAccessToken(API_AUDIENCE);

  const citizens = [];

  fs.createReadStream('test_migration.csv')
    .pipe(csv())
    .on('data', (row) => {
      const bills = JSON.parse(row.bills);
      const permits = JSON.parse(row.permits);

      citizens.push({
        email: row.email,
        name: row.name,
        password: row.password,
        address: row.address,
        bills: bills,
        permits: permits
      });
    })
    .on('end', async () => {
      console.log(`Migrating ${citizens.length} users`);

      for (const citizen of citizens) {
        await createAuth0User(auth0Token, citizen.email, citizen.name, citizen.password);
        await createCitizen(apiToken, citizen);
      }

      console.log('Migration complete');
    });
}


//main logic
migrateUsers();
