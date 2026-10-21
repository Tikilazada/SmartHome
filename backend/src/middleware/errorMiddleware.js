// backend/src/middleware/errorMiddleware.js

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  console.error('🔥 [Server Error]:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi xử lý nội bộ trên máy chủ Backend.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.actionId && { actionId: err.actionId }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
