const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const variantRouter = require('./variantRoutes');

//merging the paramaters of the productRoute and the reviewRoute. By merging the params the reviewRoute get access to the id of the product
const router = express.Router({ mergeParams: true });

//router.param('id', productController.checkID);
//router.route('/product-stats').get(productController.getProductStats);
//router.route('/get-variant/:price').get(productController.getProducVariant);

//the product router will use the review/variant router in case it will encouter a route below
// gets all the reviews/variants of a product
router.use('/:productId/reviews', reviewRouter);
router.use('/:productId/reviews/:id', reviewRouter);

router.use('/:productId/variants', variantRouter);

router.use('/:productId/variants/addVariant', variantRouter);
//router.use('/:productId/variants/variantId', variantRouter);

router.route('/product-stats').get(productController.getProductStats);
// router.post(
//   '/addProduct',
//   authController.protect,
//   authController.restrictTo,
//   productController.createProduct
// );

router.route('/').get(productController.getAllProducts);
router.post(
  authController.protect,
  authController.restrictTo,
  productController.createProduct
);
router.route('/:id').get(productController.getProduct);

// Protect all routes after this middleware
router.use(authController.protect);
// Restric all routes after this middleware
router.use(authController.restrictTo('admin'));

router
  .route('/:id')
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
