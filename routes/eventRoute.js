const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getEvents, getEvent, getUserEvents, addEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getEvents)
  .post(auth, upload.array("image"), addEvent);

router
  .route('/:id')
  .get(auth, getEvent)
  .patch(auth, upload.array("image"), updateEvent)
  .delete(auth, deleteEvent);

router
  .route('/user/:id')
  .get(auth, getUserEvents);

module.exports = router;