const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { getCategories, getCategory, addCategory, updateCategory, deleteCategory } = require('../controllers/categoriesController');
const auth = require('../middleware/authMiddleware');

router
  .route('/')
  .get(auth, getCategories)
  .post(auth, addCategory);

router
  .route('/:id')
  .get(auth, getCategory)
  .patch(auth, updateCategory)
  .delete(auth, deleteCategory);

module.exports = router;