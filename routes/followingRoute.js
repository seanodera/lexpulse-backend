const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getFollowing, getSingleFollowing, getUserFollowing, addFollowing, updateFollowing, deleteFollowing } = require('../controllers/followingController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getFollowing)
  .post(auth, addFollowing);

router
  .route('/:id')
  .get(auth, getSingleFollowing)
  .patch(auth, updateFollowing)
  .delete(auth, deleteFollowing);

router
  .route('/user/:id')
  .get(auth, getUserFollowing);

module.exports = router;