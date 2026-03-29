require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(express.json());

const PORT = process.env.API_PORT;

const jwksClient = jwksRsa({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
  jwksClient.getSigningKey(header.kid, function(err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = authHeader.substring(7);

  jwt.verify(token, getKey, {
    audience: process.env.API_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Token valid - User:', decoded.sub, '- Scopes:', decoded.permissions);
    req.user = decoded;
    next();
  });
}

function requireScope(requiredScope) {
  return (req, res, next) => {
    const permissions = req.user.permissions || [];

    if (!permissions.includes(requiredScope)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

function loadCitizens() {
  return new Promise((resolve) => {
    const citizens = {};
    fs.createReadStream('../citizens.csv')
      .pipe(csv())
      .on('data', (row) => {
        let bills = [];
        let permits = [];

        try {
          bills = JSON.parse(row.bills);
        } catch (e) {}

        try {
          permits = JSON.parse(row.permits);
        } catch (e) {}

        citizens[row.email] = {
          name: row.name,
          email: row.email,
          address: row.address,
          bills: bills,
          permits: permits
        };
      })
      .on('end', () => {
        resolve(citizens);
      });
  });
}

app.get('/api/citizens/me', validateToken, requireScope('read:profile'), async (req, res) => {
  const citizens = await loadCitizens();
  const email = req.query.email;
  const citizen = citizens[email];

  if (!citizen) {
    return res.status(404).json({ error: 'Citizen not found' });
  }

  console.log('Returning profile:', citizen.name);
  res.json({
    id: req.user.sub,
    ...citizen
  });
});

app.get('/api/citizens', validateToken, requireScope('admin:all'), async (req, res) => {
  const citizens = await loadCitizens();
  console.log('Admin access - returning all citizens');
  res.json(Object.values(citizens));
});

app.post('/api/citizens', validateToken, requireScope('admin:all'), async (req, res) => {
  const citizens = await loadCitizens();
  const { email, name, address, bills, permits } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name required' });
  }

  if (citizens[email]) {
    return res.status(409).json({ error: 'Citizen already exists' });
  }

  const citizen = {
    name,
    email,
    address: address || '',
    bills: bills || [],
    permits: permits || []
  };

  const billsJson = JSON.stringify(bills || []);
  const permitsJson = JSON.stringify(permits || []);
  const billsEscaped = billsJson.replace(/"/g, '""');
  const permitsEscaped = permitsJson.replace(/"/g, '""');

  const csvLine = `\n${email},${name},${address || ''},"${billsEscaped}","${permitsEscaped}"`;
  fs.appendFileSync('../citizens.csv', csvLine);

  console.log('Created citizen:', email);
  res.status(201).json(citizen);
});

app.listen(PORT, () => {
  console.log('Springfield API started: http://localhost:' + PORT);
});
