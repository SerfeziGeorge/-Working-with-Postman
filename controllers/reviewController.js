const Review = require('../models/reviewModel');
//const User = require('../models/userModel');
//const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  //These filter matches the reviews to the product they are reference. Its searching for reviews where product is equal to the productId we have in the req. and returns all the reviews.
  let filter = {};
  // if there is a req.params.productId then create a filter object, the filter should be equal to req.params.productId.
  if (req.params.productId) filter = { product: req.params.productId };
  const reviews = await Review.find(filter);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews: reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  // if (!req.body.product) req.body.product = req.params.productId;
  // if (!req.body.review) req.body.review = req.params.reviewId;
  // if (!req.body.user) req.body.user = req.user.id;
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    return next(new AppError('Unable to return a review with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: review,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // allowing nested routes, the  user can specify manually the product and userId
  // if we did not specify the product id in the body (request.body.product) then define as coming from the URL (req.params)
  // req.user comes from the protect middleware
  //https://cedric.tech/blog/expressjs-accessing-req-params-from-child-routers
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;

  //if there are any fields on the body that are not in the schema, they will be ignored
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

// To fix --- any user can modify any review, a user should only modify his reviews rating. Need to figure out how to check if req.user is the same as the reference user in the review. I dont know how to extract/access the reference user from the db.
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) {
    return next(new AppError('Unable to return a review with this id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      review: review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError('Unable to return a review with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: review,
    },
  });
});
