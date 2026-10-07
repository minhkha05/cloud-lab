import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const output = resolve(process.argv[2] || 'artifacts/cold-start-results.json');
const idleMs = 16 * 60 * 1000;
const services = [
  { name: 'frontend', url: 'https://mern-frontend-235186.onrender.com/', ready: (text) => /id=["']root["']/.test(text) },
  { name: 'backend', url: 'https://mern-backend-235186.onrender.com/api/hello', ready: (text) => {
    try { return typeof JSON.parse(text).message === 'string'; } catch { return false; }
  } },
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = {
  startedAt: new Date().toISOString(),
  timezone: 'Asia/Saigon',
  idleMinutes: idleMs / 60000,
  note: 'The probe sends no requests during the idle interval. Other users, monitoring, or deployments can prevent idle sleep; timings alone cannot prove Render sleep state.',
  measurements: [],
};
await mkdir(dirname(output), { recursive: true });
const save = () => writeFile(output, JSON.stringify(report, null, 2) + '\n');

async function measure(service, phase) {
  const start = performance.now();
  const result = { service: service.name, phase, url: service.url, startedAt: new Date().toISOString(), attempts: [] };
  while (performance.now() - start < 180000) {
    const attemptStart = performance.now();
    try {
      const remaining = Math.max(1, 180000 - (performance.now() - start));
      const response = await fetch(service.url, { signal: AbortSignal.timeout(Math.ceil(remaining)) });
      const body = await response.text();
      const ready = response.ok && service.ready(body);
      result.attempts.push({ status: response.status, elapsedMs: Math.round(performance.now() - attemptStart), ready });
      if (ready) {
        result.ready = true;
        break;
      }
    } catch (error) {
      result.attempts.push({ error: error.message, elapsedMs: Math.round(performance.now() - attemptStart) });
    }
    const remaining = 180000 - (performance.now() - start);
    if (remaining > 0) await sleep(Math.min(3000, remaining));
  }
  result.ready ??= false;
  result.elapsedMs = Math.round(performance.now() - start);
  result.finishedAt = new Date().toISOString();
  report.measurements.push(result);
  await save();
  console.log(JSON.stringify({ service: result.service, phase, ready: result.ready, elapsedMs: result.elapsedMs, attempts: result.attempts.length }));
  return result;
}

try {
  for (const service of services) await measure(service, 'initial');
  for (const service of services) {
    const warm = await measure(service, 'warm');
    if (!warm.ready) throw new Error(`${service.name} is not healthy; cannot compare cold start.`);
  }
  report.idleStartedAt = new Date().toISOString();
  report.idleEndsAt = new Date(Date.now() + idleMs).toISOString();
  await save();
  console.log(`Idle interval starts now. No HTTP requests for 16 minutes; next probe at ${report.idleEndsAt}.`);
  const deadline = Date.now() + idleMs;
  while (Date.now() < deadline) {
    await sleep(Math.min(55000, deadline - Date.now()));
    console.log(`Idle: ${Math.max(0, Math.ceil((deadline - Date.now()) / 60000))} minute(s) remaining. No requests sent.`);
  }
  report.actualIdleMs = Date.now() - Date.parse(report.idleStartedAt);
  for (const service of services) await measure(service, 'after-idle');
  for (const service of services) await measure(service, 'warm-after-idle');
  report.completedAt = new Date().toISOString();
  await save();
  console.log(`Completed. Results saved to ${output}`);
} catch (error) {
  report.error = error.message;
  await save();
  console.error(error.message);
  process.exitCode = 1;
}
