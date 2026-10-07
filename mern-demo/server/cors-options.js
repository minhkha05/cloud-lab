function createCorsOptions(env = process.env) {
  const allowedOrigins = new Set(
    (env.CLIENT_URL || '')
      .split(',')
      .map((value) => value.trim().replace(/\/+$/, ''))
      .filter(Boolean)
  );

  if (env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:5173');
    allowedOrigins.add('http://localhost:3000');
  }

  return {
    origin(origin, callback) {
      // Requests without Origin include server-to-server calls and health checks.
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

module.exports = createCorsOptions;
