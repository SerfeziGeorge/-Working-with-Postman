//const { query } = require('express');
const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Execute the query
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  //send response
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products: products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  // findById the id is coming req.params.id, we have the route name id in the productRoutes.js/.route('/:id'). If we named route('/:name') we had req.params.name
  //shorthand for Product.findOne({_id: req.params.id})

  const product = await Product.findById(req.params.id).populate('reviews');

  if (!product) {
    return next(new AppError('Unable to return a product with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  //call the create method on the product model, in the func pass the data that you want to store in the database as a new product, the data comes from the post body which is stored in req.body
  // //if there are any fields on the body that are not in the schema, they will be ignored
  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  // findByIdAndUpdate arg: req.params.id = finds the id that will updated, req.body = the data that we want to change, the third arguments makes sure that the new updated document will be returned
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //if true, return the modified document rather than the original. defaults to false (changed in 4.0)
    runValidators: true, // if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
  });

  if (!product) {
    return next(new AppError('Unable to return a product with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: product, // the property name has the name of the value
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  //there no need to save anything to a variable because nothing is send back to the client in a restful apia
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('Unable to return a product with this id', 404));
  }

  res.status(204).json({
    status: 'success', //in postman if the operation was successful it returns 204
    data: null,
  });
});

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    // aggregation pipeline stages
    // each of the step is an object
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    //$group allows to group documents toghether using acumulators
    {
      $group: {
        // the first thing we alwasys need to specify is the id. at this stage we specify what we want to group by. default null
        //_id: null,
        _id: '$variant',
        numProducts: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
