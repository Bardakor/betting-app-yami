const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

// Create cache instance with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`🏈 [FIXTURES] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : '🟢';
    console.log(`${statusColor} [FIXTURES] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Rate limiter for API calls
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function for logging API calls
const logApi = (message) => {
  console.log(message);
};

module.exports = {
  requestLogger,
  apiLimiter,
  cache,
  logApi
}; 