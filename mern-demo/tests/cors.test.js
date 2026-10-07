const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cors = require('cors');
const createCorsOptions = require('../server/cors-options');

const clientOrigin = 'https://mern-frontend-235186.onrender.com';

async function withServer(env, check) {
  const app = express();
  app.use(cors(createCorsOptions(env)));
  app.get('/api/hello', (req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await check(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    });
  }
}

test('production allows CLIENT_URL and JSON PUT preflight', async () => {
  await withServer({ NODE_ENV: 'production', CLIENT_URL: `${clientOrigin}/` }, async (base) => {
    const response = await fetch(`${base}/api/hello`, { headers: { Origin: clientOrigin } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), clientOrigin);
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
    assert.match(response.headers.get('vary'), /Origin/);
    const preflight = await fetch(`${base}/api/students/123`, {
      method: 'OPTIONS',
      headers: {
        Origin: clientOrigin,
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), clientOrigin);
    assert.match(preflight.headers.get('access-control-allow-methods'), /PUT/);
    assert.match(preflight.headers.get('access-control-allow-headers'), /Content-Type/i);
  });
});

test('production omits CORS permission for unknown origins and localhost', async () => {
  await withServer({ NODE_ENV: 'production', CLIENT_URL: clientOrigin }, async (base) => {
    for (const origin of ['https://untrusted.example', 'http://localhost:5173']) {
      const response = await fetch(`${base}/api/hello`, { headers: { Origin: origin } });
      assert.equal(response.headers.get('access-control-allow-origin'), null);
      const preflight = await fetch(`${base}/api/students`, {
        method: 'OPTIONS',
        headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' },
      });
      assert.equal(preflight.headers.get('access-control-allow-origin'), null);
    }
    const health = await fetch(`${base}/api/hello`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true });
  });
});

test('missing production CLIENT_URL does not allow arbitrary origins', async () => {
  await withServer({ NODE_ENV: 'production' }, async (base) => {
    const response = await fetch(`${base}/api/hello`, { headers: { Origin: clientOrigin } });
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  });
});

test('development allows specified origins and local React apps only', async () => {
  await withServer({ CLIENT_URL: `${clientOrigin}, https://second.example` }, async (base) => {
    for (const origin of [clientOrigin, 'https://second.example', 'http://localhost:5173', 'http://localhost:3000']) {
      const response = await fetch(`${base}/api/hello`, { headers: { Origin: origin } });
      assert.equal(response.headers.get('access-control-allow-origin'), origin);
    }
    const denied = await fetch(`${base}/api/hello`, { headers: { Origin: 'https://untrusted.example' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
  });
});
