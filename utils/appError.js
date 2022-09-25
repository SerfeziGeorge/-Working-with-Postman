// Handless Operation Errors
// class inherence, here AppError inherence from Error class
class AppError extends Error {
  // the constractor method is time we call a new object out this class
  constructor(message, statusCode) {
    //when we extend a parent class we call super in order to the parrent constructor
    super(message);

    this.statusCode = statusCode;
    // checking if the status code starts with a 400 error. if true it is marked as an operation error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // capturing the line where the operational error happened
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
