function createRequestLogger(write = console.log) {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.once('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      // Do not log bodies, credentials, or URL query strings.
      write(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${durationMs.toFixed(1)}ms`);
    });
    next();
  };
}

module.exports = createRequestLogger;
