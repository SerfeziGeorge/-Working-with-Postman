const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
//router.get('/checkout-session/:productId', orderController.getCheckoutSession);

// user and admin access

router.route('/createOrder').post(orderController.createOrder);
router.route('/:id').get(orderController.getOrder);

// only admin access
router.use(authController.restrictTo('admin'));
router.route('/').get(orderController.getAllOrders);
router
  .route('/:id')
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);
module.exports = router;
