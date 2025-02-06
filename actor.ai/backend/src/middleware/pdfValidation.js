const createError = require('http-errors');

module.exports = (req, res, next) => {
  if (!req.file) {
    return next(createError(400, 'No file uploaded'));
  }

  if (req.file.mimetype !== 'application/pdf') {
    return next(createError(400, 'File must be a PDF'));
  }

  if (req.file.size > 5 * 1024 * 1024) { // 5MB
    return next(createError(400, 'File size must be less than 5MB'));
  }

  next();
}; 