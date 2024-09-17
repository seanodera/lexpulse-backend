const express = require('express');
const router = express.Router();
const {
    addVenue,
    searchVenues,
    updateVenue,
    getVenue,
    deleteVenue
} = require('../controllers/venueController');
const auth = require('../middleware/authMiddleware');

router
    .route('/')
    .post(auth, addVenue);

router
    .route('/search')
    .get(auth, searchVenues);

router
    .route('/:id')
    .get(auth, getVenue)
    .put(auth, updateVenue)
    .delete(auth, deleteVenue);

module.exports = router;