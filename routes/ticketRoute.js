const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getTickets, getTicket, getUserTickets, getEventTickets, addTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getTickets)
  .post(auth, addTicket);

router
  .route('/:id')
  .get(auth, getTicket)
  .patch(auth, updateTicket)
  .delete(auth, deleteTicket);

router
  .route('/user/:id/:status')
  .get(auth, getUserTickets);

router
  .route('/event/:id')
  .get(auth, getEventTickets);

module.exports = router;