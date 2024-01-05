const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getNotifications, getNotification, getUserNotifications, addNotifications, updateNotifications, deleteNotifications } = require('../controllers/notificationsController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getNotifications)
  .post(auth, addNotifications);

router
  .route('/:id')
  .get(auth, getNotification)
  .patch(auth, updateNotifications)
  .delete(auth, deleteNotifications);

router
  .route('/user/:id')
  .get(auth, getUserNotifications);

module.exports = router;