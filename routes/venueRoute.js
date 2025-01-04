const express = require('express');
const router = express.Router();
const {
    addVenue, searchVenues, updateVenue, getVenue, deleteVenue, getUserVenue, getVenueEvents, createRecurringEvent,
    createVenueTable
} = require('../controllers/venueController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');
const {getEvent} = require("../controllers/eventController");

router
    .route('/')
    .post(auth, upload.fields([
        {name: 'images', maxCount: 10},
        {name: 'poster', maxCount: 1}
    ]), addVenue);

router
    .route('/search')
    .get(searchVenues);

router.route('/user/:id').get(auth,getUserVenue);
router.route('/:id/events').get(getVenueEvents);
router
    .route('/:id')
    .get(getVenue)
    .put(auth, updateVenue)
    .delete(auth, deleteVenue);

// POST route to add a table to a venue
router
    .route('/:venueId/table')
    .post(auth, createVenueTable);

// POST route to add a recurringEvent to a venue
router
    .route('/:venueId/recurring')
    .post(auth, createRecurringEvent);

module.exports = router;
