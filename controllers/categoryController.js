const Category = require('../models/categoryModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//exports.getAllCategories = factory.getAll(Category);
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const categories = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categoriesKey: categories,
    },
  });
});

//exports.getCategory = factory.getOne(Category, { path: 'products' });
exports.getCategory = catchAsync(async (req, res, next) => {
  // findById the id is coming req.params.id, we have the route name id in the categoryRoutes.js/.route('/:id'). If we named route('/:name') we had req.params.name
  //shorthand for Category.findOne({_id: req.params.id})
  // populate the category with the products

  const category = await Category.findById(req.params.id).populate('products');

  if (!category) {
    return next(new AppError('Unable to return a category with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      categoriesKey: category,
    },
  });
});

//exports.createCategory = factory.createOne(Category);
exports.createCategory = catchAsync(async (req, res, next) => {
  //call the create method on the category model, in the func pass the data that you want to store in the database as a new category, the data comes from the post body which is stored in req.body
  //if there are any fields on the body that are not in the schema, they will be ignored
  const newCategory = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      categoriesKey: newCategory,
    },
  });
});

//exports.updateCategory = factory.updateOne(Category);
exports.updateCategory = catchAsync(async (req, res, next) => {
  // findByIdAndUpdate arg: req.params.id = finds the id that will be updated, req.body = the data that we want to change, the third arguments makes sure that the new updated document will be returned

  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //if true, return the modified categoryument rather than the original. defaults to false (changed in 4.0)
    runValidators: true, // if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
  });

  if (!category) {
    return next(new AppError('No category found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      categoriesKey: category,
    },
  });
});

//exports.deleteCategory = factory.deleteOne(Category);
exports.deleteCategory = catchAsync(async (req, res, next) => {
  //there no need to save anything to a variable because nothing is send back to the client in a restful apia
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError('Unable to return a category with this id', 404));
  }

  res.status(204).json({
    status: 'success', //in postman if the operation was successful it returns 204
    data: null,
  });
});
