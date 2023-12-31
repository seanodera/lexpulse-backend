const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getReferralCodes, getReferralCode, getUserReferralCodes, addReferralCode, updateReferralCode, deleteReferralCode } = require('../controllers/referralCodeController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getReferralCodes)
  .post(auth, addReferralCode);

router
  .route('/:id')
  .get(auth, getReferralCode)
  .patch(auth, updateReferralCode)
  .delete(auth, deleteReferralCode);

router
  .route('/user/:id')
  .get(auth, getUserReferralCodes);

module.exports = router;