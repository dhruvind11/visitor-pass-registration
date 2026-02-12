import { ApiError } from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error for debugging
  console.error(err);

  // If error is already an ApiError instance, use it directly
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(404, 'Resource not found');
  }
  // Mongoose duplicate key
  else if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0];
    let message = 'Duplicate field value entered';
    
    // Provide specific error messages for duplicate email or mobile
    if (duplicateField === 'email') {
      message = 'This email address is already registered. Please use a different email.';
    } else if (duplicateField === 'mobile') {
      message = 'This mobile number is already registered. Please use a different mobile number.';
    } else if (duplicateField === 'vitiorId') {
      message = 'Visitor ID already exists. Please try again.';
    } else {
      message = `${duplicateField} already exists. Please use a different value.`;
    }
    
    error = new ApiError(409, message);
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message);
  }
  // Default server error
  else {
    error = new ApiError(500, err.message || 'Server Error');
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;

