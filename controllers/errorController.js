// Handling errors in the express application by passing operational async errors in globalhandling middleware

const AppError = require('../utils/appError');

// invalid input data, the value is in the wrong format. this type of error can happen to any fields that we query for with the value in the wrong format. for example the price has a type of Number, if we introduced type String it gets handled by handleCastErrorDB
// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// const handleDuplicateFieldsDB = (err) => {
//   //errmsg is a value defined by mongodb
//   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
//   console.log(value);

//   const message = `Duplicate field value: ${value}. Please use another value!`;
//   return new AppError(message, 400);
// };

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  console.error('ERROR in development mode!!!', err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    console.error('ERROR operational in production mode!', err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error(
      'ERROR in production mode! programming or other unknown error. Posibble cause, error in any express middlleware',
      err
    );

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  //defining the status code and the status of the req
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
    //errors from other librarie in production mode eg mongodb and jwt
  } else if (process.env.NODE_ENV === 'production') {
    // it is not a good practice to overide the arg of a function. istead it is recomended to make a hard copy of the object by destructuring the origanal error (err).
    let error = { ...err };

    // correctly copying the err object in production mode in order to display the messages to the user
    error.message = err.message;

    // We pass the error mongoose created(CastError), in the handleCastErrorDb function. This function will return a new error created with AppError class. The AppError class marks the CastError error as operational
    // if we have a CastError it gets passed to handleCastErrorDB where it is handled as described above. the it perssisted to error(error = handleCastErrorDB ). then it is send to client using sendErrorProd

    //if (error.name === 'CastError') error = handleCastErrorDB(error);
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Invalid ${err.path}: ${err.value}.}.`;
      error = new AppError(message, 404);
    }
    // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // Mongoose duplicate key
    if (err.code === 11000) {
      const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
      //console.log(value);
      //const message = `Duplicate field value: ${value}. Please use another value!`;
      const message = `This  ${value} is already in use!`;
      error = new AppError(message, 409);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      // each object in the array is a validator error and each validator has a unique error message. Here where are just extracting the validator for our output messages
      const errors = Object.values(err.errors).map((el) => el.message);

      const message = `Invalid input data. ${errors.join('. ')}`;
      error = new AppError(message, 400);
    }
    // Invalid JWT token
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    // Users tries to connect with an expired JWT token
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
