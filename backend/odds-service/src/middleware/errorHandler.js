const errorHandler = (err, req, res, next) => {
  console.error('Odds Service Error:', err);

  // Database errors
  if (err.code === 'SQLITE_ERROR' || err.code === 'SQLITE_CONSTRAINT') {
    return res.status(500).json({
      error: 'Database operation failed',
      code: 'DATABASE_ERROR',
      service: 'odds-service'
    });
  }

  // Calculation errors
  if (err.message && err.message.includes('calculation')) {
    return res.status(422).json({
      error: 'Odds calculation failed',
      details: err.message,
      code: 'CALCULATION_ERROR',
      service: 'odds-service'
    });
  }

  // External API errors
  if (err.response) {
    return res.status(err.response.status || 500).json({
      error: 'External API error',
      details: err.response.data?.message || err.message,
      code: 'EXTERNAL_API_ERROR',
      service: 'odds-service'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    service: 'odds-service',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
}; 