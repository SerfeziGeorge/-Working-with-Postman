const express = require('express');
const categoryController = require('../controllers/categoryController');
const productRouter = require('./productRoutes');
const authController = require('../controllers/authController');

const router = express.Router();

router.use('/:categoryId/products', productRouter);
router.use('/:categoryId/products/:id', productRouter);

router.route('/').get(categoryController.getAllCategories);
router.route('/:id').get(categoryController.getCategory);

// Protect all routes after this middleware
router.use(authController.protect);
// Restric all routes after this middleware
router.use(authController.restrictTo('admin'));

router.post('/addCategory', categoryController.createCategory);

router
  .route('/:id')
  .patch(authController.protect, categoryController.updateCategory)
  .delete(authController.protect, categoryController.deleteCategory);
module.exports = router;
