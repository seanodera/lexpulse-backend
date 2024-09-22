const express = require('express');
const router = express.Router();
const {
    addVenue, searchVenues, updateVenue, getVenue, deleteVenue, getUserVenue
} = require('../controllers/venueController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

router
    .route('/')
    .post(auth, upload.fields([
        {name: 'images', maxCount: 10},
        {name: 'poster', maxCount: 1}
    ]), addVenue);

router
    .route('/search')
    .get(auth, searchVenues);

router.route('/user/:id').get(auth,getUserVenue);
router
    .route('/:id')
    .get(auth, getVenue)
    .put(auth, updateVenue)
    .delete(auth, deleteVenue);

module.exports = router;