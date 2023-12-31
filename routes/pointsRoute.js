const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getPoints, getPoint, getUserPoints, addPoint, updatePoint, deletePoint } = require('../controllers/pointsController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getPoints)
  .post(auth, addPoint);

router
  .route('/:id')
  .get(auth, getPoint)
  .patch(auth, updatePoint)
  .delete(auth, deletePoint);

router
  .route('/user/:id')
  .get(auth, getUserPoints);

module.exports = router;