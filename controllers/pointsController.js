const Points = require('../models/pointsModel');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all points
// @route GET /api/v1/points
exports.getPoints = async(req, res, next) => {
    try {
      const points =  await Points.find().populate({ path: 'userId', select: 'firstName lastName image' }).exec();
  
      return res.status(200).json({
        success: true,
        data: points
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single point
// @route GET /api/v1/points/:id
exports.getPoint = async(req, res, next) => {
    try {
      const point = await Points.findById(req.params.id);
  
      if(!point) {
        return res.status(404).json({
          success: false,
          error: 'Points not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: point
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Get user points
// @route GET /api/v1/points/user/:id
exports.getUserPoints = async(req, res, next) => {
  try {
    const points = await Points.findOne({ userId: req.params.id });

    if(!points) {
      return res.status(404).json({
        success: false,
        error: 'Points not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: points
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

// @desc Add point
// @route POST /api/v1/points
exports.addPoint = async (req, res, next) => {
  try {

    const point = await Points.create({
      userId: req.body.userId,
      newBalance: req.body.newBalance,
      previousBalance: req.body.previousBalance
    });

    return res.status(201).json({
      success: true,
      data: point
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

// @desc Update point
// @route PATCH /api/v1/points/:id
exports.updatePoint = async(req, res) => {
  try {
    
    const data = req.body;

    const result = await Points.findByIdAndUpdate(req.params.id, data, { new: true });

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

// @desc Delete point
// @route DELETE /api/v1/points/:id
exports.deletePoint = async(req, res, next) => {
  try {
    const points = await Points.findById(req.params.id);

    if(!points) {
      return res.status(404).json({
        success: false,
        error: 'Points not found'
      });
    }

    await points.remove();

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