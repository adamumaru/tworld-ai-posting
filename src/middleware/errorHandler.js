export function errorHandler(err, req, res, next) {
  console.error('[Error] Unhandled API error:', err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected internal error occurred.',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
}
