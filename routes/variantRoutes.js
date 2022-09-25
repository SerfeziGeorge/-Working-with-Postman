const express = require('express');
const variantController = require('../controllers/variantControler');
const authController = require('../controllers/authController');

//by default each router has accessed to the params of their specific routes. with no merged params there is no access to the product id.
const router = express.Router({ mergeParams: true });

router.route('/').get(variantController.getAllVariants);

// Protect all routes after this middleware
router.use(authController.protect);
// Restric all routes after this middleware
router.use(authController.restrictTo('admin'));

router.post('/addVariant', variantController.createVariant);

router
  .route('/:id')
  .get(variantController.getVariant)
  .patch(variantController.updateVariant)
  .delete(variantController.deleteVariant);

module.exports = router;
