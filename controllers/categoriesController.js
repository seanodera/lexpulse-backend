const Categories = require('../models/categoriesModel');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all categories
// @route GET /api/v1/categories
exports.getCategories = async(req, res, next) => {
    try {
      const categories =  await Categories.find();
  
      return res.status(200).json({
        success: true,
        data: categories
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single category
// @route GET /api/v1/categories/:id
exports.getCategory = async(req, res, next) => {
    try {
      const category = await Categories.findById(req.params.id);
  
      if(!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Add category
// @route POST /api/v1/categories
exports.addCategory = async (req, res, next) => {
  try {
    const category = await Categories.findOne({ userId: req.params.id });

    if(!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.log(error);
    if(error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    else {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }
}

// @desc Update category
// @route PATCH /api/v1/categories/:id
exports.updateCategory = async(req, res) => {
  try {
    const data = req.body;

    const result = await Categories.findByIdAndUpdate(req.params.id, data, { new: true });

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error);
    if(error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);

      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    else {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }
}

// @desc Delete category
// @route DELETE /api/v1/categories/:id
exports.deleteCategory = async(req, res, next) => {
  try {
    const categories = await Categories.findById(req.params.id);

    if(!categories) {
      return res.status(404).json({
        success: false,
        error: 'Categories not found'
      });
    }

    await categories.remove();

    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}