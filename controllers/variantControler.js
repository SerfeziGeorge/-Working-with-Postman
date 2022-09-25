const Variant = require('../models/productVariant');
const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllVariants = catchAsync(async (req, res, next) => {
  // Execute the query
  const features = new APIFeatures(Variant.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const variants = await features.query;

  res.status(200).json({
    status: 'success',
    results: variants.length,
    data: {
      variants: variants,
    },
  });
});

exports.getVariant = catchAsync(async (req, res, next) => {
  const variant = await Variant.findOne({ _id: req.params.id });

  if (!variant) {
    return next(new AppError('Unable to return a variant with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      variant: variant,
    },
  });
});

exports.createVariant = catchAsync(async (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;

  const newVariant = await Variant.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      variant: newVariant,
    },
  });
});

exports.updateVariant = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id });

  if (!product) {
    return next(new AppError('Unable to return a product with this id', 404));
  }

  const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!variant) {
    return next(new AppError('Unable to return a variant with this id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      variant: variant,
    },
  });
});

exports.deleteVariant = catchAsync(async (req, res, next) => {
  const variant = await Variant.findByIdAndDelete(req.params.id);
  if (!variant) {
    return next(new AppError('Unable to return a variant with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      variant: variant,
    },
  });
});
