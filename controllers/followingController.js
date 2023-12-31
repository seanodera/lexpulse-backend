const Following = require('../models/followingModel');
const shortid = require('shortid');
const cloudinary = require('../middleware/cloudinary');

// @desc Get all following
// @route GET /api/v1/following
exports.getFollowing = async(req, res, next) => {
    try {
      const following =  await Following.find();
  
      return res.status(200).json({
        success: true,
        data: following
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };

// @desc Get single following
// @route GET /api/v1/following/:id
exports.getSingleFollowing = async(req, res, next) => {
    try {
      const following = await Following.findById(req.params.id);
  
      if(!following) {
        return res.status(404).json({
          success: false,
          error: 'Following not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: following
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  }

// @desc Get user following
// @route GET /api/v1/following/user/:id
exports.getUserFollowing = async(req, res, next) => {
  try {
    const following = await Following.findOne({ userId: req.params.id });

    if(!following) {
      return res.status(404).json({
        success: false,
        error: 'Following not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: following
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

// @desc Add following
// @route POST /api/v1/following
exports.addFollowing = async (req, res, next) => {
  try {

    const following = await Following.create({
        userId: req.body.userId,
        followers: [],
        following: []
    });

    return res.status(201).json({
      success: true,
      data: following
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

// @desc Update following
// @route PATCH /api/v1/following/:id
exports.updateFollowing = async(req, res) => {
  try {

    const userIdToAddOrRemove = req.body.followerId;
    const following = await Following.findById(req.params.id);

    if (!following) {
        return res.status(404).json({
            success: false,
            error: 'Following not found'
        });
    }

    const indexInFollowers = following.followers.indexOf(userIdToAddOrRemove);

    if (indexInFollowers === -1) {
        following.followers.push(userIdToAddOrRemove);
    } else {
        following.followers.splice(indexInFollowers, 1);
    }

    const result = await Following.findByIdAndUpdate(req.params.id, following, { new: true });

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

// @desc Delete following
// @route DELETE /api/v1/following/:id
exports.deleteFollowing = async(req, res, next) => {
  try {
    const following = await Following.findById(req.params.id);

    if(!following) {
      return res.status(404).json({
        success: false,
        error: 'Following not found'
      });
    }

    await following.remove();

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