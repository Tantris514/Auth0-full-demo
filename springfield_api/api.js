require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.API_PORT;
let citizensDB = {};

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
    fs.createReadStream('../citizens.csv')
      .pipe(csv())
      .on('data', (row) => {
        citizensDB[row.email] = {
          name: row.name,
          email: row.email,
          address: row.address,
          bills: JSON.parse(row.bills),
          permits: JSON.parse(row.permits)
        };
      })
      .on('end', () => {
        console.log('Citizens loaded from CSV');
        resolve();
      });
  });
}

app.get('/api/citizens/me', validateToken, requireScope('read:profile'), (req, res) => {
  const email = req.query.email;
  const citizen = citizensDB[email];

  if (!citizen) {
    return res.status(404).json({ error: 'Citizen not found' });
  }

  console.log('Returning profile:', citizen.name);
  res.json({
    id: req.user.sub,
    ...citizen
  });
});

app.get('/api/citizens', validateToken, requireScope('admin:all'), (req, res) => {
  console.log('Admin access - returning all citizens');
  res.json(Object.values(citizensDB));
});

loadCitizens().then(() => {
  app.listen(PORT, () => {
    console.log('Springfield API started: http://localhost:' + PORT);
  });
});
