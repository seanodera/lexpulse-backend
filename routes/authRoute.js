const express = require('express');
const router = express.Router();
const { checkUser, checkUserVerification, userResetPassword, userChangePassword } = require('../controllers/authController');

router
  .route('/')
  .post(checkUser);

router
  .route('/confirm-code')
  .post(checkUserVerification);

router
  .route('/reset-password')
  .post(userResetPassword);

  router
    .route('/change-password')
    .post(userChangePassword);

module.exports = router;