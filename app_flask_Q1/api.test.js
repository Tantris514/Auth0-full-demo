const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

describe('GET /users', () => {
  it('should return 200 and an array', async () => {
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNJZGZqakZVZ2xTOVVmeHdSU2dkWiJ9.eyJpc3MiOiJodHRwczovL2Rldi02eXNpMGxjcmN6eTNzMnFkLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJDNjhpdUxBODhVUkRRYlBFT1hOaVlUTWdpSWE1NXBNa0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly92YWxpZGF0aW9uL2FwaSIsImlhdCI6MTc1MTA3ODA5MiwiZXhwIjoxNzUxMTY0NDkyLCJzY29wZSI6InJlYWQ6dXNlcnMgd3JpdGU6dXNlcnMgZGVsZXRlOnVzZXJzIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoiQzY4aXVMQTg4VVJEUWJQRU9YTmlZVE1naUlhNTVwTWsifQ.1wPaFAaYT_j1xOJblR6RohAGX8QOTyvm8Q5SsrlFBT9NtJ8g3UaawbxDwjw_XVSjPhpteojhoznoIHQhcZqPeXg9RwZvv4u1koANfpraiL4RzKutSFDdIk33nCP2nIXKhn-bQ6hKqOZ1MeGyjTIRqiNFyUNXaTL1ix-Aw5BDKruXlO4N6fqkAr_KoVj8BHu9E4O60GB4EsUHDhs7Ylj7A1YbFdTRX5axF-ZRYVMJrRVYLrMjAPicNSyomO57O6ac-PVuOSqgRO1kD8Dubz5bIjdt8uXlKvk-gLc_UDvBvvdBRRFF_h4Oqm3VI-Ds76hRXHjaCcgwDBOccOEq2nOGOQ';
    const res = await fetch(`${baseUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

//Doc used for this part https://jestjs.io/docs/getting-started