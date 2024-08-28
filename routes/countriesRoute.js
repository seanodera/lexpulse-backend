const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getCountries, getCountry, addCountry, updateCountry, deleteCountry } = require('../controllers/countriesController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getCountries)
  .post(auth, addCountry);

router
  .route('/:id')
  .get(auth, getCountry)
  .patch(auth, updateCountry)
  .delete(auth, deleteCountry);

module.exports = router;