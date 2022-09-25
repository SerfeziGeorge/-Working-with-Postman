const Order = require('../models/orderModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const orders = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      ordersKey: orders,
    },
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  // findById the id is coming req.params.id, we have the route name id in the orderRoutes.js/.route('/:id'). If we named route('/:name') we had req.params.name
  //shorthand for Order.findOne({_id: req.params.id})
  // populate the order with the products
  //const orders = await Order.find({ 'user.userId': req.user._id });
  const order = await Order.findOne({ _id: req.params.id });

  if (!order) {
    return next(new AppError('Unable to return a order with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      orderKey: order,
    },
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  //call the create method on the order model, in the func pass the data that you want to store in the database as a new order, the data comes from the post body which is stored in req.body
  //if there are any fields on the body that are not in the schema, they will be ignored
  const newOrder = await Order.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      orderKey: newOrder,
    },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  // findByIdAndUpdate arg: req.params.id = finds the id that will be updated, req.body = the data that we want to change, the third arguments makes sure that the new updated document will be returned

  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //if true, return the modified orderument rather than the original. defaults to false (changed in 4.0)
    runValidators: true, // if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
  });

  if (!order) {
    return next(new AppError('No order found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      orderKey: order,
    },
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  //there no need to save anything to a variable because nothing is send back to the client in a restful apia
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new AppError('Unable to return a order with this id', 404));
  }

  res.status(204).json({
    status: 'success', //in postman if the operation was successful it returns 204
    data: null,
  });
});
