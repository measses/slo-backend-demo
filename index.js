const express = require('express');
const promClient = require('prom-client');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create a Registry to register the metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);

// Middleware to measure request duration
app.use((req, res, next) => {
  const start = Date.now();
  
  // Record end time and metrics on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const durationInSeconds = duration / 1000;
    const { method, path } = req;
    const route = path === '/metrics' ? '/metrics' : path === '/slow' ? '/slow' : '/';
    
    // Record metrics
    httpRequestDurationMicroseconds
      .labels(method, route, res.statusCode)
      .observe(durationInSeconds);
    
    httpRequestCounter
      .labels(method, route, res.statusCode)
      .inc();
    
    console.log(`${method} ${path} ${res.statusCode} - ${durationInSeconds}s`);
  });
  
  next();
});

// Fast endpoint (~ 10ms)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Fast response endpoint' });
});

// Slow endpoint (1-2 seconds delay)
app.get('/slow', (req, res) => {
  const delayTime = 1000 + Math.random() * 1000; // Random delay between 1-2 seconds
  
  setTimeout(() => {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Slow response endpoint',
      delay_ms: delayTime
    });
  }, delayTime);
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
