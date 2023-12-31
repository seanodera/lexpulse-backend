const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getFavorites, getFavorite, getUserFavorites, addFavorite, updateFavorite, deleteFavorite } = require('../controllers/favoritesController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getFavorites)
  .post(auth, addFavorite);

router
  .route('/:id')
  .get(auth, getFavorite)
  .patch(auth, updateFavorite)
  .delete(auth, deleteFavorite);

router
  .route('/user/:id')
  .get(auth, getUserFavorites);

module.exports = router;