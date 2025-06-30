const errorHandler = (err, req, res, next) => {
  console.error('Fixtures Service Error:', err);

  // API timeout error
  if (err.code === 'ECONNABORTED') {
    return res.status(408).json({
      error: 'API request timeout',
      code: 'TIMEOUT_ERROR',
      service: 'fixtures-service'
    });
  }

  // External API errors
  if (err.response) {
    return res.status(err.response.status || 500).json({
      error: 'External API error',
      details: err.response.data?.message || err.message,
      code: 'EXTERNAL_API_ERROR',
      service: 'fixtures-service'
    });
  }

  // Network errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'External service unavailable',
      code: 'SERVICE_UNAVAILABLE',
      service: 'fixtures-service'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    service: 'fixtures-service',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
}; 