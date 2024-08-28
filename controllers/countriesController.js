const Countries = require('../models/countriesModel');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all countries
// @route GET /api/v1/countries
exports.getCountries = async(req, res, next) => {
    try {
      const countries =  await Countries.find();
  
      return res.status(200).json({
        success: true,
        data: countries
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single countries
// @route GET /api/v1/countries/:id
exports.getCountry = async(req, res, next) => {
    try {
      const countries = await Countries.findById(req.params.id);
  
      if(!countries) {
        return res.status(404).json({
          success: false,
          error: 'Countries not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: countries
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Add countries
// @route POST /api/v1/countries
exports.addCountry = async (req, res, next) => {
  try {
    const countries = await Countries.create({
        country: req.body.country
    });

    return res.status(201).json({
        success: true,
        data: countries
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
// @route PATCH /api/v1/countries/:id
exports.updateCountry = async(req, res) => {
  try {
    const data = req.body;

    const result = await Countries.findByIdAndUpdate(req.params.id, data, { new: true });

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

// @desc Delete countries
// @route DELETE /api/v1/countries/:id
exports.deleteCountry = async(req, res, next) => {
  try {
    const countries = await Countries.findById(req.params.id);

    if(!countries) {
      return res.status(404).json({
        success: false,
        error: 'Countries not found'
      });
    }

    await countries.remove();

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