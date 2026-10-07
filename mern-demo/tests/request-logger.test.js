const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const createRequestLogger = require('../server/request-logger');

test('logs completed CRUD requests with status and timing, without sensitive data', async () => {
  const lines = [];
  const app = express();
  app.use(createRequestLogger((line) => lines.push(line)));
  app.use(express.json());
  app.get('/api/students', (req, res) => res.json([]));
  app.post('/api/students', (req, res) => res.status(201).json({ ok: true }));
  app.put('/api/students/:id', (req, res) => res.json({ ok: true }));
  app.delete('/api/students/:id', (req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [method, path, status] of [
      ['GET', '/api/students', 200],
      ['POST', '/api/students', 201],
      ['PUT', '/api/students/test-id', 200],
      ['DELETE', '/api/students/test-id', 200],
      ['GET', '/missing', 404],
    ]) {
      const response = await fetch(`${base}${path}?token=secret-query`, {
        method,
        headers: { Authorization: 'Bearer secret-header', 'Content-Type': 'application/json' },
        ...(method === 'POST' || method === 'PUT' ? { body: JSON.stringify({ password: 'secret-body' }) } : {}),
      });
      await response.text();
      assert.equal(response.status, status);
      const line = lines[lines.length - 1];
      assert.match(line, new RegExp(` ${method} ${path} ${status} \\d+\\.\\dms$`));
      assert.equal(line.includes('secret'), false);
    }
    assert.equal(lines.length, 5);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    });
  }
});
