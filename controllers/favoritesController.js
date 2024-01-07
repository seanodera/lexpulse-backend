const Favorites = require('../models/favoritesModel');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all favorites
// @route GET /api/v1/favorites
exports.getFavorites = async(req, res, next) => {
    try {
      const favorites =  await Favorites.find().populate({ path: 'userId', select: 'firstName lastName image' }).exec();
  
      return res.status(200).json({
        success: true,
        data: favorites
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single favorite
// @route GET /api/v1/favorites/:id
exports.getFavorite = async(req, res, next) => {
    try {
      const favorite = await Favorites.findById(req.params.id);
  
      if(!favorite) {
        return res.status(404).json({
          success: false,
          error: 'Favorite not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: favorite
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Get user favorite
// @route GET /api/v1/favorites/user/:id
exports.getUserFavorites = async(req, res, next) => {
  try {
    const favorites = await Favorites.find({ userId: req.params.id }).populate('eventId').populate({ path: 'eventId', populate: { path: 'eventHostId', select: '_id firstName lastName image'}}).exec();

    if(!favorites) {
      return res.status(404).json({
        success: false,
        error: 'Favorites not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

// @desc Add favorite
// @route POST /api/v1/favorites
exports.addFavorite = async (req, res, next) => {
  try {

    const fav1 = await Favorites.find({ userId: req.body.userId, eventId: req.body.eventId });
  
    if(fav1.length !== 0) {
      return res.status(404).json({
        success: false,
        error: 'Event has already been saved. To remove it, do so at the favorites tab.'
      });
    };

    const favorite = await Favorites.create({
      userId: req.body.userId,
      eventId: req.body.eventId
    });

    return res.status(201).json({
      success: true,
      data: favorite
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

// @desc Update favorite
// @route PATCH /api/v1/favorites/:id
exports.updateFavorite = async(req, res) => {
  try {
    
    const data = req.body;

    const result = await Favorites.findByIdAndUpdate(req.params.id, data, { new: true });

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

// @desc Delete favorite
// @route DELETE /api/v1/favorites/:id
exports.deleteFavorite = async(req, res, next) => {
  try {
    const favorites = await Favorites.findById(req.params.id);

    if(!favorites) {
      return res.status(404).json({
        success: false,
        error: 'Favorites not found'
      });
    }

    await favorites.remove();

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