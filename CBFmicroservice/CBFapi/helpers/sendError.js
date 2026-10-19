function sendError(res, message = 'Generic Error', code = 400, data = {}) {
    res.status(code).json({
      status: 'error',
      message,
      data,
    });
  }
  
  module.exports = sendError;