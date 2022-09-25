const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyCurrentPassword', authController.updatePassword);
router.get('/me', userController.CurrentLogedInUser, userController.getUser);
router.patch(
  '/updateCurrentUser',
  userController.CurrentLogedInUser,
  userController.updateCurrentUser
);
router.delete(
  '/deleteCurrentUser',
  userController.CurrentLogedInUser,
  userController.deleteCurrentUser
);

// Restric all routes after this middleware
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
