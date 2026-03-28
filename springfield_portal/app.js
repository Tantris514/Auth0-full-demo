require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { auth, requiresAuth } = require('express-openid-connect');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT;
const API_URL = process.env.API_URL;

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 3600
  }
}));

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  secret: process.env.SECRET,
  authorizationParams: {
    response_type: 'code',
    audience: process.env.API_AUDIENCE,
    scope: 'openid profile email'
  }
};

app.use((req, res, next) => {
  console.log(`\n==> ${req.method} ${req.path}`);

  if (req.query.code) {
    console.log('Authorization code received:', req.query.code);
  }

  if (req.path === '/login') {
    console.log('Redirecting to Auth0 for login');
  }

  if (req.path === '/callback') {
    console.log('Processing OAuth callback');
  }

  if (req.path === '/logout') {
    console.log('User logging out:', req.oidc?.user?.email || 'Unknown');
  }

  next();
});

app.use(auth(authConfig));

app.get('/', (req, res) => {
  console.log('\n--- HOME PAGE REQUEST ---');

  const isAuthenticated = req.oidc.isAuthenticated();
  console.log('Authenticated:', isAuthenticated);

  if (isAuthenticated) {
    console.log('User:', req.oidc.user.email);
  }

  res.send(`
    <h1>Springfield Citizen Portal</h1>
    ${isAuthenticated
      ? `<p>Welcome! You are logged in.</p>
         <a href="/dashboard">Go to Dashboard</a> |
         <a href="/logout">Logout</a>`
      : `<p>Please log in to access your account.</p>
         <a href="/login">Login</a>`
    }
  `);
});

app.get('/dashboard', requiresAuth(), (req, res) => {
  console.log('\n--- DASHBOARD ACCESS ---');

  const user = req.oidc.user;
  const idToken = req.oidc.idToken;
  const accessToken = req.oidc.accessToken;

  console.log('User:', user.email);

  console.log('\n--- ID TOKEN ---');
  console.log(idToken);

  console.log('\n--- ACCESS TOKEN ---');
  console.log(accessToken.access_token);

  res.send(`
    <style>
      textarea { width: 100%; height: 150px; font-family: monospace; font-size: 12px; }
    </style>
    <h1>Dashboard</h1>
    <h2>Welcome, ${user.name}!</h2>

    <h3>Your Profile:</h3>
    <ul>
      <li><strong>Email:</strong> ${user.email}</li>
      <li><strong>User ID:</strong> ${user.sub}</li>
    </ul>

    <h3>ID Token:</h3>
    <textarea readonly>${idToken}</textarea>

    <h3>Access Token:</h3>
    <textarea readonly>${accessToken.access_token}</textarea>

    <p>
      <strong>Decode tokens:</strong>
      <a href="https://jwt.io/" target="_blank">jwt.io</a>
    </p>

    <p>
      <a href="/profile">View My Citizen Profile</a> |
      <a href="/admin">Admin: View All Citizens</a> |
      <a href="/">Home</a> |
      <a href="/logout">Logout</a>
    </p>
  `);
});

app.get('/profile', requiresAuth(), async (req, res) => {
  const accessToken = req.oidc.accessToken.access_token;
  const email = req.oidc.user.email;

  try {
    const response = await axios.get(`${API_URL}/api/citizens/me?email=${email}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const citizen = response.data;
    console.log('API call success - Citizen:', citizen.name);

    res.send(`
      <style>
        table { border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .unpaid { color: red; font-weight: bold; }
        .paid { color: green; }
      </style>
      <h1>Citizen Profile</h1>
      <h2>${citizen.name}</h2>

      <h3>Personal Information:</h3>
      <ul>
        <li><strong>Email:</strong> ${citizen.email}</li>
        <li><strong>Address:</strong> ${citizen.address}</li>
        <li><strong>User ID:</strong> ${citizen.id}</li>
      </ul>

      <h3>Bills:</h3>
      <table>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
        ${citizen.bills.map(bill => `
          <tr>
            <td>${bill.type}</td>
            <td>$${bill.amount}</td>
            <td class="${bill.status}">${bill.status}</td>
          </tr>
        `).join('')}
      </table>

      <h3>Permits:</h3>
      ${citizen.permits.length > 0 ? `
        <table>
          <tr>
            <th>Type</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
          ${citizen.permits.map(permit => `
            <tr>
              <td>${permit.type}</td>
              <td>${permit.status}</td>
              <td>${permit.date}</td>
            </tr>
          `).join('')}
        </table>
      ` : '<p>No permits on file.</p>'}

      <p><a href="/dashboard">Back to Dashboard</a> | <a href="/">Home</a> | <a href="/logout">Logout</a></p>
    `);
  } catch (error) {
    console.log('API call failed:', error.message);
    res.status(500).send(`
      <h1>Error</h1>
      <p>Could not load citizen profile</p>
      <p><a href="/dashboard">Back to Dashboard</a></p>
    `);
  }
});

app.get('/admin', requiresAuth(), async (req, res) => {
  const accessToken = req.oidc.accessToken.access_token;

  try {
    const response = await axios.get(`${API_URL}/api/citizens`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const citizens = response.data;
    console.log('Admin API call success - Citizens:', citizens.length);

    res.send(`
      <style>
        table { border-collapse: collapse; margin: 20px 0; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
      <h1>All Citizens (Admin View)</h1>
      <table>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Address</th>
        </tr>
        ${citizens.map(citizen => `
          <tr>
            <td>${citizen.name}</td>
            <td>${citizen.email}</td>
            <td>${citizen.address}</td>
          </tr>
        `).join('')}
      </table>
      <p><a href="/dashboard">Back to Dashboard</a></p>
    `);
  } catch (error) {
    console.log('Admin API call failed:', error.message);

    if (error.response && error.response.status === 403) {
      res.status(403).send(`
        <h1>Access Denied</h1>
        <p>You don't have admin permissions</p>
        <p><a href="/dashboard">Back to Dashboard</a></p>
      `);
    } else {
      res.status(500).send(`
        <h1>Error</h1>
        <p>Could not load citizens</p>
        <p><a href="/dashboard">Back to Dashboard</a></p>
      `);
    }
  }
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('Springfield Portal Started');
  console.log('========================================');
  console.log('URL: http://localhost:' + PORT);
  console.log('Login: http://localhost:' + PORT + '/login');
  console.log('Auth0 Domain:', process.env.AUTH0_DOMAIN);
  console.log('API Audience:', process.env.API_AUDIENCE);
  console.log('========================================\n');
});
