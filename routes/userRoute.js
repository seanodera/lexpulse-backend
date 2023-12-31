const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getUsers, getUser, addUser, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getUsers)
  .post(upload.array("image"), addUser);

router
  .route('/:id')
  .get(auth, getUser)
  .patch(auth, updateUser)
  .delete(auth, deleteUser);

module.exports = router;