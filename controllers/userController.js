const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//filtered the body to contain only the name and email
// allowed fields creates an array with all the arg we passed in (name and email)
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // object.keys returns an array containing all the key names, the field names of obj in the arg above
  Object.keys(obj).forEach((el) => {
    //loop through the object and for each of the element check if its one of the allowed fields, if its true, then added to a new object that will be returned
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.CurrentLogedInUser = (req, res, next) => {
  //set req.params.id equal to req.user.id
  req.params.id = req.user.id;
  next();
};

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filterdBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  // selecting the active property from user model to false
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // findById the id is coming req.params.id, we have the route name id in the userRoutes.js/.route('/:id'). If we named route('/:name') we had req.params.name
  //shorthand for User.findOne({_id: req.params.id})
  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    return next(new AppError('Unable to return a user with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    },
  });
});

// Do not update passwords with this because findByIdAndUpdate does not run the save middleware. This is only for admin
//exports.updateUser = factory.updateOne(User);
exports.updateUser = catchAsync(async (req, res, next) => {
  // findByIdAndUpdate arg: req.params.id = finds the id that will be updated, req.body = the data that we want to change, the third arguments makes sure that the new updated document will be returned

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //if true, return the modified userument rather than the original. defaults to false (changed in 4.0)
    runValidators: true, // if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
  });

  if (!user) {
    return next(new AppError('No user found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      userKey: user,
    },
  });
});

// here an admin deletes the user from the db
//exports.deleteUser = factory.deleteOne(User);
exports.deleteUser = catchAsync(async (req, res, next) => {
  //there no need to save anything to a variable because nothing is send back to the client in a restful apia
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('Unable to return a user with this id', 404));
  }

  res.status(204).json({
    status: 'success', //in postman if the operation was successful it returns 204
    data: null,
  });
});
