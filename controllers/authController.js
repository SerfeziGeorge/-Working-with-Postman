const jwt = require('jsonwebtoken');
const { promisify } = require('util'); // build in from node util
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//creating the signature for JWT token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
//Creating a new token
const createSendToken = (user, statusCode, res) => {
  //the signToken takes as arg the payload ${user._id}
  const token = signToken(user._id);
  //create and send a cookie. Creating the cookie with an expire property
  const cookieOptions = {
    //deleting the cookie after it expires, and converting into miliseconds
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // the cookie can not be accesed or modified by the browser in order to prevent cross site scripting (XSS) attacks
  };
  // secure:true, the cookie will only be sent when using https, only for production
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // sending the cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output when creating a new document
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
//middleware func for signup
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

//middleware func for login

exports.login = catchAsync(async (req, res, next) => {
  // creating the email and the password from request body using destructuring. this is how the user send the login credentials
  const { email, password } = req.body;

  // Checking process on the server side
  // 1) Check if email and password exist
  // if there is no email or no password then send back error message
  if (!email || !password) {
    return next(
      new AppError(
        'Missing email and password! Please provide a valid email and password! If you do not have an already an account, please create one!',
        400
      )
    );
  }
  // 2) Check if user exists && password is correct
  // in the user model we explictly did not select the password so that we do not send the encrypted passwords to the user. Here we are explictly selecting the password field from the mongodb
  const user = await User.findOne({ email }).select('+password');
  //console.log(user)
  // the method correctPassword is the defined in the userModel
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        'Incorrect email or password!  If you do not have an already an account, please create one!',
        401
      )
    );
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

//middleware func for Authenthification - authenthficatedUsers
// only currently logged in user get access, checking if the user is logged in with the correct credentials
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  //console.log(token);
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists, if it expired,
  // decoded.id retrieves the user id from the JWT token
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the JWT token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  // here we store the user in the request, and is being used the next middleware, the restrictTo
  req.user = currentUser;
  //res.locals.user = currentUser;
  next();
});

// middleware func for Authorization, restriction acces to resources based on roles, admin and user
// if this roles array does not includes the role of the current user eg admin, then you do not have permision
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    console.log(req.user.role);
    next();
  };

// Implementation of a user friendly password reset functionallity

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address!', 404));
  }

  // 2) Generate the random reset token, not a JWT TOKEN
  const resetToken = user.createPasswordResetToken();
  // here pass a special option in the method. Deactivates all the validators specified in the schema. method from mongoose library
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  //if we have an error we reset the token and the expires property
  try {
    await sendEmail({
      //options
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

// setting the new password
//To fix --- check if the new password is equal to the last know password in the database. Figure out how to check if the newpassword is not equal to the oldpassword.
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // modifiyng the doc
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // saving the doc in mongodb
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection and the password
  // req.user.id is coming from the protect middleware, by the we have reached this middleware the user is log in and whants to change the current password
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // if (req.body.passwordCurrent === user.password) {
  //   return next(
  //     new AppError('Your current is the same as the old password.', 401)
  //   );
  // }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
