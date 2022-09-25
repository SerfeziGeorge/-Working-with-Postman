const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//merging the paramaters of the productRoute and the reviewRoute. By merging the params the reviewRoute get access to the id of the product
const router = express.Router({ mergeParams: true });
// - POST /product/id of the product/ reviews gets handled in the below router
// - POST /reviews gets handled in the below router
router.route('/').get(reviewController.getAllReviews);
router.route('/:id').get(reviewController.getReview);

// Protect all routes after this middleware
router.use(authController.protect);
// Restric all routes after this middleware
router.use(authController.restrictTo('admin'));

router.post(reviewController.createReview);
router
  .route('/:id')
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
