const express = require('express');
const router = express.Router();
const { checkUser, checkUserVerification, userResetPassword, userChangePassword, autoLogin} = require('../controllers/authController');

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
  router.route('/autoLogin')
      .get(autoLogin)
module.exports = router;
