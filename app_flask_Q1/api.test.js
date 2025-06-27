const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

describe('GET /users', () => {
  it('should return 200 and an array', async () => {
    const res = await fetch(`${baseUrl}/users`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});


//Doc used for this part https://jestjs.io/docs/getting-started